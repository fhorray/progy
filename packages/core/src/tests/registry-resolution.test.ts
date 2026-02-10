import { expect, test, describe, beforeAll, afterAll, spyOn } from "bun:test";
import { CourseLoader } from "@progy/core";
import { OFICIAL_USERNAME } from "@consts";

describe("CourseLoader Registry Resolution", () => {

  test("should auto-prefix simple slug with official username", async () => {
    // Mock fetch to simulate successful resolution
    const mockResponse = {
      ok: true,
      json: async () => ({
        scope: "progy",
        slug: "sql-basics",
        latest: "1.0.0",
        downloadUrl: "https://api.progy.dev/registry/download/progy/sql-basics/1.0.0"
      })
    };

    const globalFetch = spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as any);

    const source = await CourseLoader.resolveSource("sql-basics");

    expect(globalFetch).toHaveBeenCalled();
    const callUrl = globalFetch.mock.calls[0]![0] as string;
    expect(callUrl).toContain(encodeURIComponent(`${OFICIAL_USERNAME}/sql-basics`));
    expect(source.isRegistry).toBe(true);
    expect(source.url).toContain("sql-basics/1.0.0");

    globalFetch.mockRestore();
  });

  test("should preserve explicit community handle", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        scope: "fhorray",
        slug: "rust-flow",
        latest: "0.5.0",
        downloadUrl: "https://api.progy.dev/registry/download/fhorray/rust-flow/0.5.0"
      })
    };

    const globalFetch = spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as any);

    const source = await CourseLoader.resolveSource("@fhorray/rust-flow");

    expect(globalFetch).toHaveBeenCalled();
    const callUrl = globalFetch.mock.calls[0]![0] as string;
    expect(callUrl).toContain(encodeURIComponent("@fhorray/rust-flow"));
    expect(source.url).toContain("fhorray/rust-flow/0.5.0");

    globalFetch.mockRestore();
  });

  test("should return git url for non-registry inputs containing slashes", async () => {
    const source = await CourseLoader.resolveSource("fhorray/some-repo");
    expect(source.isRegistry).toBeFalsy();
    expect(source.url).toBe("https://github.com/progy-dev/fhorray/some-repo.git");
  });
});
