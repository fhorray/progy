import type { BunRequest } from "bun";
import { z } from "zod";
import { CourseConfigSchema } from "./loader";


export type RunnerConfig = z.infer<typeof CourseConfigSchema>['runner']

export type ContentConfig = z.infer<typeof CourseConfigSchema>['content']

export type SetupConfig = z.infer<typeof CourseConfigSchema>['setup']

export type ProgressionConfig = z.infer<typeof CourseConfigSchema>['progression']

export type BrandingConfig = z.infer<typeof CourseConfigSchema>['branding']

export type Achievement = z.infer<typeof CourseConfigSchema>['achievements']

export interface SetupCheck {
  name: string;
  status: 'pending' | 'checking' | 'pass' | 'fail' | 'warning';
  message?: string;
  solution?: string;
}

export interface CourseConfig {
  id: string;
  name: string;
  runner: RunnerConfig;
  content: ContentConfig;
  api_keys?: Record<string, string>;
  setup?: SetupConfig;
  repo?: string;
  isOfficial?: boolean;
  progression?: ProgressionConfig;
  branding?: BrandingConfig;
  achievements?: Achievement[];
}

export interface ProgressStats {
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalExercises: number;
}

export interface ExerciseProgress {
  status: 'pass' | 'fail';
  xpEarned: number;
  completedAt: string;
  attempts?: number;
}

export interface QuizProgress {
  passed: boolean;
  score: number;
  totalQuestions: number;
  xpEarned: number;
  completedAt: string;
}

export interface Progress {
  stats: ProgressStats;
  exercises: Record<string, ExerciseProgress>;
  quizzes: Record<string, QuizProgress>;
  achievements: string[];
  tutorSuggestion?: {
    exerciseId: string;
    lesson: string;
    timestamp: string;
  };
}

export type NotificationType = 'tutor' | 'streak' | 'achievement' | 'system';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ManifestEntry {
  id: string;
  module: string;
  moduleTitle: string;
  moduleIcon?: string; // New: Icon for the module
  name: string;
  exerciseName: string;
  friendlyName: string;
  path: string;
  entryPoint?: string;
  markdownPath: string | null;
  hasQuiz: boolean;
  type: "file" | "directory";
  isLocked: boolean;
  lockReason?: string;
  tags?: string[]; // New: Tags like ["easy", "sql"]
  difficulty?: 'easy' | 'medium' | 'hard'; // New: Difficulty level
  xp?: number; // New: XP override
  completionMessage?: string; // New: Custom message when module is completed
}

export interface SRPDiagnostic {
  severity: 'error' | 'warning' | 'note';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  snippet?: string;
  suggestion?: string;
}

export interface SRPOutput {
  success: boolean;
  summary: string;
  diagnostics?: SRPDiagnostic[];
  tests?: Array<{ name: string; status: 'pass' | 'fail'; message?: string }>;
  raw: string;
}

export type ServerType<P extends string = string> = (req: BunRequest<P>) => Response | Promise<Response>;
