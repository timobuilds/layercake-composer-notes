import React, { useState } from 'react';
import { Mic, MicOff, Play, Pause, Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { VoiceNote } from '@/types/layercake';
import { formatDuration } from '@/services/voiceRecording';
import { initializeTogetherAI } from '@/services/togetherAI';
import { useToast } from '@/hooks/use-toast';

interface VoiceNoteRecorderProps {
  onSave: (voiceNote: VoiceNote) => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
}

export const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({
  onSave,
  onCancel,
  trigger
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const { toast } = useToast();
  
  const {
    recordingState,
    startRecording,
    stopRecording,
    cancelRecording,
    playAudio,
    stopAudio,
    isApiKeySet,
    error
  } = useVoiceRecording();

  const handleStartRecording = async () => {
    if (!isApiKeySet) {
      setShowApiKeyDialog(true);
      return;
    }
    await startRecording();
  };

  const handleStopRecording = async () => {
    const voiceNote = await stopRecording();
    if (voiceNote) {
      onSave(voiceNote);
      setIsOpen(false);
      toast({
        title: "Voice note saved",
        description: voiceNote.transcript ? "Audio transcribed successfully" : "Voice note recorded",
      });
    }
  };

  const handleCancel = () => {
    cancelRecording();
    setIsOpen(false);
    onCancel?.();
  };

  const handleSetApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your Together AI API key to enable transcription.",
        variant: "destructive",
      });
      return;
    }
    
    initializeTogetherAI(apiKey);
    setShowApiKeyDialog(false);
    setApiKey('');
    toast({
      title: "API Key Set",
      description: "Together AI is now configured for voice transcription.",
    });
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm">
              <Mic className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Record Voice Note</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-6 py-4">
            {/* Recording Status */}
            <div className="text-center">
              {recordingState.isRecording && (
                <div className="flex items-center space-x-2 text-red-500">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span>Recording...</span>
                </div>
              )}
              
              {recordingState.duration > 0 && (
                <div className="text-lg font-mono">
                  {formatDuration(recordingState.duration)}
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="flex space-x-4">
              {!recordingState.isRecording ? (
                <Button
                  onClick={handleStartRecording}
                  size="lg"
                  className="rounded-full w-16 h-16"
                  variant="default"
                >
                  <Mic className="h-6 w-6" />
                </Button>
              ) : (
                <Button
                  onClick={handleStopRecording}
                  size="lg"
                  className="rounded-full w-16 h-16"
                  variant="destructive"
                >
                  <MicOff className="h-6 w-6" />
                </Button>
              )}
            </div>

            {/* Playback Controls (when recording exists) */}
            {recordingState.audioBlob && !recordingState.isRecording && (
              <div className="flex space-x-2">
                <Button
                  onClick={playCurrentRecording}
                  variant="outline"
                  disabled={recordingState.isPlaying}
                >
                  {recordingState.isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                
                <Button onClick={handleStopRecording} variant="default">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                
                <Button onClick={handleCancel} variant="outline">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="text-sm text-red-500 text-center">
                {error}
              </div>
            )}

            {/* API Key Status */}
            {!isApiKeySet && (
              <div className="text-sm text-muted-foreground text-center">
                <p>Set your Together AI API key to enable transcription</p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowApiKeyDialog(true)}
                >
                  Configure API Key
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Configuration Dialog */}
      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configure Together AI API Key</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Together AI API key"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Get your API key from{' '}
                <a
                  href="https://api.together.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  Together AI
                </a>
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={handleSetApiKey} disabled={!apiKey.trim()}>
                Save API Key
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowApiKeyDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};