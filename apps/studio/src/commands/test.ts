
import { Command } from "commander";
import { logger, CourseLoader } from "@progy/core";
import { resolve } from "node:path";

export function test(program: Command) {
  program
    .command("test")
    .description("Validate course structure and configuration")
    .argument("[dir]", "Course directory (default: current directory)")
    .action(async (dir) => {
      const cwd = resolve(dir || process.cwd());

      try {
        logger.info(`Validating course structure in ${cwd}...`);

        const config = await CourseLoader.validateCourse(cwd);

        logger.success(`Course '${config.name}' (ID: ${config.id}) is valid!`);
        logger.info(`Version: ${config.version}`);

        // Optional: Run additional checks if we implement them
        // For now, validation throws if invalid.

      } catch (e: any) {
        logger.error("Validation failed", e.message);
        process.exit(1);
      }
    });
}
