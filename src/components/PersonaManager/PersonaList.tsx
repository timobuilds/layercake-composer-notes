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
    return <div className="flex-1 flex items-center justify-center text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground">No personas found</p>
        </div>
      </div>;
  }
  return <div className="flex-1 overflow-y-auto space-y-2">
      {personas.map(persona => {})}
    </div>;
};