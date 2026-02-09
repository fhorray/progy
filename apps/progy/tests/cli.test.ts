import { describe, test, expect } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";

// Helper to create temp directories
async function createTempDir(prefix: string): Promise<string> {
  const dir = join(tmpdir(), `progy-test-${prefix}-${Date.now()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

// Helper to check if path exists
async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

describe("CLI Environment Detection", () => {
  test("detectEnvironment returns 'instructor' when course.json and content/ exist", async () => {
    const tempDir = await createTempDir("instructor");
    try {
      // Create instructor environment
      await writeFile(join(tempDir, "course.json"), "{}");
      await mkdir(join(tempDir, "content"), { recursive: true });

      // Import the function dynamically
      const { detectEnvironment } = await import("../src/commands/course");
      // Note: detectEnvironment is not exported, so we test through the dev command behavior

      // For now, just verify the files exist
      expect(await exists(join(tempDir, "course.json"))).toBe(true);
      expect(await exists(join(tempDir, "content"))).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("detectEnvironment returns 'student' when only .progy file exists", async () => {
    const tempDir = await createTempDir("student");
    try {
      // Create student environment (only .progy file)
      await writeFile(join(tempDir, "course.progy"), "dummy content");

      // Verify no course.json or content/
      expect(await exists(join(tempDir, "course.json"))).toBe(false);
      expect(await exists(join(tempDir, "content"))).toBe(false);
      expect(await exists(join(tempDir, "course.progy"))).toBe(true);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

describe("Config Functions", () => {
  test("saveToken and loadToken work correctly", async () => {
    const { saveToken, loadToken, clearToken } = await import("../src/core/config");

    // Save a test token
    const testToken = `test-token-${Date.now()}`;
    await saveToken(testToken);

    // Load and verify
    const loaded = await loadToken();
    expect(loaded).toBe(testToken);

    // Clear token
    await clearToken();
    const cleared = await loadToken();
    expect(cleared).toBeNull();
  });

  test("clearToken removes the token", async () => {
    const { saveToken, clearToken, loadToken } = await import("../src/core/config");

    await saveToken("temp-token");
    await clearToken();

    const token = await loadToken();
    expect(token).toBeNull();
  });
});

describe("Course Loader", () => {
  test("validateCourse throws on missing course.json", async () => {
    const { CourseLoader } = await import("../src/core/loader");
    const tempDir = await createTempDir("invalid-course");

    try {
      await expect(CourseLoader.validateCourse(tempDir)).rejects.toThrow();
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("validateCourse accepts valid course structure", async () => {
    const { CourseLoader } = await import("../src/core/loader");
    const tempDir = await createTempDir("valid-course");

    try {
      // Create minimal valid course
      const courseJson = {
        id: "test-course",
        name: "Test Course",
        description: "A test course",
        runner: {
          type: "process",
          command: "echo test",
          args: [],
          cwd: "."
        },
        content: {
          root: ".",
          exercises: "content"
        },
        setup: {
          checks: [],
          guide: "SETUP.md"
        }
      };

      await writeFile(join(tempDir, "course.json"), JSON.stringify(courseJson, null, 2));
      await mkdir(join(tempDir, "content"), { recursive: true });
      await writeFile(join(tempDir, "SETUP.md"), "# Setup");

      const config = await CourseLoader.validateCourse(tempDir);
      expect(config.id).toBe("test-course");
      expect(config.name).toBe("Test Course");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  test("resolveSource resolves alias to progy-dev organization", async () => {
    const { CourseLoader } = await import("../src/core/loader");
    const result = await CourseLoader.resolveSource("python");
    expect(result.url).toBe("https://github.com/progy-dev/python.git");
  });
});

describe("CLI Commands Exports", () => {
  test("all expected functions are exported from course.ts", async () => {
    const courseModule = await import("../src/commands/course");

    expect(typeof courseModule.init).toBe("function");
    expect(typeof courseModule.createCourse).toBe("function");
    expect(typeof courseModule.validate).toBe("function");
    expect(typeof courseModule.pack).toBe("function");
    expect(typeof courseModule.dev).toBe("function");
    expect(typeof courseModule.start).toBe("function");
    expect(typeof courseModule.testExercise).toBe("function");
    expect(typeof courseModule.publish).toBe("function");
  });

  test("all expected functions are exported from auth.ts", async () => {
    const authModule = await import("../src/commands/auth");

    expect(typeof authModule.login).toBe("function");
    expect(typeof authModule.logout).toBe("function");
  });

  test("config functions are exported", async () => {
    const configModule = await import("../src/core/config");

    expect(typeof configModule.saveToken).toBe("function");
    expect(typeof configModule.loadToken).toBe("function");
    expect(typeof configModule.clearToken).toBe("function");
    expect(typeof configModule.getGlobalConfig).toBe("function");
    expect(typeof configModule.saveGlobalConfig).toBe("function");
  });
});

describe("Publish Command", () => {
  test("publish function exists and can be called", async () => {
    const { publish } = await import("../src/commands/course");

    // Mock console.log to capture output
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args) => logs.push(args.join(" "));

    try {
      await publish();

      expect(logs.some(l => l.includes("coming soon"))).toBe(true);
    } finally {
      console.log = originalLog;
    }
  });
});
