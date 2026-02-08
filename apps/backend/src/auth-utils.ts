import { createMiddleware } from "hono/factory";
import { authServer } from "./auth";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";

export type AuthVariables = {
  user: typeof schema.user.$inferSelect | null;
  session: typeof schema.session.$inferSelect | null;
};

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
  Bindings: CloudflareBindings;
}>(async (c, next) => {
  const auth = authServer(c.env);
  const authHeader = c.req.header('Authorization');
  const db = drizzle(c.env.DB);

  let token = '';
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  try {
    // 1. Better Auth check (Standard Cookie/Header)
    const sessionData = await auth.api.getSession({
      headers: c.req.raw.headers
    });

    if (sessionData) {
      // Cast to any to avoid strict null/undefined mismatches between Better Auth types and Drizzle schema
      c.set('user', sessionData.user as any);
      c.set('session', sessionData.session as any);
      await next();
      return;
    }

    // 2. Manual Lookup (Fallback for CLI/Bearer if not handled by better-auth yet)
    if (token) {
      // A. Check 'session' table by token string
      const sessionRow = await db.select()
        .from(schema.session)
        .where(eq(schema.session.token, token))
        .get();

      if (sessionRow) {
        const userRow = await db.select()
          .from(schema.user)
          .where(eq(schema.user.id, sessionRow.userId))
          .get();

        if (userRow) {
          c.set('user', userRow);
          c.set('session', sessionRow);
          await next();
          return;
        }
      }

      // B. Check if token is actually a Session ID
      const sessionById = await db.select()
        .from(schema.session)
        .where(eq(schema.session.id, token))
        .get();
      if (sessionById) {
        const userRow = await db.select()
          .from(schema.user)
          .where(eq(schema.user.id, sessionById.userId))
          .get();
        if (userRow) {
          c.set('user', userRow);
          c.set('session', sessionById);
          await next();
          return;
        }
      }
    }
  } catch (err: any) {
    console.error(`[AUTH-ERROR-CRITICAL] ${err.message}`, err.stack);
  }

  // No session found
  c.set('user', null);
  c.set('session', null);
  await next();
});
