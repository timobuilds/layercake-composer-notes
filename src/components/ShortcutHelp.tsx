import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function openShortcutHelp() {
  try {
    const evt = new CustomEvent('open-shortcut-help');
    window.dispatchEvent(evt);
  } catch {}
}

export function ShortcutHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === '/') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    const onOpen = () => setOpen(true);
    window.addEventListener('open-shortcut-help', onOpen as EventListener);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-base">Keyboard Shortcuts</DialogTitle>
          <DialogDescription className="text-xs">Press Cmd/Ctrl+/ to toggle this panel anywhere.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-xs font-medium mb-2">Editing</h4>
            <ul className="space-y-1 text-xs">
              <li><kbd>Enter</kbd>: New sibling</li>
              <li><kbd>Tab</kbd>/<kbd>Shift+Tab</kbd>: Indent/Outdent</li>
              <li><kbd>Esc</kbd>: Cancel edit</li>
              <li>Click bullet to expand/collapse branch</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-medium mb-2">Navigation</h4>
            <ul className="space-y-1 text-xs">
              <li><kbd>Cmd/Ctrl+K</kbd>: Command palette</li>
              <li>Click version: Open Version Manager</li>
              <li><kbd>Cmd/Ctrl+/</kbd>: Open this help</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-medium mb-2">Versioning</h4>
            <ul className="space-y-1 text-xs">
              <li>Create/restore/merge in Version Manager</li>
              <li>Optional: Release to GitHub</li>
              <li>Preview release before publishing</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-medium mb-2">Voice & Personas</h4>
            <ul className="space-y-1 text-xs">
              <li>Mic: Inline voice recorder</li>
              <li>Context menu: Add personas</li>
              <li>Drag persona chips to reorder on Home</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


