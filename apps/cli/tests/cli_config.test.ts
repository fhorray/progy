import { describe, test, expect, mock, beforeEach, afterEach } from "bun:test";

// --- Mocks ---

const mockConfig = {
    getGlobalConfig: mock(async () => ({ ai: { provider: "openai" } })),
    saveGlobalConfig: mock(async (config) => {
        // Update mock state if needed, but for now just spy
        return config;
    }),
};

mock.module("@progy/core", () => ({
    getGlobalConfig: mockConfig.getGlobalConfig,
    saveGlobalConfig: mockConfig.saveGlobalConfig,
    loadToken: mock(async () => null),
    saveToken: mock(async () => { }),
    clearToken: mock(async () => { }),
    logger: {
        info: mock((msg) => console.log(msg)),
        success: mock((msg) => console.log(msg)),
        error: mock((msg) => console.error(msg)),
        warn: mock((msg) => console.warn(msg)),
        brand: mock((msg) => console.log(msg)),
        banner: mock(() => { }),
        startupInfo: mock(() => { }),
        divider: mock(() => { }),
    },
    exists: mock(async () => true),
    RUNNER_README: "# Runner",
    FRONTEND_URL: "https://progy.dev",
    COURSE_CONFIG_NAME: "course.json",
    // Add other exports if needed to prevent runtime errors during import
    MODULE_INFO_TOML: "mock",
    EXERCISE_README: "mock",
    EXERCISE_STARTER: "mock",
    QUIZ_TEMPLATE: "[]",
    TEMPLATES: {},
    CourseLoader: { resolveSource: mock(async () => ({ url: "" })) },
    CourseContainer: {},
    SyncManager: {},
    scanAndGenerateManifest: mock(async () => ({})),
}));



describe("CLI Config Commands", () => {

    beforeEach(() => {
        mockConfig.getGlobalConfig.mockClear();
        mockConfig.saveGlobalConfig.mockClear();
    });

    test("setConfig updates nested value", async () => {
        const { setConfig } = await import("../src/commands/config");

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(" "));

        try {
            await setConfig("ai.model", "gpt-4");
        } finally {
            console.log = originalLog;
        }

        expect(mockConfig.getGlobalConfig).toHaveBeenCalled();
        expect(mockConfig.saveGlobalConfig).toHaveBeenCalled();

        // Verify structure
        const lastCallArg = (mockConfig.saveGlobalConfig as any).mock.calls[0][0];
        expect(lastCallArg.ai.model).toBe("gpt-4");
        expect(lastCallArg.ai.provider).toBe("openai"); // Preserves existing
    });

    test("listConfig prints JSON", async () => {
        const { listConfig } = await import("../src/commands/config");

        const logs: string[] = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(" "));

        try {
            await listConfig();
        } finally {
            console.log = originalLog;
        }

        const output = logs.join("");
        expect(output).toContain('"provider": "openai"');
    });
});
