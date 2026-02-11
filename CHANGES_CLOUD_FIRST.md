# Cloud-First Portfolio Architecture

This document details the architectural changes made to transition Progy from a Git-based course distribution model to a **Cloud-First, R2-based Portfolio model**.

## 1. Overview

The previous architecture relied on `git clone` to fetch courses and required users to manage local Git repositories for their progress from day one. This created friction for beginners and scattered course files between the global cache and the local workspace.

The new architecture centralizes course distribution via the **Progy Registry** and user progress via **Progy Cloud (R2)**, making the local workspace ephemeral and portable.

## 2. Key Changes

### 2.1 Removal of Git-Based Init
- **Removed:** Support for initializing courses directly from Git URLs (`https://...`, `git@...`).
- **Removed:** Support for GitHub user shortcuts (e.g., `github-user/repo`).
- **New Standard:** All courses must be initialized from the registry using `@scope/package` or `package` syntax.

### 2.2 The "Cloud-First" `progy init`
When a user runs `progy init @scope/course`:

1.  **Cloud Check:** The CLI checks if the user has existing progress for this course in the Progy Cloud (R2).
    *   **Found:** It downloads the user's `progress.progy` (a zip archive) and restores the workspace exactly as they left it.
    *   **Not Found:** It downloads the immutable **Course Artifact** from the Registry to the global cache (`~/.progy/cache`).
2.  **Scaffolding:**
    *   It extracts *only* the `content/` folder (editable files) to the local directory.
    *   It generates a portable `progy.toml` linking to the Course ID (e.g., `repo = "@scope/course"`).
    *   It generates a **Smart `.gitignore`** that hides course metadata (`README.md`, `info.toml`, `quiz.json`) from the user's view/commit history, keeping the portfolio clean.

### 2.3 Runtime Hydration (`progy start`)
When `progy start` is run:

1.  **Resolution:** It reads `progy.toml` to get the Course ID.
2.  **Hydration:** It verifies if the course assets (Runner, Dockerfile, etc.) exist in the global cache (`~/.progy/cache`).
    *   If missing (e.g., on a new device), it automatically re-downloads the course artifact from the Registry.
3.  **Execution:** The backend runs code from the local `content/` folder using the runner configuration from the cache.

### 2.4 Cloud Sync & Persistence
User progress is no longer solely dependent on local files.

-   **Manual Sync:** `progy sync` packs the local `content/` folder and `progy.toml` into a `progress.progy` file and uploads it to Progy Cloud (R2).
-   **Auto-Sync:** `progy start` automatically triggers a sync:
    *   Every 2 minutes (if changes are detected).
    *   On server shutdown (Ctrl+C).

### 2.5 Backend Updates
-   **Storage:** Progress is stored as binary blobs (`progress.progy`) in Cloudflare R2, under `users/<userId>/courses/<courseId>/progress.progy`.
-   **Endpoints:**
    *   `POST /progress/upload`: Accepts multipart form data with the progress file.
    *   `GET /progress/download`: Streams the progress file.

## 3. Benefits

-   **Portability:** Users can switch devices and `progy init` will restore their work instantly.
-   **Simplicity:** No need for users to understand Git to start. `progy sync` handles backup.
-   **Clean Portfolio:** The local folder contains only the user's code, making it perfect for pushing to GitHub as a portfolio without course clutter.
