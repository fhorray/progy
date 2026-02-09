import { z } from "zod";
import { readFile, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { COURSE_CONFIG_NAME, BACKEND_URL as DEFAULT_BACKEND_URL } from "./paths";

const getBackendUrl = () => process.env.PROGY_API_URL || DEFAULT_BACKEND_URL;

const CourseConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  runner: z.object({
    command: z.string(),
    args: z.array(z.string()),
    cwd: z.string(),
  }),
  content: z.object({
    root: z.string(),
    exercises: z.string(),
  }),
  setup: z.object({
    checks: z.array(z.object({
      name: z.string(),
      type: z.string(),
      command: z.string(),
    })),
    guide: z.string(),
  }),
});

export type CourseConfig = z.infer<typeof CourseConfigSchema>;

async function isDirectory(path: string): Promise<boolean> {
  try {
    const s = await stat(path);
    return s.isDirectory();
  } catch {
    return false;
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

export class CourseLoader {
  static async resolveSource(courseInput: string): Promise<{ url: string; branch?: string; path?: string }> {
    // 1. Check if it's a local directory first
    const resolvedLocal = resolve(courseInput);
    if (await isDirectory(resolvedLocal)) {
      return { url: resolvedLocal };
    }

    // 2. Check if it looks like a URL (HTTP/HTTPS/SSH)
    const isUrl = /^(https?:\/\/|git@)/.test(courseInput);
    if (isUrl) {
      const parts = courseInput.split("#");
      const url = parts[0] as string;
      const branch = parts[1];
      return { url, branch };
    }

    // 3. Try to resolve from registry
    console.log(`[INFO] Resolving alias '${courseInput}'...`);
    try {
      const url = `${getBackendUrl()}/registry`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch registry (Status: ${response.status})`);
      }

      const data: any = await response.json();
      const course = data.courses?.[courseInput];

      if (course) {
        return { url: course.repo, branch: course.branch, path: course.path };
      }
    } catch (e: any) {
      console.warn(`[WARN] Registry lookup failed (${getBackendUrl()}/registry): ${e.message || e}`);
      // Fallthrough to error if registry fails and it's not a known alias
    }

    throw new Error(`Could not resolve course source for '${courseInput}'. Ensure it is a valid directory, URL, or registered alias.`);
  }

  static async validateCourse(path: string): Promise<CourseConfig> {
    const configPath = join(path, COURSE_CONFIG_NAME);

    if (!(await exists(configPath))) {
      throw new Error(`Missing ${COURSE_CONFIG_NAME} in course directory.`);
    }

    const configStr = await readFile(configPath, "utf-8");
    if (!configStr.trim()) {
       throw new Error(`Empty configuration file: ${COURSE_CONFIG_NAME}`);
    }

    let configJson;
    try {
      configJson = JSON.parse(configStr);
    } catch (e) {
      throw new Error(`Invalid JSON in ${COURSE_CONFIG_NAME}`);
    }

    if ("repo" in configJson) {
      throw new Error(`Security Error: Pre-configured 'repo' field in ${COURSE_CONFIG_NAME} is forbidden.`);
    }

    const result = CourseConfigSchema.safeParse(configJson);
    if (!result.success) {
      const issues = result.error.issues.map((e: any) => `- ${e.path.join('.')}: ${e.message}`).join("\n");
      throw new Error(`Invalid course configuration in ${COURSE_CONFIG_NAME}:\n${issues}`);
    }

    const contentRoot = join(path, result.data.content.root);
    if (!(await exists(contentRoot))) {
      throw new Error(`Content root '${result.data.content.root}' not found.`);
    }

    const exercisesDir = join(path, result.data.content.exercises);
    if (!(await exists(exercisesDir))) {
      throw new Error(`Exercises directory '${result.data.content.exercises}' not found.`);
    }

    const setupGuide = join(path, result.data.setup.guide);
    if (!(await exists(setupGuide))) {
      throw new Error(`Setup guide '${result.data.setup.guide}' not found.`);
    }

    return result.data;
  }
}
