import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GithubSettings, loadGithubSettings, saveGithubSettings, testGithubConnection, getValidationResult, setValidationResult } from '@/services/githubSync';
import { useEffect as useReactEffect } from 'react';

export default function Settings() {
  const [form, setForm] = useState<GithubSettings>({ owner: '', repo: '', token: '' });
  const [showToken, setShowToken] = useState(false);
  const [status, setStatus] = useState<null | 'idle' | 'testing' | 'ok' | 'error'>(null);
  const [message, setMessage] = useState<string>('');
  const validation = getValidationResult();

  useEffect(() => {
    const s = loadGithubSettings();
    if (s) setForm(s);
  }, []);

  const save = () => {
    saveGithubSettings(form);
    setMessage('Saved.');
  };

  const test = async () => {
    setStatus('testing');
    setMessage('');
    try {
      await testGithubConnection(form);
      setStatus('ok');
      setMessage('Connection successful.');
      setValidationResult(true, 'OK');
    } catch (e: any) {
      setStatus('error');
      setMessage(e?.message || 'Connection failed.');
      setValidationResult(false, e?.message);
    }
  };

  // Install app button via beforeinstallprompt
  const [canInstall, setCanInstall] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  useReactEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
  };

  return (
    <div className="min-h-screen bg-background flex justify-center">
      <div className="w-[600px] px-4 py-6 space-y-4">
        <h1 className="text-base font-medium">Settings</h1>
        <p className="text-xs text-muted-foreground">Configure GitHub sync for releases.</p>

        <div className="space-y-2">
          <label className="text-xs">GitHub Owner</label>
          <Input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-xs">Repository</label>
          <Input value={form.repo} onChange={(e) => setForm({ ...form, repo: e.target.value })} />
        </div>
        <div className="space-y-2">
          <label className="text-xs">Personal Access Token (repo scope)</label>
          <div className="flex gap-2 items-center">
            <Input type={showToken ? 'text' : 'password'} value={form.token} onChange={(e) => setForm({ ...form, token: e.target.value })} />
            <Button size="sm" variant="outline" onClick={() => setShowToken(v => !v)}>{showToken ? 'Hide' : 'Show'}</Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={save}>Save</Button>
          <Button size="sm" variant="outline" onClick={test} disabled={!form.owner || !form.repo || !form.token || status === 'testing'}>
            {status === 'testing' ? 'Testing…' : 'Test connection'}
          </Button>
          <Button size="sm" variant="secondary" onClick={installApp} disabled={!canInstall}>Install App</Button>
        </div>
        {message && (
          <div className={`text-xs ${status === 'error' ? 'text-red-600' : 'text-muted-foreground'}`}>{message}</div>
        )}
        {validation && (
          <div className="text-xs text-muted-foreground">
            Last validation: {validation.ok ? 'OK' : 'Failed'} • {new Date(validation.at).toLocaleString()}
            {validation.message ? ` • ${validation.message}` : ''}
          </div>
        )}
        <div className="text-[11px] text-muted-foreground mt-2">
          Required scopes: <code>repo</code>. For fine-grained tokens, grant Contents: Read & Write. If your repo is in an org with SSO, authorize the token for that org.
        </div>
      </div>
    </div>
  );
}


