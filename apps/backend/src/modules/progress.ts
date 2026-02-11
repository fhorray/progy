import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { ProgressService } from "../services/progress.service";
import type { AuthVariables } from "../middlewares/auth";

const progress = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>()
  .post(
    "/sync",
    zValidator(
      "json",
      z.object({
        courseId: z.string(),
        data: z.any()
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { courseId, data } = c.req.valid("json");
      const progressService = new ProgressService(c.env);

      try {
        const result = await progressService.syncProgress(user.id, courseId, data);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: "Failed to sync progress" }, 500);
      }
    }
  )
  .get(
    "/get",
    zValidator(
      "query",
      z.object({
        courseId: z.string()
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { courseId } = c.req.valid("query");
      const progressService = new ProgressService(c.env);

      try {
        const data = await progressService.getProgress(user.id, courseId);
        return c.json(data);
      } catch (e: any) {
        return c.json(null);
      }
    }
  )
  .get("/list", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const progressService = new ProgressService(c.env);
    try {
      const list = await progressService.listProgress(user.id);
      return c.json(list);
    } catch (e: any) {
      return c.json([]);
    }
  })
  .post(
    "/reset",
    zValidator(
      "json",
      z.object({
        courseId: z.string()
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { courseId } = c.req.valid("json");
      const progressService = new ProgressService(c.env);

      try {
        const result = await progressService.resetProgress(user.id, courseId);
        return c.json(result);
      } catch (e: any) {
        return c.json({ error: "Failed to reset progress" }, 500);
      }
    }
  )
  .post("/upload", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const body = await c.req.parseBody();
    const courseId = body['courseId'] as string;
    const file = body['file'] as File;

    if (!courseId || !file) {
      return c.json({ error: "Missing courseId or file" }, 400);
    }

    const progressService = new ProgressService(c.env);
    await progressService.uploadProgressFile(user.id, courseId, await file.arrayBuffer());

    return c.json({ success: true });
  })
  .get("/download", async (c) => {
    const user = c.get("user");
    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const courseId = c.req.query("courseId");
    if (!courseId) return c.json({ error: "Missing courseId" }, 400);

    const progressService = new ProgressService(c.env);
    const stream = await progressService.downloadProgressFile(user.id, courseId);

    if (!stream) {
      return c.text("Not found", 404);
    }

    return c.body(stream, 200, {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="progress.progy"`
    });
  });

export default progress;
