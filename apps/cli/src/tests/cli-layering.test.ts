import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { SyncManager } from "@progy/core";

describe("CLI Layering persistence", () => {
  const testDir = join(tmpdir(), `progy-layer-test-${Date.now()}`);
  const cacheDir = join(tmpdir(), `progy-cache-test-${Date.now()}`);

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
    await mkdir(cacheDir, { recursive: true });

    // 1. Create a "cache" (mocked artifact extraction)
    await mkdir(join(cacheDir, "content/01_intro"), { recursive: true });
    await writeFile(join(cacheDir, "content/01_intro/exercise.ts"), "// Starter Code");

    // 2. Create student work in testDir
    await mkdir(join(testDir, "content/01_intro"), { recursive: true });
    await writeFile(join(testDir, "content/01_intro/exercise.ts"), "// Student Changes");
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
    await rm(cacheDir, { recursive: true, force: true });
  });

  test("should NOT overwrite existing exercise code during layering", async () => {
    // Apply layering from cache to testDir (simulating init/sync)
    // applyLayering(dest, cacheDir, force, sourcePathInCache)
    await SyncManager.applyLayering(join(testDir, "content"), cacheDir, false, "content");

    const content = await readFile(join(testDir, "content/01_intro/exercise.ts"), "utf-8");
    expect(content).toBe("// Student Changes");
  });

  test("should provision NEW files that don't exist yet", async () => {
    // Add a new file to cache
    await writeFile(join(cacheDir, "content/01_intro/new_file.ts"), "// New File");

    await SyncManager.applyLayering(join(testDir, "content"), cacheDir, false, "content");

    const content = await readFile(join(testDir, "content/01_intro/new_file.ts"), "utf-8");
    expect(content).toBe("// New File");
  });
});
