export interface ProjectVersion {
  id: string;
  projectId: string;
  version: string;
  name: string;
  description?: string;
  createdAt: string;
  nodeSnapshot: any; // Snapshot of nodes at this version
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  currentVersion: string;
}

export interface Node {
  id: string;
  projectId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
}

export interface NodeWithChildren extends Node {
  children: NodeWithChildren[];
}