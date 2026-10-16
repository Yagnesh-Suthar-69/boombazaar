const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), '.data', 'boombazaar.sqlite');
if (!fs.existsSync(dbPath)) {
  console.log('Database file not found, running migrations first...');
  require('./migrate-local.js');
}

const db = new DatabaseSync(dbPath);
const seedSqlPath = path.join(process.cwd(), 'migrations', '0002_seed_data.sql');
const seedSql = fs.readFileSync(seedSqlPath, 'utf8');

console.log('Seeding initial data...');
db.exec(seedSql);

console.log('Database seeded successfully!');
