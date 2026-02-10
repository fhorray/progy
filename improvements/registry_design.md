# Progy Official Registry Implementation Plan

## 1. Executive Summary & Goals

This document outlines the comprehensive architectural design and implementation strategy for the **Progy Official Registry**. The primary objective is to transition from the current decentralized, Git-based distribution model to a centralized, performant registry system leveraging **Cloudflare D1** for metadata management and **Cloudflare R2** for artifact storage.

### Key Objectives
1.  **Centralization:** Establish a single source of truth for all official and community courses.
2.  **Performance:** Utilize R2's global CDN capabilities to serve course content faster than raw Git clones.
3.  **Decoupling:** Separate the *course source code* (immutable, versioned artifacts) from the *student's progress* (mutable, personal Git history).
4.  **Versioning:** Enforce Semantic Versioning (SemVer) to allow instructors to patch courses without breaking existing student environments.
5.  **Ownership:** Introduce a strict `@username/slug` namespacing system to prevent collisions and ensure clear attribution.

### The "Portfolio Mode" Shift
Currently, students clone an instructor's repository and build on top of it. This often leads to confusion when the upstream repo changes or when students want to showcase their work as their own project.

**The New Workflow:**
1.  **Instructor:** Publishes `v1.0.0` of `@diego/rust-mastery` to the Registry.
2.  **Registry:** Stores `v1.0.0.zip` in R2 and records metadata in D1.
3.  **Student:** Runs `progy init @diego/rust-mastery`.
4.  **CLI:** Downloads and extracts the zip.
5.  **CLI:** Initializes a *fresh* Git repository in the student's folder.
6.  **CLI:** Helps the student push this new repo to their own GitHub as a "Portfolio Project".
7.  **Result:** The student owns the code 100%. The instructor owns the distribution channel.

---

## 2. Architecture & Tech Stack

The registry is built on the existing Progy infrastructure, adding new capabilities to the Backend and CLI.

### Components
*   **Backend (Apps/Backend):**
    *   **Runtime:** Cloudflare Workers (Hono framework).
    *   **Database:** Cloudflare D1 (SQLite).
    *   **Storage:** Cloudflare R2 (Object Storage).
    *   **Auth:** Existing Better-Auth integration.
*   **CLI (Apps/CLI):**
    *   **Language:** TypeScript (Bun runtime).
    *   **Libraries:** `adm-zip` for archiving, `commander` for CLI parsing.
*   **Frontend (Apps/Web - Future):**
    *   A "Marketplace" view to browse registry packages.

### Storage Strategy: Zip Archives
We will use **Zip Archives** as the primary distribution format.
*   **Why not Git?** Storing raw git objects is complex and requires a git server implementation.
*   **Why not CAS?** Content-Addressable Storage (deduplicating every file by hash) is excellent for efficiency but introduces significant complexity in the upload/download client logic. For the initial version, simple zip files are robust, easy to debug, and leverage standard HTTP caching.
*   **Path Format:** `packages/@<username>/<slug>/v<version>.zip`
    *   Example: `packages/@diego/rust-mastery/v1.0.0.zip`

---

## 3. Database Schema Design (Cloudflare D1)

We need to introduce three new tables to `apps/backend/src/db/schema.ts` to manage the registry state.

### 3.1 `registry_packages`
This table stores the high-level metadata for a course. It acts as the "Catalog Entry".

```typescript
// apps/backend/src/db/schema.ts

import { sqliteTable, text, integer, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
import { user } from './auth-schema'; // Assuming user table is imported

export const registryPackages = sqliteTable("registry_packages", {
  // UUID for the package
  id: text("id").primaryKey(),

  // The owner of the package (must match the @scope)
  userId: text("user_id").notNull().references(() => user.id),

  // The full package name, e.g., "@diego/rust-mastery"
  name: text("name").notNull(),

  // The URL-friendly slug, e.g., "rust-mastery"
  slug: text("slug").notNull(),

  // Short description for the CLI search
  description: text("description"),

  // Cached latest version to avoid joining tables on simple listings
  latestVersion: text("latest_version"),

  // Visibility flag
  isPublic: integer("is_public", { mode: "boolean" }).default(true),

  // Timestamps
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  // Ensure strict uniqueness on the full package name
  uniqueName: uniqueIndex("registry_packages_name_idx").on(table.name),
  // Optimize lookups for "My Courses" dashboard
  userIdIdx: index("registry_packages_user_id_idx").on(table.userId),
}));
```

### 3.2 `registry_versions`
This table stores the immutable history of every published version.

```typescript
export const registryVersions = sqliteTable("registry_versions", {
  id: text("id").primaryKey(),

  // Link to parent package
  packageId: text("package_id").notNull().references(() => registryPackages.id),

  // The SemVer string, e.g., "1.0.0"
  version: text("version").notNull(),

  // The R2 path to the zip file
  storageKey: text("storage_key").notNull(),

  // File size in bytes (for progress bars/quotas)
  sizeBytes: integer("size_bytes").notNull(),

  // SHA-256 Checksum for integrity verification
  checksum: text("checksum").notNull(),

  // Release notes / Changelog from the CLI
  changelog: text("changelog"),

  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  // Ensure a version number is unique within a package
  uniqueVersion: uniqueIndex("registry_versions_pkg_ver_idx").on(table.packageId, table.version),
}));
```

### 3.3 `registry_downloads`
(Optional for MVP, but recommended for analytics)
Tracks who is downloading what version and when.

```typescript
export const registryDownloads = sqliteTable("registry_downloads", {
  id: text("id").primaryKey(),
  packageId: text("package_id").notNull(),
  versionId: text("version_id").notNull(),

  // Nullable if we allow anonymous downloads (e.g. CLI without login)
  userId: text("user_id"),

  ipAddress: text("ip_address"),

  // Analytics
  downloadedAt: integer("downloaded_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
```

---

## 4. Backend API Implementation (`apps/backend`)

We will create a new route file `apps/backend/src/endpoints/registry.ts` and mount it at `/registry` in `index.ts`.

### 4.1 Dependency Injection
Update `wrangler.toml` and `env` interface to include the R2 binding.

```toml
# apps/backend/wrangler.toml
[[r2_buckets]]
binding = "REGISTRY_BUCKET"
bucket_name = "progy-registry-prod"
```

```typescript
// apps/backend/src/env.ts
export interface CloudflareBindings {
  DB: D1Database;
  REGISTRY_BUCKET: R2Bucket;
  // ... existing bindings
}
```

### 4.2 API Endpoint: Publish (`POST /registry/publish`)
This is the most critical endpoint. It handles the upload of a new version.

**Request Flow:**
1.  **Auth:** Verify `Authorization` header.
2.  **Parse:** Read `Multipart/Form-Data`.
    *   `file`: The `.zip` blob.
    *   `metadata`: JSON string `{ "name": "@scope/slug", "version": "1.0.0", "description": "..." }`.
3.  **Validate:**
    *   Name format matches `@username/slug`.
    *   User owns `@username`.
    *   Version is valid SemVer.
    *   Version does not already exist (Immutable versions!).
4.  **Storage:**
    *   Generate path: `packages/@scope/slug/v1.0.0.zip`.
    *   Stream file to R2.
5.  **Database:**
    *   Insert into `registry_packages` (if new).
    *   Insert into `registry_versions`.
    *   Update `latestVersion` in `registry_packages`.

**Code Implementation (Draft):**

```typescript
// apps/backend/src/endpoints/registry.ts
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and } from "drizzle-orm";
import { registryPackages, registryVersions } from "../db/schema";

const registry = new Hono<{ Bindings: CloudflareBindings }>();

registry.post("/publish", async (c) => {
  const user = c.get('user');
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const body = await c.req.parseBody();
  const file = body['file'];
  const metaStr = body['metadata'] as string;

  if (!file || !(file instanceof File)) {
    return c.json({ error: "Invalid file upload" }, 400);
  }

  // 1. Parse Metadata
  let metadata;
  try {
    metadata = JSON.parse(metaStr);
  } catch (e) {
    return c.json({ error: "Invalid metadata JSON" }, 400);
  }

  // 2. Validate Naming (@scope/slug)
  const nameParts = metadata.name.split('/');
  if (nameParts.length !== 2 || !nameParts[0].startsWith('@')) {
     return c.json({ error: "Invalid package name. Must be @username/slug" }, 400);
  }
  const scope = nameParts[0].substring(1); // "diego"

  // TODO: Validate that 'scope' matches user.username (or allowed orgs)

  const db = drizzle(c.env.DB);

  // 3. Find/Create Package
  let pkg = await db.select().from(registryPackages)
    .where(eq(registryPackages.name, metadata.name)).get();

  if (!pkg) {
    const newId = crypto.randomUUID();
    await db.insert(registryPackages).values({
      id: newId,
      userId: user.id,
      name: metadata.name,
      slug: nameParts[1],
      description: metadata.description || "",
      isPublic: !metadata.private,
      latestVersion: metadata.version
    });
    pkg = { id: newId };
  } else {
    // Check ownership
    if (pkg.userId !== user.id) {
      return c.json({ error: "Permission denied: You do not own this package." }, 403);
    }
  }

  // 4. Check for Version Conflict
  const existing = await db.select().from(registryVersions)
    .where(and(eq(registryVersions.packageId, pkg.id), eq(registryVersions.version, metadata.version)))
    .get();

  if (existing) {
    return c.json({ error: `Version ${metadata.version} already exists. Please increment version in course.json` }, 409);
  }

  // 5. Upload to R2
  const key = `packages/${metadata.name}/${metadata.version}.zip`;
  await c.env.REGISTRY_BUCKET.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: "application/zip" },
    customMetadata: { userId: user.id, version: metadata.version }
  });

  // 6. Record Version
  await db.insert(registryVersions).values({
    id: crypto.randomUUID(),
    packageId: pkg.id,
    version: metadata.version,
    storageKey: key,
    sizeBytes: file.size,
    checksum: "sha256-placeholder", // Compute this if possible
    changelog: metadata.changelog
  });

  // 7. Update Head
  await db.update(registryPackages)
    .set({ latestVersion: metadata.version, updatedAt: new Date() })
    .where(eq(registryPackages.id, pkg.id));

  return c.json({ success: true, version: metadata.version });
});
```

### 4.3 API Endpoint: Resolve (`GET /registry/resolve/:name`)
Used by the CLI to find the latest version and metadata before downloading.

```typescript
registry.get("/resolve/:scope/:slug", async (c) => {
  const name = `@${c.req.param("scope")}/${c.req.param("slug")}`;
  const db = drizzle(c.env.DB);

  const pkg = await db.select().from(registryPackages)
    .where(eq(registryPackages.name, name)).get();

  if (!pkg) return c.json({ error: "Package not found" }, 404);

  // Get versions list
  const versions = await db.select({ v: registryVersions.version })
    .from(registryVersions)
    .where(eq(registryVersions.packageId, pkg.id))
    .orderBy(desc(registryVersions.createdAt))
    .all();

  return c.json({
    name: pkg.name,
    latest: pkg.latestVersion,
    versions: versions.map(v => v.v),
    description: pkg.description
  });
});
```

### 4.4 API Endpoint: Download (`GET /registry/download/:name/:version`)
Streams the file content.

```typescript
registry.get("/download/:scope/:slug/:version", async (c) => {
  const name = `@${c.req.param("scope")}/${c.req.param("slug")}`;
  const version = c.req.param("version");
  const key = `packages/${name}/${version}.zip`;

  const object = await c.env.REGISTRY_BUCKET.get(key);
  if (!object) return c.json({ error: "Artifact not found in registry storage" }, 404);

  // Add analytics tracking here (fire-and-forget async)

  return new Response(object.body, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${c.req.param("slug")}-${version}.zip"`
    }
  });
});
```

---

## 5. CLI Implementation (`apps/cli`)

### 5.1 Command: `progy publish`
This command allows instructors to push their courses.

**Prerequisites:**
1.  Authenticated (`progy login`).
2.  `course.json` exists in CWD.
3.  `course.json` has `name` starting with `@user/` and valid `version`.

**Implementation Logic:**
1.  **Read Config:** Load `course.json`.
2.  **Validate:** Check fields.
3.  **Pack:** Use `adm-zip` to recursively zip the folder.
    *   **Filter:** Exclude `node_modules`, `.git`, `.progy`, `dist`, `.env`.
4.  **Upload:** Use `fetch` with `FormData` to POST to `/registry/publish`.
5.  **Feedback:** Show a spinner/progress bar.

**Error Handling:**
*   If version exists -> "Version conflict. Please bump version in course.json".
*   If network fails -> Retry logic.

### 5.2 Command: `progy init <package>` (The Student Flow)
This replaces the old `git clone` logic.

**Steps:**
1.  **Parse:** User types `progy init @diego/rust`.
2.  **Resolve:** Fetch metadata from `/registry/resolve/@diego/rust`.
    *   If package doesn't exist -> "Package not found. Did you mean...?"
3.  **Download:** Fetch `/registry/download/@diego/rust/<latest_version>`.
    *   Stream response to a temporary file (e.g., `/tmp/progy-download.zip`).
4.  **Extract:** Unzip to `./rust` (or provided directory name).
5.  **Post-Process:**
    *   Remove `course.json` internal fields if necessary (keep clean).
    *   **CRITICAL: Portfolio Setup.**

**Portfolio Setup Logic (Detailed):**
We want the student to feel like they are starting *their* project.

```typescript
// apps/cli/src/utils/student-setup.ts

async function initializePortfolio(cwd: string, courseName: string) {
  logger.info("🎨 Setting up your portfolio workspace...");

  // 1. Initialize a FRESH git repository
  // This disconnects the history from the instructor's development history
  await GitUtils.exec(["init"], cwd);

  // 2. Add all files
  await GitUtils.exec(["add", "."], cwd);

  // 3. Create the first commit
  // "Initial commit" gives the student a clean slate
  await GitUtils.exec(["commit", "-m", `Initial commit: Started ${courseName}`], cwd);

  // 4. Prompt for Remote Connection
  // This uses the existing GitHub integration in Progy
  const { connect } = await prompt({
    type: 'confirm',
    name: 'connect',
    message: 'Would you like to publish this to your GitHub as a new repository?',
    initial: true
  });

  if (connect) {
    const token = await loadToken();
    const repoName = `learning-${courseName.split('/')[1]}`; // e.g. learning-rust

    logger.info(`Creating private repository '${repoName}' on GitHub...`);

    // Call backend to create repo
    const repoData = await api.createRepo(repoName, token);

    // Link remote
    await GitUtils.exec(["remote", "add", "origin", repoData.clone_url], cwd);
    await GitUtils.exec(["branch", "-M", "main"], cwd);
    await GitUtils.exec(["push", "-u", "origin", "main"], cwd);

    logger.success(`🚀 Portfolio ready! Pushed to ${repoData.html_url}`);
  }
}
```

---

## 6. Migration Plan

How do we move from the current `wrangler.toml` hardcoded list to this DB?

### Phase 1: Dual Mode (The "Compatibility" Layer)
*   Modify `CourseLoader` in the CLI.
*   **Logic:**
    1.  Is the input a Registry ID (`@scope/name`)? -> Call Registry API.
    2.  Is the input a Legacy Alias (`rust`, `go`)? -> Check `COURSES` map (legacy).
    3.  Is the input a URL? -> Clone directly.

### Phase 2: Content Migration
*   Write a script that:
    1.  Iterates through the `COURSES` list in `wrangler.toml`.
    2.  Clones each repo.
    3.  Reads `course.json` (or creates one).
    4.  Zips it.
    5.  Uploads it to the Registry under the `@progy` official account (e.g., `@progy/rust`).
*   Update the `COURSES` map to point "rust" alias to `@progy/rust`.

### Phase 3: Deprecation
*   Remove the `COURSES` map entirely.
*   Require `@scope/name` for all new projects.

---

## 7. Security & Compliance

### 7.1 Access Control
*   **Publishing:** Strict check. `pkg.userId === session.userId`.
*   **Namespace Protection:** User `@diego` can ONLY publish to `@diego/*`. They cannot publish to `@progy/*`.
*   **Admin Override:** A specific boolean flag in the `User` table (`isAdmin`) should allow publishing to system namespaces like `@progy` or `@std`.

### 7.2 Content Safety
*   **Zip Bombs:** The backend should check the extracted size ratio of the zip before accepting it (if possible in Worker) or rely on R2 limits.
*   **Malicious Code:** Since these are courses, they contain code. We cannot easily scan for "malware" in code, but we can scan for binary executables (`.exe`, `.dll`) in the zip and reject them if found.

---

## 8. Detailed Migration SQL

To manually migrate the database or create the new tables, use the following SQL. This is useful for `wrangler d1 execute`.

```sql
-- Migration: Add Registry Tables

-- 1. Create Packages Table
CREATE TABLE IF NOT EXISTS registry_packages (
    id TEXT PRIMARY KEY NOT NULL,
    user_id TEXT NOT NULL REFERENCES user(id),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL,
    description TEXT,
    latest_version TEXT,
    is_public INTEGER DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 2. Create Index for Packages
CREATE INDEX IF NOT EXISTS registry_packages_user_id_idx ON registry_packages(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS registry_packages_name_idx ON registry_packages(name);

-- 3. Create Versions Table
CREATE TABLE IF NOT EXISTS registry_versions (
    id TEXT PRIMARY KEY NOT NULL,
    package_id TEXT NOT NULL REFERENCES registry_packages(id),
    version TEXT NOT NULL,
    storage_key TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    checksum TEXT NOT NULL,
    changelog TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- 4. Create Index for Versions
CREATE UNIQUE INDEX IF NOT EXISTS registry_versions_pkg_ver_idx ON registry_versions(package_id, version);

-- 5. Create Downloads Table (Optional)
CREATE TABLE IF NOT EXISTS registry_downloads (
    id TEXT PRIMARY KEY NOT NULL,
    package_id TEXT NOT NULL,
    version_id TEXT NOT NULL,
    user_id TEXT,
    ip_address TEXT,
    downloaded_at INTEGER NOT NULL DEFAULT (unixepoch())
);
```

---

## 9. Error Code Reference

The backend API will return specific error codes to help the CLI provide better feedback.

| HTTP Code | Error Code | Message | Description |
| :--- | :--- | :--- | :--- |
| 400 | `INVALID_NAME` | "Invalid package name. Must be @username/slug" | Malformed package name in metadata. |
| 400 | `INVALID_VERSION` | "Invalid semantic version" | Version does not follow SemVer (x.y.z). |
| 401 | `UNAUTHORIZED` | "Unauthorized" | Session token missing or invalid. |
| 403 | `FORBIDDEN` | "Permission denied: You do not own this package" | User tries to publish to a scope they don't own. |
| 404 | `PACKAGE_NOT_FOUND` | "Package not found" | Package ID or name does not exist. |
| 409 | `VERSION_EXISTS` | "Version already exists" | Attempt to overwrite an existing immutable version. |
| 413 | `PAYLOAD_TOO_LARGE` | "File too large" | Upload exceeds the 100MB limit. |
| 500 | `R2_UPLOAD_FAILED` | "Storage upload failed" | Internal error communicating with R2. |

---

## 10. Client-Side Caching Strategy

To improve performance and reduce R2 bandwidth, the CLI should implement a local cache.

### Local Cache Directory
On macOS/Linux: `~/.progy/cache/registry/`
On Windows: `%LOCALAPPDATA%\progy\cache\registry\`

### Cache Logic
1.  **Resolve:** When `progy init` runs, it gets the latest version (e.g., `1.0.0`) and its checksum.
2.  **Check Cache:** Look for `~/.progy/cache/registry/@scope/slug/1.0.0.zip`.
3.  **Verify:** If found, compute SHA-256 of the cached file.
    *   If matches checksum from API -> Use cached file (HIT).
    *   If mismatch -> Delete and re-download (MISS).
4.  **Download:** If not found, download from API and save to cache.

**Pruning:**
A background process (or on every execution) should check the cache size. If it exceeds 1GB, delete the oldest accessed files (LRU).

---

## 11. Course Metadata Specification (`course.json`)

The `course.json` file is the manifest for every package.

```json
{
  "$schema": "https://progy.dev/schema/course.json",
  "name": "@diego/rust-mastery",
  "version": "1.0.0",
  "description": "The ultimate guide to Rust programming.",
  "keywords": ["rust", "systems", "webassembly"],
  "author": {
    "name": "Diego",
    "email": "diego@example.com",
    "url": "https://diego.dev"
  },
  "license": "MIT",
  "private": false,
  "repository": {
    "type": "git",
    "url": "https://github.com/diego/rust-mastery.git"
  },
  "engines": {
    "progy": ">=0.15.0"
  },
  "files": [
    "content/**/*",
    "runner/**/*",
    "assets/**/*",
    "README.md"
  ]
}
```

### Fields Explanation
*   `name`: **Required.** Must match the Registry ID format.
*   `version`: **Required.** SemVer.
*   `files`: **Optional.** Glob patterns to include in the published zip. If omitted, defaults to everything except `.gitignore` rules.
*   `engines`: **Optional.** Specifies compatible Progy CLI versions.

---

## 12. Environment Setup Guide

For developers contributing to the Progy Registry codebase.

### Prerequisites
*   Wrangler CLI (`npm install -g wrangler`)
*   Cloudflare Account (Free Tier works)

### Step 1: Create D1 Database
```bash
wrangler d1 create progy-db
# Copy the database_id to wrangler.toml
```

### Step 2: Create R2 Bucket
```bash
wrangler r2 bucket create progy-registry-prod
# Add binding to wrangler.toml
```

### Step 3: Local Development
```bash
# Start local D1 and R2 emulation
bun run dev:backend
```

The local backend will emulate R2 using local disk storage, allowing full testing of the publish/download flow without hitting Cloudflare limits.

---

## 13. Testing Strategy

We must ensure the registry is reliable.

### Backend Tests (`apps/backend/tests/registry.test.ts`)
*   **Unit Tests:**
    *   Test SemVer validation regex.
    *   Test Package Name validation regex (`@scope/slug`).
*   **Integration Tests:**
    *   Mock `c.env.DB` and `c.env.BUCKET`.
    *   `POST /publish` with valid data -> 200 OK.
    *   `POST /publish` with duplicate version -> 409 Conflict.
    *   `POST /publish` with mismatching user -> 403 Forbidden.

### CLI Tests (`apps/cli/tests/registry.test.ts`)
*   **Mock Server:** Spin up a local Hono server mocking the Registry API.
*   **Flow Test:**
    1.  Run `progy publish` in a test folder.
    2.  Assert `POST /publish` was called with correct FormData.
    3.  Assert zip file structure (contains `course.json`).
*   **Init Test:**
    1.  Run `progy init @test/pkg`.
    2.  Assert `GET /resolve` called.
    3.  Assert `GET /download` called.
    4.  Assert folder created and `git init` run.

---

## 14. Advanced CLI Usage

### `--dry-run`
Simulates a publish without uploading.
```bash
progy publish --dry-run
# Output:
# [DRY-RUN] Validating course.json... OK
# [DRY-RUN] Packing files... (3.2MB)
# [DRY-RUN] Would publish @diego/rust-mastery v1.0.0
```

### `--force` (Admin Only)
Overrides version checks or ownership (if admin).
```bash
progy publish --force
```

### `--json`
Outputs result in JSON for CI/CD pipelines.
```bash
progy publish --json
# Output: { "success": true, "version": "1.0.0", "url": "..." }
```

---

## 15. Future Improvements (Post-MVP)

1.  **Web UI:** A marketplace to browse courses, view readmes, and see version history.
2.  **Course Updates:**
    *   Command: `progy update`
    *   Logic: Checks for new version -> Downloads patch -> Attempts to merge changes into student's repo using `git merge-file`.
3.  **Monetization:**
    *   Gate the `/download` endpoint behind a Stripe purchase check.
    *   "Buy this course for $10" -> Adds record to `user_purchases` table -> API verifies before returning stream.

## 16. Implementation Checklist & file Changes

### backend/src/db/schema.ts
- [ ] Import `user` table.
- [ ] Define `registryPackages`.
- [ ] Define `registryVersions`.
- [ ] Define `registryDownloads`.
- [ ] Export new tables.

### backend/src/index.ts
- [ ] Import `registry` router.
- [ ] Mount `app.route('/registry', registry)`.

### backend/src/endpoints/registry.ts (New)
- [ ] Implement `POST /publish`.
- [ ] Implement `GET /resolve/:scope/:slug`.
- [ ] Implement `GET /download/:scope/:slug/:version`.

### cli/src/commands/publish.ts (New)
- [ ] Implement argument parsing.
- [ ] Implement `packCourse` (zip logic).
- [ ] Implement API upload client.

### cli/src/commands/course.ts (Update)
- [ ] Modify `init` to detect registry pattern.
- [ ] Implement `downloadAndExtract`.
- [ ] Implement `initializePortfolio` (git init logic).

### cli/package.json
- [ ] Add `adm-zip` dependency.
- [ ] Add `@types/adm-zip` devDependency.

---

## 17. Conclusion

This design provides a robust foundation for the Progy ecosystem. By moving to a centralized registry, we gain control over the distribution pipeline, enable versioning, and significantly improve the student experience by giving them clean, independent git repositories for their work. The use of Cloudflare D1 and R2 ensures this solution is scalable and cost-effective from Day 1.
