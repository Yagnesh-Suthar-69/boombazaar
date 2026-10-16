import path from 'path';
import fs from 'fs';
import os from 'os';

export interface D1PreparedStatement {
  bind(...params: any[]): D1PreparedStatement;
  all<T = Record<string, any>>(): Promise<{ results: T[]; success: boolean }>;
  first<T = Record<string, any>>(column?: string): Promise<T | null>;
  run(): Promise<{ success: boolean; meta: { changes: number; last_row_id: number } }>;
  raw<T = any[]>(): Promise<T[]>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<{ results: T[]; success: boolean }[]>;
  exec(query: string): Promise<{ count: number; duration: number }>;
}

let localDbInstance: any = null;

/**
 * Determine a safe, writable directory for SQLite storage.
 * On Vercel / AWS Lambda, process.cwd() is '/var/task' (read-only), so we fallback to os.tmpdir() (/tmp).
 */
function getWritableDbDir(): string {
  // 1. Explicit DB_DIR environment variable
  if (process.env.DB_DIR) {
    try {
      if (!fs.existsSync(process.env.DB_DIR)) {
        fs.mkdirSync(process.env.DB_DIR, { recursive: true });
      }
      return process.env.DB_DIR;
    } catch (e) {
      console.warn('[BoomBazaar DB] Could not use DB_DIR from environment:', e);
    }
  }

  // 2. Try project root .data directory (standard local development)
  try {
    const localDir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    // Verify write permission (fails on read-only environments like /var/task)
    const probe = path.join(localDir, `.write_probe_${Date.now()}`);
    fs.writeFileSync(probe, '1');
    fs.unlinkSync(probe);
    return localDir;
  } catch {
    // 3. Fallback to OS temp directory (fully writable on Vercel / AWS Lambda / Docker)
    const tmpDir = path.join(os.tmpdir(), 'boombazaar-data');
    try {
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return tmpDir;
    } catch {
      return os.tmpdir();
    }
  }
}

/**
 * Ensures tables and seed data exist if a new SQLite database is created in /tmp or fresh environment.
 */
function ensureInitialized(sqlite: any) {
  try {
    const check = sqlite.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='categories'").get();
    if (check && check.count > 0) {
      return; // Database already has tables
    }
  } catch {
    // proceed
  }

  console.log('[BoomBazaar DB] Fresh database detected. Applying schema migrations...');

  const migrationDirs = [
    path.join(process.cwd(), 'migrations'),
    path.join(__dirname, 'migrations'),
    path.join(__dirname, '../migrations'),
    path.join(__dirname, '../../migrations'),
  ];

  let migrationsDir: string | null = null;
  for (const dir of migrationDirs) {
    try {
      if (fs.existsSync(dir)) {
        migrationsDir = dir;
        break;
      }
    } catch {}
  }

  if (migrationsDir) {
    try {
      const files = fs.readdirSync(migrationsDir).filter((f: string) => f.endsWith('.sql')).sort();
      for (const file of files) {
        try {
          const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
          sqlite.exec(sql);
        } catch (mErr) {
          console.warn(`[BoomBazaar DB] Migration ${file} error:`, mErr);
        }
      }
      console.log('[BoomBazaar DB] Migrations applied successfully.');
      return;
    } catch (err) {
      console.warn('[BoomBazaar DB] Could not read migrations directory:', err);
    }
  }

  // Minimal embedded bootstrap schema if migrations folder is inaccessible
  try {
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image TEXT,
        display_order INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        category_id TEXT NOT NULL,
        sku TEXT UNIQUE NOT NULL,
        price INTEGER NOT NULL,
        sale_price INTEGER,
        stock INTEGER NOT NULL DEFAULT 50,
        low_stock_threshold INTEGER DEFAULT 10,
        sound_level TEXT DEFAULT 'Medium',
        altitude TEXT DEFAULT 'Ground',
        burst_effect TEXT,
        safety_instructions TEXT,
        images TEXT,
        video TEXT,
        is_featured INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS hampers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        description TEXT,
        image TEXT,
        video TEXT,
        price INTEGER NOT NULL,
        sale_price INTEGER,
        badge TEXT,
        is_featured INTEGER DEFAULT 1,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS hamper_items (
        id TEXT PRIMARY KEY,
        hamper_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_number TEXT UNIQUE NOT NULL,
        customer_id TEXT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        delivery_type TEXT NOT NULL DEFAULT 'delivery',
        address TEXT,
        notes TEXT,
        subtotal INTEGER NOT NULL,
        tax_amount INTEGER DEFAULT 0,
        delivery_fee INTEGER DEFAULT 0,
        discount_amount INTEGER DEFAULT 0,
        total_amount INTEGER NOT NULL,
        payment_status TEXT NOT NULL DEFAULT 'pending',
        payment_method TEXT DEFAULT 'cash_on_delivery',
        order_status TEXT NOT NULL DEFAULT 'Pending',
        sales_channel TEXT NOT NULL DEFAULT 'online',
        access_token TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS order_items (
        id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        product_id TEXT NOT NULL,
        product_name TEXT NOT NULL,
        sku TEXT NOT NULL,
        unit_price INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_price INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS admin_users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'admin',
        must_change_password INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (bErr) {
    console.warn('[BoomBazaar DB] Fallback bootstrap error:', bErr);
  }
}

function getLocalSQLite(): any {
  if (localDbInstance) return localDbInstance;

  // Dynamically require node:sqlite (native in Node.js 22+)
  const { DatabaseSync } = require('node:sqlite');
  const dbDir = getWritableDbDir();
  const dbPath = path.join(dbDir, 'boombazaar.sqlite');

  localDbInstance = new DatabaseSync(dbPath);
  ensureInitialized(localDbInstance);
  return localDbInstance;
}

/**
 * Cloudflare D1 REST API Client
 * Used when running on Vercel / external Node servers with Cloudflare credentials configured.
 */
function getCloudflareD1Http(): D1Database | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || process.env.CLOUDFLARE_D1_TOKEN;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID || '68376693-77c8-489e-9b66-349baf8b8755';

  if (!accountId || !apiToken || !databaseId) {
    return null;
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  async function executeHttp(sql: string, params: any[]) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudflare D1 REST API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    if (!data.success) {
      const errMessage = data.errors?.map((e: any) => e.message).join(', ') || 'Unknown Cloudflare D1 error';
      throw new Error(`Cloudflare D1 error: ${errMessage}`);
    }

    const firstResult = data.result?.[0] || { results: [], success: true, meta: { changes: 0, last_row_id: 0 } };
    return firstResult;
  }

  return {
    prepare(query: string): D1PreparedStatement {
      let boundParams: any[] = [];
      return {
        bind(...params: any[]) {
          boundParams = params.map(p => (typeof p === 'boolean' ? (p ? 1 : 0) : p === undefined ? null : p));
          return this;
        },
        async all<T = Record<string, any>>() {
          const res = await executeHttp(query, boundParams);
          return {
            results: (res.results || []) as T[],
            success: true,
          };
        },
        async first<T = Record<string, any>>(col?: string) {
          const res = await executeHttp(query, boundParams);
          const rows = res.results || [];
          if (!rows.length) return null;
          const firstRow = rows[0];
          if (col && typeof col === 'string') {
            return (firstRow[col] ?? null) as T;
          }
          return firstRow as T;
        },
        async run() {
          const res = await executeHttp(query, boundParams);
          return {
            success: true,
            meta: {
              changes: Number(res.meta?.changes ?? 0),
              last_row_id: Number(res.meta?.last_row_id ?? 0),
            },
          };
        },
        async raw<T = any[]>() {
          const res = await executeHttp(query, boundParams);
          const rows = res.results || [];
          return rows.map((r: any) => Object.values(r)) as T[];
        },
      };
    },
    async batch(statements: D1PreparedStatement[]) {
      const results: any[] = [];
      for (const stmt of statements) {
        results.push(await stmt.all());
      }
      return results;
    },
    async exec(query: string) {
      await executeHttp(query, []);
      return { count: 1, duration: 0 };
    },
  };
}

export function getDb(): D1Database {
  // 1. If running natively inside Cloudflare Workers / Pages
  if (typeof (globalThis as any).DB !== 'undefined') {
    return (globalThis as any).DB;
  }
  if (typeof (process.env as any).DB !== 'undefined' && typeof (process.env as any).DB.prepare === 'function') {
    return (process.env as any).DB;
  }

  // 2. If configured with Cloudflare D1 REST API credentials
  const d1Http = getCloudflareD1Http();
  if (d1Http) {
    return d1Http;
  }

  // 3. Local & Serverless SQLite adapter providing identical D1 API
  const sqlite = getLocalSQLite();

  return {
    prepare(query: string): D1PreparedStatement {
      let boundParams: any[] = [];
      return {
        bind(...params: any[]) {
          boundParams = params.map(p => (typeof p === 'boolean' ? (p ? 1 : 0) : p === undefined ? null : p));
          return this;
        },
        async all<T = Record<string, any>>() {
          try {
            const stmt = sqlite.prepare(query);
            const rows = stmt.all(...boundParams);
            return {
              results: rows.map((r: any) => ({ ...r })) as T[],
              success: true,
            };
          } catch (err: any) {
            console.error('D1 local all error:', err, 'Query:', query, 'Params:', boundParams);
            throw err;
          }
        },
        async first<T = Record<string, any>>(col?: string) {
          try {
            const stmt = sqlite.prepare(query);
            const row = stmt.get(...boundParams);
            if (!row) return null;
            const plainRow = { ...row };
            if (col && typeof col === 'string') {
              return (plainRow[col] ?? null) as T;
            }
            return plainRow as T;
          } catch (err: any) {
            console.error('D1 local first error:', err, 'Query:', query, 'Params:', boundParams);
            throw err;
          }
        },
        async run() {
          try {
            const stmt = sqlite.prepare(query);
            const res = stmt.run(...boundParams);
            return {
              success: true,
              meta: {
                changes: Number(res.changes || 0),
                last_row_id: Number(res.lastInsertRowid || 0),
              },
            };
          } catch (err: any) {
            console.error('D1 local run error:', err, 'Query:', query, 'Params:', boundParams);
            throw err;
          }
        },
        async raw<T = any[]>() {
          const stmt = sqlite.prepare(query);
          const rows = stmt.all(...boundParams);
          return rows.map((r: any) => Object.values(r)) as T[];
        },
      };
    },
    async batch(statements: D1PreparedStatement[]) {
      const results: any[] = [];
      for (const stmt of statements) {
        const res = await stmt.all();
        results.push(res);
      }
      return results;
    },
    async exec(query: string) {
      sqlite.exec(query);
      return { count: 1, duration: 0 };
    },
  };
}

export async function queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getDb();
  const stmt = db.prepare(sql).bind(...params);
  const res = await stmt.all<T>();
  return res.results || [];
}

export async function queryFirst<T = any>(sql: string, params: any[] = []): Promise<T | null> {
  const db = getDb();
  const stmt = db.prepare(sql).bind(...params);
  return await stmt.first<T>();
}

export async function execute(sql: string, params: any[] = []) {
  const db = getDb();
  const stmt = db.prepare(sql).bind(...params);
  return await stmt.run();
}
