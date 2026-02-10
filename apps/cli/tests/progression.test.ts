import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

// --- Mocking Setup ---
const tempCwd = join(tmpdir(), `progy-prog-test-${Date.now()}`);
// Set environment variables BEFORE importing anything
process.env.PROG_CWD = tempCwd;
process.env.PROGY_OFFLINE = "true";
process.env.PROGY_BYPASS_MODE = "false";
process.env.NODE_ENV = "test";

// Mock paths module BEFORE it's loaded by anyone else
mock.module("@progy/core", () => {
  const original = require("../src/core/paths");
  return {
    ...original,
    PROG_CWD: tempCwd,
    COURSE_CONFIG_PATH: join(tempCwd, "course.json"),
    PROG_DIR: join(tempCwd, ".progy"),
    MANIFEST_PATH: join(tempCwd, ".progy", "exercises.json"),
    PROGRESS_PATH: join(tempCwd, ".progy", "progress.json"),
  };
});

// Import AFTER mocking/env setup
import { checkPrerequisite, scanAndGenerateManifest } from "../src/backend/helpers";

describe("Progression System", () => {

  beforeEach(async () => {
    await mkdir(tempCwd, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempCwd, { recursive: true, force: true });
  });

  test("checkPrerequisite - Module Completion", async () => {
    const progress: any = {
      exercises: {
        "01_intro/01_hello": { status: "pass" },
        "01_intro/02_vars": { status: "fail" }
      },
      quizzes: {}
    };

    const manifest: any = {
      "01_intro": [
        { id: "01_intro/01_hello" },
        { id: "01_intro/02_vars" }
      ]
    };

    // Should fail because 02_vars is fail
    let result = checkPrerequisite("module_01_intro", progress, manifest);
    expect(result.met).toBe(false);
    expect(result.reason).toContain("Complete all items");

    // Should pass if all are pass
    progress.exercises["01_intro/02_vars"].status = "pass";
    result = checkPrerequisite("module_01_intro", progress, manifest);
    expect(result.met).toBe(true);
  });

  test("checkPrerequisite - Quiz Score", async () => {
    const progress: any = {
      exercises: {},
      quizzes: {
        "01_intro/quiz.json": { passed: true, score: 70 }
      }
    };

    // Should fail if 80 is required
    let result = checkPrerequisite("quiz:01_intro/quiz.json:80", progress, {});
    expect(result.met).toBe(false);
    expect(result.reason).toContain("Score at least 80%");

    // Should pass if 60 is required
    result = checkPrerequisite("quiz:01_intro/quiz.json:60", progress, {});
    expect(result.met).toBe(true);
  });

  test("checkPrerequisite - Exercise Completion", async () => {
    const progress: any = {
      exercises: {
        "01_intro/01_hello": { status: "pass" },
        "01_intro/02_vars": { status: "fail" }
      },
      quizzes: {}
    };

    let result = checkPrerequisite("exercise:01_intro/01_hello", progress, {});
    expect(result.met).toBe(true);

    result = checkPrerequisite("exercise:01_intro/02_vars", progress, {});
    expect(result.met).toBe(false);
  });

  test("scanAndGenerateManifest - Sequential Locking", async () => {
    // Setup directory structure
    const contentPath = join(tempCwd, "content");
    const modPath = join(contentPath, "01_intro");
    await mkdir(modPath, { recursive: true });

    await writeFile(join(modPath, "01_hello.rs"), "// Title: Hello");
    await writeFile(join(modPath, "02_vars.rs"), "// Title: Vars");
    await writeFile(join(tempCwd, "course.json"), JSON.stringify({
      id: "test",
      name: "Test",
      runner: { command: "echo", args: [] },
      content: { exercises: "content" },
      progression: { mode: "sequential" }
    }));

    const config: any = {
      id: "test",
      content: { exercises: "content" },
      progression: { mode: "sequential" }
    };

    const manifest = await scanAndGenerateManifest(config);

    expect(manifest["01_intro"]).toBeDefined();
    expect(manifest["01_intro"].length).toBe(2);
    expect(manifest["01_intro"][0].isLocked).toBe(false); // First item always unlocked
    expect(manifest["01_intro"][1].isLocked).toBe(true);  // Second item locked because first not passed
    expect(manifest["01_intro"][1].lockReason).toBe("Complete previous lesson");
  });

  test("scanAndGenerateManifest - Bypass Mode", async () => {
    process.env.PROGY_BYPASS_MODE = "true";

    // Setup directory structure
    const contentPath = join(tempCwd, "content");
    const modPath = join(contentPath, "01_intro");
    await mkdir(modPath, { recursive: true });
    await writeFile(join(modPath, "01_hello.rs"), "// Title: Hello");
    await writeFile(join(modPath, "02_vars.rs"), "// Title: Vars");
    await writeFile(join(tempCwd, "course.json"), JSON.stringify({
      id: "test",
      name: "Test",
      runner: { command: "echo", args: [] },
      content: { exercises: "content" },
      progression: { mode: "sequential" }
    }));

    const config: any = {
      id: "test",
      content: { exercises: "content" },
      progression: { mode: "sequential" }
    };

    const manifest = await scanAndGenerateManifest(config);

    expect(manifest["01_intro"][0].isLocked).toBe(false);
    expect(manifest["01_intro"][1].isLocked).toBe(false); // Should be unlocked in bypass mode
  });

  test("updateProgressHandler - Quiz Scoring", async () => {
    const { updateProgressHandler } = await import("../src/backend/endpoints/progress");

    // Setup initial progress
    await mkdir(join(tempCwd, ".progy"), { recursive: true });
    const initialProgress = {
      stats: { totalXp: 0, currentStreak: 0, longestStreak: 0, lastActiveDate: null, totalExercises: 0 },
      exercises: {},
      quizzes: {},
      achievements: []
    };
    await writeFile(join(tempCwd, ".progy", "progress.json"), JSON.stringify(initialProgress));

    const req: any = {
      json: async () => ({
        type: 'quiz',
        id: "01_intro/quiz.json",
        success: true,
        results: { correct: 4, total: 5 } // 80%
      })
    };

    await updateProgressHandler(req);

    const { getProgress } = await import("../src/backend/helpers");
    const progress = await getProgress();

    const quiz = progress.quizzes["01_intro/quiz.json"];
    expect(quiz).toBeDefined();
    expect(quiz.score).toBe(80);
    expect(quiz.passed).toBe(true);
    expect(quiz.xpEarned).toBeGreaterThan(0);
  });
});
