import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";
import { join } from "node:path";
import { mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";

// Mock @progy/core
const mockPackProgress = mock(async () => Buffer.from("mock-zip"));
const mockUploadProgress = mock(async () => true);
const mockLoadConfig = mock(async () => ({
    course: { id: "test-course", repo: "test-id" },
    sync: {}
}));
const mockSaveConfig = mock(async () => {});

mock.module("@progy/core", () => ({
    SyncManager: {
        loadConfig: mockLoadConfig,
        packProgress: mockPackProgress,
        uploadProgress: mockUploadProgress,
        saveConfig: mockSaveConfig,
    },
    logger: {
        info: () => {},
        success: () => {},
        error: () => {},
        warn: () => {},
    },
    GitUtils: {},
    loadToken: async () => "token",
    BACKEND_URL: "http://mock",
    getCourseCachePath: () => "/tmp",
    exists: async () => true,
}));

describe("CLI Sync Commands (Cloud)", () => {
    let originalCwd: any;
    let tempCwd: string;

    beforeEach(async () => {
        originalCwd = process.cwd;
        tempCwd = join(tmpdir(), `progy-sync-test-${Date.now()}`);
        await mkdir(tempCwd, { recursive: true });
        process.cwd = () => tempCwd;
    });

    afterEach(async () => {
        process.cwd = originalCwd;
        await rm(tempCwd, { recursive: true, force: true });
    });

    test("sync packs and uploads progress", async () => {
        // Dynamic import to ensure mock is used
        const { sync } = await import("../src/commands/sync");

        await sync();

        expect(mockLoadConfig).toHaveBeenCalled();
        expect(mockPackProgress).toHaveBeenCalled();
        expect(mockUploadProgress).toHaveBeenCalledWith("test-course", expect.any(Buffer));
        expect(mockSaveConfig).toHaveBeenCalled();
    });
});
