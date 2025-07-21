import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Tag, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Persona } from '@/types/persona';
import { useToast } from '@/hooks/use-toast';

interface PersonaPreviewProps {
  persona: Persona | null;
}

export const PersonaPreview = ({ persona }: PersonaPreviewProps) => {
  const { toast } = useToast();

  const handleCopyInstructions = () => {
    if (persona) {
      navigator.clipboard.writeText(persona.instructions);
      toast({
        title: "Copied!",
        description: "Persona instructions copied to clipboard."
      });
    }
  };

  if (!persona) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Select a persona to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 p-4">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-5 h-5 rounded flex-shrink-0" 
            style={{ backgroundColor: persona.color }}
          />
          <h2 className="text-lg font-medium">{persona.name}</h2>
          <Badge variant="secondary">{persona.category}</Badge>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Instructions</h3>
          <Button variant="outline" size="sm" onClick={handleCopyInstructions}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-3 border rounded bg-muted/20">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {persona.instructions}
          </p>
        </div>
      </div>
    </div>
  );
};