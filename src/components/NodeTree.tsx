import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Node } from '@/types/layercake';
import { storage, generateId } from '@/lib/storage';
import { Plus, Edit3, Save, X, ChevronRight, ChevronDown } from 'lucide-react';

interface NodeTreeProps {
  nodes: Node[];
  projectId: string;
  parentId?: string | null;
  level?: number;
  onNodesChange: () => void;
}

interface NodeItemProps {
  node: Node;
  projectId: string;
  level: number;
  onNodesChange: () => void;
}

const NodeItem = ({ node, projectId, level, onNodesChange }: NodeItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildContent, setNewChildContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const childNodes = storage.getChildNodes(node.id);
  const hasChildren = childNodes.length > 0;

  const handleSave = () => {
    storage.updateNode(node.id, { content: editContent });
    setIsEditing(false);
    onNodesChange();
  };

  const handleAddChild = () => {
    if (newChildContent.trim()) {
      const newNode: Node = {
        id: generateId(),
        projectId,
        parentId: node.id,
        content: newChildContent.trim(),
        createdAt: new Date().toISOString(),
      };
      storage.addNode(newNode);
      setNewChildContent('');
      setIsAddingChild(false);
      setIsExpanded(true);
      onNodesChange();
    }
  };

  const indentClass = level > 0 ? `ml-${Math.min(level * 6, 24)}` : '';

  return (
    <div className={`${indentClass} mb-4`}>
      <Card className="shadow-sm border-border/40 hover:border-primary/30 transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-1 p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )}
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[100px] resize-none"
                    placeholder="Write in markdown..."
                  />
                  <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(node.content);
                      }}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="group">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {node.content}
                    </ReactMarkdown>
                  </div>
                  <div className="flex gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => setIsAddingChild(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Sub-node
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {isAddingChild && (
            <div className="mt-4 pl-9 space-y-3">
              <Textarea
                value={newChildContent}
                onChange={(e) => setNewChildContent(e.target.value)}
                className="min-h-[80px] resize-none"
                placeholder="Write sub-node content in markdown..."
              />
              <div className="flex gap-2">
                <Button variant="default" size="sm" onClick={handleAddChild}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingChild(false);
                    setNewChildContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {hasChildren && isExpanded && (
        <div className="mt-4">
          <NodeTree
            nodes={childNodes}
            projectId={projectId}
            level={level + 1}
            onNodesChange={onNodesChange}
          />
        </div>
      )}
    </div>
  );
};

export const NodeTree = ({ nodes, projectId, level = 0, onNodesChange }: NodeTreeProps) => {
  return (
    <div className="space-y-4">
      {nodes.map((node) => (
        <NodeItem
          key={node.id}
          node={node}
          projectId={projectId}
          level={level}
          onNodesChange={onNodesChange}
        />
      ))}
    </div>
  );
};