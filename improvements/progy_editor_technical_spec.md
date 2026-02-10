# Progy Editor: Technical Specification (v2.1 - Hybrid Editor)

This document outlines the technical architecture for the standalone `apps/editor` application, pivoting towards a **Hybrid Editor Strategy**.

**Core Vision:** A high-performance, developer-centric Course Orchestrator. It excels at **Structure, Configuration, and Content Creation** (Markdown/Quizzes) while seamlessly integrating with the user's preferred local IDE (VS Code, Neovim) for heavy code editing.

---

## 1. High-Level Architecture

The **Progy Editor** is a local web application that bridges the gap between raw file editing and a rich course management interface.

### 1.1. The Hybrid Strategy

| Feature | Progy Editor (Web) | Local IDE (VS Code) |
| :--- | :--- | :--- |
| **Course Structure** | **Primary.** Drag & drop modules, reorder lessons, visualize dependencies. | **Secondary.** Raw file system manipulation. |
| **Configuration** | **Primary.** Form-based editing for `course.json` with validation & image selection. | **Secondary.** Raw JSON editing (error-prone). |
| **Content (Markdown)** | **Primary.** WYSIWYG editor with live preview of custom blocks (Video, Quiz). | **Secondary.** Raw Markdown. |
| **Quizzes** | **Primary.** Visual builder for complex JSON structures. | **Secondary.** Raw JSON. |
| **Code (Rust/Python)** | **Secondary.** Quick fixes, embedded playgrounds. | **Primary.** Heavy coding, LSP features, debugging. |

### 1.2. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Runtime & Server** | **Bun** (`Bun.serve`) | Zero-config, ultra-fast HTTP/WebSocket server. |
| **Frontend Framework** | **React 19** (via Vite) | Standard component model. |
| **Styling** | **Tailwind CSS v4** | JIT CDN/CLI. No config files. |
| **State Management** | **Nanostores** | Atomic state for high-frequency updates. |
| **Routing** | **@nanostores/router** | Minimal, type-safe router. |
| **Data Fetching** | **@nanostores/query** | Revalidating cache for file tree (SWR). |
| **Form Handling** | **@tanstack/react-form** | Headless, type-safe validation for configs. |
| **Rich Text Editor** | **Tiptap** | Block-based editing for course content. |
| **Code Editor** | **Monaco Editor** | Embedded editor for quick edits & playgrounds. |

---

## 2. Project Structure (`apps/editor`)

Designed to separate the "Server Bridge" from the "Client UI".

```
apps/editor/
├── index.ts                # Entry point (Bun.serve)
├── public/                 # Static assets
├── server/                 # Backend Logic (Bridge)
│   ├── router.ts           # API Routes
│   ├── handlers/
│   │   ├── fs.ts           # File System operations
│   │   ├── ide.ts          # IDE Integration (open in VS Code)
│   │   └── docker.ts       # Runner integration
│   └── ws.ts               # WebSocket (Hot Reload)
├── src/                    # Frontend React App
│   ├── main.tsx            # Entry
│   ├── App.tsx             # Layout
│   ├── stores/             # Nanostores
│   ├── components/
│   │   ├── editor/         # Core editors
│   │   │   ├── RichText.tsx
│   │   │   ├── Code.tsx
│   │   │   └── extensions/ # Custom Tiptap Nodes
│   │   ├── layout/         # Panels
│   │   └── forms/          # Config Forms
│   └── lib/                # Utilities
├── index.html              # App Shell
└── vite.config.ts          # Minimal build config
```

---

## 3. Detailed Component Specifications

### 3.1. IDE Integration (`server/handlers/ide.ts`)

The backend must provide robust support for opening files in the user's preferred editor.

**Endpoints:**
-   `POST /api/ide/open`: Accepts `{ path: string, line?: number, column?: number }`.
    -   Detects `EDITOR` env var or defaults to `code`.
    -   Executes `code -g <path>:<line>:<col>` or `launch <path>` (macOS).

**UI Integration:**
-   **File Tree:** Right-click -> "Open in System Editor".
-   **Code Editor Toolbar:** "Open in VS Code" button (primary action).
-   **Error Links:** Clicking a compiler error line number opens the file in the IDE at that line.

### 3.2. Rich Text Editor (Tiptap)

Focus on providing a "What You See Is What You Get" experience for course elements.

**Custom Nodes:**
1.  **Video Block:** Embeds YouTube/Vimeo players.
2.  **Callout Block:** Visual alerts (`:::note`, `:::warning`).
3.  **Quiz Block:** Embeds a visual quiz editor *inline* within the lesson content (serialized to `quiz.json` or frontmatter).
4.  **Playground Block:** Embeds a runnable code snippet.

### 3.3. Configuration Forms (`@tanstack/react-form`)

**Schema-Driven UI:**
-   **`course.json`:** Fields for ID, Title, Runner (Docker/Process), Repository.
-   **`info.toml`:** Fields for Module Title, Message, Prerequisites.
-   **Validation:** Immediate feedback on invalid IDs or missing fields using Zod.

### 3.4. The Bun Server

**`index.ts` Strategy:**
-   Use `Bun.serve` to serve both the API and the static frontend.
-   **WebSockets:** Essential for:
    -   **File Watcher:** Notify frontend when files change externally (e.g., edited in VS Code).
    -   **Terminal Stream:** Pipe runner output to the frontend console.

---

## 4. Implementation Plan

### Phase 1: Foundation (Days 1-2)
1.  Initialize `apps/editor` with Bun, React, Vite.
2.  Implement `server/index.ts` with `Bun.serve`.
3.  Implement basic FS API (`GET /tree`, `GET /content`).
4.  Implement `POST /api/ide/open`.

### Phase 2: Core Editors (Days 3-5)
5.  **Monaco:** Setup basic code editing. Add "Open in IDE" button.
6.  **Tiptap:** Setup Markdown editing. Implement basic formatting.
7.  **File Tree:** Visual tree with icons and context menu.

### Phase 3: Advanced Features (Days 6-8)
8.  **Config Forms:** Implement `course.json` editor with TanStack Form.
9.  **Visual Assets:** Drag-and-drop image upload to Markdown.
10. **Hot Reload:** WebSocket file watcher to sync external edits.

---

## 5. Why Hybrid?

By acknowledging that **VS Code** is the best tool for writing code, we free up the Progy Editor to be the best tool for **everything else**:
-   **Structure:** Organizing modules visually.
-   **Content:** Writing rich, interactive lessons.
-   **Configuration:** Managing complex settings without syntax errors.
-   **Preview:** Seeing the course exactly as a student would.

This approach minimizes scope creep (building a full IDE) and maximizes value (solving the unique pain points of course creation).
