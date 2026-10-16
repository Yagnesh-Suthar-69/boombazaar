const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbDir = path.join(process.cwd(), '.data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'boombazaar.sqlite');
const db = new DatabaseSync(dbPath);

console.log('Applying migrations to:', dbPath);

const migrationsDir = path.join(process.cwd(), 'migrations');
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort();

db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const applied = new Set(
  db.prepare('SELECT name FROM _migrations').all().map(r => r.name)
);

// If the database already had 0001, 0002, 0003 applied before tracking table existed:
try {
  const pragma = db.prepare("PRAGMA table_info(products)").all();
  const hasVideo = pragma.some(col => col.name === 'video');
  if (hasVideo) {
    if (!applied.has('0001_initial_schema.sql')) db.prepare('INSERT OR IGNORE INTO _migrations (name) VALUES (?)').run('0001_initial_schema.sql');
    if (!applied.has('0002_seed_data.sql')) db.prepare('INSERT OR IGNORE INTO _migrations (name) VALUES (?)').run('0002_seed_data.sql');
    if (!applied.has('0003_add_video_column.sql')) db.prepare('INSERT OR IGNORE INTO _migrations (name) VALUES (?)').run('0003_add_video_column.sql');
    applied.add('0001_initial_schema.sql');
    applied.add('0002_seed_data.sql');
    applied.add('0003_add_video_column.sql');
  }
} catch (e) {}

for (const file of migrationFiles) {
  if (applied.has(file)) {
    console.log(`Skipping already applied migration: ${file}`);
    continue;
  }
  console.log(`Running migration: ${file}...`);
  const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  db.exec(sql);
  db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
}

console.log('All migrations applied successfully!');
