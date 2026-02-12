
import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import rateLimiterMiddleware from "../middlewares/rate-limiter";
import { AIService } from "../services/ai.service";
import type { AuthVariables } from "../middlewares/auth";

const billing = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables
}>()

  // Middlewares
  .use(rateLimiterMiddleware)

  // Routes
  .get(
    '/usage',
    async (c) => {
      const user = c.get('user');
      if (!user) return c.json({ error: 'Unauthorized' }, 401);

      const aiService = new AIService(c.env);
      try {
        const usage = await aiService.getUsage(user);
        return c.json(usage);
      } catch (e: any) {
        return c.json({ error: e.message }, 500);
      }
    }
  )
  .post(
    '/generate',
    zValidator('json', z.object({
      prompt: z.string(),
      difficulty: z.string(),
      config: z.any().optional()
    })),
    async (c) => {
      const user = c.get('user')
      if (!user) return c.json({ error: 'Unauthorized' }, 401);

      const { prompt, difficulty, config } = c.req.valid('json');
      const aiService = new AIService(c.env);

      try {
        const result = await aiService.generate(user, prompt, difficulty, config);
        return c.json(result);
      } catch (e: any) {
        const isAuthError = e.message.includes('subscription') || e.message.includes('Daily AI limit');
        return c.json({ error: e.message }, isAuthError ? 403 : 500);
      }
    }
  )
  .post(
    '/hint',
    zValidator('json', z.object({
      context: z.any(),
      config: z.any().optional()
    })),
    async (c) => {
      const user = c.get('user')
      if (!user) return c.json({ error: 'Unauthorized' }, 401);

      const { context, config } = c.req.valid('json');
      const aiService = new AIService(c.env);

      try {
        const result = await aiService.hint(user, context, config);
        return result.toTextStreamResponse();
      } catch (e: any) {
        const isAuthError = e.message.includes('subscription') || e.message.includes('Daily AI limit');
        return c.json({ error: e.message }, isAuthError ? 403 : 500);
      }
    }
  )
  .post(
    '/explain',
    zValidator('json', z.object({
      context: z.any(),
      config: z.any().optional()
    })),
    async (c) => {
      const user = c.get('user')
      if (!user) return c.json({ error: 'Unauthorized' }, 401);

      const { context, config } = c.req.valid('json');
      const aiService = new AIService(c.env);

      try {
        const result = await aiService.explain(user, context, config);
        return result.toTextStreamResponse();
      } catch (e: any) {
        const isAuthError = e.message.includes('subscription') || e.message.includes('Daily AI limit');
        return c.json({ error: e.message }, isAuthError ? 403 : 500);
      }
    }
  )
  .post(
    '/chat',
    zValidator('json', z.object({
      messages: z.array(z.any()),
      context: z.any(),
      config: z.any().optional()
    })),
    async (c) => {
      const user = c.get('user')
      if (!user) return c.json({ error: 'Unauthorized' }, 401);

      const { messages, context, config } = c.req.valid('json');
      const aiService = new AIService(c.env);

      try {
        const result = await aiService.chat(user, messages, context, config);
        return result.toTextStreamResponse();
      } catch (e: any) {
        const isAuthError = e.message.includes('subscription') || e.message.includes('Daily AI limit');
        return c.json({ error: e.message }, isAuthError ? 403 : 500);
      }
    }
  )

export default billing;
