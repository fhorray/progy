import { rm } from "node:fs/promises";
import { join } from "node:path";
import { readdir } from "node:fs/promises";

const TARGET_FOLDERS = [
  "node_modules",
  ".wrangler",
  ".open-next",
  "dist",
  ".next",
  ".prog",
];

async function cleanup(dir: string) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (TARGET_FOLDERS.includes(entry.name)) {
        console.log(`[CLEANUP] Deleting: ${fullPath}`);
        try {
          await rm(fullPath, { recursive: true, force: true });
        } catch (err: any) {
          console.error(`[ERROR] Failed to delete ${fullPath}: ${err.message}`);
        }
      } else {
        // Recursively check subdirectories
        await cleanup(fullPath);
      }
    }
  }
}

console.log("🚀 Starting recursive cleanup...");
cleanup(process.cwd())
  .then(() => console.log("✨ Cleanup complete!"))
  .catch((err) => console.error("❌ Cleanup failed:", err));
