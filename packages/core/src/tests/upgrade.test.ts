
import { describe, test, expect, spyOn, beforeEach, afterEach, mock } from "bun:test";
import { join } from "node:path";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";

// Import directly from source files to ensure we share the module instance
import { SyncManager } from "../sync";
import { CourseLoader } from "../loader";
import { CourseContainer } from "../container";

describe("Course Upgrade Flow", () => {
  let tempDir: string;
  let resolveSourceSpy: any;
  let downloadAndUnpackSpy: any;

  beforeEach(async () => {
    tempDir = join(tmpdir(), `progy-upgrade-test-${Date.now()}`);
    await mkdir(tempDir, { recursive: true });

    // Setup v1.0.0 course
    await mkdir(join(tempDir, "content"), { recursive: true });
    await writeFile(join(tempDir, "content", "old.txt"), "Old Content");
    await writeFile(join(tempDir, "content", "modified.txt"), "Original Content");

    const config = `[course]
id = "test-course"
repo = "test-repo"
version = "1.0.0"

[sync]
`;
    await writeFile(join(tempDir, "progy.toml"), config);

    // Setup Spies
    resolveSourceSpy = spyOn(CourseLoader, "resolveSource").mockResolvedValue({
      id: "test-course",
      url: "https://mock-registry.com/download.zip",
      version: "1.5.0",
      isRegistry: true
    } as any);

    downloadAndUnpackSpy = spyOn(CourseContainer, "downloadAndUnpack").mockImplementation(async (url, dest) => {
      // Simulate unpacking new version
      await mkdir(join(dest, "content"), { recursive: true });
      await writeFile(join(dest, "content", "new-file.txt"), "New Content");
      await writeFile(join(dest, "content", "modified.txt"), "Modified Content");
    });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
    resolveSourceSpy.mockRestore();
    downloadAndUnpackSpy.mockRestore();
  });

  test("checkUpdate detects available update", async () => {
    const update = await SyncManager.checkUpdate(tempDir);
    expect(update).not.toBeNull();
    expect(update?.updateAvailable).toBe(true);
    expect(update?.currentVersion).toBe("1.0.0");
    expect(update?.latestVersion).toBe("1.5.0");
  });

  test("getUpdateDiff identifies changes", async () => {
    const diff = await SyncManager.getUpdateDiff(tempDir, "1.5.0");

    expect(diff.added).toContain("new-file.txt");
    expect(diff.modified).toContain("modified.txt");
    // old.txt is present locally but not in new version -> deleted
    expect(diff.deleted).toContain("old.txt");
  });

  test("applyUpdate updates version and content", async () => {
    await SyncManager.applyUpdate(tempDir, "1.5.0");

    // Verify progy.toml updated
    const configContent = await readFile(join(tempDir, "progy.toml"), "utf-8");
    expect(configContent).toContain('version = "1.5.0"');

    // Verify content updated
    const newFileExists = await Bun.file(join(tempDir, "content", "new-file.txt")).exists();
    expect(newFileExists).toBe(true);

    const modContent = await readFile(join(tempDir, "content", "modified.txt"), "utf-8");
    expect(modContent).toBe("Modified Content");

    // NOTE: applyUpdate currently ADDs/OVERWRITEs, it does NOT delete old files.
    // So old.txt should still exist.
    const oldFileExists = await Bun.file(join(tempDir, "content", "old.txt")).exists();
    expect(oldFileExists).toBe(true);
  });
});
