import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { NodeTree } from '@/components/NodeTree';
import { CreateVersionDialog } from '@/components/CreateVersionDialog';
import { VersionHistoryDialog } from '@/components/VersionHistoryDialog';
import { storage, generateId } from '@/lib/storage';
import { Project, Node } from '@/types/layercake';
import { ArrowLeft, Plus, FileText } from 'lucide-react';

export const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newRootContent, setNewRootContent] = useState('');
  const [newRootTitle, setNewRootTitle] = useState('');

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

  const handleAddRootNode = () => {
    if (newRootContent.trim() && projectId) {
      const newNode: Node = {
        id: generateId(),
        projectId,
        parentId: null,
        title: newRootTitle.trim() || undefined,
        content: newRootContent.trim(),
        createdAt: new Date().toISOString(),
      };
      storage.addNode(newNode);
      setNewRootContent('');
      setNewRootTitle('');
      setIsAddingRoot(false);
      loadNodes();
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
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="outline" size="sm" className="text-xs">
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h1 className="text-lg font-medium">{project.name}</h1>
                  <p className="text-xs text-muted-foreground">
                    v{project.currentVersion} • {nodes.length} root nodes
                  </p>
                </div>
              </div>
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
              <Button
                onClick={() => setIsAddingRoot(true)}
                size="sm"
                className="text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Node
              </Button>
            </div>
          </div>
        </div>

        {/* Add Root Node Form */}
        {isAddingRoot && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Plus className="h-4 w-4" />
                Create Root Node
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                value={newRootTitle}
                onChange={(e) => setNewRootTitle(e.target.value)}
                className="text-xs"
                placeholder="Node title (optional)"
              />
              <Textarea
                value={newRootContent}
                onChange={(e) => setNewRootContent(e.target.value)}
                className="min-h-[80px] resize-none text-xs"
                placeholder="Write your root node content..."
              />
              <div className="flex gap-2">
                <Button onClick={handleAddRootNode} disabled={!newRootContent.trim()} size="sm" className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Create
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingRoot(false);
                    setNewRootContent('');
                    setNewRootTitle('');
                  }}
                  size="sm"
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nodes */}
        {nodes.length > 0 ? (
          <div className="space-y-3">
            <NodeTree
              nodes={nodes}
              projectId={projectId!}
              onNodesChange={loadNodes}
            />
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-muted-foreground mb-4">
              <FileText className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-base font-medium mb-2">No nodes yet</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first node to start organizing your thoughts.
            </p>
            <Button
              size="sm"
              onClick={() => setIsAddingRoot(true)}
              className="text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Create First Node
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};