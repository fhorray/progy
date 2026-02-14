
import { Command } from "commander";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { logger } from "@progy/core";
import { PORTS } from "@consts";

export function dev(program: Command) {
  program
    .command("dev")
    .description("Start the Progy Studio editor in development mode (Preview)")
    .option("-p, --port <number>", "Port to run the editor on", String(PORTS.EDITOR))
    .action((options) => {
      const serverPath = join(import.meta.dir, "../server.ts");

      logger.brand("🎨 Launching Progy Studio (Dev Mode)...");

      spawn("bun", ["run", "--watch", serverPath], {
        stdio: "inherit",
        env: {
          ...process.env,
          PORT: options.port,
          PROGY_EDITOR_MODE: "true",
          PROGY_DEV_MODE: "true"
        }
      });
    });
}
