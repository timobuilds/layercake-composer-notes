import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Download, Upload, Undo, Redo, X } from 'lucide-react';
import { PersonaList } from './PersonaList';
import { PersonaEditor } from './PersonaEditor';
import { PersonaTemplates } from './PersonaTemplates';
import { PersonaPreview } from './PersonaPreview';
import { Persona, PersonaManagerState, PersonaFormData, PersonaCategory } from '@/types/persona';
import { personaStorage } from '@/lib/personaStorage';
import { useToast } from '@/hooks/use-toast';
interface PersonaManagerProps {
  isOpen: boolean;
  onClose: () => void;
  mainPagePersonas?: string[];
}
const initialFormData: PersonaFormData = {
  name: '',
  color: 'hsl(var(--persona-blue))',
  instructions: '',
  category: 'Other',
  tags: []
};
export const PersonaManager = ({
  isOpen,
  onClose,
  mainPagePersonas = []
}: PersonaManagerProps) => {
  const {
    toast
  } = useToast();
  const [state, setState] = useState<PersonaManagerState>({
    personas: [],
    selectedPersona: null,
    searchQuery: '',
    selectedCategory: 'All',
    isEditing: false,
    isDirty: false,
    showTemplates: false,
    selectedPersonas: []
  });
  const [formData, setFormData] = useState<PersonaFormData>(initialFormData);
  const [undoStack, setUndoStack] = useState<Persona[][]>([]);
  const [redoStack, setRedoStack] = useState<Persona[][]>([]);

  // Load personas on mount
  useEffect(() => {
    if (isOpen) {
      const personas = personaStorage.getPersonas();
      setState(prev => ({
        ...prev,
        personas
      }));
      setUndoStack([personas]);
    }
  }, [isOpen]);

  // Auto-save draft
  useEffect(() => {
    if (state.isDirty && (formData.name || formData.instructions)) {
      const saveTimer = setTimeout(() => {
        personaStorage.saveDraft(formData);
      }, 1000);
      return () => clearTimeout(saveTimer);
    }
  }, [formData, state.isDirty]);

  // Load draft on edit start
  useEffect(() => {
    if (state.isEditing && !state.selectedPersona) {
      const draft = personaStorage.getDraft();
      if (draft) {
        setFormData(draft);
        setState(prev => ({
          ...prev,
          isDirty: true
        }));
      }
    }
  }, [state.isEditing, state.selectedPersona]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (state.isEditing) {
          handleSavePersona();
        }
      } else if (e.key === 'Escape') {
        if (state.isEditing) {
          handleCancelEdit();
        } else {
          onClose();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, state.isEditing, formData]);
  const addToUndoStack = useCallback((personas: Persona[]) => {
    setUndoStack(prev => [...prev, personas]);
    setRedoStack([]);
  }, []);
  const handleStartEdit = (persona?: Persona) => {
    if (persona) {
      setFormData({
        name: persona.name,
        color: persona.color,
        instructions: persona.instructions,
        category: persona.category,
        tags: persona.tags || []
      });
      setState(prev => ({
        ...prev,
        selectedPersona: persona,
        isEditing: true,
        isDirty: false,
        showTemplates: false
      }));
    } else {
      setFormData(initialFormData);
      setState(prev => ({
        ...prev,
        selectedPersona: null,
        isEditing: true,
        isDirty: false,
        showTemplates: false
      }));
    }
    personaStorage.clearDraft();
  };
  const handleCancelEdit = () => {
    if (state.isDirty) {
      const confirmDiscard = window.confirm('You have unsaved changes. Are you sure you want to discard them?');
      if (!confirmDiscard) return;
    }
    setState(prev => ({
      ...prev,
      selectedPersona: null,
      isEditing: false,
      isDirty: false,
      showTemplates: false
    }));
    setFormData(initialFormData);
    personaStorage.clearDraft();
  };
  const handleSavePersona = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the persona.",
        variant: "destructive"
      });
      return;
    }
    if (!formData.instructions.trim()) {
      toast({
        title: "Instructions required",
        description: "Please enter instructions for the persona.",
        variant: "destructive"
      });
      return;
    }
    try {
      addToUndoStack(state.personas);
      let updatedPersonas: Persona[];
      if (state.selectedPersona) {
        const updated = personaStorage.updatePersona(state.selectedPersona.id, formData);
        if (!updated) throw new Error('Failed to update persona');
        updatedPersonas = state.personas.map(p => p.id === updated.id ? updated : p);
      } else {
        const newPersona = personaStorage.addPersona(formData);
        updatedPersonas = [...state.personas, newPersona];
      }
      setState(prev => ({
        ...prev,
        personas: updatedPersonas,
        selectedPersona: null,
        isEditing: false,
        isDirty: false
      }));
      setFormData(initialFormData);
      personaStorage.clearDraft();
      toast({
        title: "Success",
        description: `Persona ${state.selectedPersona ? 'updated' : 'created'} successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save persona. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleDeletePersona = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this persona?')) return;
    addToUndoStack(state.personas);
    const success = personaStorage.deletePersona(id);
    if (success) {
      setState(prev => ({
        ...prev,
        personas: prev.personas.filter(p => p.id !== id),
        selectedPersonas: prev.selectedPersonas.filter(sid => sid !== id)
      }));
      toast({
        title: "Success",
        description: "Persona deleted successfully."
      });
    }
  };
  const handleDuplicatePersona = (id: string) => {
    addToUndoStack(state.personas);
    const duplicated = personaStorage.duplicatePersona(id);
    if (duplicated) {
      setState(prev => ({
        ...prev,
        personas: [...prev.personas, duplicated]
      }));
      toast({
        title: "Success",
        description: "Persona duplicated successfully."
      });
    }
  };
  const handleBulkDelete = () => {
    if (state.selectedPersonas.length === 0) return;
    if (!window.confirm(`Delete ${state.selectedPersonas.length} selected personas?`)) return;
    addToUndoStack(state.personas);
    const deletedCount = personaStorage.deletePersonas(state.selectedPersonas);
    setState(prev => ({
      ...prev,
      personas: prev.personas.filter(p => !prev.selectedPersonas.includes(p.id)),
      selectedPersonas: []
    }));
    toast({
      title: "Success",
      description: `${deletedCount} personas deleted.`
    });
  };
  const handleExport = () => {
    try {
      const exportData = personaStorage.exportPersonas();
      const blob = new Blob([exportData], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `personas-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Personas exported successfully."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export personas.",
        variant: "destructive"
      });
    }
  };
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      const content = e.target?.result as string;
      const result = personaStorage.importPersonas(content);
      if (result.success) {
        setState(prev => ({
          ...prev,
          personas: personaStorage.getPersonas()
        }));
        toast({
          title: "Success",
          description: `${result.imported} personas imported successfully.`
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to import personas.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };
  const handleUndo = () => {
    if (undoStack.length <= 1) return;
    const current = undoStack[undoStack.length - 1];
    const previous = undoStack[undoStack.length - 2];
    setRedoStack(prev => [...prev, current]);
    setUndoStack(prev => prev.slice(0, -1));
    personaStorage.savePersonas(previous);
    setState(prev => ({
      ...prev,
      personas: previous
    }));
    toast({
      title: "Undone",
      description: "Last action has been undone."
    });
  };
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const toRedo = redoStack[redoStack.length - 1];
    setUndoStack(prev => [...prev, toRedo]);
    setRedoStack(prev => prev.slice(0, -1));
    personaStorage.savePersonas(toRedo);
    setState(prev => ({
      ...prev,
      personas: toRedo
    }));
    toast({
      title: "Redone",
      description: "Action has been redone."
    });
  };
  const filteredPersonas = state.personas.filter(persona => {
    const matchesSearch = persona.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || persona.instructions.toLowerCase().includes(state.searchQuery.toLowerCase());
    return matchesSearch;
  });
  if (!isOpen) return null;
  return <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      
      {/* Side Panel */}
      <div className="fixed inset-y-0 right-0 w-1/3 bg-background border-l border-border shadow-xl z-50 flex flex-col animate-slide-in-right">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Prompt Persona Manager</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          
          
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {!state.isEditing ? <>
            {/* Left Panel - Persona List */}
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <div className="flex-shrink-0 space-y-3 mb-4">
                
                
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleStartEdit()}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Persona
                  </Button>
                  
                </div>
              </div>

              {state.showTemplates ? <PersonaTemplates onSelectTemplate={handleStartEdit} /> : <PersonaList personas={filteredPersonas} onPersonaSelect={persona => setState(prev => ({
              ...prev,
              selectedPersona: persona
            }))} onPersonaEdit={handleStartEdit} onPersonaDelete={handleDeletePersona} onPersonaDuplicate={handleDuplicatePersona} mainPagePersonas={mainPagePersonas} />}
            </div>

            {/* Right Panel - Preview */}
            
          </> : (/* Editor Mode - Full Width */
        <div className="flex-1 p-4">
            <PersonaEditor formData={formData} setFormData={setFormData} onSave={handleSavePersona} onCancel={handleCancelEdit} isEditing={!!state.selectedPersona} onDirtyChange={isDirty => setState(prev => ({
            ...prev,
            isDirty
          }))} />
          </div>)}
      </div>
      </div>
    </>;
};