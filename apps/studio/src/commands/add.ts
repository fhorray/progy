
import { Command } from "commander";
import { resolve, join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { logger, exists } from "@progy/core";

export function add(program: Command) {
  const addCmd = program.command("add").description("Add content to the course");

  addCmd
    .command("module")
    .description("Add a new module")
    .argument("<name>", "Module name (e.g. 'basics')")
    .option("-t, --title <title>", "Module title")
    .action(async (name, options) => {
      const cwd = process.cwd();
      // Simple lookup for next prefix
      // For now, let's just ask user or use 00_ if empty
      // To keep it simple, we require user to manage prefixes or we auto-prefix if we implement scanning.
      // Let's just create the folder for now.

      const moduleName = name.match(/^\d{2}_/) ? name : `99_${name}`;
      const moduleDir = join(cwd, "content", moduleName);

      if (await exists(moduleDir)) {
        logger.error(`Module ${moduleName} already exists`);
        return;
      }

      await mkdir(moduleDir, { recursive: true });
      await writeFile(join(moduleDir, "info.toml"), `[module]\ntitle = "${options.title || name}"\n`);
      logger.success(`Created module: ${moduleName}`);
    });

  addCmd
    .command("exercise")
    .description("Add a new exercise to a module")
    .argument("<module>", "Target module (folder name)")
    .argument("<name>", "Exercise name")
    .action(async (moduleName, name) => {
      const cwd = process.cwd();
      const targetModule = join(cwd, "content", moduleName);

      if (!(await exists(targetModule))) {
        logger.error(`Module ${moduleName} not found`);
        return;
      }

      const exerciseName = name.match(/^\d{2}_/) ? name : `01_${name}`;
      const exDir = join(targetModule, exerciseName);

      if (await exists(exDir)) {
        logger.error(`Exercise ${exerciseName} already exists`);
        return;
      }

      await mkdir(exDir, { recursive: true });
      await writeFile(join(exDir, "README.md"), `# ${name}\n\nInstructions here.`);
      await writeFile(join(exDir, "exercise.ts"), `// Your solution here`); // Default to TS for now
      logger.success(`Created exercise: ${exerciseName} in ${moduleName}`);
    });
}
