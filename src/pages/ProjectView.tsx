import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { NodeTree } from '@/components/NodeTree';
import { Project, Node } from '@/types/layercake';
import { storage, generateId } from '@/lib/storage';
import { ArrowLeft, Plus, FileText, Brain } from 'lucide-react';

export const ProjectView = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [isAddingRoot, setIsAddingRoot] = useState(false);
  const [newRootContent, setNewRootContent] = useState('');

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
        content: newRootContent.trim(),
        createdAt: new Date().toISOString(),
      };
      storage.addNode(newNode);
      setNewRootContent('');
      setIsAddingRoot(false);
      loadNodes();
    }
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-creative/20 border border-primary/20">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{project.name}</h1>
                <p className="text-muted-foreground">
                  {nodes.length} root {nodes.length === 1 ? 'node' : 'nodes'}
                </p>
              </div>
            </div>
          </div>
          
          <Button
            variant="gradient"
            onClick={() => setIsAddingRoot(true)}
            className="shadow-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Root Node
          </Button>
        </div>

        {/* Add Root Node Form */}
        {isAddingRoot && (
          <Card className="mb-8 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create Root Node
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={newRootContent}
                onChange={(e) => setNewRootContent(e.target.value)}
                className="min-h-[120px] resize-none"
                placeholder="Write your root node content in markdown...

Example:
# My Main Idea
This is the starting point for organizing my thoughts.

- **Key concept**: Important detail
- Next steps to explore"
              />
              <div className="flex gap-2">
                <Button onClick={handleAddRootNode} disabled={!newRootContent.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Node
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingRoot(false);
                    setNewRootContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Nodes */}
        {nodes.length > 0 ? (
          <div className="space-y-6">
            <NodeTree
              nodes={nodes}
              projectId={projectId!}
              onNodesChange={loadNodes}
            />
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="flex justify-center mb-6">
              <div className="p-6 rounded-full bg-gradient-to-br from-primary/10 to-creative/10 border border-primary/20">
                <Brain className="h-16 w-16 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-semibold mb-4">Start Building Your Knowledge Tree</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Create your first root node to begin organizing your thoughts hierarchically. Each node can have sub-nodes, creating a beautiful tree of connected ideas.
            </p>
            <Button
              variant="gradient"
              size="lg"
              onClick={() => setIsAddingRoot(true)}
              className="shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create First Node
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};