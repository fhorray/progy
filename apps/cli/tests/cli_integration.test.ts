import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";

// --- Mocks ---

const mockSpawn = mock(() => {
  return {
    stdout: { on: () => { } },
    stderr: { on: () => { } },
    on: (event: string, cb: any) => { if (event === 'close') cb(0); },
    kill: () => { },
    unref: () => { },
  };
});

mock.module("node:child_process", () => ({
  spawn: mockSpawn
}));

// Mock global fetch
global.fetch = mock(async (url: any) => {
    return new Response(Buffer.from("mock-content"));
});

const mockGitUtils = {
  clone: mock(async () => ({ success: true })),
  init: mock(async () => ({ success: true })),
  addRemote: mock(async () => ({ success: true })),
  pull: mock(async () => ({ success: true })),
  getGitInfo: mock(async () => ({ remoteUrl: null, root: null })),
  lock: mock(async () => true),
  unlock: mock(async () => { }),
};

const mockCourseContainer = {
  pack: mock(async (src: string, dest: string) => {
    await writeFile(dest, "dummy-progy-content");
  }),
  unpack: mock(async (file: string) => {
    const dir = join(tmpdir(), "progy-unpack-" + Date.now());
    await mkdir(dir, { recursive: true });
    return dir;
  }),
  sync: mock(async () => { })
};

const mockSyncManager = {
  loadConfig: mock(async () => null),
  ensureOfficialCourse: mock(async () => ""),
  applyLayering: mock(async () => { }),
  saveConfig: mock(async () => { }),
  generateGitIgnore: mock(async () => { }),
  downloadProgress: mock(async () => null),
  restoreProgress: mock(async () => { }),
  packProgress: mock(async () => Buffer.from("")),
  uploadProgress: mock(async () => true),
};

const mockCourseLoader = {
  validateCourse: mock(async () => ({})),
  resolveSource: mock(async (input: string) => ({ url: `https://registry.progy.dev/download/${input}`, isRegistry: true })),
  getCourseFlow: mock(async () => []),
};

const mockLogger = {
  info: mock(() => { }),
  success: mock(() => { }),
  error: mock(() => { }),
  warn: mock(() => { }),
  security: mock(() => { }),
  brand: mock(() => { }),
  banner: mock(() => { }),
};

mock.module("@progy/core", () => ({
  GitUtils: mockGitUtils,
  CourseContainer: mockCourseContainer,
  SyncManager: mockSyncManager,
  CourseLoader: mockCourseLoader,
  logger: mockLogger,
  loadToken: mock(async () => "mock-token"),
  saveToken: mock(async () => { }),
  clearToken: mock(async () => { }),
  getGlobalConfig: mock(async () => ({})),
  saveGlobalConfig: mock(async () => { }),
  BACKEND_URL: "https://api.progy.dev",
  exists: mock(async (p: string) => {
    try {
      if (!p) return false;
      await stat(p);
      return true;
    } catch {
      return false;
    }
  }),
  getCourseCachePath: mock((id: string) => join(tmpdir(), "progy-cache-" + id)),
  MODULE_INFO_TOML: "mock-toml",
  EXERCISE_README: "mock-readme",
  EXERCISE_STARTER: "mock-starter",
  QUIZ_TEMPLATE: "[]",
  RUNNER_README: "mock-runner",
  TEMPLATES: {
    python: {
      courseJson: {},
      setupMd: "",
      introReadme: "",
      introFilename: "",
      introCode: ""
    }
  },
  spawnPromise: mock(async () => { }),
  checkPrerequisite: mock(() => ({ met: true })),
  getCourseConfig: mock(async () => ({})),
  ensureConfig: mock(async () => ({})),
  currentConfig: null,
  getProgress: mock(async () => ({ exercises: {}, quizzes: {}, stats: {} })),
  saveProgress: mock(async () => { }),
  updateStreak: mock((s: any) => s),
  scanAndGenerateManifest: mock(async () => ({})),
  runSetupChecks: mock(async () => []),
  parseRunnerOutput: mock(() => ({ success: true, output: "", friendlyOutput: "" })),
  HELPERS_BACKEND_URL: "https://api.progy.dev",
  FRONTEND_URL: "https://progy.dev",
  CONFIG_DIR: "/mock/config",
  GLOBAL_CONFIG_PATH: "/mock/config/config.json",
  COURSE_CONFIG_NAME: "course.json",
  COURSE_CONFIG_PATH: "/mock/course/course.json",
  PROG_DIR_NAME: ".progy",
  PROG_DIR: "/mock/course/.progy",
  MANIFEST_PATH: "/mock/course/.progy/exercises.json",
  PROGRESS_PATH: "/mock/course/.progy/progress.json",
  COURSE_CACHE_DIR: "/mock/cache",
  PROG_CWD: "/mock/course",
}));


async function createTempDir(prefix: string): Promise<string> {
  const dir = join(tmpdir(), `progy-test-${prefix}-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

describe("CLI Start Integration", () => {
  let originalCwd: any;
  let originalExit: any;
  let tempCwd: string;

  beforeEach(async () => {
    originalCwd = process.cwd;
    originalExit = process.exit;
    process.exit = mock(() => { }) as any;
    tempCwd = await createTempDir("start-test");
    process.cwd = () => tempCwd;
    mockSpawn.mockClear();
  });

  afterEach(async () => {
    process.cwd = originalCwd;
    process.exit = originalExit;
    await rm(tempCwd, { recursive: true, force: true });
  });

  // Removed legacy alias test

  test("start opens existing .progy file", async () => {
    const { start } = await import("../src/commands/course");
    const { CourseContainer } = await import("@progy/core");

    // Clear previous mock calls
    (CourseContainer.unpack as any).mockClear();

    await writeFile(join(tempCwd, "my-course.progy"), "dummy");

    await start("my-course.progy", { offline: false });

    expect(CourseContainer.unpack).toHaveBeenCalled();
    const calls = (CourseContainer.unpack as any).mock.calls;
    expect(calls[0][0]).toContain("my-course.progy");

    expect(mockSpawn).toHaveBeenCalled();
  });
});
