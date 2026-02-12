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

  static async restoreProgress(buffer: Buffer, cwd: string) {
    const zip = new AdmZip(buffer);
    zip.extractAllTo(cwd, true);
  }
}
