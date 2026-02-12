
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { describe, test, expect, beforeAll, afterAll } from "bun:test";

// Simulate the schema
const registryStats = sqliteTable("registries_stats", {
  id: text("id").primaryKey(),
  packageId: text("package_id").notNull(),
  date: text("date").notNull(),
  downloadCount: integer("downloads_count").notNull().default(0),
});

const sqlite = new Database(":memory:");
const db = drizzle(sqlite);

const NUM_RECORDS = 5000;
const DATE_STR = "2024-01-01";

// Generate mock data
const mockResults = Array.from({ length: NUM_RECORDS }, (_, i) => ({
  packageId: `pkg-${i}`,
  count: Math.floor(Math.random() * 100),
}));

describe("Aggregation Benchmark", () => {
  beforeAll(async () => {
    sqlite.exec(`
      CREATE TABLE registries_stats (
        id TEXT PRIMARY KEY,
        package_id TEXT NOT NULL,
        date TEXT NOT NULL,
        downloads_count INTEGER NOT NULL DEFAULT 0
      );
    `);
  });

  afterAll(() => {
    sqlite.close();
  });

  test("Baseline: N+1 Loop Insert", async () => {
    // Clear table
    sqlite.exec("DELETE FROM registries_stats");

    const start = performance.now();

    for (const row of mockResults) {
      const id = `stats-${row.packageId}-${DATE_STR}`;
      await db
        .insert(registryStats)
        .values({
          id,
          packageId: row.packageId,
          date: DATE_STR,
          downloadCount: row.count,
        })
        .onConflictDoUpdate({
          target: registryStats.id,
          set: { downloadCount: row.count },
        });
    }

    const end = performance.now();
    console.log(`[Baseline] N+1 Insert took: ${(end - start).toFixed(2)}ms for ${NUM_RECORDS} records`);
  });

  test("Optimized: Bulk Insert", async () => {
    // Clear table
    sqlite.exec("DELETE FROM registries_stats");

    const start = performance.now();

    const statsToInsert = mockResults.map((row) => ({
      id: `stats-${row.packageId}-${DATE_STR}`,
      packageId: row.packageId,
      date: DATE_STR,
      downloadCount: row.count,
    }));

    if (statsToInsert.length > 0) {
      // In SQLite, bulk insert parameters are limited (often 999 or 32766), so we might need to batch large datasets.
      // Drizzle ORM might handle this, but let's test a simple bulk insert first.
      // For this benchmark, 5000 records * 4 params = 20000 params, which fits within the typical SQLite limit of 32766 or 999 depending on config.
      // Bun's SQLite implementation handles larger batches well usually.

      await db
        .insert(registryStats)
        .values(statsToInsert)
        .onConflictDoUpdate({
          target: registryStats.id,
          set: { downloadCount: sql`excluded.downloads_count` },
        });
    }

    const end = performance.now();
    console.log(`[Optimized] Bulk Insert took: ${(end - start).toFixed(2)}ms for ${NUM_RECORDS} records`);

    // Verify count
    const result = await db.select({ count: sql<number>`count(*)` }).from(registryStats).get();
    expect(result?.count).toBe(NUM_RECORDS);
  });
});
