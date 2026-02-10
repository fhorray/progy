# Monorepo Restructuring Plan

This document defines the ideal structure for the `progy` monorepo to support multiple applications (`cli`, `editor`, `web`) sharing a common core.

---

## 1. Goal

Transform the current "loose" folder structure into a strict **Bun Workspace** monorepo. This ensures code reuse, consistent tooling, and easier maintenance as the project grows.

## 2. Target Structure

```
root/
├── apps/
│   ├── cli/             # The Student CLI (existing 'progy')
│   ├── editor/          # The new Instructor Editor (React + Bun)
│   ├── web/             # The Cloud Platform (Next.js)
│   └── backend/         # The Cloud API Worker (Cloudflare Workers)
├── packages/
│   ├── core/            # Business Logic (Config, Loader, Validation)
│   ├── runner/          # Execution Logic (Docker, Process, SRP)
│   ├── ui/              # Shared Design System (Tailwind + React components)
│   └── tsconfig/        # Shared TS configurations
├── package.json         # Workspace definition
└── bun.lock             # Single lockfile
```

---

## 3. Package Responsibilities

### 3.1. `packages/core`
*   **Purpose:** The "Brain" of Progy. Logic that works everywhere (Node, Bun, Cloudflare - careful with IO).
*   **Contents:**
    *   `src/config.ts`: Parsing `progy.toml`, `course.json`.
    *   `src/loader.ts`: Analyzing directory structures, `manifest.json`.
    *   `src/types.ts`: Shared TS interfaces (`CourseConfig`, `Progress`).
    *   `src/constants.ts`: Global defaults.

### 3.2. `packages/runner`
*   **Purpose:** executing code. Heavily dependent on Node/Bun APIs.
*   **Contents:**
    *   `DockerClient`: Wrapper for `docker` CLI.
    *   `ComposeClient`: Wrapper for `docker-compose`.
    *   `ProcessRunner`: Local execution.
    *   `SRP`: The Smart Runner Protocol parser/serializer.

### 3.3. `packages/ui`
*   **Purpose:** Visual consistency between Editor and Web.
*   **Contents:**
    *   **Components:** `Button`, `Card`, `Dialog`, `Input` (shadcn/ui ports).
    *   **Theme:** Tailwind configuration preset (colors, fonts).
    *   **Icons:** Lucide-react re-exports or standard set.

---

## 4. Migration Strategy

This is a non-trivial refactor. It should be done in stages to avoid breaking the build.

### Phase 1: Create Packages & Move Independent Logic (Low Risk)
1.  **Initialize Workspaces:** Ensure root `package.json` has `"workspaces": ["apps/*", "packages/*"]`.
2.  **Create `packages/core`:**
    *   Move `apps/cli/src/core/types.ts` -> `packages/core/src/types.ts`.
    *   Move `apps/cli/src/core/paths.ts` -> `packages/core/src/paths.ts`.
    *   *Update Imports:* Update `apps/cli` to import from `@progy/core`.

### Phase 2: Move Runner Logic (Medium Risk)
1.  **Create `packages/runner`:**
    *   Move `apps/cli/src/docker/*` -> `packages/runner/src/docker/`.
    *   Extract SRP parsing logic from `apps/cli/src/backend/helpers.ts`.
    *   *Update Imports:* Update `apps/cli` to import from `@progy/runner`.

### Phase 3: Move Loader Logic (High Risk)
1.  **Refactor `packages/core`:**
    *   Move `apps/cli/src/core/loader.ts` -> `packages/core/src/loader.ts`.
    *   This is complex because `loader.ts` likely depends on `runner` or `fs` logic. Carefully disentangle dependencies.

### Phase 4: UI Library (For Editor)
1.  **Create `packages/ui`:**
    *   Do not extract *everything* from `apps/cli` immediately.
    *   Start fresh for `apps/editor`. Move components as needed.

---

## 5. Dependency Management

*   **Runtime:** Use `bun` for everything.
*   **Build:**
    *   `packages/core` & `packages/runner`: Build to ESM/CJS using `bun build`.
    *   `apps/*`: Consume source files directly if possible (Bun supports TS natively), or build outputs if needed.
*   **Versioning:** Sync versions manually for now, or use `changesets`.

---

## 6. Next Steps

1.  **Execute Phase 1:** Create `packages/core` and move types.
2.  **Verify:** Run `bun test` in `apps/cli`.
3.  **Execute Phase 2:** Extract Docker logic.
4.  **Verify:** Run `apps/cli` manual test.

This structure allows `apps/editor` to be built cleanly from day one using shared logic, without copying code from `apps/cli`.
