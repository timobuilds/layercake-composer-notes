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
          <p className="text-sm text-muted-foreground">
            Click on any persona from the list to see its details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-6 p-6 border rounded-lg bg-muted/10">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-6 h-6 rounded flex-shrink-0" 
            style={{ backgroundColor: persona.color }}
          />
          <h2 className="text-xl font-semibold">{persona.name}</h2>
          <Badge variant="secondary">{persona.category}</Badge>
        </div>

        {/* Tags */}
        {persona.tags && persona.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {persona.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Created {new Date(persona.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Updated {new Date(persona.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Instructions</h3>
          <Button variant="outline" size="sm" onClick={handleCopyInstructions}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
        
        <div className="p-4 border rounded-lg bg-background">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {persona.instructions}
          </p>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {persona.instructions.length} characters
        </div>
      </div>

      {/* Usage Example */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">How it appears</h3>
        <div className="p-3 border rounded-lg bg-background">
          <div className="flex items-center gap-2">
            <div 
              className="px-2 py-1 rounded text-xs font-medium text-white"
              style={{ backgroundColor: persona.color }}
            >
              {persona.name}
            </div>
            <span className="text-xs text-muted-foreground">
              This is how it appears in the workflowy interface
            </span>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Statistics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg bg-background">
            <div className="text-sm text-muted-foreground">Word Count</div>
            <div className="text-xl font-semibold">
              {persona.instructions.split(/\s+/).filter(word => word.length > 0).length}
            </div>
          </div>
          <div className="p-3 border rounded-lg bg-background">
            <div className="text-sm text-muted-foreground">Character Count</div>
            <div className="text-xl font-semibold">
              {persona.instructions.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};