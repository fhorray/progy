# Progy Instructor Guide

This guide details the CLI tools available for creating, validating, and packaging Progy courses.

## Workflow Overview

1.  **Initialize**: `progy init --course [template]`
2.  **Develop**: `progy dev` (Hot-reload, live verification)
3.  **Validate**: `progy validate` (Static checks)
4.  **Package**: `progy pack` (Create distribution file)

## Commands

### `progy validate`
Performs a static analysis of your course directory.

**Checks:**
-   `course.json` schema validity.
-   Content root and exercises directory existence.
-   Setup guide presence.
-   Security check (ensures `repo` is not hardcoded).

**Usage:**
```bash
bunx progy validate [path]
```

### `progy dev`
Starts the course runner in **Development Mode**.

**Features:**
-   **Live Reload**: Changes to `README.md` or code files are reflected immediately on the next request.
-   **Source Mode**: Runs directly from your file system (ignores `.progy` archives).
-   **No Authentication**: Can be run with `--offline` for air-gapped development.

**Usage:**
```bash
cd my-course
bunx progy dev
# or
bunx progy dev --offline
```

### `progy pack`
Packages your course into a `.progy` archive for distribution.

**Why use this?**
-   To verify the exact artifact students will download.
-   To share your course manually (e.g., via USB or private network).

**Usage:**
```bash
bunx progy pack --out my-course-v1.progy
```

## Tips for Instructors

-   **Metadata**: Update `course.json` with a clear `name` and `runner` configuration.
-   **Hidden Files**: The packer automatically ignores `node_modules`, `.git`, `.next`, and `target` directories to keep the archive small.
-   **Testing**: Always run `progy dev` and solve `01_intro` yourself to ensure the runner configuration (`Cargo.toml`, `go.mod`, etc.) is correct.
