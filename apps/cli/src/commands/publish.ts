import { resolve, relative, join } from "node:path";
import { readdir, stat, mkdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { CourseLoader, CourseContainer, loadToken, BACKEND_URL, logger, exists } from "@progy/core";

import { incrementVersion } from "./version";

async function findUsedAssets(cwd: string): Promise<Set<string>> {
  const used = new Set<string>();

  // Skip directories that we know don't contain content or references
  const skipDirs = [".git", "node_modules", "assets", "dist", "target", ".progy"];

  const scanFile = async (path: string) => {
    try {
      const content = await Bun.file(path).text();
      // Refined regex: matches assets/ followed by alphanumeric, dot, underscore, hyphen, 
      // forward slash, space or percent (for URL encoding)
      // Stops at common delimiters: whitespace, quotes, parentheses, brackets, backticks
      const matches = content.matchAll(/assets\/([a-zA-Z0-9\._\-\/ %]+)/g);
      for (const match of matches) {
        if (match[1]) {
          // Clean up delimiters that might be caught
          const rawPath = match[1].split(/[\"\'\)\(\x60\>\s\n\[\]]/)[0]?.trim();
          if (rawPath) {
            const assetPath = decodeURIComponent(rawPath.replace(/\\/g, "/"));
            used.add(assetPath);
          }
        }
      }
    } catch (e) {
      // Ignore read errors
    }
  };

  const scanDir = async (dir: string) => {
    const files = await readdir(dir);
    for (const file of files) {
      const fullPath = resolve(dir, file);
      const s = await stat(fullPath);

      if (s.isDirectory()) {
        if (!skipDirs.includes(file)) {
          await scanDir(fullPath);
        }
      } else {
        // Scan common text files
        const ext = file.split(".").pop()?.toLowerCase();
        const scannableExtensions = ["md", "toml", "json", "ts", "js", "rs", "c", "cpp", "py", "sh", "html", "css"];
        if (ext && scannableExtensions.includes(ext)) {
          await scanFile(fullPath);
        }
      }
    }
  };

  await scanDir(cwd);

  return used;
}

export async function publish(options: any) {
  const sourceCwd = process.cwd();

  // 0. Handle Version Increment (on source files)
  if (options.patch) await incrementVersion("patch");
  if (options.minor) await incrementVersion("minor");
  if (options.major) await incrementVersion("major");

  logger.info("🚀 Preparing to publish...", "PUBLISH");

  // 1. Create a temporary packaging directory
  const tempPackDir = join(tmpdir(), `progy-publish-${Date.now()}`);
  await mkdir(tempPackDir, { recursive: true });

  // 2. Copy course to temp
  const filesToCopy = await readdir(sourceCwd);
  for (const file of filesToCopy) {
    if (file === ".progy" || file.endsWith(".progy") || file === "node_modules" || file === ".git") continue;
    const src = join(sourceCwd, file);
    const dst = join(tempPackDir, file);
    const s = await stat(src);
    if (s.isDirectory()) await cpRecursive(src, dst);
    else await Bun.write(dst, await Bun.file(src).arrayBuffer());
  }

  // 3. Optimize and Update References in Temp Dir
  const tempAssetsDir = join(tempPackDir, "assets");
  if (await exists(tempAssetsDir)) {
    const { optimizeDirectory, updateAssetReferences } = await import("../utils/optimize");
    logger.info("🎨 Optimizing course assets...", "ASSETS");
    const result = await optimizeDirectory(tempAssetsDir, tempAssetsDir);
    if (result.filesProcessed > 0) {
      await updateAssetReferences(tempPackDir);
      logger.success(`Optimized ${result.filesProcessed} images for publish.`);
    }
  }

  // 4. Validate Course (from temp)
  let config: any;
  try {
    config = await CourseLoader.validateCourse(tempPackDir);
  } catch (e: any) {
    logger.error("Course validation failed", e.message);
    await rm(tempPackDir, { recursive: true, force: true });
    process.exit(1);
  }

  // 5. Ensure Pack (from temp)
  const progyFile = `${config.id}.progy`;
  const progyPath = resolve(tempPackDir, progyFile);

  logger.info(`Packing course ${config.name} v${config.version}...`, "PACK");
  try {
    await CourseContainer.pack(tempPackDir, progyPath);
  } catch (e: any) {
    logger.error("Packaging failed", e.message);
    await rm(tempPackDir, { recursive: true, force: true });
    process.exit(1);
  }

  // 6. Prepare Upload (Rest of the logic remains mostly same but uses tempPackDir)
  const token = await loadToken();
  if (!token) {
    logger.error("Authentication required.", "Run 'progy login' first.");
    await rm(tempPackDir, { recursive: true, force: true });
    process.exit(1);
  }

  // Fetch session to get username
  let username = "";
  try {
    const sessionRes = await fetch(`${BACKEND_URL}/auth/get-session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const session = await sessionRes.json();
    username = session?.user?.username;
  } catch (e) { }

  if (!username) {
    logger.error("User username not found.");
    await rm(tempPackDir, { recursive: true, force: true });
    process.exit(1);
  }

  const packageName = config.id.startsWith(`@${username}/`) ? config.id : `@${username}/${config.id}`;
  logger.info("Scanning for used assets...", "ASSETS");
  const usedAssetNames = await findUsedAssets(tempPackDir);

  const version = (config.version || "1.0.0") as string;
  const versionCode = version.replace(/\./g, "");

  let coverAssetPath = (config.branding?.coverImage || "").replace(/\\/g, "/");
  let renamedCoverName = "";

  if (coverAssetPath && coverAssetPath.startsWith("assets/")) {
    const originalName = coverAssetPath.replace("assets/", "");
    const ext = originalName.split(".").pop();
    // Use .webp for renamed cover if we optimized it
    const finalExt = (ext === "svg" || ext === "gif") ? ext : "webp";
    renamedCoverName = `cover-${versionCode}.${finalExt}`;
    logger.info(`Renaming cover for registry: ${originalName} -> ${renamedCoverName}`, "ASSETS");

    if (config.branding) {
      config.branding.coverImage = `assets/${renamedCoverName}`;
    }
  }

  logger.info("Extracting course manifest...", "INDEX");
  const manifest = await CourseLoader.getCourseFlow(tempPackDir);

  const file = Bun.file(progyPath);
  const formData = new FormData();
  formData.append('file', file as any);

  // Filter and append optimized assets from temp dir
  if (await exists(tempAssetsDir)) {
    const assetFiles = await readdir(tempAssetsDir, { recursive: true });
    for (const assetFileRaw of assetFiles) {
      const fullPath = resolve(tempAssetsDir, assetFileRaw);
      const assetFile = relative(tempAssetsDir, fullPath).replace(/\\/g, "/");
      const s = await stat(fullPath);
      if (s.isFile()) {
        const getBaseName = (p: string) => p.split("/").pop()?.split(".")[0]?.toLowerCase();
        const assetBase = getBaseName(assetFile);
        const coverBase = getBaseName(coverAssetPath);

        const isCover = coverAssetPath === `assets/${assetFile}` ||
          (coverBase && assetBase && assetBase === coverBase);
        const isUsed = usedAssetNames.has(assetFile);

        if (isCover || isUsed) {
          const f = Bun.file(fullPath);
          const uploadName = isCover ? renamedCoverName : assetFile;
          formData.append(`assets/${uploadName}`, f as any);
        }
      }
    }
  }

  formData.append('metadata', JSON.stringify({
    name: packageName,
    version,
    engineVersion: "0.15.0", // Simplified
    description: config.name,
    manifest,
    branding: config.branding,
    progression: config.progression,
    runner: config.runner,
  }));

  try {
    const res = await fetch(`${BACKEND_URL}/registry/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json() as { error: string };
      logger.error("Publish failed", err.error || res.statusText);
    } else {
      const data = await res.json() as { success: boolean; version: string };
      logger.success(`Successfully published ${config.id} v${data.version}!`);
    }
  } catch (e: any) {
    logger.error("Network error during publish", e.message);
  } finally {
    await rm(tempPackDir, { recursive: true, force: true });
  }
}

async function cpRecursive(src: string, dst: string) {
  await mkdir(dst, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const dstPath = join(dst, entry.name);
    if (entry.isDirectory()) await cpRecursive(srcPath, dstPath);
    else await Bun.write(dstPath, await Bun.file(srcPath).arrayBuffer());
  }
}

