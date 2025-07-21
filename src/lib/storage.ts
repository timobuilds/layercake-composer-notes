import { Project, Node, ProjectVersion } from '@/types/layercake';
import { undoManager } from './undoManager';

const PROJECTS_KEY = 'layercake-projects';
const NODES_KEY = 'layercake-nodes';
const VERSIONS_KEY = 'layercake-versions';

export const storage = {
  // Projects
  getProjects(): Project[] {
    const stored = localStorage.getItem(PROJECTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveProjects(projects: Project[]): void {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  addProject(project: Project): void {
    const projects = this.getProjects();
    projects.push(project);
    this.saveProjects(projects);
    
    // Create initial version
    this.createVersion(project.id, '1.0.0', 'Initial version', []);
  },

  getProject(id: string): Project | undefined {
    return this.getProjects().find(p => p.id === id);
  },

  // Nodes
  getNodes(): Node[] {
    const stored = localStorage.getItem(NODES_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveNodes(nodes: Node[]): void {
    localStorage.setItem(NODES_KEY, JSON.stringify(nodes));
  },

  addNode(node: Node): void {
    const nodes = this.getNodes();
    
    // Auto-assign order if not provided
    if (node.order === undefined) {
      const siblings = nodes.filter(n => n.parentId === node.parentId);
      const maxOrder = siblings.reduce((max, sibling) => Math.max(max, sibling.order || 0), 0);
      node.order = maxOrder + 1000;
    }
    
    nodes.push(node);
    this.saveNodes(nodes);
  },

  updateNode(id: string, updates: Partial<Node>, recordUndo: boolean = true): void {
    const nodes = this.getNodes();
    const index = nodes.findIndex(n => n.id === id);
    if (index !== -1) {
      const oldNode = nodes[index];
      
      // Record undo for move operations
      if (recordUndo && (updates.parentId !== undefined || updates.order !== undefined)) {
        undoManager.recordMove(
          id, 
          oldNode.parentId, 
          updates.parentId !== undefined ? updates.parentId : oldNode.parentId,
          oldNode.order,
          updates.order !== undefined ? updates.order : oldNode.order
        );
      }
      
      // Record undo for content edits
      if (recordUndo && updates.content !== undefined && updates.content !== oldNode.content) {
        undoManager.recordEdit(id, oldNode.content, updates.content);
      }
      
      nodes[index] = { ...nodes[index], ...updates };
      this.saveNodes(nodes);
    }
  },

  deleteNode(id: string): void {
    const nodes = this.getNodes();
    // Delete the node and all its descendants recursively
    const deleteNodeAndDescendants = (nodeId: string) => {
      const children = nodes.filter(n => n.parentId === nodeId);
      children.forEach(child => deleteNodeAndDescendants(child.id));
    };
    
    deleteNodeAndDescendants(id);
    const filtered = nodes.filter(n => n.id !== id && !this.isDescendantOf(n.id, id, nodes));
    this.saveNodes(filtered);
  },

  isDescendantOf(nodeId: string, ancestorId: string, allNodes: Node[]): boolean {
    const node = allNodes.find(n => n.id === nodeId);
    if (!node || !node.parentId) return false;
    if (node.parentId === ancestorId) return true;
    return this.isDescendantOf(node.parentId, ancestorId, allNodes);
  },

  getProjectNodes(projectId: string): Node[] {
    return this.getNodes().filter(n => n.projectId === projectId);
  },

  getChildNodes(parentId: string): Node[] {
    return this.getNodes()
      .filter(n => n.parentId === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  getRootNodes(projectId: string): Node[] {
    return this.getNodes()
      .filter(n => n.projectId === projectId && !n.parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  insertNodeAt(nodeId: string, targetNodeId: string, position: 'before' | 'after'): void {
    const nodes = this.getNodes();
    const nodeToMove = nodes.find(n => n.id === nodeId);
    const targetNode = nodes.find(n => n.id === targetNodeId);
    
    if (!nodeToMove || !targetNode) return;

    // Prevent circular references: check if target is a descendant of the node being moved
    if (this.isDescendantOf(targetNodeId, nodeId, nodes)) {
      console.warn('Cannot move node: would create circular reference');
      return;
    }

    // Prevent moving to same position
    if (nodeToMove.parentId === targetNode.parentId) {
      const siblings = this.getChildNodes(targetNode.parentId || '');
      const nodeIndex = siblings.findIndex(n => n.id === nodeId);
      const targetIndex = siblings.findIndex(n => n.id === targetNodeId);
      
      if ((position === 'before' && nodeIndex === targetIndex - 1) ||
          (position === 'after' && nodeIndex === targetIndex + 1)) {
        return; // Already in the correct position
      }
    }

    // Get siblings of the target node (excluding the node being moved)
    const siblings = this.getChildNodes(targetNode.parentId || '').filter(n => n.id !== nodeId);
    
    // Find target position
    const targetIndex = siblings.findIndex(n => n.id === targetNodeId);
    const insertIndex = position === 'before' ? targetIndex : targetIndex + 1;
    
    // Update the moved node's parent and calculate new order
    const newOrder = this.calculateOrderForPosition(siblings, insertIndex);
    
    this.updateNode(nodeId, { 
      parentId: targetNode.parentId,
      order: newOrder 
    });
    
    // Reorder all siblings to maintain clean ordering
    this.reorderSiblings(targetNode.parentId || '');
  },

  calculateOrderForPosition(siblings: Node[], insertIndex: number): number {
    if (siblings.length === 0) return 1000;
    if (insertIndex === 0) return (siblings[0].order || 1000) - 1000;
    if (insertIndex >= siblings.length) return (siblings[siblings.length - 1].order || 1000) + 1000;
    
    const prevOrder = siblings[insertIndex - 1].order || 1000;
    const nextOrder = siblings[insertIndex].order || 1000;
    return prevOrder + (nextOrder - prevOrder) / 2;
  },

  reorderSiblings(parentId: string | null): void {
    const siblings = this.getChildNodes(parentId || '');
    siblings.forEach((node, index) => {
      this.updateNode(node.id, { order: (index + 1) * 1000 }, false); // Don't record undo for reordering
    });
  },

  // Undo/Redo functionality
  undo(): boolean {
    const action = undoManager.undo();
    if (!action) return false;

    switch (action.type) {
      case 'move':
        this.updateNode(action.nodeId, {
          parentId: action.data.oldParentId,
          order: action.data.oldOrder
        }, false); // Don't record undo for undo operations
        break;
      case 'edit':
        this.updateNode(action.nodeId, {
          content: action.data.oldContent
        }, false);
        break;
      // Add other undo types as needed
    }
    return true;
  },

  redo(): boolean {
    const action = undoManager.redo();
    if (!action) return false;

    switch (action.type) {
      case 'move':
        this.updateNode(action.nodeId, {
          parentId: action.data.newParentId,
          order: action.data.newOrder
        }, false);
        break;
      case 'edit':
        this.updateNode(action.nodeId, {
          content: action.data.newContent
        }, false);
        break;
    }
    return true;
  },

  canUndo(): boolean {
    return undoManager.canUndo();
  },

  canRedo(): boolean {
    return undoManager.canRedo();
  },

  // Versions
  getVersions(): ProjectVersion[] {
    const stored = localStorage.getItem(VERSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveVersions(versions: ProjectVersion[]): void {
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(versions));
  },

  createVersion(projectId: string, version: string, name: string, nodes: Node[], description?: string): ProjectVersion {
    const newVersion: ProjectVersion = {
      id: generateId(),
      projectId,
      version,
      name,
      description,
      createdAt: new Date().toISOString(),
      nodeSnapshot: JSON.parse(JSON.stringify(nodes)) // Deep copy
    };
    
    const versions = this.getVersions();
    versions.push(newVersion);
    this.saveVersions(versions);
    
    // Update project's current version
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex !== -1) {
      projects[projectIndex].currentVersion = version;
      this.saveProjects(projects);
    }
    
    return newVersion;
  },

  getProjectVersions(projectId: string): ProjectVersion[] {
    return this.getVersions().filter(v => v.projectId === projectId);
  },

  restoreVersion(projectId: string, versionId: string): void {
    const versions = this.getVersions();
    const version = versions.find(v => v.id === versionId);
    if (!version) return;

    // Clear current nodes
    const allNodes = this.getNodes();
    const filteredNodes = allNodes.filter(n => n.projectId !== projectId);
    
    // Restore nodes from snapshot
    const restoredNodes = version.nodeSnapshot.map((node: Node) => ({
      ...node,
      id: generateId() // Generate new IDs to avoid conflicts
    }));
    
    this.saveNodes([...filteredNodes, ...restoredNodes]);
  },

  mergeVersions(projectId: string, sourceVersionId: string, targetVersionId: string, destructive: boolean = false): ProjectVersion {
    const versions = this.getVersions();
    const sourceVersion = versions.find(v => v.id === sourceVersionId);
    const targetVersion = versions.find(v => v.id === targetVersionId);
    
    if (!sourceVersion || !targetVersion) {
      throw new Error('Source or target version not found');
    }

    // Create merged node snapshot
    let mergedNodes: Node[] = [];
    
    if (destructive) {
      // Destructive merge: replace target nodes with source nodes
      mergedNodes = [...sourceVersion.nodeSnapshot];
    } else {
      // Non-destructive merge: combine nodes, preferring source for conflicts
      const targetNodesMap = new Map(targetVersion.nodeSnapshot.map(node => [node.id, node]));
      const sourceNodesMap = new Map(sourceVersion.nodeSnapshot.map(node => [node.id, node]));
      
      // Start with target nodes
      mergedNodes = [...targetVersion.nodeSnapshot];
      
      // Add or update with source nodes
      sourceVersion.nodeSnapshot.forEach(sourceNode => {
        const existingIndex = mergedNodes.findIndex(node => node.id === sourceNode.id);
        if (existingIndex !== -1) {
          // Update existing node
          mergedNodes[existingIndex] = sourceNode;
        } else {
          // Add new node
          mergedNodes.push(sourceNode);
        }
      });
    }

    // Create new version for merge result
    const projects = this.getProjects();
    const project = projects.find(p => p.id === projectId);
    const newVersionNumber = project ? (parseFloat(project.currentVersion) + 0.1).toFixed(1) : '1.0';
    
    const mergedVersion = this.createVersion(
      projectId,
      newVersionNumber,
      `Merge: ${sourceVersion.name} → ${targetVersion.name}`,
      mergedNodes,
      `${destructive ? 'Destructive' : 'Non-destructive'} merge of ${sourceVersion.name} into ${targetVersion.name}`
    );

    return mergedVersion;
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};