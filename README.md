## Layercake Composer

Local‑first, Workflowy‑style outliner for creative projects with personas, versioning, and voice notes.

### Features
- Projects with nested bullet nodes: indent/outdent, collapse, complete, drag-and-drop
- Persona manager: templates, colors, editable instructions
- Version Manager: side panel sheet with history, restore, and merge (destructive/non‑destructive)
- Voice notes: record, attach to nodes, inline sentence capture to auto-create child nodes
- Global search and command palette (Cmd/Ctrl+K) across projects and nodes
- Pluggable persistence (default: browser `localStorage`)

### Quick start
```bash
npm i
npm run dev
```

Open http://localhost:8080 and press Cmd/Ctrl+K to try the command palette.

### Development
- Build: `npm run build`
- Lint: `npm run lint`

### Project structure (high level)
```
src/
  components/
    CommandMenu.tsx            # Cmd/Ctrl+K global search
    VersionHistoryDialog.tsx   # Version Manager (right-side Sheet)
    WorkflowyView.tsx          # Outliner view
    WorkflowyItem.tsx          # Node row: edit/indent/drag/voice/personas
    PersonaManager/            # Persona CRUD and templates
  lib/
    storage.ts                 # App data facade (projects/nodes/versions)
    personaStorage.ts          # Persona persistence
    search.ts                  # Global search across projects/nodes
  data/
    storageBackend.ts          # Pluggable storage backend (default: localStorage)
  pages/                       # Home, ProjectView, NotFound
```

### Data model (simplified)
- `Project { id, name, createdAt, currentVersion }`
- `Node { id, projectId, parentId, content, order, completed, collapsed, locked, voiceNote, personas }`
- `ProjectVersion { id, projectId, version, name, description?, createdAt, nodeSnapshot }`

### Import / Export
- Export: in DevTools console run `storage.exportProject('<projectId>')` to get JSON.
- Import: run `storage.importProject(jsonString)` to load a project (IDs preserved for that project).

### Keyboard
- Cmd/Ctrl+K: Command palette / search
- Enter: New sibling
- Tab / Shift+Tab: Indent / Outdent

### Swappable storage backend
`storage` delegates to the active backend from `src/data/storageBackend.ts`.
- Default: browser `localStorage`.
- To plug another backend (e.g., IndexedDB/Supabase), implement `{ getItem, setItem }` and call `setStorageBackend()` at app start.

### Stack
React, Vite, TypeScript, Tailwind, shadcn-ui, React Router, TanStack Query, cmdk.

### Roadmap
- Sync + multi-device (CRDT/IndexedDB/Supabase)
- Realtime collaboration (presence, cursors)
- AI persona assistance (summaries, rewrite, tagging, vector search)
- PWA/Electron packaging
