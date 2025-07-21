import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Node } from '@/types/layercake';
import { storage, generateId } from '@/lib/storage';
import { ChevronRight, ChevronDown, Circle, CheckCircle2, Home, Dot } from 'lucide-react';

interface WorkflowyViewProps {
  projectId: string;
  onNodesChange: () => void;
}

interface WorkflowyItemProps {
  node: Node;
  level: number;
  focusedId: string | null;
  onFocus: (nodeId: string) => void;
  onEdit: (nodeId: string, content: string) => void;
  onToggleComplete: (nodeId: string) => void;
  onToggleCollapse: (nodeId: string) => void;
  onCreateChild: (parentId: string, content: string) => void;
  onCreateSibling: (nodeId: string, content: string) => void;
  onDelete: (nodeId: string) => void;
  onIndent: (nodeId: string) => void;
  onOutdent: (nodeId: string) => void;
  children: Node[];
}

const WorkflowyItem = ({ 
  node, 
  level, 
  focusedId, 
  onFocus, 
  onEdit, 
  onToggleComplete, 
  onToggleCollapse,
  onCreateChild,
  onCreateSibling,
  onDelete,
  onIndent,
  onOutdent,
  children 
}: WorkflowyItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.content);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const hasChildren = children.length > 0;
  const isCollapsed = node.collapsed && hasChildren;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
    }
  };

  const handleBulletClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onFocus(node.id);
    }
  };

  const handleSave = () => {
    if (editValue.trim() !== node.content) {
      onEdit(node.id, editValue.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        if (e.shiftKey) {
          // Shift+Enter for new line within item
          return;
        }
        e.preventDefault();
        handleSave();
        onCreateSibling(node.id, '');
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          onOutdent(node.id);
        } else {
          onIndent(node.id);
        }
        break;
      case 'Escape':
        setEditValue(node.content);
        setIsEditing(false);
        break;
      case 'Backspace':
        if (editValue === '' && node.content === '') {
          e.preventDefault();
          onDelete(node.id);
        }
        break;
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <div className="workflowy-item">
      <div 
        className={`flex items-center gap-2 py-1 pl-${level * 4} hover:bg-muted/30 rounded group cursor-text`}
        onClick={handleClick}
        data-node-id={node.id}
      >
        {/* Bullet/Toggle */}
        <div className="flex items-center gap-1 mt-1">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCollapse(node.id);
              }}
              className="p-0 h-3 w-3 hover:bg-muted rounded"
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
          
          <button
            onClick={handleBulletClick}
            className="p-0 h-4 w-4 hover:bg-muted rounded flex items-center justify-center"
          >
            {node.completed ? (
              <CheckCircle2 className="h-3 w-3 text-green-600" />
            ) : (
              <Dot className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <Input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="border-none shadow-none p-0 h-auto text-xs bg-transparent focus-visible:ring-0"
              placeholder="Type something..."
            />
          ) : (
            <div 
              className={`text-xs cursor-text min-h-[1.2rem] ${
                node.completed ? 'line-through text-muted-foreground' : ''
              }`}
            >
              {node.content || (
                <span className="text-muted-foreground italic">Click to edit</span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(node.id);
            }}
            className="h-6 w-6 p-0"
            title="Toggle complete"
          >
            <CheckCircle2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
            title="Delete item"
          >
            ×
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <div className="workflowy-children">
          {children.map((child) => (
            <WorkflowyItemContainer
              key={child.id}
              node={child}
              level={level + 1}
              focusedId={focusedId}
              onFocus={onFocus}
              onEdit={onEdit}
              onToggleComplete={onToggleComplete}
              onToggleCollapse={onToggleCollapse}
              onCreateChild={onCreateChild}
              onCreateSibling={onCreateSibling}
              onDelete={onDelete}
              onIndent={onIndent}
              onOutdent={onOutdent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const WorkflowyItemContainer = (props: Omit<WorkflowyItemProps, 'children'>) => {
  const children = storage.getChildNodes(props.node.id);
  return <WorkflowyItem {...props} children={children} />;
};

export const WorkflowyView = ({ projectId, onNodesChange }: WorkflowyViewProps) => {
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Node[]>([]);

  const loadNodes = useCallback(() => {
    if (focusedNodeId) {
      const focusedChildren = storage.getChildNodes(focusedNodeId);
      setNodes(focusedChildren);
      
      // Build breadcrumbs
      const crumbs: Node[] = [];
      let currentId = focusedNodeId;
      while (currentId) {
        const allNodes = storage.getNodes();
        const currentNode = allNodes.find(n => n.id === currentId);
        if (currentNode) {
          crumbs.unshift(currentNode);
          currentId = currentNode.parentId;
        } else {
          break;
        }
      }
      setBreadcrumbs(crumbs);
    } else {
      const rootNodes = storage.getRootNodes(projectId);
      setNodes(rootNodes);
      setBreadcrumbs([]);
    }
    onNodesChange();
  }, [projectId, focusedNodeId, onNodesChange]);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  const handleFocus = (nodeId: string) => {
    setFocusedNodeId(nodeId);
  };

  const handleEdit = (nodeId: string, content: string) => {
    storage.updateNode(nodeId, { content });
    loadNodes();
  };

  const handleToggleComplete = (nodeId: string) => {
    const allNodes = storage.getNodes();
    const node = allNodes.find(n => n.id === nodeId);
    if (node) {
      storage.updateNode(nodeId, { completed: !node.completed });
      loadNodes();
    }
  };

  const handleToggleCollapse = (nodeId: string) => {
    const allNodes = storage.getNodes();
    const node = allNodes.find(n => n.id === nodeId);
    if (node) {
      storage.updateNode(nodeId, { collapsed: !node.collapsed });
      loadNodes();
    }
  };

  const handleCreateChild = (parentId: string, content: string) => {
    const newNode: Node = {
      id: generateId(),
      projectId,
      parentId,
      content,
      createdAt: new Date().toISOString(),
    };
    storage.addNode(newNode);
    loadNodes();
  };

  const handleCreateSibling = (nodeId: string, content: string) => {
    const allNodes = storage.getNodes();
    const node = allNodes.find(n => n.id === nodeId);
    if (node) {
      const newNode: Node = {
        id: generateId(),
        projectId,
        parentId: node.parentId,
        content,
        createdAt: new Date().toISOString(),
      };
      storage.addNode(newNode);
      loadNodes();
      
      // Focus the new node for immediate editing
      setTimeout(() => {
        const newElement = document.querySelector(`[data-node-id="${newNode.id}"] input`);
        if (newElement) {
          (newElement as HTMLInputElement).focus();
        }
      }, 50);
    }
  };

  const handleDelete = (nodeId: string) => {
    storage.deleteNode(nodeId);
    loadNodes();
  };

  const handleIndent = (nodeId: string) => {
    const allNodes = storage.getNodes();
    const currentNodes = focusedNodeId ? storage.getChildNodes(focusedNodeId) : storage.getRootNodes(projectId);
    const nodeIndex = currentNodes.findIndex(n => n.id === nodeId);
    
    if (nodeIndex > 0) {
      const previousSibling = currentNodes[nodeIndex - 1];
      storage.updateNode(nodeId, { parentId: previousSibling.id });
      loadNodes();
    }
  };

  const handleOutdent = (nodeId: string) => {
    const allNodes = storage.getNodes();
    const node = allNodes.find(n => n.id === nodeId);
    if (node && node.parentId) {
      const parent = allNodes.find(n => n.id === node.parentId);
      if (parent) {
        storage.updateNode(nodeId, { parentId: parent.parentId });
        loadNodes();
      }
    }
  };

  const handleAddNew = () => {
    const newNode: Node = {
      id: generateId(),
      projectId,
      parentId: focusedNodeId,
      content: '',
      createdAt: new Date().toISOString(),
    };
    storage.addNode(newNode);
    loadNodes();
    
    // Focus the new node for immediate editing
    setTimeout(() => {
      const newElement = document.querySelector(`[data-node-id="${newNode.id}"] input`);
      if (newElement) {
        (newElement as HTMLInputElement).focus();
      }
    }, 50);
  };

  return (
    <div className="workflowy-container">
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFocusedNodeId(null)}
            className="h-6 px-2 text-xs"
          >
            <Home className="h-3 w-3 mr-1" />
            Home
          </Button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <span>›</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFocusedNodeId(index === breadcrumbs.length - 1 ? null : crumb.id)}
                className="h-6 px-2 text-xs"
              >
                {crumb.content || 'Untitled'}
              </Button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="workflowy-items space-y-0">
        {nodes.map((node) => (
          <WorkflowyItemContainer
            key={node.id}
            node={node}
            level={0}
            focusedId={focusedNodeId}
            onFocus={handleFocus}
            onEdit={handleEdit}
            onToggleComplete={handleToggleComplete}
            onToggleCollapse={handleToggleCollapse}
            onCreateChild={handleCreateChild}
            onCreateSibling={handleCreateSibling}
            onDelete={handleDelete}
            onIndent={handleIndent}
            onOutdent={handleOutdent}
          />
        ))}
      </div>

      {/* Add new item */}
      <div className="mt-4">
        <Button
          variant="ghost"
          onClick={handleAddNew}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          + Add new item
        </Button>
      </div>
    </div>
  );
};