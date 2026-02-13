# Progy CLI Documentation (v2)

The Progy CLI is the interactive runner and learning platform for students. It manages the lifecycle of Progy courses, handles progress synchronization, and provides a local environment for code execution.

> [!NOTE]
> **Instructor Tools Moved**: Commands for course creation and authoring (e.g., `dev`, `pack`, `publish`) have been migrated to **Progy Studio**.

---

## 1. Getting Started

### Installation

The Progy CLI is distributed via the `@progy/cli` package and runs on **Bun**.

```bash
# Run without installation
bunx @progy/cli start
```

### Initializing a Course

Use `progy init` to download a course from the registry or a Git repository.

```bash
progy init sql-basics
```

---

## 2. Command Reference

### `progy start [file]`

The primary command for students. Starts the interactive learning environment.

- **Arguments**:
  - `[file]`: (Optional) Path to a specific `.progy` course artifact to open.
- **Options**:
  - `--offline`: Force-disables cloud synchronization.
- **Behavior**:
  1.  Detects the environment (Instructor vs Student).
  2.  Resolves course assets from the local cache or registry.
  3.  Starts the local Progy server and launches the student UI.
  4.  Monitors file changes for auto-saving progress.

### `progy init <package>`

Initializes a new course environment from the Progy Registry.

- **Arguments**:
  - `<package>`: The registry package name (e.g., `sql-basics` or `@scope/course`).
- **Options**:
  - `--offline`: Forces local-only setup.

### Authentication

Manage your Progy account session to sync progress across devices.

- **`progy login`**: Authenticates via the browser.
- **`progy logout`**: Clears the local session.
- **`progy whoami`**: Displays the currently logged-in user.

### Configuration

Manage CLI and runner settings.

- **`progy config list`**: Shows all active configurations.
- **`progy config set <path> <value>`**: Updates a setting (e.g., `config set ai.provider openai`).

### Utilities

- **`progy reset <path>`**: Resets a specific exercise file to its original state (useful if you want to start an exercise over).
- **`progy kill-port <port>`**: Forces termination of a process running on a specific port (e.g., if a previous Progy session didn't close properly).

---

## 3. Instructor Commands (Moved to Studio)

The following commands are no longer natively supported in the CLI. Attempting to run them will provide a redirection message:

| Command   | Action                     | New Tool        |
| :-------- | :------------------------- | :-------------- |
| `create`  | Create new course          | `@progy/studio` |
| `add`     | Add modules/exercises      | `@progy/studio` |
| `test`    | Run authoring tests        | `@progy/studio` |
| `dev`     | Preview course changes     | `@progy/studio` |
| `pack`    | Export `.progy` artifact   | `@progy/studio` |
| `publish` | Upload to Registry         | `@progy/studio` |
| `version` | Manage semantic versioning | `@progy/studio` |

---

## 4. Architecture (Internal)

### Layering System

When running a course from the registry, the CLI uses a layering system:

1.  **Immutable Layer**: The `.progy` artifact (read-only).
2.  **Mutable Layer**: Your local workspace.

The CLI ensures that exercise files are copied into your workspace as you progress, while the runner reads core assets from the immutable side to ensure stability.

### The Runner Engine

The CLI executes your code using the engine defined by the course instructor:

- **Process**: Native execution on your machine.
- **Docker**: Isolated execution within a container (requires Docker).
