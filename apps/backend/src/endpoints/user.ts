import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import type { AuthVariables } from '../auth-utils';

const user = new Hono<{
  Bindings: CloudflareBindings;
  Variables: AuthVariables;
}>();

// update username
user.post('/update-username', async (c) => {
  const sessionUser = c.get('user');
  if (!sessionUser) return c.json({ error: 'Unauthorized' }, 401);

  let username: string;
  try {
    const body = await c.req.json() as { username: string };
    username = body.username;
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  if (!username) {
    return c.json({ error: 'Username is required' }, 400);
  }

  // 1. Validate format
  const usernameRegex = /^[a-zA-Z0-9.-]{3,20}$/;
  if (!usernameRegex.test(username)) {
    return c.json({ error: 'Invalid username format. 3-20 characters, alphanumeric, dots or hyphens only.' }, 400);
  }

  const db = drizzle(c.env.DB);

  // 2. Check for uniqueness
  const existing = await db
    .select()
    .from(schema.user)
    .where(eq(schema.user.username, username.toLowerCase()))
    .get();

  if (existing && existing.id !== sessionUser.id) {
    return c.json({ error: 'Username is already taken' }, 409);
  }

  // 3. Update
  try {
    const oldUsername = sessionUser.username;
    const newUsername = username.toLowerCase();

    await db.batch([
      // A. Update user's username
      db.update(schema.user)
        .set({ username: newUsername, updatedAt: new Date() })
        .where(eq(schema.user.id, sessionUser.id)),

      // B. Update all owned packages (Migration)
      // This is a bit complex in D1 batch, we might need to do it as a separate loop if batching is too restrictive for dynamic values.
      // But we can update all packages where scope was the old username.
    ]);

    // Since we can't easily concatenate strings in a D1 batch .set() with drizzle efficiently for all packages at once 
    // without fetching them first or using raw SQL, let's fetch and update them.
    const packages = await db
      .select()
      .from(schema.registryPackages)
      .where(eq(schema.registryPackages.userId, sessionUser.id))
      .all();

    for (const pkg of packages) {
      const newName = `@${newUsername}/${pkg.slug}`;
      await db
        .update(schema.registryPackages)
        .set({ name: newName, updatedAt: new Date() })
        .where(eq(schema.registryPackages.id, pkg.id));
    }

    return c.json({
      success: true,
      username: newUsername,
      packagesMigrated: packages.length
    });
  } catch (e: any) {
    return c.json({ error: 'Failed to update username or migrate packages' }, 500);
  }
});

export default user;
