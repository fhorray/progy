# Progy Editor: Architecture & Migration Plan

This document outlines the architectural vision, technical requirements, and step-by-step migration plan for separating the "Visual Course Editor" from the `progy` CLI into a dedicated application (`apps/editor`).

---

## 1. Executive Summary

**Goal:** Decouple the course creation experience (Instructor UI) from the course consumption experience (Student CLI).
**Result:** A specialized, high-performance editor application that can leverage heavy dependencies (LSP, Docker integration, Electron/Tauri) without bloating the student-facing CLI.
**Chosen Architecture:** **Option 2 (Local Web App + Bridge)**, with a future path to **Option 1 (Desktop App)**.

---

## 2. Architecture Overview

The new architecture introduces a clear separation of concerns within the monorepo:

### 2.1. The New Monorepo Structure

```
root/
├── apps/
│   ├── cli/             (Student Experience - lightweight)
│   ├── editor/          (Instructor Experience - rich features)
│   ├── web/             (Cloud Platform)
│   └── backend/         (Cloud API Worker)
├── packages/
│   ├── core/            (Shared Logic: Config parsing, Docker, Git)
│   ├── ui/              (Shared Components: Button, Input, Theme)
│   └── runner/          (Shared Runner Protocol implementation)
```

### 2.2. Component Responsibilities

#### `apps/cli` (Existing `progy`)
- **Focus:** Student consumption, progress tracking, submission.
- **Removed:** All `/instructor/*` endpoints, `EditorView`, `FileTree`, `Monaco/CodeMirror` heavy languages.
- **Added:** A simple command `progy edit` that *launches* the `apps/editor` server (or prompts to install it).

#### `apps/editor` (New)
- **Focus:** Course creation, debugging, content management.
- **Tech Stack:**
    - **Frontend:** React + Vite (migrated from CLI).
    - **Backend:** Fastify or Hono (Node.js/Bun).
    - **Database:** SQLite (local cache of course structure/metadata).
- **Key Capabilities:**
    - **File Watcher:** Real-time updates of the file tree (`chokidar`).
    - **LSP Bridge:** Websocket connection to language servers (rust-analyzer, pyright).
    - **Docker Manager:** Advanced container management for testing exercises.
    - **Hot Reload:** Instant feedback on `course.json` changes.

#### `packages/core` (New)
- **Goal:** Prevent code duplication.
- **Contents:**
    - `CourseLoader`: Logic to parse `course.json`, `info.toml`.
    - `RunnerClient`: Logic to talk to Docker/Process runners.
    - `GitManager`: Logic for cloning/syncing courses.

---

## 3. Detailed Migration Steps

This section details the exact steps to execute this migration.

### Phase 1: Preparation (Refactor Shared Logic)

1.  **Create `packages/core`:**
    -   `mkdir -p packages/core/src`
    -   `cd packages/core && bun init`
    -   Move `apps/cli/src/core/loader.ts` -> `packages/core/src/loader.ts`
    -   Move `apps/cli/src/core/config.ts` -> `packages/core/src/config.ts`
    -   Move `apps/cli/src/core/logger.ts` -> `packages/core/src/logger.ts`
    -   Extract `DockerClient` and `ComposeClient` to `packages/core/src/runner/`.

2.  **Update `apps/cli` Dependencies:**
    -   Update `apps/cli/package.json` to depend on `workspace:@progy/core`.
    -   Refactor all imports in `apps/cli` to use `@progy/core`.
    -   *Verification:* Run `bun run build` in `apps/cli` to ensure nothing broke.

### Phase 2: Scaffolding `apps/editor`

3.  **Initialize App:**
    -   Create `apps/editor` using a Vite template (React + TS).
    -   Install dependencies: `react-router-dom`, `nanostores`, `lucide-react`, `cmdk`, `radix-ui`, `codemirror`.
    -   Add `workspace:@progy/core` dependency.

4.  **Backend Setup (The "Bridge"):**
    -   Create `apps/editor/server/main.ts` (using Bun or Node).
    -   **Re-implement Endpoints:**
        -   Port `fsGetHandler`, `fsWriteHandler`, `reorderHandler` from `apps/cli/src/backend/endpoints/instructor.ts`.
        -   *Improvement:* Use a persistent WebSocket connection instead of polling for file tree updates.

### Phase 3: Frontend Migration

5.  **Move Components:**
    -   Copy `apps/cli/src/frontend/components/editor/*` to `apps/editor/src/components/`.
    -   Copy `apps/cli/src/frontend/views/editor-view.tsx` to `apps/editor/src/views/`.
    -   Copy `apps/cli/src/frontend/stores/editor-store.ts` to `apps/editor/src/stores/`.

6.  **Decouple from "Student" Stores:**
    -   The current editor components rely on `course-store.ts` (progress, xp). The editor shouldn't care about student XP.
    -   **Action:** Refactor `EditorView` to remove dependencies on `$progress`, `$user`, `$streak`.
    -   Create a *Mock Student Context* if needed for previewing (see Phase 4).

7.  **Styling & Theme:**
    -   Copy `tailwind.config.js` and `global.css`.
    -   Ensure the new "Rust/Zinc" theme is the default.

### Phase 4: Integration & Advanced Features (The "Value Add")

8.  **The `progy edit` Command:**
    -   In `apps/cli/src/commands/edit.ts`:
        -   Check if `@progy/editor` is installed globally or available.
        -   If not, prompt: *"Progy Editor is required. Install it? [y/n]"*.
        -   Launch the editor server: `bun run @progy/editor start --cwd .`.
        -   Open browser to `http://localhost:4000`.

9.  **LSP Integration (Language Server Protocol):**
    -   **Backend:** Use `rpc-websockets` to spawn `rust-analyzer` or `pyright-langserver` processes.
    -   **Frontend:** Use `monaco-languageclient` (switching from CodeMirror to Monaco might be worth it here for full VS Code experience, or stick to CodeMirror with `codemirror-languageserver`).

10. **Terminal Integration:**
    -   **Frontend:** Install `xterm` and `xterm-addon-fit`.
    -   **Backend:** Use `node-pty` to spawn a pseudoterminal shell.
    -   **Socket:** Pipe `pty` data <-> WebSocket <-> `xterm`.

---

## 4. Technical Specifications

### 4.1. File System Bridge (Backend)

The `apps/editor` backend must provide a robust API for file manipulation.

**Endpoints:**
-   `GET /api/fs/tree`: Returns recursive file tree.
-   `GET /api/fs/file?path=...`: Returns file content.
-   `POST /api/fs/file`: Writes file content.
-   `POST /api/fs/move`: Renames/Moves files.
-   `DELETE /api/fs/file`: Deletes files.
-   `POST /api/docker/run`: Triggers a test run (ephemeral container).

**WebSockets (`/ws`):**
-   **Event:** `file:change` (Payload: `{ path: string, type: 'add'|'change'|'unlink' }`).
    -   Use `chokidar` to watch the project root.
    -   Frontend listens to this to auto-refresh the file tree without reloading.
-   **Event:** `terminal:data` (Bidirectional).
-   **Event:** `lsp:message` (Bidirectional).

### 4.2. Configuration Editor (Frontend)

Instead of editing raw `course.json`, implement a **Form-Based Editor**.

**Schema-Driven UI:**
-   Define the `CourseConfig` schema using `zod`.
-   Use `react-hook-form` or `@tanstack/react-form` to auto-generate inputs.
-   **Fields:**
    -   **ID/Slug:** Validated regex.
    -   **Runner:** Dropdown (Docker, Process), Image selector.
    -   **Progression:** Toggle (Sequential/Open).
    -   **Repository:** Git URL validation.

### 4.3. Asset Management

**Drag & Drop Handler:**
-   Target: The Markdown Editor area.
-   Action:
    1.  Detect file drop.
    2.  Upload file to `/api/fs/upload?dest=assets/images`.
    3.  Backend saves file to `course/assets/images/${timestamp}_${filename}`.
    4.  Frontend inserts `![alt](assets/images/...)` at cursor.

---

## 5. Security Considerations

Since `apps/editor` allows arbitrary code execution (Terminal, Docker) and file system access:

1.  **Localhost Only:** The server MUST bind to `127.0.0.1` by default.
2.  **Token Authentication:**
    -   When `progy edit` launches the server, it should generate a random session token.
    -   It opens the browser with `http://localhost:4000?token=xyz`.
    -   Frontend saves token to `localStorage`.
    -   All API requests require `Authorization: Bearer xyz`.
3.  **Path Traversal:** Strict validation that all file operations are within `PROG_CWD`.

---

## 6. Implementation Checklist & Timeline

| Phase | Task | Est. Effort |
| :--- | :--- | :--- |
| **1** | Extract `packages/core` | 2 Days |
| **1** | Refactor `apps/cli` to use core | 1 Day |
| **2** | Scaffold `apps/editor` & Backend | 2 Days |
| **3** | Port Frontend Components | 3 Days |
| **3** | Refactor Stores & State | 2 Days |
| **4** | Implement File Watcher (WebSockets) | 1 Day |
| **4** | Implement Terminal (`xterm`) | 2 Days |
| **4** | Implement Visual `course.json` Editor | 3 Days |
| **5** | Final Polish & Integration Test | 2 Days |

**Total Estimate:** ~3 Weeks of dedicated work.

---

## 7. Future Proofing: Desktop App (Electron/Tauri)

By choosing **Architecture Option 2**, we pave the way for a Desktop App.
-   The "Backend" (Node/Bun server) becomes the "Main Process" in Electron.
-   The "Frontend" (React) becomes the "Renderer Process".
-   The transition is seamless because the separation of concerns (IPC via HTTP/WS) is already established.

If moving to **Tauri (Rust)**:
-   The Frontend remains identical.
-   The Backend logic (FS, Docker, Terminal) needs to be rewritten in Rust.
-   *Benefit:* Smaller binary, better performance.
-   *Cost:* High rewrite effort for the backend logic.

**Recommendation:** Stick to Node/Bun backend for now (Option 2) as it shares code with the CLI. Migrate to Tauri only if performance becomes a bottleneck.
