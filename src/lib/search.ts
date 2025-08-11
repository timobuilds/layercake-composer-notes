import { storage } from '@/lib/storage';
import type { Node, Project } from '@/types/layercake';

export type SearchResult =
  | { type: 'project'; project: Project }
  | { type: 'node'; node: Node; projectId: string };

export function searchAll(query: string, limit = 50): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const projects = storage.getProjects();
  const nodes = storage.getNodes();

  const projectMatches: SearchResult[] = projects
    .filter((p) => p.name.toLowerCase().includes(q))
    .map((p) => ({ type: 'project', project: p }));

  const nodeMatches: SearchResult[] = nodes
    .filter((n) => (n.content || '').toLowerCase().includes(q))
    .map((n) => ({ type: 'node', node: n, projectId: n.projectId }));

  return [...projectMatches, ...nodeMatches].slice(0, limit);
}


