import { join, resolve, basename } from "node:path";
import { mkdir, writeFile, readFile, readdir, stat, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { GitUtils } from "../core/git";
import { SyncManager } from "../core/sync";
import { CourseLoader } from "../core/loader";
import { CourseContainer } from "../core/container";
import { loadToken } from "../core/config";
import { BACKEND_URL, COURSE_CONFIG_NAME } from "../core/paths";
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

  const isTs = import.meta.file.endsWith(".ts");
  const serverExt = isTs ? "ts" : "js";
  const serverPath = isTs
    ? join(import.meta.dir, "..", "backend", `server.${serverExt}`)
    : join(import.meta.dir, "backend", `server.${serverExt}`);

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
    const credRes = await fetch(`${BACKEND_URL}/git/credentials`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const gitCreds = await credRes.json() as any;

    const officialSource = await CourseLoader.resolveSource(courseId!);

    const ensureRes = await fetch(`${BACKEND_URL}/git/ensure-repo`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ courseId })
    });
    const userRepoInfo = await ensureRes.json() as { repoUrl: string, isNew: boolean };

    if (await exists(join(cwd, ".git"))) {
      await GitUtils.pull(cwd);
    } else {
      const files = await readdir(cwd);
      if (files.length > 0 && !existingConfig) {
        await GitUtils.init(cwd);
        await GitUtils.addRemote(cwd, gitCreds.token, userRepoInfo.repoUrl);
        await GitUtils.pull(cwd);
      } else {
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

/**
 * Detect if we're in a student or instructor environment
 * Student: Only has .progy file
 * Instructor: Has course.json + content/ folder
 */
async function detectEnvironment(cwd: string): Promise<"student" | "instructor"> {
  const hasCourseJson = await exists(join(cwd, "course.json"));
  const hasContentDir = await exists(join(cwd, "content"));

  if (hasCourseJson && hasContentDir) return "instructor";
  return "student";
}

export async function dev(options: { offline?: boolean }) {
  const cwd = process.cwd();

  // Check environment - dev is only for instructors
  const env = await detectEnvironment(cwd);
  if (env === "student") {
    console.error("❌ 'progy dev' is for course development only.");
    console.error("   Use 'progy start' to learn the course.");
    process.exit(1);
  }

  try {
    await CourseLoader.validateCourse(cwd);
    console.log("[DEV] Running as GUEST - progress will NOT be saved.");
    // Always run as offline/guest in dev mode
    await runServer(cwd, true, null);
  } catch (e: any) {
    console.error(`[ERROR] Not a valid course: ${e.message}`);
    process.exit(1);
  }
}

export async function start(file: string | undefined, options: { offline?: boolean }) {
  const cwd = process.cwd();
  let runtimeCwd = cwd;
  let containerFile: string | null = null;
  let isOffline = !!options.offline;

  // Check if running in instructor environment (course.json + content/)
  const env = await detectEnvironment(cwd);

  if (file && file.endsWith(".progy") && await exists(file)) {
    // Loading a .progy file - student mode
    containerFile = resolve(file);
    runtimeCwd = await CourseContainer.unpack(containerFile);
  } else if (file && !file.endsWith(".progy") && !await exists(file)) {
    // Treat as an alias -> Clone, Validate, Pack, Run
    console.log(`[INFO] Resolving course alias '${file}'...`);
    try {
      const source = await CourseLoader.resolveSource(file);
      const tempDir = join(tmpdir(), `progy-${file}-${Date.now()}`);

      console.log(`[INFO] Cloning from ${source.url}...`);
      await GitUtils.clone(source.url, tempDir);

      console.log(`[INFO] Validating course structure...`);
      await CourseLoader.validateCourse(tempDir);

      const progyFilename = `${file}.progy`;
      const progyPath = join(cwd, progyFilename);
      console.log(`[INFO] Packaging into ${progyFilename}...`);
      await CourseContainer.pack(tempDir, progyPath);

      // Cleanup temp directory
      await rm(tempDir, { recursive: true, force: true });

      containerFile = progyPath;
      runtimeCwd = await CourseContainer.unpack(containerFile);
      console.log(`[SUCCESS] Course ready: ${progyFilename}`);
    } catch (e: any) {
      console.error(`❌ Failed to fetch course '${file}': ${e.message}`);
      process.exit(1);
    }
  } else if (env === "instructor") {
    // Instructor environment detected - run as GUEST
    console.log("[INFO] Detected instructor environment - running as GUEST.");
    isOffline = true;
  } else {
    // Check for .progy file in current directory
    const files = await readdir(cwd);
    const progyFile = files.find(f => f.endsWith(".progy") && f !== ".progy");
    if (progyFile) {
      containerFile = join(cwd, progyFile);
      runtimeCwd = await CourseContainer.unpack(containerFile);
    }
  }

  await runServer(runtimeCwd, isOffline, containerFile);
}

export async function testExercise(path: string) {
  const cwd = process.cwd();

  const env = await detectEnvironment(cwd);
  if (env === "student") {
    console.error("❌ 'progy test' is for course development only.");
    console.error("   Use the UI to run exercises.");
    process.exit(1);
  }

  try {
    const config = await CourseLoader.validateCourse(cwd);

    // Import and run the exercise handler
    console.log(`[TEST] Running exercise: ${path}`);
    console.log("---");

    // For now, just validate the path exists
    const exercisePath = join(cwd, path);
    if (!await exists(exercisePath)) {
      console.error(`❌ Exercise not found: ${path}`);
      process.exit(1);
    }

    console.log(`✅ Exercise path exists: ${path}`);
    console.log("   (Full test execution coming soon - use 'progy dev' for now)");
  } catch (e: any) {
    console.error(`[ERROR] ${e.message}`);
    process.exit(1);
  }
}

export async function publish() {
  console.log("🚧 This feature is coming soon!");
  console.log("");
  console.log("   Publishing will allow you to:");
  console.log("   • Upload your course to the Progy registry");
  console.log("   • Share with students via 'progy start <course-id>'");
  console.log("   • Track student progress and analytics");
  console.log("");
  console.log("   Follow updates at: https://progy.dev/roadmap");
}
