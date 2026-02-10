import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm, readFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";

// --- Mocks ---

// Mock spawn
const mockSpawn = mock(() => {
  return {
    stdout: { on: () => { } },
    stderr: { on: () => { } },
    on: (event: string, cb: any) => { if (event === 'close') cb(0); },
    kill: () => { },
    unref: () => { }, // For detached processes
  };
});

mock.module("node:child_process", () => ({
  spawn: mockSpawn
}));

mock.module("@progy/core", () => ({
  GitUtils: {
    clone: mock(async () => ({ success: true })),
    init: mock(async () => ({ success: true })),
    addRemote: mock(async () => ({ success: true })),
    pull: mock(async () => ({ success: true })),
    exec: mock(async () => ({ success: true, stdout: "", stderr: "" })),
    getGitInfo: mock(async () => ({ remoteUrl: null, root: null })),
    lock: mock(async () => true),
    unlock: mock(async () => { }),
    updateOrigin: mock(async () => ({ success: true })),
    sparseCheckout: mock(async () => ({ success: true })),
  },
  CourseContainer: {
    pack: mock(async (src, dest) => {
      await writeFile(dest, "dummy-progy-content");
    }),
    unpack: mock(async (file) => {
      const dir = join(tmpdir(), "progy-unpack-" + Date.now());
      await mkdir(dir, { recursive: true });
      return dir;
    }),
    sync: mock(async () => { })
  },
  SyncManager: {
    loadConfig: mock(async () => ({
      course: { id: "test-course", repo: "test-repo", branch: "main", path: "" },
      sync: {}
    })),
    ensureOfficialCourse: mock(async () => "/mock/cache/dir"),
    applyLayering: mock(async () => { }),
    saveConfig: mock(async () => { }),
    generateGitIgnore: mock(async () => { }),
    resetExercise: mock(async () => { }),
  },
  loadToken: mock(async () => "mock-token"),
  saveToken: mock(async () => { }),
  clearToken: mock(async () => { }),
  getGlobalConfig: mock(async () => ({})),
  saveGlobalConfig: mock(async () => { }),
  CourseLoader: {
    validateCourse: mock(async (path) => {
      // minimal valid config
      return {
        id: "test-course",
        name: "Test Course",
        runner: { command: "echo", args: [], cwd: "." },
        content: { root: ".", exercises: "content" },
        setup: { guide: "SETUP.md", checks: [] }
      };
    }),
    resolveSource: mock(async (input) => {
      return { url: `https://github.com/progy-dev/${input}.git`, branch: "main" };
    })
  },
  logger: {
    info: mock((msg) => console.log(msg)),
    success: mock((msg) => console.log(msg)),
    error: mock((msg, detail) => console.error(msg, detail)),
    warn: mock((msg) => console.warn(msg)),
    brand: mock((msg) => console.log(msg)),
    banner: mock(() => { }),
    startupInfo: mock(() => { }),
    divider: mock(() => { }),
  },
  exists: mock(async (p: string) => {
    try {
      await stat(p);
      return true;
    } catch {
      return false;
    }
  }),
  BACKEND_URL: "https://api.progy.dev",
  getCourseCachePath: mock((id: string) => join(tmpdir(), "progy-cache-" + id)),
  TEMPLATES: {
    python: {
      courseJson: {
        id: "{{id}}",
        name: "{{name}}",
        runner: { command: "python3 runner.py", args: [], cwd: "." },
        content: { root: ".", exercises: "content" },
        setup: { guide: "SETUP.md", checks: [] }
      },
      setupMd: "# Setup",
      introReadme: "# Intro",
      introFilename: "intro.py",
      introCode: "print('hello')"
    }
  },
  MODULE_INFO_TOML: "mock",
  EXERCISE_README: "mock",
  EXERCISE_STARTER: "mock",
  QUIZ_TEMPLATE: "[]",
  RUNNER_README: "mock",
}));



// Helper to create temp directories
async function createTempDir(prefix: string): Promise<string> {
  const dir = join(tmpdir(), `progy-test-${prefix}-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}


describe("CLI Course Commands", () => {
  let originalCwd: any;
  let originalExit: any;
  let tempCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd;
    originalExit = process.exit;
    process.exit = mock(() => { }) as any;
    tempCwd = await createTempDir("course-test");
    process.cwd = () => tempCwd;
    mockSpawn.mockClear();
  });

  afterEach(async () => {
    process.cwd = originalCwd;
    process.exit = originalExit;
    await rm(tempCwd, { recursive: true, force: true });
  });

  test("createCourse generates basic structure", async () => {
    const { createCourse } = await import("../src/commands/course");

    await createCourse({ name: "my-python-course", course: "python" });

    const courseDir = join(tempCwd, "my-python-course");
    expect(await exists(courseDir)).toBe(true);
    expect(await exists(join(courseDir, "course.json"))).toBe(true);
    expect(await exists(join(courseDir, "content", "01_intro"))).toBe(true);
    expect(await exists(join(courseDir, "runner"))).toBe(true);

    const courseJson = JSON.parse(await readFile(join(courseDir, "course.json"), "utf-8"));
    expect(courseJson.id).toBe("my-python-course");
  });

  test("createCourse fails if directory exists", async () => {
    const { createCourse } = await import("../src/commands/course");
    const logs: string[] = [];
    const originalError = console.error;
    console.error = (...args) => logs.push(args.join(" "));

    try {
      await mkdir(join(tempCwd, "existing-dir"));
      await createCourse({ name: "existing-dir", course: "python" });

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(logs.some(l => l.includes("already exists"))).toBe(true);
    } finally {
      console.error = originalError;
    }
  });

  test("pack creates a .progy file", async () => {
    const { pack } = await import("../src/commands/course");
    const { CourseContainer } = await import("@progy/core");

    const dest = join(tempCwd, "output.progy");
    await pack({ out: dest });

    expect(CourseContainer.pack).toHaveBeenCalled();
    const calls = (CourseContainer.pack as any).mock.calls;
    expect(calls[0][1]).toContain("output.progy");
  });

  test("dev runs server in guest/offline mode", async () => {
    const { dev } = await import("../src/commands/course");

    // Setup instructor environment
    await writeFile(join(tempCwd, "course.json"), "{}");
    await mkdir(join(tempCwd, "content"), { recursive: true });

    await dev({});

    expect(mockSpawn).toHaveBeenCalled();
    const calls = mockSpawn.mock.calls;
    const env = calls[0][2].env;
    expect(env.PROGY_OFFLINE).toBe("true");
  });

  test("dev fails in student environment", async () => {
    const { dev } = await import("../src/commands/course");
    const logs: string[] = [];
    const originalError = console.error;
    console.error = (...args) => logs.push(args.join(" "));

    try {
      // Setup student environment
      await writeFile(join(tempCwd, "course.progy"), "");

      await dev({});

      expect(process.exit).toHaveBeenCalledWith(1);
      expect(logs.some(l => l.includes("development only"))).toBe(true);
    } finally {
      console.error = originalError;
    }
  });
});
