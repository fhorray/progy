import type { ServerType } from "@progy/core";
import { getProgress, saveProgress, updateStreak, } from "@progy/core";
import { DEFAULT_PROGRESS } from "@consts";

const getProgressHandler: ServerType<"/progress"> = async () => {
  try {
    return Response.json(await getProgress());
  } catch (e) {
    console.error(`[ERROR] getProgress failed: ${e}`);
    // Return default progress so frontend doesn't crash, but logged error on server
    return Response.json(JSON.parse(JSON.stringify(DEFAULT_PROGRESS)));
  }
};

export const updateProgressHandler: ServerType<"/progress/update"> = async (req) => {
  try {
    const { type, id, success, results } = await req.json() as any;
    if (!id) return Response.json({ success: false, error: "Missing ID" });

    let progress = await getProgress();
    const now = new Date().toISOString();

    if (type === 'quiz') {
      const score = results ? Math.round(((results.correct || 0) / (results.total || 1)) * 100) : (success ? 100 : 0);
      const totalQuestions = results?.total || 0;

      // Update if not exists or if score is higher
      if (!progress.quizzes[id] || progress.quizzes[id].score < score) {
        const xpEarned = Math.floor(score / 5) + (success ? 5 : 0); // Dynamic XP

        progress.quizzes[id] = {
          passed: success,
          score: score,
          totalQuestions: totalQuestions,
          xpEarned: xpEarned,
          completedAt: now
        };

        progress.stats.totalXp += xpEarned;
        progress.stats = updateStreak(progress.stats);
        await saveProgress(progress);
      }
    } else if (type === 'exercise' && success) {
      if (!progress.exercises[id]) {
        progress.exercises[id] = { status: 'pass', xpEarned: 10, completedAt: now };
        progress.stats.totalXp += 10;
        progress.stats = updateStreak(progress.stats);
        await saveProgress(progress);
      }
    }
    return Response.json({ success: true, progress });
  } catch (e) {
    return Response.json({ success: false, error: String(e) });
  }
};

export const progressRoutes = {
  "/progress": { GET: getProgressHandler },
  "/progress/update": { POST: updateProgressHandler }
};
