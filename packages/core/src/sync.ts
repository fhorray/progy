import { join, dirname } from "node:path";
import { mkdir, writeFile, readFile, copyFile, readdir, rm } from "node:fs/promises";
import AdmZip from "adm-zip";
import { GitUtils } from "./git.ts";
import { getCourseCachePath, BACKEND_URL } from "./paths.ts";
import { exists } from "./utils.ts";
import { loadToken } from "./config.ts";

export interface ProgyConfig {
  course: {
    id: string;
    repo: string;
    branch?: string;
    path?: string;
    version?: string;
  };
  sync?: {
    last_sync?: string;
  };
}

export class SyncManager {

  static async loadConfig(cwd: string): Promise<ProgyConfig | null> {
    const configPath = join(cwd, "progy.toml");
    if (!(await exists(configPath))) return null;

    try {
      const content = await readFile(configPath, "utf-8");
      const config: any = { course: {}, sync: {} };
      let section = "";

      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
          section = trimmed.slice(1, -1);
          continue;
        }
        if (!trimmed || trimmed.startsWith("#")) continue;

        const [key, ...valParts] = trimmed.split("=");
        if (!key || valParts.length === 0) continue;

        const val = valParts.join("=").trim().replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");

        if (section === "course") config.course[key.trim()] = val;
        if (section === "sync") config.sync[key.trim()] = val;
      }

      return config as ProgyConfig;
    } catch {
      return null;
    }
  }

  static async saveConfig(cwd: string, config: ProgyConfig) {
    const content = `[course]
id = "${config.course.id}"
repo = "${config.course.repo}"
branch = "${config.course.branch || 'main'}"
path = "${config.course.path || ''}"
version = "${config.course.version || '1.0.0'}"

[sync]
last_sync = "${new Date().toISOString()}"
`;
    await writeFile(join(cwd, "progy.toml"), content);
  }

  static async generateGitIgnore(cwd: string, courseId: string) {
    const extensions: Record<string, string[]> = {
      rust: [".rs", ".toml"],
      go: [".go", ".mod", ".sum"],
      typescript: [".ts", ".json", ".tsx"],
      javascript: [".js", ".json", ".jsx"],
      python: [".py", ".txt"],
      lua: [".lua"],
      c: [".c", ".h", "Makefile"],
      cpp: [".cpp", ".h", ".hpp", "Makefile"],
      java: [".java"],
      ruby: [".rb"],
      zig: [".zig", ".zon"],
    };

    let extList: string[] = [];
    const lowerId = courseId.toLowerCase();

    if (extensions[lowerId]) {
      extList = extensions[lowerId];
    } else {
      for (const [key, val] of Object.entries(extensions)) {
        if (lowerId.startsWith(key)) {
          extList = val;
          break;
        }
      }
    }

    let content = `# Progy Course Ignore File
# This file ensures only your solutions are tracked in Git.

# System & Dependencies
.DS_Store
node_modules/
dist/
.env

# Course Metadata (Do not commit these)
**/README.md
**/info.toml
**/quiz.json
**/solution.*
**/.progy/

# Keep these
!progy.toml
!.gitignore
`;
    await writeFile(join(cwd, ".gitignore"), content);
  }

  static async applyLayering(cwd: string, cacheDir: string, force = false, sourcePath?: string) {
    const src = sourcePath ? join(cacheDir, sourcePath) : cacheDir;
    await this.copyRecursive(src, cwd, force);
  }

  private static async copyRecursive(src: string, dest: string, force: boolean) {
    const entries = await readdir(src, { withFileTypes: true });
    await mkdir(dest, { recursive: true });

    for (const entry of entries) {
      if (entry.name === ".git") continue;

      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyRecursive(srcPath, destPath, force);
      } else {
        const isContent = destPath.replace(/\\/g, "/").includes("/content/");

        let shouldOverwrite = true;
        if (isContent) {
          const isCode = /\.(rs|go|ts|js|py|lua|c|cpp|h|toml|mod|sum|json|sql)$/.test(entry.name);
          if (isCode && !force) {
            if (await exists(destPath)) {
              shouldOverwrite = false;
            }
          }
        }

        if (shouldOverwrite) {
          await copyFile(srcPath, destPath);
        }
      }
    }
  }

  static async resetExercise(cwd: string, cacheDir: string, relativePath: string) {
    const srcPath = join(cacheDir, relativePath);
    const destPath = join(cwd, relativePath);

    if (await exists(srcPath)) {
      await mkdir(dirname(destPath), { recursive: true });
      await copyFile(srcPath, destPath);
      console.log(`[RESET] Restored ${relativePath}`);
    } else {
      throw new Error(`File ${relativePath} not found in official course.`);
    }
  }

  static async packProgress(cwd: string): Promise<Buffer> {
    const zip = new AdmZip();
    const contentPath = join(cwd, "content");
    if (await exists(contentPath)) {
      zip.addLocalFolder(contentPath, "content");
    }
    const configPath = join(cwd, "progy.toml");
    if (await exists(configPath)) {
      zip.addLocalFile(configPath);
    }
    return zip.toBuffer();
  }

  static async uploadProgress(courseId: string, buffer: ArrayBuffer): Promise<boolean> {
    const token = await loadToken();
    if (!token) return false;

    const formData = new FormData();
    formData.append("courseId", courseId);
    formData.append("file", new Blob([buffer]), "progress.progy");

    try {
      const response = await fetch(`${BACKEND_URL}/progress/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      return response.ok;
    } catch (e) {
      console.error("Upload failed", e);
      return false;
    }
  }

  static async downloadProgress(courseId: string): Promise<Buffer | null> {
    const token = await loadToken();
    if (!token) return null;

    try {
      const response = await fetch(`${BACKEND_URL}/progress/download?courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }
    } catch (e) {
      // console.warn("Download progress failed (likely no progress exists)", e);
    }
    return null;
  }

  static async checkUpdate(cwd: string): Promise<{ updateAvailable: boolean; currentVersion: string; latestVersion: string; courseId: string } | null> {
    const config = await this.loadConfig(cwd);
    if (!config || !config.course.id) return null;

    try {
      // Use dynamic import to avoid circular dependency if CourseLoader imports SyncManager
      const { CourseLoader } = await import("./loader");
      const source = await CourseLoader.resolveSource(config.course.id);

      if (!source.isRegistry || !source.version) return null;

      const currentVersion = config.course.version || "1.0.0";
      // Simple string comparison for now, assuming semantic versioning is strictly followed in registry
      // Ideally use semver package, but for now strict inequality is a safe enough trigger
      if (source.version !== currentVersion) {
        return {
          updateAvailable: true,
          currentVersion,
          latestVersion: source.version,
          courseId: config.course.id
        };
      }
    } catch (e) {
      console.warn("Failed to check for updates:", e);
    }
    return null;
  }

  static async getUpdateDiff(cwd: string, latestVersion: string): Promise<{ added: string[]; modified: string[]; deleted: string[] }> {
    const config = await this.loadConfig(cwd);
    if (!config) throw new Error("Course not initialized");

    const { CourseLoader } = await import("./loader");
    const { CourseContainer } = await import("./container");

    // 1. Download new version to temp cache
    // We construct the registry ID/Version request manually or use loader if we had a specific version method
    // For now, let's assume we can fetch the specific version or 'latest' via the loader's resolution logic
    // but CourseLoader.resolveSource returns 'latest'.
    // If we need a specific version, we might need to adjust loader, but for "upgrade" we usually want latest.
    const source = await CourseLoader.resolveSource(config.course.id);
    if (!source.url) throw new Error("Could not resolve update URL");

    const tempDir = join(getCourseCachePath(config.course.id), `update-${latestVersion}-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Download and unpack
    await CourseContainer.downloadAndUnpack(source.url, tempDir);

    // 2. Compare content files
    const localContent = join(cwd, "content");
    const newContent = join(tempDir, "content");

    const localFiles = await this.listContentFiles(localContent);
    const newFiles = await this.listContentFiles(newContent);

    const added: string[] = [];
    const modified: string[] = [];
    const deleted: string[] = [];

    // Check for added and modified
    for (const file of newFiles) {
      if (!localFiles.includes(file)) {
        added.push(file);
      } else {
        // Compare content (size/hash or just overwrite? Let's check size for speed)
        // A better check is needed for real production, but for now we assume overwrite if exists and is different
        // or just mark as 'modified' if it exists in simple Logic.
        // Let's actually compare content to be precise.
        const localBuf = await readFile(join(localContent, file));
        const newBuf = await readFile(join(newContent, file));
        if (!localBuf.equals(newBuf)) {
          modified.push(file);
        }
      }
    }

    // Check for deleted (files present locally but not in new version)
    // We only track files that were part of the course structure.
    for (const file of localFiles) {
      if (!newFiles.includes(file)) {
        deleted.push(file);
      }
    }

    // Cleanup temp
    await rm(tempDir, { recursive: true, force: true });

    return { added, modified, deleted };
  }

  static async applyUpdate(cwd: string, latestVersion: string) {
    const config = await this.loadConfig(cwd);
    if (!config) throw new Error("Course not initialized");

    const { CourseLoader } = await import("./loader");
    const { CourseContainer } = await import("./container");

    const source = await CourseLoader.resolveSource(config.course.id);
    if (!source.url) throw new Error("Could not resolve update URL");

    // Use standard cache path for the version
    // We want to update the peristent cache too so future starts use it
    const cachePath = getCourseCachePath(config.course.id);
    // We might want to clear old cache or just overwrite

    // Download and extract directly to cache (managing versioning in cache is a broader topic,
    // here we just treat cache as 'latest' for the course ID)
    // For safety, let's download to a temp first, then move to cache.
    const tempUpdateDir = join(dirname(cachePath), `${config.course.id}-update-${Date.now()}`);
    await CourseContainer.downloadAndUnpack(source.url, tempUpdateDir);

    // Update Project Content
    // We use force=true to overwrite because the user confirmed the update
    // But strictly speaking, applyLayering is conservative.
    // Let's manually copy 'content' from temp to cwd with overwrite
    await this.applyLayering(cwd, tempUpdateDir, true);

    // Update Progy Config
    config.course.version = latestVersion;
    await this.saveConfig(cwd, config);

    // Update Cache (Swap)
    // If cache exists, remove it
    if (await exists(cachePath)) {
      await rm(cachePath, { recursive: true, force: true });
    }
    // Rename temp to cache
    // Note: rename across partitions might fail, so we might need copy+rm if temp is elsewhere.
    // They should be in the same temp/cache root usually.
    await mkdir(dirname(cachePath), { recursive: true });
    // Safe move/rename
    try {
      // We need to move the *contents* or the folder? 
      // getCourseCachePath usually returns .../cache/course-id
      // We unpacked to tempUpdateDir.
      await import("node:fs/promises").then(fs => fs.rename(tempUpdateDir, cachePath));
    } catch {
      // Fallback copy
      await this.copyRecursive(tempUpdateDir, cachePath, true);
      await rm(tempUpdateDir, { recursive: true, force: true });
    }
  }

  private static async listContentFiles(dir: string, base = ""): Promise<string[]> {
    const files: string[] = [];
    if (!(await exists(dir))) return [];

    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = join(base, entry.name);
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...await this.listContentFiles(fullPath, relativePath));
      } else {
        files.push(relativePath);
      }
    }
    return files;
  }

  static async restoreProgress(buffer: Buffer, cwd: string) {
    const zip = new AdmZip(buffer);
    zip.extractAllTo(cwd, true);
  }
}
