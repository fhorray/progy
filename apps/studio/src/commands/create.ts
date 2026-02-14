
import { Command } from "commander";
import { resolve, join } from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { logger, exists, SyncManager } from "@progy/core";

export function create(program: Command) {
  program
    .command("create")
    .description("Create a new Progy course")
    .argument("<name>", "Name of the course (folder name)")
    .option("-t, --title <title>", "Display title of the course")
    .action(async (name, options) => {
      const cwd = process.cwd();
      const courseDir = resolve(cwd, name);
      const title = options.title || name;

      if (await exists(courseDir)) {
        logger.error(`Directory '${name}' already exists.`);
        process.exit(1);
      }

      try {
        logger.info(`Creating course '${title}' in ${courseDir}...`);

        // 1. Create Directory Structure
        await mkdir(courseDir, { recursive: true });
        await mkdir(join(courseDir, "content"), { recursive: true });

        // 2. Create progy.toml
        const config = {
          course: {
            id: name.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
            repo: "",
            branch: "main",
            version: "0.0.1"
          }
        };
        // We use SyncManager.saveConfig but we need to pass a config object matching ProgyConfig interface
        // Constructing it manually for initial file is safer/easier
        const tomlContent = `[course]
id = "${config.course.id}"
repo = ""
branch = "main"
version = "0.0.1"

[sync]
`;
        await writeFile(join(courseDir, "progy.toml"), tomlContent);

        // 3. Create .gitignore
        await SyncManager.generateGitIgnore(courseDir, config.course.id);

        // 4. Create README
        await writeFile(join(courseDir, "README.md"), `# ${title}\n\nWelcome to your new Progy course!`);

        logger.success(`Course created successfully!`);
        logger.info(`Run 'cd ${name}' and 'progy-studio start' to begin editing.`);

      } catch (e: any) {
        logger.error("Failed to create course", e.message);
        process.exit(1);
      }
    });
}
