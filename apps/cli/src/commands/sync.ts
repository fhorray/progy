import { join, relative, resolve } from "node:path";
import { GitUtils, SyncManager, loadToken, BACKEND_URL, getCourseCachePath, logger, exists } from "@progy/core";

export async function save(options: { message: string }) {
  const cwd = process.cwd();
  if (!(await exists(join(cwd, ".git")))) {
    logger.error("Not a synced course", "No .git repository found in current directory.");
    return;
  }

  const token = await loadToken();
  const config = await SyncManager.loadConfig(cwd);

  if (config?.course?.id) {
    await SyncManager.generateGitIgnore(cwd, config.course.id);
  }

  if (!(await GitUtils.lock(cwd))) {
    logger.warn("Sync in progress: Another Progy process is currently syncing. Please wait.");
    return;
  }

  try {
    if (token) {
      try {
        const res = await fetch(`${BACKEND_URL}/git/credentials`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const gitCreds = await res.json() as any;
          await GitUtils.updateOrigin(cwd, gitCreds.token);
          logger.info(`Authenticated as \x1b[1m${gitCreds.user}\x1b[0m`, "SYNC");
        }
      } catch { }
    }

    logger.info("Preparing artifacts for upload...", "SYNC");
    await GitUtils.exec(["add", "."], cwd);
    const commit = await GitUtils.exec(["commit", "-m", options.message], cwd);

    if (commit.success) {
      logger.info("Snapshotted current state.", "SYNC");
    } else if (!commit.stdout.includes("nothing to commit")) {
      logger.error("Commit failed", commit.stderr);
      return;
    }

    logger.info("Synchronizing with Progy Cloud...", "SYNC");
    const pull = await GitUtils.pull(cwd);
    if (!pull.success) {
      logger.warn(`Manual merge may be required: ${pull.stderr}`);
    }

    const push = await GitUtils.exec(["push", "origin", "HEAD"], cwd);
    if (push.success) {
      logger.success("All changes successfully pushed to the cloud.");
    } else {
      logger.error("Push failed", push.stderr);
    }
  } finally {
    await GitUtils.unlock(cwd);
  }
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
      await SyncManager.ensureOfficialCourse(config.course.id, config.course.repo, config.course.branch);
    }

    await SyncManager.resetExercise(cwd, cacheDir, targetFile);
    logger.success("File successfully restored.");
  } catch (e: any) {
    logger.error("Restore failed", e.message);
  }
}
