import { join, relative, resolve } from "node:path";
import { GitUtils, SyncManager, loadToken, BACKEND_URL, getCourseCachePath, logger, exists } from "@progy/core";

export async function save(options: { message: string }) {
  // Deprecated: progy save was for Git. We now use progy sync for cloud.
  // We can alias it to sync if we want, or remove it.
  // Given the instruction to clean up, we should probably remove it or redirect it.
  // Let's redirect it to sync for backward compatibility but warn.
  logger.warn("'progy save' is deprecated. Please use 'progy sync' to save your progress to the cloud.");
  await sync();
}

export async function sync() {
  const cwd = process.cwd();
  const config = await SyncManager.loadConfig(cwd);

  if (!config) {
    logger.error("Not a Progy course", "Missing progy.toml.");
    return;
  }

  logger.info("Packing progress...", "SYNC");
  const buffer = await SyncManager.packProgress(cwd);

  logger.info("Uploading to cloud...", "SYNC");
  const success = await SyncManager.uploadProgress(config.course.id, buffer);

  if (success) {
    config.sync = { last_sync: new Date().toISOString() };
    await SyncManager.saveConfig(cwd, config);
    logger.success("Progress successfully synced to cloud!");
  } else {
    logger.error("Sync failed", "Could not upload progress to server.");
  }
}

export async function reset(path: string) {
  const cwd = process.cwd();
  const targetFile = relative(cwd, resolve(path));

  const config = await SyncManager.loadConfig(cwd);
  if (!config) {
    logger.error("Reset failed", "Course configuration not found.");
    return;
  }

  try {
    logger.info(`Restoring \x1b[38;5;208m${targetFile}\x1b[0m to its original state...`, "RESET");
    const cacheDir = getCourseCachePath(config.course.id);
    if (!(await exists(cacheDir))) {
      // With Cloud First, we can't "ensure" (git clone) if it's missing.
      // We must assume the user ran 'progy start' or 'progy init' which handles hydration.
      // But if we really need to, we could try to download the artifact again using CourseLoader.
      // For now, let's error out guiding the user.
      logger.error("Cache missing", "Please run 'progy start' to restore course assets first.");
      return;
    }

    await SyncManager.resetExercise(cwd, cacheDir, targetFile);
    logger.success("File successfully restored.");
  } catch (e: any) {
    logger.error("Restore failed", e.message);
  }
}
