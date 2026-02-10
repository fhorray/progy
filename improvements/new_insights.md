# New Ideas & Insights for Progy Editor

Based on the analysis of `apps/cli` and the previous conversation, here are technical insights on the agreed features and new proposals.

## 1. Rich Text Editor (Tiptap) Enhancements

**Current State:** The editor uses Tiptap (`MarkdownEditor.tsx`) but relies on basic markdown rendering.
**Agreed Feature:** Custom Node Views for `::video` and `::note`.

**Technical Insights:**
*   **Implementation:** Use `ReactNodeViewRenderer` from `@tiptap/react` to render interactive React components for these nodes.
*   **Data Structure:** `::video{url="..."}` should map to a Tiptap node with attributes `url`.
*   **Interactive Editing:** The node view should have two modes: "View" (rendered) and "Edit" (form to change URL/content).
*   **Parsing:** You need a custom Tiptap extension that parses the `::video` syntax from Markdown (using `remark-directive` logic if you use that for parsing, or a custom regex).

**New Ideas:**
*   **Slash Commands:** Implement a `/` menu (using `tiptap-extension-slash-commands`) to quickly insert blocks like Note, Video, Quiz, Code Block.
*   **Drag & Drop Assets:**
    *   Allow dragging images/videos directly into the editor.
    *   Automatically upload them to an `assets/` folder in the course directory.
    *   Insert the markdown `![alt](assets/filename.png)` automatically.
*   **Live Preview Split:** Option to toggle a split view: Raw Markdown (Monaco) <-> Preview (Tiptap/Renderer) for power users who prefer raw text.

## 2. Quiz System Improvements

**Current State:** `QuizEditor.tsx` likely edits the JSON structure directly or has a basic form.
**Agreed Feature:** Drag & Drop Reordering.

**Technical Insights:**
*   **Library:** Use `@dnd-kit/core` and `@dnd-kit/sortable` (already in dependencies).
*   **Structure:** The quiz JSON likely needs a `type: "ordering"` field.
*   **Visual Editor:** Create a dedicated visual editor for quizzes where you can add/remove questions and reorder answers via drag-handle.

**New Ideas:**
*   **Snippet Gap Fill:** A code block where certain parts are "blank". The user drags code tokens into the blanks.
    *   *Implementation:* Store code with placeholders (e.g., `__BLANK__`) and a list of correct tokens.
*   **AI Generation:** A button to "Generate Quiz from Content" using an LLM, reading the current module's markdown file.

## 3. IDE Integration

**Current State:** `OpenInIdeButton` sends a POST to `/ide/open` with `path`. Backend hardcodes `code` (VS Code).
**Agreed Feature:** User-defined editor command.

**Technical Insights:**
*   **Backend Change:** Update `apps/cli/src/backend/endpoints/ide.ts` to accept a `command` parameter (e.g., `subl`, `cursor`, `idea`).
*   **Security:** Sanitize the command to prevent arbitrary execution (allow-list or strict validation).
*   **Frontend Change:** Add a "Settings" -> "Preferences" section where the user selects their preferred IDE. Store this in `localStorage` or a user config file (`~/.progy/config.json`).

**New Ideas:**
*   **Open Specific Line:** If possible, pass line number to the IDE (e.g., `code -g file.rs:10`).
*   **"Edit Here" vs "Edit in IDE":** A toggle in the file tree to default to opening in external IDE for certain file types (like `.rs` or `.go`), while keeping `.md` in Progy.

## 4. Integrated Terminal

**Current State:** Missing (placeholder icon).
**Agreed Feature:** "Run Output" panel.

**Technical Insights:**
*   **Implementation:** Use `xterm.js` (frontend) + `node-pty` (backend).
*   **Connection:** WebSocket connection to stream stdin/stdout.
*   **Security:** This gives full shell access. Ensure it's restricted or only available in local dev mode (`progy dev`).

**New Ideas:**
*   **Task Runner:** Instead of a full terminal, a "Tasks" panel that lists commands from `course.json` (e.g., "Run Tests", "Build", "Format"). Clicking a button runs the command and shows output in a read-only terminal.
*   **REPL:** For languages like Python/Lua, offer a REPL session in the terminal panel.

## 5. Course Configuration & Settings

**Current State:** `CourseSettings.tsx` fails if `course.json` is missing/invalid. `ConfigForm.tsx` exists but is unused in the layout.
**Issue:** "Editor settings not rendering a modal".

**Technical Insights:**
*   **Fix:** Replace `CourseSettings` with `ConfigForm` in `EditorLayout.tsx`.
*   **Robustness:** `ConfigForm` fetches config via API, which handles defaults and missing files gracefully.

**New Ideas:**
*   **Schema Validation:** Use a JSON Schema for `course.json` to provide real-time validation and autocomplete in the config form.
*   **Visual Dependency Graph:** Enhance `GraphView` to allow *editing* dependencies by dragging lines between nodes, updating `info.toml` automatically.

## 6. General Improvements

*   **Course Templates:** When creating a new course or module, offer templates (e.g., "Rust Basics", "Python Data Science").
*   **Asset Manager:** A dedicated "Assets" panel to browse/manage files in the `assets/` directory.
*   **Global Search:** `cmd+p` currently opens a file palette. Enhance it to search *content* across all files.
