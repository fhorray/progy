
import { logger, SyncManager } from "@progy/core";
import { createInterface } from "node:readline/promises";

export async function upgrade() {
  const cwd = process.cwd();

  // 1. Check for updates
  logger.info("Checking for updates...");
  const updateInfo = await SyncManager.checkUpdate(cwd);

  if (!updateInfo || !updateInfo.updateAvailable) {
    logger.success("Your course is up to date!");
    return;
  }

  logger.brand(`🚀 Update Available: v${updateInfo.currentVersion} -> v${updateInfo.latestVersion}`);

  // 2. Dry Run / Diff
  logger.info("Comparing files...", "DRY RUN");
  try {
    const diff = await SyncManager.getUpdateDiff(cwd, updateInfo.latestVersion);

    // Display simplified diff
    if (diff.added.length > 0) {
      console.log("\n📦 New Files:");
      diff.added.slice(0, 10).forEach(f => console.log(`  + ${f}`));
      if (diff.added.length > 10) console.log(`  ... and ${diff.added.length - 10} more`);
    }

    if (diff.modified.length > 0) {
      console.log("\n⚠️  Modified Files (will be overwritten):");
      diff.modified.slice(0, 10).forEach(f => console.log(`  ~ ${f}`));
      if (diff.modified.length > 10) console.log(`  ... and ${diff.modified.length - 10} more`);
    }

    if (diff.deleted.length > 0) {
      console.log("\n🗑️  Deleted Files:");
      diff.deleted.slice(0, 10).forEach(f => console.log(`  - ${f}`));
      if (diff.deleted.length > 10) console.log(`  ... and ${diff.deleted.length - 10} more`);
    }

    if (diff.added.length === 0 && diff.modified.length === 0 && diff.deleted.length === 0) {
      logger.warn("Version mismatch detected, but no content files look different.");
    }

    // 3. Prompt for confirmation
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    console.log("\n");
    const answer = await rl.question("Do you want to apply this update? (y/N) ");
    rl.close();

    if (answer.toLowerCase() !== 'y') {
      logger.info("Update cancelled.");
      return;
    }

    // 4. Apply Update
    logger.info("Applying update...");
    await SyncManager.applyUpdate(cwd, updateInfo.latestVersion);
    logger.success(`Successfully upgraded to v${updateInfo.latestVersion}!`);

  } catch (e: any) {
    logger.error("Update failed", e.message);
    process.exit(1);
  }
}
