export interface Project {
  id: string;
  name: string;
  createdAt: string;
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