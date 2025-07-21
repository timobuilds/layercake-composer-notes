import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Node } from '@/types/layercake';
import { storage, generateId } from '@/lib/storage';
import { ChevronRight, ChevronDown, Circle, CheckCircle2, Home, Dot, MoreHorizontal, Plus, Copy, Lock, Unlock, Trash2, Calendar, Clock } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
  onCopyTree: (nodeId: string) => void;
  onToggleLock: (nodeId: string) => void;
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
  onCopyTree,
  onToggleLock,
  children 
}: WorkflowyItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.content);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const hasChildren = children.length > 0;
  const isCollapsed = node.collapsed && hasChildren;
  // Adaptive indentation: smaller increments for deeper levels to prevent excessive indentation
  const baseIndent = Math.min(level * 16, 200); // Max 200px base indentation
  const extraIndent = Math.max(0, level - 12) * 8; // Smaller increments after level 12
  const indentLevel = baseIndent + extraIndent;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing && !node.locked) {
      setIsEditing(true);
    }
  };

  const handleBulletClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleCollapse(node.id);
    } else {
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
    if (node.locked) return;
    
    switch (e.key) {
      case 'Enter':
        if (e.shiftKey) {
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
      <ContextMenu>
        <ContextMenuTrigger>
          <div 
            className={`flex items-center gap-2 py-1 hover:bg-muted/30 rounded group cursor-text relative`}
            onClick={handleClick}
            data-node-id={node.id}
            style={{ paddingLeft: `${indentLevel + 8}px` }}
          >
            {/* Three dots menu - always takes space but only visible on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-6">{/* Always reserve space */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-accent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  className="w-48 p-2" 
                  side="left" 
                  align="start"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-1">
                    <button 
                      className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded text-left"
                      onClick={() => onCopyTree(node.id)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy tree
                    </button>
                    <button 
                      className="flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded text-left"
                      onClick={() => onToggleLock(node.id)}
                    >
                      {node.locked ? (
                        <Unlock className="h-4 w-4 mr-2 text-red-500" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      {node.locked ? 'Unlock' : 'Lock'}
                    </button>
                    <button 
                      className={`flex items-center w-full px-2 py-1.5 text-sm hover:bg-accent rounded text-left ${node.locked ? 'opacity-50 cursor-not-allowed' : 'text-destructive'}`}
                      onClick={() => !node.locked && onDelete(node.id)}
                      disabled={node.locked}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </button>
                    <div className="border-t my-1"></div>
                    <div className="flex items-center px-2 py-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-2" />
                      Date created: {new Date(node.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center px-2 py-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-2" />
                      Last edit: {new Date(node.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Lock icon for locked nodes */}
            {node.locked && (
              <div className="flex-shrink-0">
                <Lock className="h-3 w-3 text-red-500" />
              </div>
            )}

            {/* Bullet/Toggle */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {hasChildren && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleCollapse(node.id);
                  }}
                  className="p-0 h-4 w-4 hover:bg-muted rounded flex items-center justify-center"
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
                  <Circle className={`h-2 w-2 text-muted-foreground fill-current ${
                    hasChildren ? 'border-2 border-gray-300 rounded-full' : ''
                  }`} />
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
                  className="border-none shadow-none px-0 py-0 h-6 text-sm bg-transparent focus-visible:ring-0 leading-6 outline-none flex items-center"
                  style={{ minHeight: '24px', margin: 0, lineHeight: '24px' }}
                  placeholder="Type something..."
                />
              ) : (
                <div 
                  className={`text-sm cursor-text px-0 py-0 leading-6 flex items-center ${
                    node.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                  style={{ minHeight: '24px', margin: 0, height: '24px', lineHeight: '24px' }}
                >
                  {node.content || (
                    <span className="text-muted-foreground italic">Click to edit</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </ContextMenuTrigger>
        
        <ContextMenuContent>
          <ContextMenuItem 
            onClick={() => !node.locked && onCreateChild(node.id, '')}
            disabled={node.locked}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add child
          </ContextMenuItem>
          <ContextMenuItem 
            onClick={() => !node.locked && onCreateSibling(node.id, '')}
            disabled={node.locked}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add sibling
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => onToggleComplete(node.id)}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            {node.completed ? 'Mark incomplete' : 'Mark complete'}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem 
            onClick={() => !node.locked && onDelete(node.id)}
            disabled={node.locked}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

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
              onCopyTree={onCopyTree}
              onToggleLock={onToggleLock}
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
  }, [projectId, focusedNodeId]);

  // Separate effect to call onNodesChange to avoid infinite loop
  useEffect(() => {
    onNodesChange();
  }, [nodes, onNodesChange]);

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

  const handleCopyTree = (nodeId: string) => {
    const buildMarkdown = (node: Node, level: number = 0): string => {
      const indent = '  '.repeat(level);
      const prefix = level === 0 ? '# ' : '- ';
      let markdown = `${indent}${prefix}${node.content || 'Untitled'}\n`;
      
      const children = storage.getChildNodes(node.id);
      children.forEach(child => {
        markdown += buildMarkdown(child, level + 1);
      });
      
      return markdown;
    };
    
    const allNodes = storage.getNodes();
    const node = allNodes.find(n => n.id === nodeId);
    if (node) {
      const markdown = buildMarkdown(node);
      navigator.clipboard.writeText(markdown).then(() => {
        // Could add a toast notification here
        console.log('Tree copied to clipboard as markdown');
      });
    }
  };

  const handleToggleLock = (nodeId: string) => {
    const allNodes = storage.getNodes();
    const node = allNodes.find(n => n.id === nodeId);
    if (node) {
      storage.updateNode(nodeId, { locked: !node.locked });
      loadNodes();
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
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFocusedNodeId(null)}
            className="h-8 px-3 text-sm"
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.id}>
              <span>›</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFocusedNodeId(index === breadcrumbs.length - 1 ? null : crumb.id)}
                className="h-8 px-3 text-sm"
              >
                {crumb.content || 'Untitled'}
              </Button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="workflowy-items space-y-1">
        {nodes.map((node) => {
          console.log('Rendering node:', node.id, 'locked:', node.locked);
          return (
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
              onCopyTree={handleCopyTree}
              onToggleLock={handleToggleLock}
            />
          );
        })}
      </div>

      {/* Add new item */}
      <div className="mt-4 ml-2">
        <Button
          variant="ghost"
          onClick={handleAddNew}
          className="text-sm text-muted-foreground hover:text-foreground h-8 px-2"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add new item
        </Button>
      </div>
    </div>
  );
};
