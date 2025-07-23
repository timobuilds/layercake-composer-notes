import React, { useState } from 'react';
import { Mic, MicOff, Play, Pause, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { VoiceNote } from '@/types/layercake';
import { formatDuration } from '@/services/voiceRecording';
import { VoiceWaveform } from '@/components/VoiceWaveform';
import { RealTimeTranscript } from '@/components/RealTimeTranscript';

interface InlineVoiceRecorderProps {
  onSave: (voiceNote: VoiceNote) => void;
  onCancel: () => void;
  onSentenceComplete: (sentence: string) => void;
  isActive: boolean;
}

export const InlineVoiceRecorder: React.FC<InlineVoiceRecorderProps> = ({
  onSave,
  onCancel,
  onSentenceComplete,
  isActive
}) => {
  const {
    recordingState,
    startRecording,
    stopRecording,
    cancelRecording,
    playAudio,
    stopAudio,
    error
  } = useVoiceRecording();

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = async () => {
    const voiceNote = await stopRecording();
    if (voiceNote) {
      onSave(voiceNote);
    }
  };

  const handleCancel = () => {
    cancelRecording();
    onCancel();
  };

  const playCurrentRecording = async () => {
    if (recordingState.audioBlob) {
      const tempVoiceNote: VoiceNote = {
        id: 'temp',
        audioBlob: recordingState.audioBlob,
        duration: recordingState.duration,
        createdAt: new Date().toISOString(),
      };
      await playAudio(tempVoiceNote);
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="w-full bg-background border rounded-lg p-4 mt-2 animate-fade-in">
      {/* Recording Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Recording Voice Note</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Recording Status and Timer */}
      <div className="text-center mb-4">
        {recordingState.isRecording && (
          <div className="flex items-center justify-center space-x-2 text-red-500 mb-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">Recording...</span>
          </div>
        )}
        
        {recordingState.duration > 0 && (
          <div className="text-lg font-mono">
            {formatDuration(recordingState.duration)}
          </div>
        )}
      </div>

      {/* Main Recording Button */}
      <div className="flex justify-center mb-4">
        {!recordingState.isRecording ? (
          <Button
            onClick={handleStartRecording}
            size="lg"
            className="rounded-full w-16 h-16 bg-primary hover:bg-primary/90"
          >
            <Mic className="h-6 w-6 text-white" />
          </Button>
        ) : (
          <Button
            onClick={handleStopRecording}
            size="lg"
            className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
          >
            <MicOff className="h-6 w-6 text-white" />
          </Button>
        )}
      </div>

      {/* Waveform Visualization */}
      {recordingState.isRecording && (
        <div className="mb-4">
          <VoiceWaveform 
            isRecording={recordingState.isRecording}
            audioStream={recordingState.mediaStream}
            className="w-full"
          />
        </div>
      )}

      {/* Real-time Transcription */}
      {recordingState.isRecording && (
        <div className="mb-4">
          <RealTimeTranscript 
            isRecording={recordingState.isRecording}
            onSentenceComplete={onSentenceComplete}
            className="w-full"
          />
        </div>
      )}

      {/* Playback Controls */}
      {recordingState.audioBlob && !recordingState.isRecording && (
        <div className="flex justify-center space-x-2 mt-4">
          <Button
            onClick={playCurrentRecording}
            variant="outline"
            size="sm"
            disabled={recordingState.isPlaying}
          >
            {recordingState.isPlaying ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {recordingState.isPlaying ? 'Playing' : 'Play'}
          </Button>
          
          <Button onClick={handleStopRecording} size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-sm text-red-500 text-center mt-2">
          {error}
        </div>
      )}
    </div>
  );
};