import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { searchAll } from '@/lib/search';

export function CommandMenu() {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const [results, setResults] = React.useState(() => [] as any[]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    setResults(q ? (searchAll(q) as any[]) : []);
  }, [q]);

  return (
    <Command.Dialog open={open} onOpenChange={setOpen} label="Command Menu">
      <Command.Input value={q} onValueChange={setQ} placeholder="Search projects and nodes…" />
      <Command.List>
        <Command.Empty>No results</Command.Empty>
        {results.map((r: any) =>
          r.type === 'project' ? (
            <Command.Item key={`p-${r.project.id}`} onSelect={() => navigate(`/project/${r.project.id}`)}>
              Project • {r.project.name}
            </Command.Item>
          ) : (
            <Command.Item key={`n-${r.node.id}`} onSelect={() => navigate(`/project/${r.projectId}`)}>
              Node • {r.node.content}
            </Command.Item>
          )
        )}
      </Command.List>
    </Command.Dialog>
  );
}


