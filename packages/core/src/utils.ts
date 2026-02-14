import { stat } from "node:fs/promises";

/**
 * Check if a file or directory exists at the given path.
 * Replaces the duplicated `exists()` helper scattered across the codebase.
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
/**
 * Slugify a string for use in URLs or IDs.
 * Replaces non-alphanumeric characters with underscores and trims.
 */
export const slugify = (str: string): string =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
