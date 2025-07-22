import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Node } from '@/types/layercake';
import { storage, generateId } from '@/lib/storage';
import { ChevronRight, ChevronDown, Circle, CheckCircle2, Home, Dot, MoreHorizontal, Plus, Copy, Lock, Unlock, Trash2, Calendar, Clock, X } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PersonaManager } from '@/components/PersonaManager/PersonaManager';

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
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | 'child' | null>(null);
  const [showPersonaManager, setShowPersonaManager] = useState(false);
  const [draggedPersona, setDraggedPersona] = useState<string | null>(null);
  const [dragOverPersona, setDragOverPersona] = useState<string | null>(null);
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
          // Don't call handleSave() here since we're deleting the node
          onDelete(node.id);
        }
        break;
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    // Determine drop position based on mouse position
    if (y < height * 0.25) {
      setDragPosition('before');
    } else if (y > height * 0.75) {
      setDragPosition('after');
    } else {
      setDragPosition('child');
    }
    
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const draggedNodeId = e.dataTransfer.getData('text/plain');
    if (draggedNodeId && draggedNodeId !== node.id) {
      // Check if the dragged node is locked
      const allNodes = storage.getNodes();
      const draggedNode = allNodes.find(n => n.id === draggedNodeId);
      if (draggedNode?.locked) {
        setDragPosition(null);
        return; // Don't allow moving locked nodes
      }

      // Check if trying to drop onto a locked node as child
      if (dragPosition === 'child' && node.locked) {
        setDragPosition(null);
        return; // Don't allow dropping into locked nodes
      }

      if (dragPosition === 'before') {
        // Insert as sibling before this node
        storage.insertNodeAt(draggedNodeId, node.id, 'before');
      } else if (dragPosition === 'after') {
        // Insert as sibling after this node
        storage.insertNodeAt(draggedNodeId, node.id, 'after');
      } else {
        // Move the dragged node to be a child of this node
        // Additional circular reference check
        if (storage.isDescendantOf(node.id, draggedNodeId, allNodes)) {
          setDragPosition(null);
          return; // Prevent circular reference
        }
        storage.updateNode(draggedNodeId, { parentId: node.id });
      }
      
      // Trigger refresh through the parent component
      const event = new CustomEvent('nodesChanged');
      window.dispatchEvent(event);
    }
    
    setDragPosition(null);
  };

  return (
    <div className="workflowy-item relative">
      {/* Drop indicator line */}
      {isDragOver && dragPosition === 'before' && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-10 -mt-0.5" />
      )}
      {isDragOver && dragPosition === 'after' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 z-10 -mb-0.5" />
      )}
      <ContextMenu>
        <ContextMenuTrigger>
          <div 
            className={`flex items-center gap-2 py-1 hover:bg-muted/30 rounded group cursor-pointer relative transition-colors ${
              isDragOver && dragPosition === 'child' ? 'bg-primary/10 border-l-4 border-primary' : ''
            }`}
            onClick={handleClick}
            data-node-id={node.id}
            style={{ paddingLeft: `${indentLevel + 8}px` }}
            draggable={!isEditing && !node.locked}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
                      {hasChildren && (
                        <>
                          <div className="px-2 py-1">
                            <label className="text-xs text-muted-foreground mb-1 block">Personas</label>
                             <div className="flex flex-wrap gap-1">
                               {['Screenwriter', 'Editor', 'Director', 'Producer', 'Actor'].map((persona, index) => (
                                 <button
                                   key={persona}
                                   draggable
                                   className={`group/persona px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1 hover:bg-opacity-80 transition-all cursor-pointer ${
                                     draggedPersona === persona ? 'opacity-50' : ''
                                   } ${
                                     dragOverPersona === persona ? 'scale-105 shadow-lg' : ''
                                   }`}
                                   style={{ 
                                     backgroundColor: `hsl(var(--persona-${
                                       ['blue', 'green', 'yellow', 'brown', 'purple'][index]
                                     }))` 
                                   }}
                                   onDragStart={(e) => {
                                     e.stopPropagation();
                                     setDraggedPersona(persona);
                                     e.dataTransfer.setData('text/plain', persona);
                                   }}
                                   onDragEnd={() => {
                                     setDraggedPersona(null);
                                     setDragOverPersona(null);
                                   }}
                                   onDragOver={(e) => {
                                     e.preventDefault();
                                     e.stopPropagation();
                                     if (draggedPersona && draggedPersona !== persona) {
                                       setDragOverPersona(persona);
                                     }
                                   }}
                                   onDragLeave={(e) => {
                                     e.stopPropagation();
                                     setDragOverPersona(null);
                                   }}
                                   onDrop={(e) => {
                                     e.preventDefault();
                                     e.stopPropagation();
                                     const draggedItem = e.dataTransfer.getData('text/plain');
                                     if (draggedItem && draggedItem !== persona) {
                                       // Here you would reorder the personas
                                       console.log(`Moving ${draggedItem} to position of ${persona}`);
                                     }
                                     setDraggedPersona(null);
                                     setDragOverPersona(null);
                                   }}
                                   onClick={() => setShowPersonaManager(true)}
                                   title="Edit personas"
                                 >
                                   <span>{persona}</span>
                                   <button 
                                     className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                                     onClick={(e) => e.stopPropagation()}
                                     title="Remove persona"
                                   >
                                     <X className="h-2.5 w-2.5" />
                                   </button>
                                 </button>
                               ))}
                              <button 
                                className="px-2 py-1 rounded text-xs font-medium border border-dashed border-muted-foreground/50 text-muted-foreground hover:bg-muted/50 transition-colors"
                                onClick={() => setShowPersonaManager(true)}
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                          <div className="border-t border-border my-1" />
                        </>
                      )}
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
                  className="p-0 h-4 w-4 hover:bg-muted rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
              
              {!hasChildren && (
                <div className="p-0 h-4 w-4 flex items-center justify-center">
                  {/* Empty space to maintain alignment */}
                </div>
              )}
              
              <button
                onClick={handleBulletClick}
                className="p-0 h-4 w-4 hover:bg-muted rounded flex items-center justify-center"
              >
                {node.completed ? (
                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                ) : (
                  <Circle className={`text-muted-foreground fill-current ${
                    hasChildren ? 'h-3 w-3 border-2 border-gray-300 rounded-full' : 'h-2 w-2'
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

      {/* Persona Manager Dialog */}
      <PersonaManager 
        isOpen={showPersonaManager} 
        onClose={() => setShowPersonaManager(false)} 
      />

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
    
    // Listen for custom drag events to refresh the view
    const handleNodesChanged = () => {
      loadNodes();
    };
    
    // Keyboard event handling for undo/redo
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (storage.undo()) {
          loadNodes();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (storage.redo()) {
          loadNodes();
        }
      }
    };
    
    window.addEventListener('nodesChanged', handleNodesChanged);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('nodesChanged', handleNodesChanged);
      window.removeEventListener('keydown', handleKeyDown);
    };
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
        const newElement = document.querySelector(`[data-node-id="${newNode.id}"]`) as HTMLElement;
        if (newElement) {
          newElement.click();
        }
      }, 50);
    }
  };

  const handleDelete = (nodeId: string) => {
    // Find the node's position to determine where to focus after deletion
    const currentNodes = focusedNodeId ? storage.getChildNodes(focusedNodeId) : storage.getRootNodes(projectId);
    const nodeIndex = currentNodes.findIndex(n => n.id === nodeId);
    
    // Store focus target before deletion
    let focusTargetId: string | null = null;
    
    if (nodeIndex > 0) {
      // Focus on previous sibling
      focusTargetId = currentNodes[nodeIndex - 1].id;
    } else if (nodeIndex === 0 && currentNodes.length > 1) {
      // If deleting first node, focus on next sibling
      focusTargetId = currentNodes[1].id;
    } else if (nodeIndex >= 0 && focusedNodeId) {
      // If no siblings, focus on parent
      focusTargetId = focusedNodeId;
    }
    
    storage.deleteNode(nodeId);
    loadNodes();
    
    // Focus on the target node's input after deletion
    if (focusTargetId) {
      setTimeout(() => {
        // Find the target node element and trigger a click to enter edit mode
        const targetNodeElement = document.querySelector(`[data-node-id="${focusTargetId}"] .cursor-text`);
        if (targetNodeElement) {
          // Simulate a click to enter edit mode
          (targetNodeElement as HTMLElement).click();
          
          // Wait a bit for the input to be created, then focus and position cursor
          setTimeout(() => {
            const targetInput = document.querySelector(`[data-node-id="${focusTargetId}"] input`) as HTMLInputElement;
            if (targetInput) {
              targetInput.focus();
              targetInput.setSelectionRange(targetInput.value.length, targetInput.value.length);
            }
          }, 100);
        }
      }, 50);
    }
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
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground" style={{ paddingLeft: '84px' }}>
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
      <div className="mt-4" style={{ paddingLeft: '8px' }}>
        <div className="flex items-center gap-2 py-1 hover:bg-muted/30 rounded group cursor-pointer">
          <div className="opacity-0 flex-shrink-0 w-6"></div> {/* Space for three dots menu */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              onClick={handleAddNew}
              className="p-0 h-4 w-4 hover:bg-muted rounded flex items-center justify-center"
            >
              <Plus className="h-3 w-3 text-muted-foreground" />
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <Button
              variant="ghost"
              onClick={handleAddNew}
              className="text-sm text-muted-foreground hover:text-foreground h-6 px-0 py-0 justify-start font-normal"
            >
              Add new item
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
