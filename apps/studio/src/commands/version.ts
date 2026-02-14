
import { Command } from "commander";
import { resolve, join } from "node:path";
import { existsSync } from "node:fs";
import { logger, SyncManager } from "@progy/core";

export function version(program: Command) {
  program
    .command("version")
    .description("View or bump the course version")
    .argument("[dir]", "Course directory (default: current directory)")
    .option("--major", "Bump major version")
    .option("--minor", "Bump minor version")
    .option("--patch", "Bump patch version")
    .action(async (dir, options) => {
      const cwd = resolve(dir || process.cwd());

      const hasProgyToml = existsSync(join(cwd, "progy.toml"));
      const hasCourseJson = existsSync(join(cwd, "course.json"));

      if (!hasProgyToml && !hasCourseJson) {
        logger.error("Not a valid Progy course directory (missing progy.toml or course.json)");
        process.exit(1);
      }

      let courseId = "";
      let currentVersion = "0.0.1";
      let config: any = null;

      const courseTitle = config?.title || config?.name || config?.course?.name;

      // If no options, just print version
      if (!options.major && !options.minor && !options.patch) {
        if (courseTitle) {
          const { slugify } = await import("@progy/core");
          logger.info(`Course: ${courseTitle} (slug: ${slugify(courseTitle)})`);
        }
        logger.brand(`Version: v${currentVersion}`);
        return;
      }

      // Logic to Bump Version
      let newVersion = currentVersion;
      try {
        const parts = currentVersion.split(".").map(Number);
        if (parts.length !== 3 || parts.some(isNaN)) {
          logger.warn(`Current version '${currentVersion}' is not valid semantic versioning (x.y.z). Defaulting to simple increment.`);
        }

        let [major, minor, patch] = parts;
        if (options.major) {
          major++;
          minor = 0;
          patch = 0;
        } else if (options.minor) {
          minor++;
          patch = 0;
        } else if (options.patch) {
          patch++;
        }
        newVersion = `${major}.${minor}.${patch}`;
      } catch (e: any) {
        logger.error("Failed to parse/bump version", e.message);
        process.exit(1);
      }

      logger.info(`Bumping version: ${currentVersion} -> ${newVersion}`);

      // Save Config
      try {
        if (hasProgyToml && config) {
          config.course.version = newVersion;
          await SyncManager.saveConfig(cwd, config);
        } else if (hasCourseJson && config) {
          config.version = newVersion;
          await Bun.write(join(cwd, "course.json"), JSON.stringify(config, null, 2));
        }
        logger.success("Version updated successfully!");
      } catch (e: any) {
        logger.error("Failed to update version in config file", e.message);
        process.exit(1);
      }
    });
}
