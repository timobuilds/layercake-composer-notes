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
  mainPagePersonas?: string[];
}
export const PersonaList = ({
  personas,
  onPersonaSelect,
  onPersonaEdit,
  onPersonaDelete,
  onPersonaDuplicate,
  mainPagePersonas = []
}: PersonaListProps) => {
  // Filter personas to only show those that match main page personas
  const filteredPersonas = personas.filter(persona => 
    mainPagePersonas.includes(persona.name)
  );
  
  if (filteredPersonas.length === 0) {
    return <div className="flex-1 flex items-center justify-center text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground">No personas found</p>
        </div>
      </div>;
  }
  return <div className="flex-1 overflow-y-auto space-y-2">
      {filteredPersonas.map(persona => (
        <div 
          key={persona.id}
          className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer group"
          onClick={() => onPersonaSelect(persona)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: persona.color }}
              />
              <span className="font-medium">{persona.name}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
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
    </div>;
};