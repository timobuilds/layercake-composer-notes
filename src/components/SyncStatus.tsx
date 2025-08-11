import { useEffect, useState } from 'react';
import { getLastSyncedAt, isGithubConfigured, loadGithubSettings, testGithubConnection } from '@/services/githubSync';

export function SyncStatus() {
  const [connected, setConnected] = useState<boolean>(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    const settings = loadGithubSettings();
    if (!settings) {
      setConnected(false);
      return;
    }
    // Soft check without blocking UI
    testGithubConnection(settings)
      .then(() => setConnected(true))
      .catch(() => setConnected(false))
      .finally(() => setLastChecked(getLastSyncedAt() || new Date().toISOString()));
    const onUpdate = () => setLastChecked(getLastSyncedAt() || new Date().toISOString());
    window.addEventListener('github-sync-updated', onUpdate as EventListener);
    return () => window.removeEventListener('github-sync-updated', onUpdate as EventListener);
  }, []);

  const configured = isGithubConfigured();
  const label = connected && configured ? 'GitHub: connected' : configured ? 'GitHub: not connected' : 'Local only';
  const title = lastChecked ? `${label} • checked ${new Date(lastChecked).toLocaleTimeString()}` : label;

  return (
    <span
      className={`text-xs px-2 py-1 rounded border ${connected ? 'text-green-700 border-green-300 bg-green-50' : 'text-muted-foreground border-border bg-transparent'}`}
      title={title}
    >
      {label}
    </span>
  );
}


