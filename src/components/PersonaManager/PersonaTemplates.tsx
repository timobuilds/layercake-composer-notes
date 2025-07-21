import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { defaultPersonaTemplates } from '@/lib/personaStorage';
import { Persona } from '@/types/persona';

interface PersonaTemplatesProps {
  onSelectTemplate: (persona?: Persona) => void;
}

export const PersonaTemplates = ({ onSelectTemplate }: PersonaTemplatesProps) => {
  const handleUseTemplate = (template: typeof defaultPersonaTemplates[0]) => {
    const personaFromTemplate: Persona = {
      id: '', // Will be generated when saved
      name: template.name,
      color: template.color,
      instructions: template.instructions,
      category: template.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: []
    };
    onSelectTemplate(personaFromTemplate);
  };

  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2">Persona Templates</h3>
        <p className="text-xs text-muted-foreground">
          Start with a pre-built persona template and customize it to your needs.
        </p>
      </div>

      <div className="grid gap-3">
        {defaultPersonaTemplates.map((template) => (
          <div
            key={template.id}
            className="group p-4 border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div 
                className="w-4 h-4 rounded flex-shrink-0 mt-1" 
                style={{ backgroundColor: template.color }}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{template.name}</h4>
                  <span className="px-2 py-1 text-xs bg-muted rounded">
                    {template.category}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {template.description}
                </p>
                
                <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  "{template.instructions.substring(0, 120)}..."
                </div>
                
                <Button
                  size="sm"
                  onClick={() => handleUseTemplate(template)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Use Template
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={() => onSelectTemplate()}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Start from Scratch
        </Button>
      </div>
    </div>
  );
};