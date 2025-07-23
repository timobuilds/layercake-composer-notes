
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Node } from '@/types/layercake';
import { ChevronRight, ChevronDown, Circle, CheckCircle2, MoreHorizontal, Plus, Copy, Lock, Unlock, Trash2, Calendar, Clock, X, Mic, Volume2 } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { PersonaManager } from '@/components/PersonaManager/PersonaManager';
import { VoiceNoteRecorder } from '@/components/VoiceNoteRecorder';
import { VoiceNotePlayer } from '@/components/VoiceNotePlayer';
import { storage } from '@/lib/storage';
import { VoiceNote } from '@/types/layercake';

interface WorkflowyItemProps {
  node: Node;
  level: number;
  children: Node[];
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
  onDrop: (draggedNodeId: string, targetNodeId: string, position: 'before' | 'after' | 'child') => void;
  onNodesChange: () => void;
  editingNodeId: string | null;
  setEditingNodeId: (nodeId: string | null) => void;
}

export const WorkflowyItem = ({ 
  node, 
  level, 
  children,
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
  onDrop,
  onNodesChange,
  editingNodeId,
  setEditingNodeId
}: WorkflowyItemProps) => {
  const [editValue, setEditValue] = useState(node.content);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | 'child' | null>(null);
  const [showPersonaManager, setShowPersonaManager] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isEditing = editingNodeId === node.id;
  const hasChildren = children.length > 0;
  const isCollapsed = node.collapsed && hasChildren;
  const indentLevel = Math.min(level * 16, 200);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(node.content);
  }, [node.content]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing && !node.locked) {
      setEditingNodeId(node.id);
    }
  };

  const handleBulletClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggleCollapse(node.id);
    }
  };

  const handleSave = () => {
    if (editValue.trim() !== node.content) {
      onEdit(node.id, editValue.trim());
    }
    setEditingNodeId(null);
  };

  const handleVoiceNoteSave = (voiceNote: VoiceNote) => {
    storage.updateNode(node.id, { voiceNote });
    onNodesChange();
  };

  const handleVoiceNoteUpdate = (updatedVoiceNote: VoiceNote) => {
    storage.updateNode(node.id, { voiceNote: updatedVoiceNote });
    onNodesChange();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (node.locked) return;
    
    switch (e.key) {
      case 'Enter':
        if (e.shiftKey) return;
        e.preventDefault();
        handleSave();
        onCreateSibling(node.id, '');
        break;
      case 'Tab':
        e.preventDefault();
        handleSave();
        if (e.shiftKey) {
          onOutdent(node.id);
        } else {
          onIndent(node.id);
        }
        break;
      case 'Escape':
        setEditValue(node.content);
        setEditingNodeId(null);
        break;
      case 'Backspace':
        if (editValue === '' && node.content === '') {
          e.preventDefault();
          onDelete(node.id);
        }
        break;
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (node.locked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    if (y < height * 0.25) {
      setDragPosition('before');
    } else if (y > height * 0.75) {
      setDragPosition('after');
    } else {
      setDragPosition('child');
    }
    
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDragPosition(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const draggedNodeId = e.dataTransfer.getData('text/plain');
    if (draggedNodeId && draggedNodeId !== node.id && dragPosition) {
      onDrop(draggedNodeId, node.id, dragPosition);
    }
    
    setIsDragOver(false);
    setDragPosition(null);
  };

  return (
    <div className="workflowy-item relative">
      {/* Drop indicators */}
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
            style={{ paddingLeft: `${indentLevel + 8}px` }}
            draggable={!isEditing && !node.locked}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Menu button */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 w-6">
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
                <PopoverContent className="w-48 p-2" side="left" align="start">
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
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Lock icon */}
            {node.locked && (
              <div className="flex-shrink-0">
                <Lock className="h-3 w-3 text-red-500" />
              </div>
            )}

            {/* Bullet/Toggle */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {hasChildren && (
                <button
                  onClick={handleBulletClick}
                  className="p-0 h-4 w-4 hover:bg-muted rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3" />
                  ) : (
                    <ChevronDown className="h-3 w-3" />
                  )}
                </button>
              )}
              
              {!hasChildren && <div className="p-0 h-4 w-4" />}
              
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
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  className="border-none shadow-none px-0 py-0 h-6 text-sm bg-transparent focus-visible:ring-0 leading-6 outline-none"
                  placeholder="Type something..."
                />
              ) : (
                <div 
                  className={`text-sm cursor-text px-0 py-0 leading-6 flex items-center ${
                    node.completed ? 'line-through text-muted-foreground' : ''
                  }`}
                  style={{ minHeight: '24px', height: '24px' }}
                >
                  {node.content || (
                    <span className="text-muted-foreground italic">Click to edit</span>
                  )}
                </div>
              )}
            </div>

            {/* Voice Note Controls */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Voice Note Recorder */}
              <VoiceNoteRecorder
                onSave={handleVoiceNoteSave}
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-accent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Mic className="h-3 w-3" />
                  </Button>
                }
              />
              
              {/* Voice Note Indicator */}
              {node.voiceNote && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Volume2 className="h-3 w-3 text-primary" />
                </Button>
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

      <PersonaManager 
        isOpen={showPersonaManager} 
        onClose={() => setShowPersonaManager(false)} 
      />

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <div className="workflowy-children">
          {children.map((child) => (
            <WorkflowyItemWrapper
              key={child.id}
              node={child}
              level={level + 1}
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
              onDrop={onDrop}
              onNodesChange={onNodesChange}
              editingNodeId={editingNodeId}
              setEditingNodeId={setEditingNodeId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Wrapper component to handle children loading
interface WorkflowyItemWrapperProps extends Omit<WorkflowyItemProps, 'children'> {
  node: Node;
}

const WorkflowyItemWrapper = (props: WorkflowyItemWrapperProps) => {
  const children = storage.getChildNodes(props.node.id);
  return <WorkflowyItem {...props} children={children} />;
};
