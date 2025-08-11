import React, { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Project } from '@/types/layercake';
import { storage } from '@/lib/storage';
import { personaStorage } from '@/lib/personaStorage';
import { Cake, X, Pencil } from 'lucide-react';
import { PersonaManager } from '@/components/PersonaManager/PersonaManager';
import { Link } from 'react-router-dom';
export const Home = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [personas, setPersonas] = useState<any[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(true);
  const [showPersonaManager, setShowPersonaManager] = useState(false);
  const [editingPersona, setEditingPersona] = useState<string | null>(null);
  const [draggedPersona, setDraggedPersona] = useState<string | null>(null);
  const [dragOverPersona, setDragOverPersona] = useState<string | null>(null);

  const loadPersonas = () => {
    setLoadingPersonas(true);
    setTimeout(() => {
      const storedPersonas = personaStorage.getPersonas();
      setPersonas(storedPersonas);
      setLoadingPersonas(false);
    }, 120);
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
  const defaultChecklist = [
    'Create your first project',
    'Add 5 nodes (Enter for sibling, Tab to indent)',
    'Open Version Manager and create v1.0.0',
    'Configure GitHub in Settings',
    'Release a version to GitHub',
  ];
  const [checklistStates, setChecklistStates] = useState<Record<string, boolean>>({});
  const CHECKLIST_KEY = 'onboarding-checklist';

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHECKLIST_KEY);
      const parsed = stored ? JSON.parse(stored) : {};
      if (projects.length > 0) {
        parsed['Create your first project'] = true;
      }
      setChecklistStates(parsed);
    } catch {
      setChecklistStates({});
    }
  }, [projects.length]);

  const toggleChecklist = (label: string) => {
    const next = { ...checklistStates, [label]: !checklistStates[label] };
    setChecklistStates(next);
    try { localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next)); } catch {}
  };

  return <div className="min-h-screen bg-background flex justify-center">
      <div className="w-[600px] px-4 py-6">
        {/* Header */}
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="text-sm font-medium">Composer</span></div>
            <div className="flex items-center gap-3">
              <Link to="/settings" className="text-xs text-muted-foreground hover:text-foreground">Settings</Link>
              <CreateProjectDialog onProjectCreated={handleProjectCreated} />
            </div>
          </div>
        </div>

        {/* Personas Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[10px] text-muted-foreground uppercase tracking-wide">Personas</h2>
            <button 
              className="px-2 py-1 rounded text-xs font-normal border border-dashed border-muted-foreground/30 text-muted-foreground/70 hover:bg-muted/30 transition-colors"
              onClick={() => setShowPersonaManager(true)}
            >
              + Add Persona
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {loadingPersonas ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-6 w-20 bg-muted/50 rounded animate-pulse" />
              ))
            ) : personas.map((persona) => (
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
          </div>
        </div>

        {/* Getting Started Checklist */}
        {projects.length === 0 && (
          <div className="mb-6 border border-dashed rounded p-3 bg-muted/20">
            <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">Getting Started</div>
            <div className="space-y-1 text-xs">
              {defaultChecklist.map((item) => (
                <label key={item} className="flex items-center gap-2">
                  <input type="checkbox" checked={!!checklistStates[item]} onChange={() => toggleChecklist(item)} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">Projects</div>
        {projects.length > 0 ? <div className="space-y-3">
            {projects.map(project => <ProjectCard key={project.id} project={project} />)}
          </div> : <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              <Cake className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-base font-medium mb-2">No projects yet</h3>
            <div className="text-xs text-muted-foreground mb-4 space-y-1">
              <p>Create your first project to get started.</p>
              <ul className="inline-block text-left list-disc ml-5">
                <li>Press Enter to add siblings; Tab to indent</li>
                <li>Cmd/Ctrl+K to search, Cmd/Ctrl+/ for shortcuts</li>
                <li>Open Version Manager to create your first version</li>
              </ul>
            </div>
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