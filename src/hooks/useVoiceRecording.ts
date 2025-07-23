import { useState, useCallback, useRef, useEffect } from 'react';
import { VoiceRecorder, RecordingState, formatDuration } from '@/services/voiceRecording';
import { getTogetherAI, isTogetherAIInitialized } from '@/services/togetherAI';
import { VoiceNote } from '@/types/layercake';
import { generateId } from '@/lib/storage';

export interface UseVoiceRecordingReturn {
  recordingState: RecordingState;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<VoiceNote | null>;
  cancelRecording: () => void;
  playAudio: (voiceNote: VoiceNote) => Promise<void>;
  stopAudio: () => void;
  isApiKeySet: boolean;
  error: string | null;
}

export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPlaying: false,
    duration: 0,
  });
  const [error, setError] = useState<string | null>(null);
  
  const recorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isApiKeySet = isTogetherAIInitialized();

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      await recorderRef.current.startRecording();
      const mediaStream = recorderRef.current.getCurrentStream();
      setRecordingState(prev => ({ 
        ...prev, 
        isRecording: true, 
        duration: 0,
        mediaStream 
      }));
      
      // Start duration counter
      const startTime = Date.now();
      durationIntervalRef.current = setInterval(() => {
        setRecordingState(prev => ({ ...prev, duration: Date.now() - startTime }));
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<VoiceNote | null> => {
    try {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }

      const { audioBlob, duration } = await recorderRef.current.stopRecording();
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: false,
        audioBlob,
        audioUrl: URL.createObjectURL(audioBlob),
        mediaStream: undefined,
      }));

      const voiceNote: VoiceNote = {
        id: generateId(),
        audioBlob,
        audioUrl: URL.createObjectURL(audioBlob),
        duration,
        createdAt: new Date().toISOString(),
        isProcessing: true,
      };

      // Start transcription if API key is available
      if (isApiKeySet) {
        const togetherAI = getTogetherAI();
        if (togetherAI) {
          try {
            voiceNote.transcript = await togetherAI.transcribeAudio(audioBlob);
            voiceNote.isProcessing = false;
          } catch (err) {
            console.error('Transcription failed:', err);
            voiceNote.isProcessing = false;
          }
        }
      }

      return voiceNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording');
      return null;
    }
  }, [isApiKeySet]);

  const cancelRecording = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    
    recorderRef.current.cancelRecording();
    setRecordingState({
      isRecording: false,
      isPlaying: false,
      duration: 0,
      mediaStream: undefined,
    });
    setError(null);
  }, []);

  const playAudio = useCallback(async (voiceNote: VoiceNote) => {
    try {
      stopAudio(); // Stop any current playback
      
      if (voiceNote.audioBlob) {
        audioRef.current = new Audio(URL.createObjectURL(voiceNote.audioBlob));
      } else if (voiceNote.audioUrl) {
        audioRef.current = new Audio(voiceNote.audioUrl);
      } else {
        throw new Error('No audio data available');
      }

      audioRef.current.onplay = () => {
        setRecordingState(prev => ({ ...prev, isPlaying: true }));
      };

      audioRef.current.onended = () => {
        setRecordingState(prev => ({ ...prev, isPlaying: false }));
      };

      audioRef.current.onerror = () => {
        setError('Failed to play audio');
        setRecordingState(prev => ({ ...prev, isPlaying: false }));
      };

      await audioRef.current.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to play audio');
    }
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setRecordingState(prev => ({ ...prev, isPlaying: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      stopAudio();
      cancelRecording();
    };
  }, [stopAudio, cancelRecording]);

  return {
    recordingState,
    startRecording,
    stopRecording,
    cancelRecording,
    playAudio,
    stopAudio,
    isApiKeySet,
    error,
  };
};