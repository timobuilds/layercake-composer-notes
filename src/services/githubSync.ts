export type GithubSettings = { owner: string; repo: string; token: string };

const SETTINGS_KEY = 'github-sync-settings';
const LAST_SYNC_KEY = 'github-last-sync';
const VALIDATION_KEY = 'github-sync-validation';

export function saveGithubSettings(settings: GithubSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function loadGithubSettings(): GithubSettings | null {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? (JSON.parse(stored) as GithubSettings) : null;
  } catch {
    return null;
  }
}

export function isGithubConfigured(): boolean {
  const s = loadGithubSettings();
  return !!(s && s.owner && s.repo && s.token);
}

export function setLastSyncedAt(iso: string): void {
  try { localStorage.setItem(LAST_SYNC_KEY, iso); } catch {}
}

export function getLastSyncedAt(): string | null {
  try { return localStorage.getItem(LAST_SYNC_KEY); } catch { return null; }
}

async function gh(path: string, init: RequestInit, token: string) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export async function testGithubConnection(settings: GithubSettings) {
  return gh(`/repos/${settings.owner}/${settings.repo}`, { method: 'GET' }, settings.token);
}

export async function createReleaseWithSnapshot(params: {
  settings: GithubSettings;
  project: { id: string; name: string };
  data: { version: string; name: string; description?: string; json: string };
}) {
  const { settings, project, data } = params;
  const body = [
    `Project: ${project.name} (${project.id})`,
    '',
    'Snapshot:',
    '```json',
    data.json,
    '```',
  ].join('\n');

  return gh(
    `/repos/${settings.owner}/${settings.repo}/releases`,
    {
      method: 'POST',
      body: JSON.stringify({
        tag_name: `v${data.version}`,
        name: `${data.name} (v${data.version})`,
        body,
        draft: false,
        prerelease: false,
      }),
    },
    settings.token,
  );
}

export function notifyGithubSyncUpdated(): void {
  try {
    const evt = new CustomEvent('github-sync-updated');
    window.dispatchEvent(evt);
  } catch {}
}

export function setValidationResult(ok: boolean, message?: string) {
  try {
    const payload = { ok, message: message || null, at: new Date().toISOString() };
    localStorage.setItem(VALIDATION_KEY, JSON.stringify(payload));
  } catch {}
}

export function getValidationResult(): { ok: boolean; message: string | null; at: string } | null {
  try {
    const v = localStorage.getItem(VALIDATION_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}


