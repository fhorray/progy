// Core utilities - Refreshed legacy exports
export { exists } from "./utils";

// Paths & constants
export {
  PROG_CWD,
  PROG_RUNTIME_ROOT,
  CONFIG_DIR,
  GLOBAL_CONFIG_PATH,
  COURSE_CONFIG_NAME,
  COURSE_CONFIG_PATH,
  PROG_DIR_NAME,
  PROG_DIR,
  MANIFEST_PATH,
  PROGRESS_PATH,
  COURSE_CACHE_DIR,
  getCourseCachePath,
  BACKEND_URL,
  FRONTEND_URL,
} from "./paths";

// Config
export {
  getGlobalConfig,
  saveGlobalConfig,
  updateGlobalConfig,
  loadToken,
  saveToken,
  clearToken,
} from "./config";
export type { AIConfig, GlobalConfig } from "./config";

// Logger
export { logger } from "./logger";

// Git
export { GitUtils } from "./git";
export type { GitResult } from "./git";

// Course loader
export { CourseLoader, spawnPromise } from "./loader";

// Course container
export { CourseContainer } from "./container";

// Registry cache
export { RegistryCache } from "./cache";

// Sync
export { SyncManager } from "./sync";
export type { ProgyConfig } from "./sync";

// Templates
export {
  MODULE_INFO_TOML,
  EXERCISE_README,
  EXERCISE_STARTER,
  QUIZ_TEMPLATE,
  TEMPLATES,
  RUNNER_README,
} from "./templates";

// Types (backend shared)
export type {
  RunnerConfig,
  ContentConfig,
  SetupCheck,
  SetupConfig,
  ProgressionConfig,
  CourseConfig,
  ProgressStats,
  ExerciseProgress,
  QuizProgress,
  Progress,
  ManifestEntry,
  SRPDiagnostic,
  SRPOutput,
  Notification,
} from "./types";

// Helpers (backend shared business logic)
export {
  checkPrerequisite,
  getCourseConfig,
  ensureConfig,
  currentConfig,
  getProgress,
  saveProgress,
  updateStreak,
  scanAndGenerateManifest,
  runSetupChecks,
  parseRunnerOutput,
} from "./helpers";
export {
  BACKEND_URL as HELPERS_BACKEND_URL,
} from "./paths";


