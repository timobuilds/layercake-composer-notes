import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { WorkflowyView } from '@/components/WorkflowyView';
import { CreateVersionDialog } from '@/components/CreateVersionDialog';
import { VersionHistoryDialog } from '@/components/VersionHistoryDialog';
import { storage, generateId } from '@/lib/storage';
import { Project, Node } from '@/types/layercake';
import { ArrowLeft, Plus, FileText } from 'lucide-react';

export const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    if (projectId) {
      const foundProject = storage.getProject(projectId);
      setProject(foundProject || null);
      loadNodes();
    }
  }, [projectId]);

  const loadNodes = () => {
    if (projectId) {
      setNodes(storage.getRootNodes(projectId));
    }
  };


  const handleVersionCreated = () => {
    if (projectId) {
      const updatedProject = storage.getProject(projectId);
      setProject(updatedProject || null);
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="w-[600px] text-center">
          <h1 className="text-base font-medium mb-4">Project Not Found</h1>
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-3 w-3 mr-1" />
              Back
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-[600px] px-4 py-4">
        {/* Header */}
        <div className="border-b border-border pb-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">
                Projects
              </Link>
              <span>›</span>
              <span className="text-foreground font-medium">{project.name}</span>
              <span>•</span>
              <span>v{project.currentVersion}</span>
              <span>•</span>
              <span>{nodes.length} nodes</span>
            </div>
            
             <div className="flex gap-2">
               <CreateVersionDialog 
                 projectId={projectId!} 
                 onVersionCreated={handleVersionCreated}
               />
               <VersionHistoryDialog 
                 projectId={projectId!} 
                 onVersionRestored={loadNodes}
               />
             </div>
          </div>
        </div>

         {/* Content */}
         <WorkflowyView
           projectId={projectId!}
           onNodesChange={loadNodes}
         />
      </div>
    </div>
  );
};