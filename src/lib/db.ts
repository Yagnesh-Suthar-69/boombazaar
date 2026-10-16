import path from 'path';
import fs from 'fs';

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

function getLocalSQLite(): any {
  if (localDbInstance) return localDbInstance;

  // Dynamically require node:sqlite to avoid edge bundling issues if deployed
  const { DatabaseSync } = require('node:sqlite');
  const dbDir = path.join(process.cwd(), '.data');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const dbPath = path.join(dbDir, 'boombazaar.sqlite');
  localDbInstance = new DatabaseSync(dbPath);
  return localDbInstance;
}

export function getDb(): D1Database {
  // If running on Cloudflare Workers / Pages
  if (typeof (globalThis as any).DB !== 'undefined') {
    return (globalThis as any).DB;
  }
  if (typeof (process.env as any).DB !== 'undefined') {
    return (process.env as any).DB;
  }

  // Local SQLite adapter providing identical D1 API
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
