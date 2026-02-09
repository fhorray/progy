import { join, resolve } from "node:path";
import { mkdir, writeFile, readdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import { GitUtils } from "../core/git";
import { SyncManager } from "../core/sync";
import { CourseLoader } from "../core/loader";
import { CourseContainer } from "../core/container";
import { loadToken } from "../core/config";
import { BACKEND_URL } from "../core/paths";
import { TEMPLATES, RUNNER_README } from "../templates";

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function runServer(runtimeCwd: string, isOffline: boolean, containerFile: string | null) {
  console.log(`[INFO] Starting UI in ${isOffline ? 'OFFLINE' : 'ONLINE'} mode...`);

  // Try to locate the server file robustly
  // In dev (ts): ../backend/server.ts
  // In prod (js): ../backend/server.js (relative to compiled commands dir)

  const isTs = import.meta.file.endsWith(".ts");
  const ext = isTs ? "ts" : "js";

  // Try resolving relative to 'commands' folder (parent of current file)
  // If this file is in src/commands, then ../backend is src/backend.
  let serverPath = resolve(import.meta.dir, "..", "backend", `server.${ext}`);

  if (!(await exists(serverPath))) {
      // Fallback: maybe structure is different in dist?
      // Try just "backend/server.js" if we are in root of dist? Unlikely but safe fallback.
      const altPath = resolve(import.meta.dir, "backend", `server.${ext}`);
      if (await exists(altPath)) {
          serverPath = altPath;
      } else {
          // One more try: maybe flattened?
          const flatPath = resolve(import.meta.dir, `server.${ext}`);
          if (await exists(flatPath)) {
              serverPath = flatPath;
          }
      }
  }

  if (!(await exists(serverPath))) {
      console.error(`[CRITICAL] Server file not found at ${serverPath}`);
      process.exit(1);
  }

  const child = spawn("bun", ["run", serverPath], {
    stdio: "inherit",
    env: {
      ...process.env,
      PROG_CWD: runtimeCwd,
      PROGY_OFFLINE: isOffline ? "true" : "false"
    },
  });

  if (containerFile) {
    console.log(`[SYNC] Auto-save enabled.`);
    const { watch } = await import("node:fs");
    let debounceTimer: any = null;

    try {
        const watcher = watch(runtimeCwd, { recursive: true }, (event, filename) => {
        if (!filename || filename.includes(".git") || filename.includes("node_modules")) return;
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            try {
            await CourseContainer.sync(runtimeCwd, containerFile);
            } catch (e) {
            console.error(`[SYNC] Failed to save: ${e}`);
            }
        }, 1000);
        });

        child.on("close", () => {
        watcher.close();
        CourseContainer.sync(runtimeCwd, containerFile).then(() => process.exit(0));
        });
    } catch (e) {
        console.warn(`[WARN] Watcher failed to start: ${e}. Auto-save might be limited.`);
        child.on("close", (code) => process.exit(code ?? 0));
    }
  } else {
    child.on("close", (code) => process.exit(code ?? 0));
  }
}

export async function init(options: { course?: string; offline?: boolean }) {
  const cwd = process.cwd();
  const isOffline = !!options.offline;
  let courseId = options.course;

  const existingConfig = await SyncManager.loadConfig(cwd);
  if (existingConfig) {
    courseId = existingConfig.course.id;
  }

  if (!courseId && !isOffline) {
    courseId = "generic";
  }

  if (isOffline) {
    console.warn("⚠️  Offline init not fully supported yet.");
    return;
  }

  const token = await loadToken();
  if (!token) {
    console.error("❌ Authentication required. Run 'progy login' first.");
    process.exit(1);
  }

  try {
    console.log("[INIT] Fetching credentials...");
    const credRes = await fetch(`${BACKEND_URL}/git/credentials`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!credRes.ok) throw new Error(`Failed to fetch credentials (${credRes.status})`);
    const gitCreds = await credRes.json() as any;

    const officialSource = await CourseLoader.resolveSource(courseId!);

    console.log("[INIT] Ensuring repository...");
    const ensureRes = await fetch(`${BACKEND_URL}/git/ensure-repo`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ courseId })
    });

    if (!ensureRes.ok) throw new Error(`Failed to ensure repo (${ensureRes.status})`);
    const userRepoInfo = await ensureRes.json() as { repoUrl: string, isNew: boolean };

    if (await exists(join(cwd, ".git"))) {
      await GitUtils.pull(cwd);
    } else {
      const files = await readdir(cwd);
      // Check if directory is effectively empty (ignoring .git or config if they existed but check above says no git)
      // Actually we checked .git exists above.

      if (files.length > 0 && !existingConfig) {
        // Directory has files but no config -> Initialize git and add remote
        await GitUtils.init(cwd);
        await GitUtils.addRemote(cwd, gitCreds.token, userRepoInfo.repoUrl);
        await GitUtils.pull(cwd);
      } else {
        // Directory empty or existing config -> Clone
        await GitUtils.clone(userRepoInfo.repoUrl, cwd, gitCreds.token);
      }
    }

    const cacheDir = await SyncManager.ensureOfficialCourse(
      courseId!,
      officialSource.url,
      officialSource.branch,
      officialSource.path
    );

    await SyncManager.applyLayering(cwd, cacheDir, false, officialSource.path);

    if (!existingConfig) {
      await SyncManager.saveConfig(cwd, {
        course: {
          id: courseId!,
          repo: officialSource.url,
          branch: officialSource.branch,
          path: officialSource.path
        }
      });
      await SyncManager.generateGitIgnore(cwd, courseId!);
    }

    console.log("[SUCCESS] Course initialized!");
  } catch (e: any) {
    console.error(`[ERROR] Init failed: ${e.message}`);
    process.exit(1);
  }
}

export async function createCourse(options: { name: string; course: string }) {
  const cwd = process.cwd();
  const courseDir = join(cwd, options.name);
  const lang = options.course.toLowerCase();

  if (options.name !== "." && await exists(courseDir)) {
    console.error(`[ERROR] Directory '${options.name}' already exists.`);
    process.exit(1);
  }

  const template = TEMPLATES[lang];
  if (!template) {
    console.error(`[ERROR] Unsupported language '${lang}'.`);
    console.log("Supported languages: " + Object.keys(TEMPLATES).join(", "));
    process.exit(1);
  }

  await mkdir(courseDir, { recursive: true });
  await mkdir(join(courseDir, "content", "01_intro"), { recursive: true });
  await mkdir(join(courseDir, "runner"), { recursive: true });

  const configStr = JSON.stringify(template.courseJson, null, 2)
    .replace(/{{id}}/g, options.name)
    .replace(/{{name}}/g, options.name);
  await writeFile(join(courseDir, "course.json"), configStr);
  await writeFile(join(courseDir, "SETUP.md"), template.setupMd);
  await writeFile(join(courseDir, "runner", "README.md"), RUNNER_README);
  await writeFile(join(courseDir, "content", "01_intro", "README.md"), template.introReadme);
  await writeFile(join(courseDir, "content", "01_intro", template.introFilename), template.introCode);

  console.log(`[SUCCESS] Course created in ${options.name}`);
}

export async function validate(path: string) {
  const target = resolve(path);
  try {
    const config = await CourseLoader.validateCourse(target);
    console.log(`✅ Course is Valid: ${config.name} (${config.id})`);
  } catch (e: any) {
    console.error(`❌ Validation Failed: ${e.message}`);
    process.exit(1);
  }
}

export async function pack(options: { out?: string }) {
  const cwd = process.cwd();
  try {
    const config = await CourseLoader.validateCourse(cwd);
    const filename = options.out || `${config.id}.progy`;
    await CourseContainer.pack(cwd, resolve(filename));
    console.log(`[SUCCESS] Created: ${filename}`);
  } catch (e: any) {
    console.error(`❌ Packaging Failed: ${e.message}`);
    process.exit(1);
  }
}

export async function dev(options: { offline?: boolean }) {
  const cwd = process.cwd();
  try {
    await CourseLoader.validateCourse(cwd);
    await runServer(cwd, !!options.offline, null);
  } catch (e: any) {
    console.error(`[ERROR] Not a valid course: ${e.message}`);
    process.exit(1);
  }
}

export async function start(file: string | undefined, options: { offline?: boolean }) {
  const cwd = process.cwd();
  let runtimeCwd = cwd;
  let containerFile: string | null = null;

  if (file && file.endsWith(".progy") && await exists(file)) {
    containerFile = resolve(file);
    runtimeCwd = await CourseContainer.unpack(containerFile);
  } else {
    const files = await readdir(cwd);
    const progyFile = files.find(f => f.endsWith(".progy") && f !== ".progy");
    if (progyFile) {
      containerFile = join(cwd, progyFile);
      runtimeCwd = await CourseContainer.unpack(containerFile);
    }
  }

  await runServer(runtimeCwd, !!options.offline, containerFile);
}
