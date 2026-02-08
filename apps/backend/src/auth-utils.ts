import { authServer } from "./auth";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";
import { eq } from "drizzle-orm";
import { createMiddleware } from "hono/factory";
import type { Context } from "hono";

export type AuthVariables = {
  user: typeof schema.user.$inferSelect | null;
  session: typeof schema.session.$inferSelect | null;
};

// Helper for robust session verification
export async function verifySession(c: Context<any>) {
  const auth = authServer(c.env as CloudflareBindings);
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
      console.log(`[AUTH-DEBUG] Session found via Better Auth: ${sessionData.user.email}`);
      return {
        user: sessionData.user as typeof schema.user.$inferSelect,
        session: sessionData.session as typeof schema.session.$inferSelect
      };
    }

    // 2. Manual Lookup (Fallback for CLI/Bearer if not handled by better-auth yet)
    if (token) {
      console.log(`[AUTH-DEBUG] Attempting manual lookup for token: ${token.substring(0, 8)}...`);
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
          console.log(`[AUTH-DEBUG] Manual session found via token field: ${userRow.email}`);
          return {
            user: userRow as typeof schema.user.$inferSelect,
            session: sessionRow as typeof schema.session.$inferSelect
          };
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
          console.log(`[AUTH-DEBUG] Manual session found via ID field: ${userRow.email}`);
          return {
            user: userRow as typeof schema.user.$inferSelect,
            session: sessionById as typeof schema.session.$inferSelect
          };
        }
      }
      console.warn(`[AUTH-DEBUG] Manual lookup failed for token: ${token.substring(0, 8)}`);
    }
    return null;
  } catch (err: any) {
    console.error(`[AUTH-ERROR-CRITICAL] ${err.message}`, err.stack);
    return null;
  }
}

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
  Bindings: CloudflareBindings;
}>(async (c, next) => {
  const result = await verifySession(c);
  if (result) {
    c.set('user', result.user);
    c.set('session', result.session);
  } else {
    c.set('user', null);
    c.set('session', null);
  }
  await next();
});
