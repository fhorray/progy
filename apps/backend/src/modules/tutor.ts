import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { eq } from "drizzle-orm";
import type { AuthVariables } from "../middlewares/auth";

const tutor = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .post(
    "/trigger",
    zValidator(
      "json",
      z.object({
        courseId: z.string(),
        exerciseId: z.string(),
        context: z.any()
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      // 1. Subscription Gate: Only PRO or LIFETIME users
      const isPro = user.subscription === 'pro' || user.hasLifetime === true;
      if (!isPro) {
        console.log(`[TUTOR-SKIP] User ${user.id} is on FREE plan. Skipping tutor trigger.`);
        return c.json({
          success: false,
          message: "Tutor Agent is exclusive for PRO users. Upgrade to unlock!"
        });
      }

      const { courseId, exerciseId, context } = c.req.valid("json");

      try {
        const db = drizzle(c.env.DB);
        const syncId = `${user.id}:${courseId}`;
        const progress = await db.select().from(schema.courseProgress).where(eq(schema.courseProgress.id, syncId)).get();

        // 2. Prevent Redundant Triggers: Check if we already have a suggestion for this exercise
        if (progress) {
          const data = JSON.parse(progress.data);
          if (data.tutorSuggestion && data.tutorSuggestion.exerciseId === exerciseId) {
            console.log(`[TUTOR-SKIP] Suggestion already exists for ${exerciseId}. Skipping trigger.`);
            return c.json({
              success: true,
              message: "Você já tem uma sugestão para este exercício. Confira na aba AI Mentor!"
            });
          }
        }

        console.log(`[TUTOR-TRIGGER] Initiating workflow for ${user.id} on ${courseId}/${exerciseId}`);

        // Sanitize ID
        const safeUserId = user.id.replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 10);
        const instanceId = `tutor_${Date.now()}_${safeUserId}`;

        // Trigger the workflow
        const instance = await c.env.TUTOR_AGENT.create({
          id: instanceId,
          params: {
            userId: user.id,
            courseId,
            exerciseId,
            context
          }
        });

        return c.json({
          success: true,
          instanceId: instance.id,
          message: "Tutor Agent is on the way!"
        });
      } catch (e: any) {
        console.error(`[TUTOR-TRIGGER-ERROR]`, e);
        return c.json({ error: "Failed to trigger Tutor Agent", message: e.message }, 500);
      }
    }
  );

export default tutor;
