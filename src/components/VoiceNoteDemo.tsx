import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MessageSquare, Sparkles, ListTodo, ExpandIcon } from 'lucide-react';

export const VoiceNoteDemo: React.FC = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mic className="h-5 w-5" />
          <span>Voice Notes Feature</span>
          <Badge variant="secondary">New</Badge>
        </CardTitle>
        <CardDescription>
          Record voice notes for any node and leverage AI for transcription and enhancement
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center space-x-2">
              <Mic className="h-4 w-4" />
              <span>Recording Features</span>
            </h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Click "Add Voice Note" on any node</li>
              <li>• Real-time recording with duration counter</li>
              <li>• Playback controls for review</li>
              <li>• Save or discard recordings</li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>AI Transcription</span>
            </h3>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>• Automatic transcription via Together AI</li>
              <li>• Uses Whisper-large-v3 for accuracy</li>
              <li>• Supports multiple languages</li>
              <li>• Processing indicator during transcription</li>
            </ul>
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>AI Enhancements</span>
          </h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-3 w-3" />
                <span className="text-sm font-medium">Summarize</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Generate concise summaries of your voice notes
              </p>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ListTodo className="h-3 w-3" />
                <span className="text-sm font-medium">Extract Actions</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Automatically identify action items and tasks
              </p>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ExpandIcon className="h-3 w-3" />
                <span className="text-sm font-medium">Expand Note</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Transform brief notes into detailed, structured content
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-primary/5 rounded-lg border-l-2 border-primary">
          <h4 className="font-semibold text-sm mb-2">Getting Started</h4>
          <ol className="text-sm space-y-1 text-muted-foreground">
            <li>1. Get your API key from <a href="https://api.together.xyz" target="_blank" rel="noopener noreferrer" className="underline">Together AI</a></li>
            <li>2. Click "Add Voice Note" on any node</li>
            <li>3. Configure your API key when prompted</li>
            <li>4. Start recording and enjoy AI-powered features!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};