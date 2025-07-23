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

export interface VoiceNote {
  id: string;
  audioBlob?: Blob;
  audioUrl?: string;
  transcript?: string;
  duration?: number;
  createdAt: string;
  isProcessing?: boolean;
  aiSummary?: string;
  aiActionItems?: string[];
}

export interface Node {
  id: string;
  projectId: string;
  parentId: string | null;
  title?: string; // Optional title for root nodes
  content: string;
  completed?: boolean; // For marking items as done
  collapsed?: boolean; // For collapsing branches
  locked?: boolean; // For locking individual nodes
  order?: number; // For ordering nodes within the same parent
  createdAt: string;
  voiceNote?: VoiceNote; // Voice note attached to this node
}

export interface NodeWithChildren extends Node {
  children: NodeWithChildren[];
}