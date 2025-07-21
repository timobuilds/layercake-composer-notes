import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Node } from '@/types/layercake';
import { storage, generateId } from '@/lib/storage';
import { Plus, Edit3, Save, X, ChevronRight, ChevronDown, Type } from 'lucide-react';

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
  const [editTitle, setEditTitle] = useState(node.title || '');
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildContent, setNewChildContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const childNodes = storage.getChildNodes(node.id);
  const hasChildren = childNodes.length > 0;
  const isRoot = !node.parentId;

  const handleSave = () => {
    storage.updateNode(node.id, { 
      content: editContent,
      title: isRoot ? (editTitle.trim() || undefined) : undefined
    });
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

  const indentClass = level > 0 ? `ml-${Math.min(level * 4, 16)}` : '';

  return (
    <div className={`${indentClass} mb-2`}>
      <Card className="border border-border/40">
        <CardContent className="p-2">
          <div className="flex items-start gap-2">
            {hasChildren && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-4 w-4 mt-1"
              >
                {isExpanded ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </Button>
            )}
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  {isRoot && (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="text-xs font-medium"
                      placeholder="Node title (optional)"
                    />
                  )}
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px] resize-none text-xs"
                    placeholder="Write in markdown..."
                  />
                  <div className="flex gap-1">
                    <Button variant="default" size="sm" onClick={handleSave} className="text-xs">
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(node.content);
                        setEditTitle(node.title || '');
                      }}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="group">
                  {isRoot && node.title && (
                    <div className="flex items-center gap-1 mb-1">
                      <Type className="h-3 w-3 text-muted-foreground" />
                      <h4 className="text-xs font-medium text-foreground">{node.title}</h4>
                    </div>
                  )}
                  <div className="prose prose-sm max-w-none text-xs">
                    <div className="whitespace-pre-wrap">{node.content}</div>
                  </div>
                  <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="text-xs h-6"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddingChild(true)}
                      className="text-xs h-6"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {isAddingChild && (
            <div className="mt-2 pl-6 space-y-2">
              <Textarea
                value={newChildContent}
                onChange={(e) => setNewChildContent(e.target.value)}
                className="min-h-[60px] resize-none text-xs"
                placeholder="Write sub-node content..."
              />
              <div className="flex gap-1">
                <Button variant="default" size="sm" onClick={handleAddChild} className="text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingChild(false);
                    setNewChildContent('');
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {hasChildren && isExpanded && (
        <div className="mt-2">
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
    <div className="space-y-2">
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