/**
 * Simple logger utility for Progy to standardize console output.
 */
export const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  warn: (msg: string) => console.warn(`[WARN] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
  success: (msg: string) => console.log(`[SUCCESS] ${msg}`),
  offline: (msg: string) => console.log(`[OFFLINE] ${msg}`),
  online: (msg: string) => console.log(`[ONLINE] ${msg}`),
  critical: (msg: string) => console.error(`[CRITICAL] ${msg}`),
  debug: (msg: string) => {
    if (process.env.DEBUG === "true") {
      console.log(`[DEBUG] ${msg}`);
    }
  }
};
