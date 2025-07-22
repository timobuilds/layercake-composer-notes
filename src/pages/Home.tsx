import React, { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Project } from '@/types/layercake';
import { storage } from '@/lib/storage';
import { personaStorage } from '@/lib/personaStorage';
import { Cake, X, Pencil } from 'lucide-react';
import { PersonaManager } from '@/components/PersonaManager/PersonaManager';
export const Home = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [showPersonaManager, setShowPersonaManager] = useState(false);
  const [editingPersona, setEditingPersona] = useState<string | null>(null);
  const [draggedPersona, setDraggedPersona] = useState<string | null>(null);
  const [dragOverPersona, setDragOverPersona] = useState<string | null>(null);

  const loadPersonas = () => {
    const storedPersonas = personaStorage.getPersonas();
    setPersonas(storedPersonas);
  };

  useEffect(() => {
    const allProjects = storage.getProjects();
    // Sort by most recently created (newest first)
    const sortedProjects = allProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setProjects(sortedProjects);
    
    // Load personas from storage
    loadPersonas();
  }, []);

  const handleProjectCreated = (project: Project) => {
    setProjects([project, ...projects]);
  };

  const handleDeletePersona = (personaId: string) => {
    // Delete from storage
    personaStorage.deletePersona(personaId);
    loadPersonas(); // Refresh the list
  };

  const handlePersonaManagerClose = () => {
    setShowPersonaManager(false);
    setEditingPersona(null);
    loadPersonas(); // Refresh personas when manager closes
  };
  return <div className="min-h-screen bg-background flex justify-center">
      <div className="w-[600px] px-4 py-6">
        {/* Header */}
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src="/lovable-uploads/ab963aa9-534b-4627-9084-44ae44b32cef.png" 
                alt="Layercake Logo" 
                className="h-[18px] w-[18px] object-contain"
              />
            </div>
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
        </div>

        {/* Personas Section */}
        <div className="mb-6">
          <h2 className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">Personas</h2>
          <div className="flex flex-wrap gap-2">
            {personas.map((persona) => (
              <button
                key={persona.id}
                draggable
                className={`group/persona px-2 py-1 rounded text-xs font-normal text-white flex items-center gap-1 hover:bg-opacity-90 transition-all cursor-pointer border border-white/10 bg-opacity-70 ${
                  draggedPersona === persona.name ? 'opacity-50' : ''
                } ${
                  dragOverPersona === persona.name ? 'scale-105 shadow-lg' : ''
                }`}
                style={{ 
                  backgroundColor: persona.color
                }}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDraggedPersona(persona.name);
                  e.dataTransfer.setData('text/plain', persona.name);
                }}
                onDragEnd={() => {
                  setDraggedPersona(null);
                  setDragOverPersona(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedPersona && draggedPersona !== persona.name) {
                    setDragOverPersona(persona.name);
                  }
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  setDragOverPersona(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const draggedItem = e.dataTransfer.getData('text/plain');
                  if (draggedItem && draggedItem !== persona.name) {
                    console.log(`Moving ${draggedItem} to position of ${persona.name}`);
                  }
                  setDraggedPersona(null);
                  setDragOverPersona(null);
                }}
                onClick={() => {
                  setEditingPersona(persona.name);
                  setShowPersonaManager(true);
                }}
                title="Edit persona"
              >
                <span>{persona.name}</span>
                <button 
                  className="hover:bg-white/20 rounded-sm p-0.5 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPersona(persona.name);
                    setShowPersonaManager(true);
                  }}
                  title="Edit persona"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button 
                  className="hover:bg-white/20 rounded-sm p-0.5 transition-all"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePersona(persona.id);
                  }}
                  title="Remove persona"
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            ))}
            <button 
              className="px-2 py-1 rounded text-xs font-normal border border-dashed border-muted-foreground/30 text-muted-foreground/70 hover:bg-muted/30 transition-colors"
              onClick={() => setShowPersonaManager(true)}
            >
              + Add Persona
            </button>
          </div>
        </div>

        {/* Projects Section */}
        <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">Projects</div>
        {projects.length > 0 ? <div className="space-y-3">
            {projects.map(project => <ProjectCard key={project.id} project={project} />)}
          </div> : <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              <Cake className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-base font-medium mb-2">No projects yet</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first project to get started.
            </p>
          </div>}
      </div>

      {/* Persona Manager */}
      <PersonaManager 
        isOpen={showPersonaManager} 
        onClose={handlePersonaManagerClose}
        onPersonasUpdated={loadPersonas}
        mainPagePersonas={personas.map(p => p.name)}
        editingPersona={editingPersona}
      />
    </div>;
};