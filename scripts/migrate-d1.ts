import { readdirSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';

const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const BACKEND_ROOT = join(import.meta.dir, '../apps/backend');
const migrationDir = join(BACKEND_ROOT, 'drizzle');

// Find all .sql files in the drizzle directory
const migrations = readdirSync(migrationDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Ensure 0000, 0001 order

if (migrations.length === 0) {
  console.log('No migrations found.');
  process.exit(0);
}

console.log(`🚀 Found ${migrations.length} migrations. Applying to ${isRemote ? 'REMOTE' : 'LOCAL'} D1...`);

for (const migration of migrations) {
  const filePath = join(migrationDir, migration);
  console.log(`\n📦 Applying: ${migration}...`);

  const wranglerArgs = [
    'wrangler',
    'd1',
    'execute',
    'progy',
    '--file',
    filePath,
    isRemote ? '--remote' : '--local',
    '--yes'
  ];

  const result = spawnSync('bun', wranglerArgs, {
    stdio: 'inherit',
    shell: true,
    cwd: BACKEND_ROOT
  });

  if (result.status !== 0) {
    console.error(`❌ Failed to apply migration: ${migration}`);
    // We don't exit here because D1 often fails if table already exists (0000_awesome...)
    // But in a more robust setup, we'd check if it's a real error.
  } else {
    console.log(`✅ Success: ${migration}`);
  }
}

console.log('\n✨ All done!');
