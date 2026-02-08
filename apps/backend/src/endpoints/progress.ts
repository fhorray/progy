
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "../db/schema";
import { eq, and } from "drizzle-orm";
import type { AuthVariables } from "../auth-utils";

const progress = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>();

progress.post("/sync", async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get("user");

  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { courseId, data } = await c.req.json();
  if (!courseId || !data) return c.json({ error: "Missing courseId or data" }, 400);

  const syncId = `${user.id}:${courseId}`;

  await db
    .insert(schema.courseProgress)
    .values({
      id: syncId,
      userId: user.id,
      courseId,
      data: typeof data === "string" ? data : JSON.stringify(data),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.courseProgress.id,
      set: {
        data: typeof data === "string" ? data : JSON.stringify(data),
        updatedAt: new Date(),
      },
    });

  return c.json({ success: true });
});

progress.get("/get", async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get("user");

  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const courseId = c.req.query("courseId");
  if (!courseId) return c.json({ error: "Missing courseId" }, 400);

  const progress = await db
    .select()
    .from(schema.courseProgress)
    .where(and(eq(schema.courseProgress.userId, user.id), eq(schema.courseProgress.courseId, courseId)))
    .get();
  if (progress?.data) {
    try {
      return c.json(JSON.parse(progress.data));
    } catch (e) {
      console.error(`[PROGRESS-PARSE-ERROR] Course: ${courseId}, User: ${user.id}`, e);
      return c.json(null);
    }
  }

  return c.json(null);
});

progress.get("/list", async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get("user");

  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const progressList = await db
    .select()
    .from(schema.courseProgress)
    .where(eq(schema.courseProgress.userId, user.id))
    .all();

  return c.json(
    progressList.map((p) => {
      let data = {};
      try {
        data = JSON.parse(p.data);
      } catch (e) {
        console.error(`[PROGRESS-LIST-PARSE-ERROR] Course: ${p.courseId}, User: ${user.id}`, e);
      }
      return {
        courseId: p.courseId,
        data,
        updatedAt: p.updatedAt,
      };
    })
  );
});

progress.post("/reset", async (c) => {
  const db = drizzle(c.env.DB);
  const user = c.get("user");

  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const { courseId } = await c.req.json();
  if (!courseId) return c.json({ error: "Missing courseId" }, 400);

  try {
    const syncId = `${user.id}:${courseId}`;

    // Delete progress entry
    await db.delete(schema.courseProgress)
      .where(
        eq(schema.courseProgress.id, syncId)
      );

    console.log(`[PROGRESS-RESET] User: ${user.id}, Course: ${courseId}`);
    return c.json({ success: true, message: "Course progress reset successfully" });
  } catch (e: any) {
    console.error(`[PROGRESS-RESET-ERROR] User: ${user.id}`, e);
    return c.json({ error: "Failed to reset progress" }, 500);
  }
});

export default progress;
