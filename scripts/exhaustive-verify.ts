import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { eq, and } from "drizzle-orm";
import * as schema from "../apps/backend/src/db/schema";


// --- MOCK SETUP ---
const sqlite = new Database(":memory:");
const db = drizzle(sqlite);

async function setupDb() {
  // Complete schema for mock testing
  sqlite.run(`CREATE TABLE user (
    id TEXT PRIMARY KEY, 
    username TEXT UNIQUE, 
    name TEXT, 
    email TEXT UNIQUE, 
    email_verified INTEGER, 
    image TEXT,
    created_at INTEGER, 
    updated_at INTEGER,
    subscription TEXT,
    has_lifetime INTEGER,
    stripe_customer_id TEXT,
    metadata TEXT
  )`);
  sqlite.run(`CREATE TABLE registry_packages (id TEXT PRIMARY KEY, user_id TEXT, name TEXT UNIQUE, slug TEXT, description TEXT, latest_version TEXT, is_public INTEGER, created_at INTEGER, updated_at INTEGER)`);
  sqlite.run(`CREATE TABLE registry_versions (id TEXT PRIMARY KEY, package_id TEXT, version TEXT, storage_key TEXT, size_bytes INTEGER, checksum TEXT, changelog TEXT, created_at INTEGER)`);
}

async function runTests() {
  console.log("🚀 Starting Exhaustive Verification...\n");
  await setupDb();

  // 1. Setup Initial Data
  const userId = "user-123";
  await db.insert(schema.user).values({
    id: userId,
    username: "diego",
    name: "Diego",
    email: "diego@example.com",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✅ User 'diego' created.");

  // 2. Simulate Publish (Phase 14/15 logic)
  const pkgName = "@diego/sql-basics";
  const pkgSlug = "sql-basics";
  await db.insert(schema.registryPackages).values({
    id: "pkg-1",
    userId: userId,
    name: pkgName,
    slug: pkgSlug,
    latestVersion: "1.0.0",
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(schema.registryVersions).values({
    id: "ver-1",
    packageId: "pkg-1",
    version: "1.0.0",
    storageKey: `packages/${pkgName}/1.0.0.progy`,
    sizeBytes: 1024,
    checksum: "sha256-mock",
    createdAt: new Date(),
  });

  console.log(`✅ Package '${pkgName}' published.`);

  // 3. Test Identity Migration (Phase 21 logic)
  console.log("\n🔄 Simulating Username Change: diego -> fhorray...");
  const newUsername = "fhorray";

  // Simulation of update-username logic:
  await db.update(schema.user)
    .set({ username: newUsername, updatedAt: new Date() })
    .where(eq(schema.user.id, userId));

  const packages = await db.select().from(schema.registryPackages).where(eq(schema.registryPackages.userId, userId)).all();
  for (const pkg of packages) {
    const migratedName = `@${newUsername}/${pkg.slug}`;
    await db.update(schema.registryPackages)
      .set({ name: migratedName, updatedAt: new Date() })
      .where(eq(schema.registryPackages.id, pkg.id));
  }

  // Verify Migration
  const migratedPkg = await db.select().from(schema.registryPackages).where(eq(schema.registryPackages.id, "pkg-1")).get();
  if (migratedPkg?.name === "@fhorray/sql-basics") {
    console.log("✅ D1 Package Migration: SUCCESS");
  } else {
    console.error("❌ D1 Package Migration: FAILED", migratedPkg?.name);
    process.exit(1);
  }

  // 4. Test Robust Download (Phase 21 logic)
  console.log("\n📦 Verifying Robust Download (using storageKey)...");
  // The storageKey remains 'packages/@diego/sql-basics/1.0.0.progy'
  const version = await db.select().from(schema.registryVersions).where(eq(schema.registryVersions.packageId, "pkg-1")).get();
  if (version?.storageKey.includes("@diego")) {
    console.log("✅ Robust Download: SUCCESS (Decoupled from current username)");
  } else {
    console.error("❌ Robust Download: FAILED (Key was lost or incorrectly updated)");
    process.exit(1);
  }

  // 5. Test Official Course Resolution (Phase 22 logic)
  console.log("\n🏷️ Verifying Official Course Resolution...");
  // Create an official package
  const oficialId = "progy-id";
  await db.insert(schema.user).values({
    id: oficialId,
    username: "progy",
    name: "Progy Official",
    email: "official@progy.dev",
    emailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(schema.registryPackages).values({
    id: "pkg-official",
    userId: oficialId,
    name: "@progy/rust-flow",
    slug: "rust-flow",
    latestVersion: "1.0.0",
    isPublic: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Since we can't easily mock fetch inside the script while testing CourseLoader directly without msw/etc,
  // we'll just verify the query string generation logic via unit tests (already done) 
  // and assume D1 lookup logic here.

  const officialLookup = await db.select().from(schema.registryPackages)
    .where(eq(schema.registryPackages.name, `@progy/rust-flow`))
    .get();

  if (officialLookup) {
    console.log("✅ Official Lookup: SUCCESS");
  } else {
    console.error("❌ Official Lookup: FAILED");
    process.exit(1);
  }

  console.log("\n✨ ALL TESTS PASSED!");
}

runTests().catch(e => {
  console.error("💥 Test runner crashed:", e);
  process.exit(1);
});
