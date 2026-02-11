import sharp from "sharp";
import { join, extname, dirname } from "node:path";
import { readdir, stat, mkdir, rm } from "node:fs/promises";
import { logger, exists } from "@progy/core";

const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);

export interface OptimizationResult {
  originalSize: number;
  optimizedSize: number;
  saved: number;
  filesProcessed: number;
}

/**
 * Optimizes an image and converts it to WebP if appropriate.
 */
export async function optimizeImage(inputPath: string, outputPath: string): Promise<boolean> {
  try {
    const ext = extname(inputPath).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) return false;

    // SVG and GIF (animated) are handled differently or skipped for basic optimization
    if (ext === ".svg" || ext === ".gif") {
      // For now, just copy them if output is different
      if (inputPath !== outputPath) {
        const content = await Bun.file(inputPath).arrayBuffer();
        await Bun.write(outputPath, content);
      }
      return true;
    }

    // Convert to WebP with reasonable quality
    await sharp(inputPath)
      .webp({ quality: 80, effort: 6 })
      .toFile(outputPath);

    return true;
  } catch (e: any) {
    logger.warn(`Failed to optimize image ${inputPath}: ${e.message}`);
    return false;
  }
}

/**
 * Recursively optimizes all images in a directory.
 */
export async function optimizeDirectory(
  sourceDir: string,
  targetDir: string
): Promise<OptimizationResult> {
  const result: OptimizationResult = {
    originalSize: 0,
    optimizedSize: 0,
    saved: 0,
    filesProcessed: 0,
  };

  if (!(await exists(sourceDir))) return result;
  if (!(await exists(targetDir))) {
    await mkdir(targetDir, { recursive: true });
  }

  const files = await readdir(sourceDir, { recursive: true });

  for (const file of files) {
    const sourcePath = join(sourceDir, file);
    const s = await stat(sourcePath);

    if (s.isDirectory()) {
      continue;
    }

    const ext = extname(file).toLowerCase();
    if (IMAGE_EXTENSIONS.has(ext)) {
      // For WebP conversion, we change the extension unless it was already webp
      const outputFilename = ext === ".svg" || ext === ".gif" || ext === ".webp"
        ? file
        : file.replace(new RegExp(`${ext}$`), ".webp");

      const outputPath = join(targetDir, outputFilename);
      const outputDir = dirname(outputPath);

      if (!(await exists(outputDir))) {
        await mkdir(outputDir, { recursive: true });
      }

      result.originalSize += s.size;
      const success = await optimizeImage(sourcePath, outputPath);

      if (success) {
        const optStat = await stat(outputPath);
        result.optimizedSize += optStat.size;
        result.filesProcessed++;

        // If we converted the file (extension changed), delete the original 
        // to avoid keeping both versions in the temp directory.
        if (sourcePath !== outputPath) {
          await rm(sourcePath, { force: true });
        }
      } else {
        // If failed, fallback to original size to not skew "saved" count
        result.optimizedSize += s.size;
      }
    }
  }

  result.saved = result.originalSize - result.optimizedSize;
  return result;
}

/**
 * Updates references in text files to match the new optimized filenames.
 */
export async function updateAssetReferences(dir: string) {
  const scannableExtensions = [".md", ".json", ".toml", ".ts", ".js", ".html"];
  const files = await readdir(dir, { recursive: true });

  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!scannableExtensions.includes(ext)) continue;

    const filePath = join(dir, file);
    try {
      let content = await Bun.file(filePath).text();
      let modified = false;

      // Replace common image extensions with .webp
      // Only if they follow "assets/"
      const newContent = content.replace(/assets\/([a-zA-Z0-9\._\-\/ %]+)\.(png|jpg|jpeg|jfif)/gi, (match, p1) => {
        modified = true;
        return `assets/${p1}.webp`;
      });

      if (modified) {
        await Bun.write(filePath, newContent);
      }
    } catch (e) {
      // Skip binary or unreadable files
    }
  }
}

