import React, { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Project } from '@/types/layercake';
import { storage } from '@/lib/storage';
import { Cake, X } from 'lucide-react';
import { PersonaManager } from '@/components/PersonaManager/PersonaManager';
export const Home = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showPersonaManager, setShowPersonaManager] = useState(false);
  const [draggedPersona, setDraggedPersona] = useState<string | null>(null);
  const [dragOverPersona, setDragOverPersona] = useState<string | null>(null);
  useEffect(() => {
    const allProjects = storage.getProjects();
    // Sort by most recently created (newest first)
    const sortedProjects = allProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setProjects(sortedProjects);
  }, []);
  const handleProjectCreated = (project: Project) => {
    setProjects([project, ...projects]);
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
            {['Screenwriter', 'Editor', 'Director', 'Producer', 'Actor'].map((persona, index) => (
              <button
                key={persona}
                draggable
                className={`group/persona px-3 py-2 rounded text-sm font-medium text-white flex items-center gap-2 hover:bg-opacity-80 transition-all cursor-pointer ${
                  draggedPersona === persona ? 'opacity-50' : ''
                } ${
                  dragOverPersona === persona ? 'scale-105 shadow-lg' : ''
                }`}
                style={{ 
                  backgroundColor: `hsl(var(--persona-${
                    ['blue', 'green', 'yellow', 'brown', 'purple'][index]
                  }))` 
                }}
                onDragStart={(e) => {
                  e.stopPropagation();
                  setDraggedPersona(persona);
                  e.dataTransfer.setData('text/plain', persona);
                }}
                onDragEnd={() => {
                  setDraggedPersona(null);
                  setDragOverPersona(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (draggedPersona && draggedPersona !== persona) {
                    setDragOverPersona(persona);
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
                  if (draggedItem && draggedItem !== persona) {
                    console.log(`Moving ${draggedItem} to position of ${persona}`);
                  }
                  setDraggedPersona(null);
                  setDragOverPersona(null);
                }}
                onClick={() => setShowPersonaManager(true)}
                title="Edit personas"
              >
                <span>{persona}</span>
                <button 
                  className="opacity-0 group-hover/persona:opacity-100 hover:bg-white/20 rounded-sm p-0.5 transition-all"
                  onClick={(e) => e.stopPropagation()}
                  title="Remove persona"
                >
                  <X className="h-3 w-3" />
                </button>
              </button>
            ))}
            <button 
              className="px-3 py-2 rounded text-sm font-medium border border-dashed border-muted-foreground/50 text-muted-foreground hover:bg-muted/50 transition-colors"
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
        onClose={() => setShowPersonaManager(false)} 
      />
    </div>;
};