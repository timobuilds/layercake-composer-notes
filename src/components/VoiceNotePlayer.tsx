import React, { useState } from 'react';
import { Play, Pause, Volume2, FileText, Sparkles, ListTodo, ExpandIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { VoiceNote } from '@/types/layercake';
import { useVoiceRecording } from '@/hooks/useVoiceRecording';
import { formatDuration } from '@/services/voiceRecording';
import { getTogetherAI } from '@/services/togetherAI';
import { useToast } from '@/hooks/use-toast';

interface VoiceNotePlayerProps {
  voiceNote: VoiceNote;
  onUpdate?: (updatedVoiceNote: VoiceNote) => void;
  compact?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  voiceNote,
  onUpdate,
  compact = false
}) => {
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { playAudio, stopAudio, recordingState } = useVoiceRecording();
  const { toast } = useToast();

  const handlePlay = () => {
    if (recordingState.isPlaying) {
      stopAudio();
    } else {
      playAudio(voiceNote);
    }
  };

  const handleAIAction = async (action: 'summary' | 'actions' | 'expand') => {
    if (!voiceNote.transcript || isProcessing) return;
    
    const togetherAI = getTogetherAI();
    if (!togetherAI) {
      toast({
        title: "API Key Required",
        description: "Please configure your Together AI API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      let result: string | string[];
      
      switch (action) {
        case 'summary':
          result = await togetherAI.generateAISummary(voiceNote.transcript);
          onUpdate?.({ ...voiceNote, aiSummary: result as string });
          break;
        case 'actions':
          result = await togetherAI.extractActionItems(voiceNote.transcript);
          onUpdate?.({ ...voiceNote, aiActionItems: result as string[] });
          break;
        case 'expand':
          result = await togetherAI.expandToFullNote(voiceNote.transcript);
          // For expand, we might want to update the parent node's content
          toast({
            title: "Note Expanded",
            description: "The expanded note is ready to use.",
          });
          break;
      }
      
      toast({
        title: "AI Processing Complete",
        description: `${action === 'summary' ? 'Summary' : action === 'actions' ? 'Action items' : 'Expanded note'} generated successfully.`,
      });
    } catch (error) {
      toast({
        title: "AI Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process voice note",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePlay}
          className="h-8 w-8 p-0"
        >
          {recordingState.isPlaying ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
        
        <Volume2 className="h-3 w-3 text-muted-foreground" />
        
        <span className="text-sm text-muted-foreground">
          {voiceNote.duration ? formatDuration(voiceNote.duration) : '0:00'}
        </span>
        
        {voiceNote.transcript && (
          <Badge variant="secondary" className="text-xs">
            Transcribed
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4" />
            <span>Voice Note</span>
            {voiceNote.isProcessing && (
              <Badge variant="secondary">Processing...</Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {voiceNote.duration ? formatDuration(voiceNote.duration) : '0:00'}
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Playback Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePlay}
            disabled={!voiceNote.audioBlob && !voiceNote.audioUrl}
          >
            {recordingState.isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Transcript Section */}
        {voiceNote.transcript && (
          <Collapsible open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Transcript
                <ExpandIcon className="h-4 w-4 ml-auto" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3">
              <div className="text-sm p-3 bg-muted/50 rounded-lg">
                {voiceNote.transcript}
              </div>
              
              {/* AI Actions */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIAction('summary')}
                  disabled={isProcessing}
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Summarize
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIAction('actions')}
                  disabled={isProcessing}
                >
                  <ListTodo className="h-3 w-3 mr-1" />
                  Extract Actions
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAIAction('expand')}
                  disabled={isProcessing}
                >
                  <ExpandIcon className="h-3 w-3 mr-1" />
                  Expand Note
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* AI Summary */}
        {voiceNote.aiSummary && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-3 w-3" />
              <span className="text-sm font-medium">AI Summary</span>
            </div>
            <div className="text-sm p-3 bg-primary/5 rounded-lg border-l-2 border-primary">
              {voiceNote.aiSummary}
            </div>
          </div>
        )}

        {/* Action Items */}
        {voiceNote.aiActionItems && voiceNote.aiActionItems.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ListTodo className="h-3 w-3" />
              <span className="text-sm font-medium">Action Items</span>
            </div>
            <ul className="space-y-1">
              {voiceNote.aiActionItems.map((item, index) => (
                <li key={index} className="text-sm flex items-start space-x-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};