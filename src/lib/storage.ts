import { Project, Node } from '@/types/layercake';

const PROJECTS_KEY = 'layercake-projects';
const NODES_KEY = 'layercake-nodes';

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
    const filtered = nodes.filter(n => n.id !== id && n.parentId !== id);
    this.saveNodes(filtered);
  },

  getProjectNodes(projectId: string): Node[] {
    return this.getNodes().filter(n => n.projectId === projectId);
  },

  getChildNodes(parentId: string): Node[] {
    return this.getNodes().filter(n => n.parentId === parentId);
  },

  getRootNodes(projectId: string): Node[] {
    return this.getNodes().filter(n => n.projectId === projectId && !n.parentId);
  }
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};