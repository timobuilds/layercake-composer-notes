import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkflowyView } from '@/components/WorkflowyView';
import { VersionHistoryDialog } from '@/components/VersionHistoryDialog';
import { storage, generateId } from '@/lib/storage';
import { Project, Node } from '@/types/layercake';
import { ArrowLeft, Plus, FileText } from 'lucide-react';

export const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [personaCount, setPersonaCount] = useState('1');

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

  const handleCollapseAll = () => {
    if (projectId) {
      const allNodes = storage.getNodes();
      const projectNodes = allNodes.filter(node => node.projectId === projectId);
      
      projectNodes.forEach(node => {
        const hasChildren = storage.getChildNodes(node.id).length > 0;
        if (hasChildren) {
          storage.updateNode(node.id, { collapsed: true });
        }
      });
      
      loadNodes();
      setRefreshKey(prev => prev + 1); // Force WorkflowyView to re-render
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
        <div className="border-b border-border pb-3 mb-4" style={{ paddingLeft: '16px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">
                Projects
              </Link>
              <span>›</span>
              <span className="text-foreground font-medium">{project.name}</span>
              <span>•</span>
               <span 
                 className="cursor-pointer hover:text-foreground transition-colors"
                 onClick={() => setIsVersionDialogOpen(true)}
               >
                 v{project.currentVersion}
               </span>
              <span>•</span>
              <span 
                className="cursor-pointer hover:text-foreground transition-colors"
                onClick={handleCollapseAll}
              >
                {nodes.length} nodes
              </span>
              <span>•</span>
              <Select value={personaCount} onValueChange={setPersonaCount}>
                <SelectTrigger className="w-20 h-6 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 persona</SelectItem>
                  <SelectItem value="2">2 personas</SelectItem>
                  <SelectItem value="3">3 personas</SelectItem>
                  <SelectItem value="4">4 personas</SelectItem>
                  <SelectItem value="5">5 personas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
             <div className="flex gap-2">
                <VersionHistoryDialog 
                  projectId={projectId!} 
                  onVersionRestored={loadNodes}
                  onVersionCreated={handleVersionCreated}
                  isOpen={isVersionDialogOpen}
                  onOpenChange={setIsVersionDialogOpen}
                />
              </div>
          </div>
        </div>

         {/* Content */}
         <WorkflowyView
           projectId={projectId!}
           onNodesChange={loadNodes}
           key={refreshKey} // Force re-render when refreshKey changes
         />
      </div>
    </div>
  );
};