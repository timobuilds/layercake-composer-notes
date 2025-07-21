import React, { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Project } from '@/types/layercake';
import { storage } from '@/lib/storage';
import { Layers, Sparkles } from 'lucide-react';

export const Home = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(storage.getProjects());
  }, []);

  const handleProjectCreated = (project: Project) => {
    setProjects([project, ...projects]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-creative/20 border border-primary/20">
              <Layers className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-creative bg-clip-text text-transparent">
              Layercake
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Organize your thoughts in beautiful hierarchical layers. Create, connect, and discover insights across your ideas.
          </p>
        </div>

        {/* Create Project Section */}
        <div className="flex justify-center mb-12">
          <CreateProjectDialog onProjectCreated={handleProjectCreated} />
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-to-br from-primary/10 to-creative/10 border border-primary/20">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Ready to start organizing?</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Create your first project to begin structuring your thoughts in beautiful, hierarchical layers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};