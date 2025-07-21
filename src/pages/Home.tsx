import React, { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { CreateProjectDialog } from '@/components/CreateProjectDialog';
import { Project } from '@/types/layercake';
import { storage } from '@/lib/storage';
import { FileText } from 'lucide-react';

export const Home = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    setProjects(storage.getProjects());
  }, []);

  const handleProjectCreated = (project: Project) => {
    setProjects([project, ...projects]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="border-b border-border pb-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h1 className="text-xl font-medium">Layercake</h1>
            </div>
            <CreateProjectDialog onProjectCreated={handleProjectCreated} />
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-base font-medium mb-2">No projects yet</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first project to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};