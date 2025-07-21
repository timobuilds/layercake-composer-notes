import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Copy, Edit3 } from 'lucide-react';
import { Persona } from '@/types/persona';

interface PersonaListProps {
  personas: Persona[];
  onPersonaSelect: (persona: Persona) => void;
  onPersonaEdit: (persona: Persona) => void;
  onPersonaDelete: (id: string) => void;
  onPersonaDuplicate: (id: string) => void;
}

export const PersonaList = ({
  personas,
  onPersonaSelect,
  onPersonaEdit,
  onPersonaDelete,
  onPersonaDuplicate
}: PersonaListProps) => {
  if (personas.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground">No personas found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {personas.map((persona) => (
        <div
          key={persona.id}
          className="group p-3 border rounded hover:bg-muted/30 cursor-pointer transition-colors"
          onClick={() => onPersonaSelect(persona)}
        >
          <div className="flex items-start gap-3">
            <div 
              className="w-4 h-4 rounded flex-shrink-0 mt-0.5" 
              style={{ backgroundColor: persona.color }}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{persona.name}</h3>
                <span className="px-2 py-0.5 text-xs bg-muted rounded">
                  {persona.category}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2">
                {persona.instructions}
              </p>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onPersonaEdit(persona);
                }}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onPersonaDuplicate(persona.id);
                }}
              >
                <Copy className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onPersonaDelete(persona.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};