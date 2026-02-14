
# Progy CLI Documentation (v2)

The Progy ecosystem consists of two main CLIs:
1.  **`@progy/cli`** (`progy`): For students/consumers to learn and run courses.
2.  **`@progy/studio`** (`progy-studio`): For instructors/creators to build and publish courses.

---

## 1. Student CLI (`progy`)

### Installation
```bash
bunx @progy/cli start
```

### Commands

#### `progy start [file]`
Starts the interactive learning environment.
- **Arguments**: `[file]` (Optional) Path to a `.progy` file.
- **Options**: `--offline` (Disable cloud sync).

#### `progy init <package>`
Initializes a new course environment from the Registry or Git.
- **Example**: `progy init sql-basics` or `progy init @myuser/advanced-rust`

#### `progy upgrade`
Checks for updates to the current course and applies them.
- **Behavior**:
    1.  Checks `progy.toml` for the current version.
    2.  Queries the Registry for the latest version.
    3.  If an update is available, downloads and applies it (preserving user progress where possible).

#### `progy login` / `logout` / `whoami`
Manage your Progy account session.

#### `progy config`
- `progy config list`: Show settings.
- `progy config set <key> <value>`: Update settings (e.g., `ai.provider`).

#### `progy reset <path>`
Resets a specific exercise file to its original state.

---

## 2. Studio CLI (`progy-studio`)

Tools for creating, testing, and publishing courses.

### Installation
```bash
bunx @progy/studio [command]
```

### Commands

#### `progy-studio create <name>`
Scaffolds a new Progy course structure.
- **Example**: `progy-studio create my-new-course`

#### `progy-studio dev`
Starts the Studio editor in **Development Mode**.
- **Features**: Hot-reloading, preview mode for verifying course content as you edit.
- **Options**: `-p, --port <number>` (Default: 3000)

#### `progy-studio test [dir]`
Validates the course structure and configuration locally.
- Checks for valid `progy.toml` or `course.json`.
- Verifies folder structure (content, metadata).

#### `progy-studio pack [dir]`
Packages the course into a `.progy` archive for distribution.
- **Output**: `course.progy` (or similar).

#### `progy-studio version`
Manage course semantic versioning.
- **Usage**:
    - `progy-studio version`: Show current version.
    - `progy-studio version --minor`: Bump minor version (e.g., 0.1.0 -> 0.2.0).
    - **Options**: `--major`, `--minor`, `--patch`.

#### `progy-studio publish`
Publishes the course to the Progy Registry.
- **Prerequisites**: Must be logged in (`progy login`).
- **Behavior**:
    - Automatically builds/packs the course.
    - **Auto-Scoping**: If the course ID is generic (e.g. `my-course`), it is automatically scoped to your user (e.g. `@username/my-course`).
    - **Metadata**: Extracts title, description, and tags from config.
- **Options**:
    - `--major`, `--minor`, `--patch`: Bump version before publishing.

---

## 3. Architecture

### Layering System
When running a course, Progy uses a layering system:
1.  **Immutable Layer**: The `.progy` artifact (read-only).
2.  **Mutable Layer**: Your local workspace.

### The Runner Engine
The CLI executes code using the engine defined in `progy.toml`:
- **Process**: Native execution.
- **Docker**: Isolated execution.
