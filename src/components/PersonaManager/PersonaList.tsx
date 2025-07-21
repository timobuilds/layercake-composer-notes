import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Copy, Edit3, Calendar, Clock } from 'lucide-react';
import { Persona } from '@/types/persona';

interface PersonaListProps {
  personas: Persona[];
  selectedPersonas: string[];
  onPersonaSelect: (persona: Persona) => void;
  onPersonaEdit: (persona: Persona) => void;
  onPersonaDelete: (id: string) => void;
  onPersonaDuplicate: (id: string) => void;
  onSelectionChange: (ids: string[]) => void;
}

export const PersonaList = ({
  personas,
  selectedPersonas,
  onPersonaSelect,
  onPersonaEdit,
  onPersonaDelete,
  onPersonaDuplicate,
  onSelectionChange
}: PersonaListProps) => {
  const handleSelectAll = (checked: boolean) => {
    onSelectionChange(checked ? personas.map(p => p.id) : []);
  };

  const handleSelectPersona = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedPersonas, id]);
    } else {
      onSelectionChange(selectedPersonas.filter(pid => pid !== id));
    }
  };

  if (personas.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <div className="space-y-2">
          <p className="text-muted-foreground">No personas found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      {/* Select All Header */}
      <div className="flex-shrink-0 flex items-center gap-3 p-3 border-b bg-muted/20">
        <Checkbox
          checked={selectedPersonas.length === personas.length && personas.length > 0}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm font-medium">
          {selectedPersonas.length > 0 
            ? `${selectedPersonas.length} selected`
            : `${personas.length} personas`
          }
        </span>
      </div>

      {/* Persona List */}
      <div className="flex-1 overflow-y-auto space-y-2 p-2">
        {personas.map((persona) => (
          <div
            key={persona.id}
            className="group p-4 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
            onClick={() => onPersonaSelect(persona)}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={selectedPersonas.includes(persona.id)}
                onCheckedChange={(checked) => handleSelectPersona(persona.id, !!checked)}
                onClick={(e) => e.stopPropagation()}
                className="mt-1 flex-shrink-0"
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded flex-shrink-0" 
                    style={{ backgroundColor: persona.color }}
                  />
                  <h3 className="font-medium truncate">{persona.name}</h3>
                  <span className="px-2 py-1 text-xs bg-muted rounded">
                    {persona.category}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {persona.instructions}
                </p>
                
                {persona.tags && persona.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {persona.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-2 py-1 text-xs bg-accent rounded">
                        {tag}
                      </span>
                    ))}
                    {persona.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs text-muted-foreground">
                        +{persona.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created: {new Date(persona.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Updated: {new Date(persona.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
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
                      className="h-7 w-7 p-0"
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
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};