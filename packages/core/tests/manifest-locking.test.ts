import { describe, expect, test, beforeAll, afterAll, mock } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";

const TEST_DIR = join(process.cwd(), "packages/core/tests/temp-locking-test");
const PROG_DIR = join(TEST_DIR, ".progy");

// Mock paths to force using our temp directory
mock.module("../src/paths", () => ({
  PROG_CWD: TEST_DIR,
  PROG_RUNTIME_ROOT: null,
  PROG_DIR: PROG_DIR,
  PROGRESS_PATH: join(PROG_DIR, "progress.json"),
  COURSE_CONFIG_PATH: join(TEST_DIR, "course.json"),
  COURSE_CONFIG_NAME: "course.json",
  MANIFEST_PATH: join(PROG_DIR, "manifest.json"),
  BACKEND_URL: "http://localhost",
  CONFIG_DIR: join(TEST_DIR, ".config"),
  GLOBAL_CONFIG_PATH: join(TEST_DIR, ".config/progy.json"),
  COURSE_CACHE_DIR: join(TEST_DIR, ".cache"),
  getCourseCachePath: () => join(TEST_DIR, ".cache")
}));

// Mock config to avoid loading token/global config
mock.module("../src/config", () => ({
  loadToken: () => Promise.resolve("test-token"),
  getGlobalConfig: () => Promise.resolve({}),
  updateGlobalConfig: () => Promise.resolve()
}));

// Import helpers AFTER mocking
import { scanAndGenerateManifest } from "../src/helpers";

describe("Manifest Locking Logic", () => {
  const config = {
    id: "test-course",
    content: { root: ".", exercises: "exercises" },
    progression: { mode: "sequential" },
    runner: { type: "process", command: "echo", args: [] }
  };

  beforeAll(async () => {
    // Setup environment
    process.env.PROGY_OFFLINE = "true"; // Force local progress

    await mkdir(TEST_DIR, { recursive: true });
    await mkdir(PROG_DIR, { recursive: true });

    // Content
    const exDir = join(TEST_DIR, "exercises/01_module");
    await mkdir(exDir, { recursive: true });

    await writeFile(join(exDir, "info.toml"), `
      [module]
      title = "Test Module"

      [[exercises]]
      name = "01_one"

      [[exercises]]
      name = "02_two"

      [[exercises]]
      name = "03_three"
    `);

    for (const ex of ["01_one", "02_two", "03_three"]) {
       await mkdir(join(exDir, ex), { recursive: true });
       await writeFile(join(exDir, ex, "exercise.ts"), "// code");
       await writeFile(join(exDir, ex, "README.md"), "# Readme");
    }
  });

  afterAll(async () => {
    // Cleanup
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  test("Passed exercises should remain unlocked even if previous failed", async () => {
    // Scenario:
    // 01_one: FAILED (User went back and broke it)
    // 02_two: PASSED (User had already completed it)
    // 03_three: PENDING (Next item)

    // Expected:
    // 01_one: Unlocked (obviously)
    // 02_two: Unlocked (because it is passed, despite 01 failing)
    // 03_three: Unlocked (because 02 passed, allowing progression)

    const progress = {
      exercises: {
        "01_module/01_one": { status: "fail", attempts: 1 },
        "01_module/02_two": { status: "pass", attempts: 1 },
        "01_module/03_three": { status: "pending" }
      },
      quizzes: {},
      stats: { totalExercises: 3, totalXp: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: "" }
    };

    await writeFile(join(PROG_DIR, "progress.json"), JSON.stringify(progress));

    // Run scan
    // @ts-ignore
    const manifest = await scanAndGenerateManifest(config);

    const exercises = manifest["01_module"];
    expect(exercises).toBeDefined();
    expect(exercises).toHaveLength(3);

    const ex1 = exercises.find(e => e.name === "01_one");
    const ex2 = exercises.find(e => e.name === "02_two");
    const ex3 = exercises.find(e => e.name === "03_three");

    // 01 is unlocked (first item)
    expect(ex1?.isLocked).toBe(false);

    // 02 is unlocked (because it is passed!)
    expect(ex2?.isLocked).toBe(false);
    // Note: If our fix works, this should be false.
    // Without fix: previousItemPassed (from 01) is false -> 02 locked?
    // Wait, 01 is failed. previousItemPassed = false.
    // 02 check: !isLocked (false) && sequential && !previousItemPassed (true) -> isLocked = true.
    // So without fix, 02 would be locked.
    // With fix: isPassed is true -> isLocked = false.

    // 03 is unlocked (because 02 passed)
    expect(ex3?.isLocked).toBe(false);
    // 02 passed -> previousItemPassed (for 03) = true.
    // 03 check: !previousItemPassed (false) -> isLocked = false.
  });

  test("Failed previous item should lock next unpassed item", async () => {
    // Scenario:
    // 01_one: FAILED
    // 02_two: FAILED
    // 03_three: PENDING

    // Expected:
    // 02: Locked (because 01 failed)

    const progress = {
      exercises: {
        "01_module/01_one": { status: "fail", attempts: 1 },
        "01_module/02_two": { status: "fail", attempts: 1 },
      },
      quizzes: {},
      stats: { totalExercises: 3 }
    };

    await writeFile(join(PROG_DIR, "progress.json"), JSON.stringify(progress));

    // @ts-ignore
    const manifest = await scanAndGenerateManifest(config);
    const exercises = manifest["01_module"];

    const ex2 = exercises.find(e => e.name === "02_two");
    expect(ex2?.isLocked).toBe(true);
    expect(ex2?.lockReason).toBe("Complete previous lesson");
  });
});
