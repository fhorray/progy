import { join, dirname } from "node:path";
import { mkdir, writeFile, readFile, copyFile, readdir, stat, rm } from "node:fs/promises";
import { GitUtils } from "./git";
import { getCourseCachePath } from "./paths";

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

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export class SyncManager {
  static async ensureOfficialCourse(courseId: string, repoUrl: string, branch = "main", path?: string): Promise<string> {
    const cacheDir = getCourseCachePath(courseId);
    const gitDir = join(cacheDir, ".git");

    if (await exists(gitDir)) {
      console.log(`[SYNC] Updating official course cache: ${courseId}...`);
      await GitUtils.exec(["fetch", "origin"], cacheDir);
      await GitUtils.exec(["reset", "--hard", `origin/${branch}`], cacheDir);
    } else {
      console.log(`[SYNC] Cloning official course cache: ${courseId}...`);
      await rm(cacheDir, { recursive: true, force: true });
      await mkdir(cacheDir, { recursive: true });

      if (path) {
        await GitUtils.exec(["init"], cacheDir);
        await GitUtils.addRemote(cacheDir, "", repoUrl);
        await GitUtils.sparseCheckout(cacheDir, [path]);
        await GitUtils.exec(["pull", "--depth=1", "origin", branch], cacheDir);
      } else {
        await GitUtils.clone(repoUrl, cacheDir, "", branch);
      }
    }
    return cacheDir;
  }

  static async loadConfig(cwd: string): Promise<ProgyConfig | null> {
    const configPath = join(cwd, "progy.toml");
    if (!(await exists(configPath))) return null;

    try {
      const content = await readFile(configPath, "utf-8");
      const config: any = { course: {}, sync: {} };
      let section = "";

      for (let line of content.split("\n")) {
        line = line.trim();

        // Skip empty lines or full-line comments
        if (!line || line.startsWith("#")) continue;

        // Strip inline comments (basic implementation: remove after #, but ignore # inside quotes)
        // This regex splits by # only if it's not preceded by an odd number of quotes... simplified for now:
        // Just splitting by # is risky if URL contains #.
        // Let's assume standard TOML: # starts comment unless in string.
        // For simplicity and robustness without a parser, we'll just handle line start # and basic key=value.
        // If a value contains #, it must be quoted.

        if (line.startsWith("[")) {
            const end = line.indexOf("]");
            if (end > 0) {
                section = line.slice(1, end).trim();
                continue;
            }
        }

        const eqIdx = line.indexOf("=");
        if (eqIdx === -1) continue;

        const key = line.slice(0, eqIdx).trim();
        let valStr = line.slice(eqIdx + 1).trim();

        // 1. Remove inline comments first (naive check)
        // If the line has a #, we need to see if it's inside quotes or not.
        // For simplicity, we'll assume # outside of the very first pair of quotes is a comment if the value starts with quote.
        // Or if it doesn't start with quote, # starts a comment.

        // Better approach for simple KV:
        // If it starts with quote, find the matching end quote.
        if (valStr.startsWith('"')) {
            const endQuote = valStr.indexOf('"', 1);
            if (endQuote !== -1) {
                valStr = valStr.slice(0, endQuote + 1); // Keep the quotes for now
            }
        } else if (valStr.startsWith("'")) {
             const endQuote = valStr.indexOf("'", 1);
             if (endQuote !== -1) {
                 valStr = valStr.slice(0, endQuote + 1);
             }
        } else {
            // No starting quote, split by #
            const commentIdx = valStr.indexOf("#");
            if (commentIdx !== -1) {
                valStr = valStr.slice(0, commentIdx).trim();
            }
        }

        // 2. Strip quotes
        let val = valStr;
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.slice(1, -1);
        } else if (val.startsWith("'") && val.endsWith("'")) {
            val = val.slice(1, -1);
        }

        if (section === "course") config.course[key] = val;
        if (section === "sync") config.sync[key] = val;
      }

      return config as ProgyConfig;
    } catch (e) {
      console.warn(`[WARN] Failed to load progy.toml: ${e}`);
      return null;
    }
  }

  static async saveConfig(cwd: string, config: ProgyConfig) {
    // Helper to safely stringify values
    const safeStr = (v: string) => JSON.stringify(v); // This adds quotes "value"

    const content = `[course]
id = ${safeStr(config.course.id)}
repo = ${safeStr(config.course.repo)}
branch = ${safeStr(config.course.branch || 'main')}
path = ${safeStr(config.course.path || '')}

[sync]
last_sync = ${safeStr(new Date().toISOString())}
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

    let content = `*
!.gitignore
!progy.toml
!content/
!content/**/
`;
    for (const ext of extList) {
      content += `!content/**/*${ext}\n`;
    }
    content += `!progy-notes/\n!progy-notes/**\n`;

    await writeFile(join(cwd, ".gitignore"), content);
  }

  static async applyLayering(cwd: string, cacheDir: string, force = false, sourcePath?: string) {
    const src = sourcePath ? join(cacheDir, sourcePath) : cacheDir;
    await this.copyRecursive(src, cwd, force, src);
  }

  private static async copyRecursive(src: string, dest: string, force: boolean, rootSrc: string) {
    const entries = await readdir(src, { withFileTypes: true });
    await mkdir(dest, { recursive: true });

    for (const entry of entries) {
      if (entry.name === ".git") continue;

      const srcPath = join(src, entry.name);
      const destPath = join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyRecursive(srcPath, destPath, force, rootSrc);
      } else {
        const relPath = srcPath.replace(rootSrc, "").replace(/\\/g, "/");
        const isContent = relPath.includes("/content/");

        let shouldOverwrite = true;
        if (isContent) {
          const isCode = /\.(rs|go|ts|js|py|lua|c|cpp|h|toml|mod|sum|json)$/.test(entry.name);
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
}
