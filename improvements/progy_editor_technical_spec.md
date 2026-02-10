# Progy Editor: Technical Specification (v2 - Bun & Modern Stack)

This document outlines the detailed technical architecture for the standalone `apps/editor` application.

**Core Vision:** A high-performance, developer-centric Course Creator environment built on cutting-edge, minimal-dependency web standards. It prioritizes the "IDE feel" over traditional CMS interfaces.

---

## 1. High-Level Architecture

The **Progy Editor** will be a single-binary application (when bundled) that serves a React frontend and handles file system operations via a Bun native server.

### 1.1. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime & Server** | **Bun** (`Bun.serve`) | Zero-config, ultra-fast HTTP/WebSocket server. Replaces Express/Fastify. |
| **Frontend Framework** | **React 19** (via Vite) | Standard component model. We need React for the rich ecosystem (Tiptap, Monaco). |
| **Styling** | **Tailwind CSS v4** | Using the JIT CDN script for dev speed or the new CLI. No `postcss.config.js` or `tailwind.config.ts`. |
| **State Management** | **Nanostores** | Atomic, framework-agnostic state. Perfect for frequent updates (typing, cursor). |
| **Routing** | **@nanostores/router** | Minimal, type-safe router that syncs URL state with atoms. |
| **Data Fetching** | **@nanostores/query** | Revalidating cache for file tree and content (SWR pattern). |
| **Form Handling** | **@tanstack/react-form** | Headless, type-safe form validation for complex configs (`course.json`). |
| **Rich Text Editor** | **Tiptap** | Headless wrapper around ProseMirror. Allows custom React components for blocks. |
| **Code Editor** | **Monaco Editor** | The VS Code editor core. Essential for the "IDE feel" (Minimap, LSP, IntelliSense). |

---

## 2. Project Structure (`apps/editor`)

The folder structure is designed to separate the "Server Bridge" from the "Client UI".

```
apps/editor/
├── index.ts                # Entry point (Bun.serve)
├── public/                 # Static assets (favicons, manifest)
├── server/                 # Backend Logic (The "Bridge")
│   ├── router.ts           # API Route matching (native Request/Response)
│   ├── handlers/
│   │   ├── fs.ts           # File System operations (read, write, move, delete)
│   │   ├── docker.ts       # Docker/Compose integration
│   │   └── lsp.ts          # Language Server Protocol bridge
│   └── ws.ts               # WebSocket handler (Hot Reload, Terminal PTY)
├── src/                    # Frontend React App
│   ├── main.tsx            # React entry
│   ├── App.tsx             # Root Layout
│   ├── stores/             # Nanostores Definitions
│   │   ├── router.ts       # URL definition
│   │   ├── files.ts        # File tree & Active file atoms
│   │   └── ui.ts           # Sidebar/Theme state
│   ├── components/
│   │   ├── editor/         # The core editing surface
│   │   │   ├── RichText.tsx   # Tiptap wrapper
│   │   │   ├── Code.tsx       # Monaco wrapper
│   │   │   └── extensions/    # Custom Tiptap Node Views (Video, Note)
│   │   ├── layout/         # Panels, Resizable Logic
│   │   └── forms/          # Configuration forms (TanStack Form)
│   └── lib/                # Utilities (API client, debouncers)
├── index.html              # App Shell (Tailwind CDN script here)
└── vite.config.ts          # Minimal build config
```

---

## 3. Detailed Component Specifications

### 3.1. The Bun Server (`server/`)

The server is not just an API; it's a bridge to the OS.

**`index.ts` Implementation Strategy:**
We use `Bun.serve` to handle both static files (the built frontend) and API calls.

```typescript
// server/index.ts (Concept)
const server = Bun.serve({
  port: 4000,
  async fetch(req, server) {
    const url = new URL(req.url);

    // 1. WebSocket Upgrade (LSP, Terminal, HMR)
    if (url.pathname === "/ws") {
      const success = server.upgrade(req);
      return success ? undefined : new Response("Upgrade failed", { status: 500 });
    }

    // 2. API Routes
    if (url.pathname.startsWith("/api/")) {
      return handleApiRequest(req); // Router logic
    }

    // 3. Static Files (Vite build or Dev Server proxy)
    // In dev: Proxy to Vite (http://localhost:5173)
    // In prod: Serve from ./dist
    return serveStatic(req);
  },
  websocket: {
    message(ws, message) { /* ... */ },
    open(ws) { /* ... */ },
  }
});
```

### 3.2. State & Routing (Nanostores)

We strictly separate **URL state** from **Application state**.

**Router Setup (`src/stores/router.ts`):**
```typescript
import { createRouter } from '@nanostores/router';

export const $router = createRouter({
  home: '/',
  editor: '/edit/:filePath', // e.g., /edit/content/01_intro/01_hello.rs
  settings: '/settings',
  preview: '/preview/:moduleId',
});
```

**Query Setup (`src/stores/files.ts`):**
Using `@nanostores/query` allows us to fetch the file tree and have it auto-update when the backend notifies of changes via WS.

```typescript
import { createFetcherStore } from '@nanostores/query';

// Fetches directory structure
export const $fileTree = createFetcherStore<FileNode[]>(['file-tree']);

// Fetches content for the active file
export const $fileContent = createFetcherStore<string>(['file-content', $activeFilePath]);
```

### 3.3. Rich Text Editor (Tiptap with Custom Nodes)

The standard Tiptap is insufficient. We need **Block-based editing** for specific Progy features.

**Architecture:**
-   **Core:** `@tiptap/react`, `@tiptap/starter-kit`.
-   **Markdown:** `tiptap-markdown` (We save as MD, not HTML/JSON).
-   **Custom Node Views (React Components):**

1.  **Video Block (`<VideoNode />`):**
    -   *Markdown:* `::video[url="https://..."]` (using `remark-directive` syntax).
    -   *UI:* Renders a specialized player placeholder. Supports pasting YouTube/Vimeo links.
    -   *Props:* `src`, `title`, `poster`.

2.  **Note/Callout Block (`<CalloutNode />`):**
    -   *Markdown:* `:::note ... :::` or `> [!NOTE]`.
    -   *UI:* A colored box (Blue/Info, Yellow/Warning, Red/Danger) with an icon.
    -   *Interaction:* Dropdown to change type (Note -> Warning).

3.  **Interactive Code Block (`<PlaygroundNode />`):**
    -   *Markdown:* ` ```rust:playground ... ``` `
    -   *UI:* Embeds a mini Monaco instance *inside* the rich text flow.
    -   *Feature:* "Run" button that sends code to the backend Docker runner.

### 3.4. Code Editor (Monaco vs. CodeMirror)

**Verdict:** Use **Monaco Editor**.

**Why Monaco?**
-   **IntelliSense:** Out-of-the-box support for TypeScript/JS/JSON validation.
-   **LSP Support:** Robust libraries (`monaco-languageclient`) exist to connect to `rust-analyzer` via WebSockets.
-   **Minimap & Diff View:** Essential for comparing file versions or large files.
-   **Familiarity:** Users expect VS Code keybindings (`Cmd+D`, `Alt+Click`).

**Implementation Strategy:**
-   Wrap `@monaco-editor/react` in a generic `<CodeEditor />` component.
-   **Theme:** Create a custom Monaco theme that matches the **Zinc/Rust** UI palette exactly (background `#09090b`, keywords `#f97316`).
-   **Typings:** For `course.json`, inject the JSON Schema to get auto-completion for fields like `runner.image`.

### 3.5. Form Management (`@tanstack/react-form`)

For complex configuration files (`course.json`, `info.toml`), raw JSON editing is error-prone. We will provide a **GUI Form**.

**Why TanStack Form?**
-   **Headless:** Full control over UI components (using our shadcn/ui library).
-   **Validation:** First-class Zod integration.
-   **Performance:** Fine-grained subscription to field updates (no re-rendering the whole form on every keystroke).

**Example Schema (`course.json`):**
```typescript
const courseSchema = z.object({
  id: z.string().min(3).regex(/^[a-z0-9-]+$/),
  name: z.string().min(5),
  runner: z.object({
    type: z.enum(['docker', 'process']),
    image: z.string().optional(),
  }),
});
```

---

## 4. Implementation Guide (Step-by-Step)

### Phase 1: The Foundation (Day 1-2)

1.  **Initialize Bun Project:**
    -   `bun init` in `apps/editor`.
    -   `bun add react react-dom vite @vitejs/plugin-react`.
    -   `bun add -d tailwindcss postcss autoprefixer` (or use CDN for MVP).

2.  **Setup Server Bridge:**
    -   Create `server/index.ts` with `Bun.serve`.
    -   Implement `GET /api/fs/tree` using `node:fs/promises`.
    -   Implement `ws` handler for `chokidar` file watching.

3.  **Setup Frontend Router & Store:**
    -   Initialize `@nanostores/router`.
    -   Create the layout shell (Sidebar + Main Area) using Tailwind v4 classes.

### Phase 2: The Editor Core (Day 3-5)

4.  **Integrate Monaco:**
    -   Install `@monaco-editor/react`.
    -   Create `<CodeEditor path="..." />`.
    -   Connect it to `$fileContent` store (fetch on mount, save on `Ctrl+S`).

5.  **Integrate Tiptap:**
    -   Install `@tiptap/react` `tiptap-markdown`.
    -   Create `<RichTextEditor />`.
    -   Implement the serialization/deserialization logic (Markdown <-> ProseMirror Node Tree).

6.  **File Tree Component:**
    -   Use `@nanostores/query` to fetch tree data.
    -   Recursive rendering with `<Folder />` and `<File />` icons.
    -   Connect click events to `$router.open('/edit/...')`.

### Phase 3: Advanced Features (Day 6-8)

7.  **Configuration Forms:**
    -   Create `ConfigEditor.tsx`.
    -   Use `@tanstack/react-form` to bind `course.json` fields.
    -   Implement "Switch View" (GUI <-> JSON Source).

8.  **Terminal Panel:**
    -   Install `xterm` and `xterm-addon-fit`.
    -   Backend: Use `node-pty` to spawn a shell.
    -   Frontend: Render `xterm` in a bottom collapsible panel.

9.  **Custom Tiptap Nodes:**
    -   Implement `<CalloutNode />` and `<VideoNode />`.
    -   Ensure they serialize correctly back to Markdown.

---

## 5. Tailwind v4 Specifics

Since Tailwind v4 is CSS-first, we avoid `tailwind.config.ts`.

**`index.html`:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Progy Editor</title>
    <!-- Development CDN -->
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    <style type="text/tailwindcss">
        @theme {
            --color-rust: #f97316;
            --color-zinc-950: #09090b;
            --font-sans: 'Inter', sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
        }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

This setup allows immediate prototyping. For production, we will switch to the Vite plugin `tailwindcss`.

---

## 6. Comparison: Monaco vs. CodeMirror

| Feature | Monaco Editor | CodeMirror 6 | Recommendation |
| :--- | :--- | :--- | :--- |
| **Bundle Size** | Heavy (~2-4MB) | Light/Modular (~500KB) | Monaco for Editor App |
| **Performance** | Excellent (Canvas-like) | Excellent (DOM-based) | Tie |
| **LSP** | Native-like (VS Code) | Requires Adapter | Monaco |
| **Minimap** | Built-in | Plugin required | Monaco |
| **Mobile** | Poor | Good | CodeMirror |
| **Customization** | Hard (Internal APIs) | Easy (Extension system) | CodeMirror |

**Decision:** Since this is a **Desktop/Web Editor for Instructors** (who are developers), the **"IDE Feel"** is paramount. Monaco provides the exact experience of VS Code, which is the gold standard. The file size penalty is acceptable for a dedicated editor application.

---

## 7. Migration Strategy (From CLI to Standalone)

1.  **Freeze CLI Editor:** Stop adding features to `apps/cli/src/frontend/editor`.
2.  **Scaffold `apps/editor`:** Set up the Bun server and basic React shell.
3.  **Port Logic:** Move the file system logic from `apps/cli/backend` to `apps/editor/server`.
4.  **Rewrite UI:** Re-implement the UI using the new stack (TanStack Form, Monaco).
5.  **Release:** Add `progy edit` command to CLI that downloads/runs the new editor binary or server.

---
