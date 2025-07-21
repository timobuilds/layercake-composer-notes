import { Project, Node, ProjectVersion } from '@/types/layercake';

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
    nodes.push(node);
    this.saveNodes(nodes);
  },

  updateNode(id: string, updates: Partial<Node>): void {
    const nodes = this.getNodes();
    const index = nodes.findIndex(n => n.id === id);
    if (index !== -1) {
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
    return this.getNodes().filter(n => n.parentId === parentId);
  },

  getRootNodes(projectId: string): Node[] {
    return this.getNodes().filter(n => n.projectId === projectId && !n.parentId);
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
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};