import { WorkflowEntrypoint } from 'cloudflare:workers';
import type { WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { drizzle } from 'drizzle-orm/d1';
import * as schema from '../db/schema';
import { eq, sql, lt } from 'drizzle-orm';

export class AggregationWorkflow extends WorkflowEntrypoint<CloudflareBindings> {
  async run(_event: WorkflowEvent<any>, step: WorkflowStep): Promise<void> {
    const db = drizzle(this.env.DB);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    console.log(`[Aggregation] Starting aggregation for ${dateStr}`);

    // 1. Aggregate Downloads
    await step.do('Aggregate Downloads', async () => {
      // Find all downloads from yesterday
      const start = new Date(dateStr);
      const end = new Date(dateStr);
      end.setDate(end.getDate() + 1);

      // This is a simplified aggregation
      // In a real app, we'd use group by packageId
      const results = await db.select({
        packageId: schema.registryDownloads.packageId,
        count: sql<number>`count(*)`
      })
        .from(schema.registryDownloads)
        .where(sql`${schema.registryDownloads.downloadedAt} >= ${start.getTime()} AND ${schema.registryDownloads.downloadedAt} < ${end.getTime()}`)
        .groupBy(schema.registryDownloads.packageId)
        .all();

      const statsToInsert = results.map((row) => ({
        id: `stats-${row.packageId}-${dateStr}`,
        packageId: row.packageId,
        date: dateStr,
        downloadCount: row.count,
      }));

      if (statsToInsert.length > 0) {
        await db.insert(schema.registryStats).values(statsToInsert)
          .onConflictDoUpdate({
            target: schema.registryStats.id,
            set: { downloadCount: sql`excluded.downloads_count` }
          });
      }

      return { totalPackages: results.length };
    });

    // 2. Housekeeping (Archive old logs)
    await step.do('Housekeeping', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deleted = await db.delete(schema.registryDownloads)
        .where(lt(schema.registryDownloads.downloadedAt, thirtyDaysAgo))
        .returning({ id: schema.registryDownloads.id });

      console.log(`[Aggregation] Purged ${deleted.length} old download logs`);
      return { purged: deleted.length };
    });
  }
}
