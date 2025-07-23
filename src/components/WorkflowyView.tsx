
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Node } from '@/types/layercake';
import { storage, generateId } from '@/lib/storage';
import { Home, Plus } from 'lucide-react';
import { WorkflowyItem } from '@/components/WorkflowyItem';

interface WorkflowyViewProps {
  projectId: string;
  onNodesChange: () => void;
}

export const WorkflowyView = ({ projectId, onNodesChange }: WorkflowyViewProps) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<Node[]>([]);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  const loadNodes = useCallback(() => {
    try {
      if (focusedNodeId) {
        const focusedChildren = storage.getChildNodes(focusedNodeId);
        setNodes(focusedChildren);
        
        // Build breadcrumbs
        const crumbs: Node[] = [];
        let currentId = focusedNodeId;
        const allNodes = storage.getNodes();
        
        while (currentId) {
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
    } catch (error) {
      console.error('Error loading nodes:', error);
      setNodes([]);
      setBreadcrumbs([]);
    }
  }, [projectId, focusedNodeId]);

  useEffect(() => {
    loadNodes();
  }, [loadNodes]);

  useEffect(() => {
    onNodesChange();
  }, [nodes.length, onNodesChange]);

  const handleEdit = useCallback((nodeId: string, content: string) => {
    storage.updateNode(nodeId, { content });
    loadNodes();
  }, [loadNodes]);

  const handleToggleComplete = useCallback((nodeId: string) => {
    const allNodes = storage.getNodes();
    const node = allNodes.find(n => n.id === nodeId);
    if (node) {
      storage.updateNode(nodeId, { completed: !node.completed });
      loadNodes();
    }
  }, [loadNodes]);

  const handleToggleCollapse = useCallback((nodeId: string) => {
    const allNodes = storage.getNodes();
    const node = allNodes.find(n => n.id === nodeId);
    if (node) {
      storage.updateNode(nodeId, { collapsed: !node.collapsed });
      loadNodes();
    }
  }, [loadNodes]);

  const handleCreateChild = useCallback((parentId: string, content: string) => {
    const newNode: Node = {
      id: generateId(),
      projectId,
      parentId,
      content,
      createdAt: new Date().toISOString(),
    };
    storage.addNode(newNode);
    loadNodes();
    
    // Set the new node to editing mode
    setTimeout(() => {
      setEditingNodeId(newNode.id);
    }, 50);
  }, [projectId, loadNodes]);

  const handleCreateSibling = useCallback((nodeId: string, content: string) => {
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
      
      // Set the new node to editing mode
      setTimeout(() => {
        setEditingNodeId(newNode.id);
      }, 50);
    }
  }, [projectId, loadNodes]);

  const handleDelete = useCallback((nodeId: string) => {
    const currentNodes = focusedNodeId ? 
      storage.getChildNodes(focusedNodeId).filter(n => n.projectId === projectId) :
      storage.getRootNodes(projectId);
    const nodeIndex = currentNodes.findIndex(n => n.id === nodeId);
    
    // Find focus target before deletion
    let focusTargetId: string | null = null;
    if (nodeIndex > 0) {
      focusTargetId = currentNodes[nodeIndex - 1].id;
    } else if (nodeIndex === 0 && currentNodes.length > 1) {
      focusTargetId = currentNodes[1].id;
    }
    
    storage.deleteNode(nodeId);
    loadNodes();
    
    // Focus on target node
    if (focusTargetId) {
      setTimeout(() => {
        setEditingNodeId(focusTargetId);
      }, 50);
    }
  }, [projectId, focusedNodeId, loadNodes]);

  const handleIndent = useCallback((nodeId: string) => {
    const currentNodes = focusedNodeId ? 
      storage.getChildNodes(focusedNodeId).filter(n => n.projectId === projectId) :
      storage.getRootNodes(projectId);
    const nodeIndex = currentNodes.findIndex(n => n.id === nodeId);
    
    if (nodeIndex > 0) {
      const previousSibling = currentNodes[nodeIndex - 1];
      if (!previousSibling.locked) {
        storage.updateNode(nodeId, { parentId: previousSibling.id });
        loadNodes();
      }
    }
  }, [projectId, focusedNodeId, loadNodes]);

  const handleOutdent = useCallback((nodeId: string) => {
    const allNodes = storage.getNodes();
    const node = allNodes.find(n => n.id === nodeId);
    
    if (node && node.parentId) {
      const parent = allNodes.find(n => n.id === node.parentId);
      if (parent) {
        storage.updateNode(nodeId, { parentId: parent.parentId });
        loadNodes();
      }
    }
  }, [loadNodes]);

  const handleCopyTree = useCallback((nodeId: string) => {
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
      navigator.clipboard.writeText(markdown);
    }
  }, []);

  const handleToggleLock = useCallback((nodeId: string) => {
    const allNodes = storage.getNodes();
    const node = allNodes.find(n => n.id === nodeId);
    if (node) {
      storage.updateNode(nodeId, { locked: !node.locked });
      loadNodes();
    }
  }, [loadNodes]);

  const handleDrop = useCallback((draggedNodeId: string, targetNodeId: string, position: 'before' | 'after' | 'child') => {
    const allNodes = storage.getNodes();
    const draggedNode = allNodes.find(n => n.id === draggedNodeId);
    const targetNode = allNodes.find(n => n.id === targetNodeId);
    
    if (!draggedNode || !targetNode || draggedNode.locked) return;
    if (position === 'child' && targetNode.locked) return;
    if (storage.isDescendantOf(targetNodeId, draggedNodeId, allNodes)) return;

    try {
      if (position === 'before' || position === 'after') {
        storage.insertNodeAt(draggedNodeId, targetNodeId, position);
      } else {
        storage.updateNode(draggedNodeId, { parentId: targetNodeId });
      }
      loadNodes();
    } catch (error) {
      console.error('Error during drag and drop:', error);
    }
  }, [loadNodes]);

  const handleAddNew = useCallback(() => {
    const newNode: Node = {
      id: generateId(),
      projectId,
      parentId: focusedNodeId,
      content: '',
      createdAt: new Date().toISOString(),
    };
    storage.addNode(newNode);
    loadNodes();
    
    setTimeout(() => {
      setEditingNodeId(newNode.id);
    }, 50);
  }, [projectId, focusedNodeId, loadNodes]);

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
        {nodes.map((node) => (
          <WorkflowyItem
            key={node.id}
            node={node}
            level={0}
            children={storage.getChildNodes(node.id)}
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
            onDrop={handleDrop}
            onNodesChange={loadNodes}
            editingNodeId={editingNodeId}
            setEditingNodeId={setEditingNodeId}
          />
        ))}
      </div>

      {/* Add new item */}
      <div className="mt-4" style={{ paddingLeft: '8px' }}>
        <div className="flex items-center gap-2 py-1 hover:bg-muted/30 rounded group cursor-pointer">
          <div className="opacity-0 flex-shrink-0 w-6"></div>
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
