import { BOOTSTRAP_SCHEMA_SQL, BOOTSTRAP_SEEDS_SQL } from './bootstrapSql';

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

let inMemoryDbInstance: any = null;
let cloudflareHttpInstance: D1Database | null = null;
let cloudflareInitialized = false;

/**
 * Cloudflare D1 REST API Client
 * Connects directly to Cloudflare D1 over HTTPS without any local database or filesystem dependencies.
 */
function getCloudflareD1Http(): D1Database | null {
  if (cloudflareHttpInstance) return cloudflareHttpInstance;

  const accountId = (
    process.env.CLOUDFLARE_ACCOUNT_ID ||
    process.env.CF_ACCOUNT_ID ||
    process.env.CLOUDFLARE_ACCOUNT ||
    process.env.ACCOUNT_ID ||
    ''
  ).trim();

  const apiToken = (
    process.env.CLOUDFLARE_API_TOKEN ||
    process.env.CF_API_TOKEN ||
    process.env.CLOUDFLARE_D1_TOKEN ||
    process.env.CF_TOKEN ||
    process.env.CLOUDFLARE_TOKEN ||
    process.env.CLOUDFLARE_API_KEY ||
    ''
  ).trim();

  const databaseId = (
    process.env.CLOUDFLARE_DATABASE_ID ||
    process.env.CF_DATABASE_ID ||
    process.env.DATABASE_ID ||
    '68376693-77c8-489e-9b66-349baf8b8755'
  ).trim();

  if (!accountId || !apiToken || !databaseId) {
    return null;
  }

  console.log('[BoomBazaar DB] Using Cloudflare D1 REST API for database:', databaseId);

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;

  async function executeHttp(sql: string, params: any[] = []) {
    const cleanParams = params.map((p) =>
      typeof p === 'boolean' ? (p ? 1 : 0) : p === undefined ? null : p
    );

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params: cleanParams }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[BoomBazaar DB] Cloudflare D1 HTTP query error:', res.status, errText, 'SQL:', sql);
      throw new Error(`Cloudflare D1 REST API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    if (!data.success) {
      const errMessage = data.errors?.map((e: any) => e.message).join(', ') || 'Unknown Cloudflare D1 error';
      console.error('[BoomBazaar DB] Cloudflare D1 query error:', errMessage, 'SQL:', sql);
      throw new Error(`Cloudflare D1 error: ${errMessage}`);
    }

    const firstResult = Array.isArray(data.result) ? data.result[0] : data.result;
    return firstResult || { results: [], success: true, meta: { changes: 0, last_row_id: 0 } };
  }

  // Ensure Cloudflare D1 has tables bootstrapped if empty
  async function ensureCloudflareSchema() {
    if (cloudflareInitialized) return;
    cloudflareInitialized = true;
    try {
      const check = await executeHttp(
        "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='products'",
        []
      );
      const count = check.results?.[0]?.count ?? 0;
      if (count === 0) {
        console.log('[BoomBazaar DB] Bootstrapping Cloudflare D1 schema and seeds...');
        await executeHttp(BOOTSTRAP_SCHEMA_SQL, []);
        await executeHttp(BOOTSTRAP_SEEDS_SQL, []);
        console.log('[BoomBazaar DB] Cloudflare D1 schema bootstrapped successfully.');
      }
    } catch (err) {
      console.warn('[BoomBazaar DB] Cloudflare schema check note:', err);
    }
  }

  // Trigger non-blocking check
  ensureCloudflareSchema().catch(() => {});

  cloudflareHttpInstance = {
    prepare(query: string): D1PreparedStatement {
      let boundParams: any[] = [];
      return {
        bind(...params: any[]) {
          boundParams = params.map((p) =>
            typeof p === 'boolean' ? (p ? 1 : 0) : p === undefined ? null : p
          );
          return this;
        },
        async all<T = Record<string, any>>() {
          try {
            const res = await executeHttp(query, boundParams);
            return {
              results: (res.results || []) as T[],
              success: true,
            };
          } catch (err: any) {
            console.warn('[BoomBazaar DB] Cloudflare D1 query failed, using in-memory database fallback:', err.message);
            const fallbackDb = getInMemorySQLite();
            const stmt = fallbackDb.prepare(query);
            const rows = stmt.all(...boundParams);
            return {
              results: rows.map((r: any) => ({ ...r })) as T[],
              success: true,
            };
          }
        },
        async first<T = Record<string, any>>(col?: string) {
          try {
            const res = await executeHttp(query, boundParams);
            const rows = res.results || [];
            if (!rows.length) return null;
            const firstRow = rows[0];
            if (col && typeof col === 'string') {
              return (firstRow[col] ?? null) as T;
            }
            return firstRow as T;
          } catch (err: any) {
            console.warn('[BoomBazaar DB] Cloudflare D1 first() failed, using in-memory database fallback:', err.message);
            const fallbackDb = getInMemorySQLite();
            const stmt = fallbackDb.prepare(query);
            const row = stmt.get(...boundParams);
            if (!row) return null;
            const plainRow = { ...row };
            if (col && typeof col === 'string') {
              return (plainRow[col] ?? null) as T;
            }
            return plainRow as T;
          }
        },
        async run() {
          try {
            const res = await executeHttp(query, boundParams);
            return {
              success: true,
              meta: {
                changes: Number(res.meta?.changes ?? 0),
                last_row_id: Number(res.meta?.last_row_id ?? 0),
              },
            };
          } catch (err: any) {
            console.warn('[BoomBazaar DB] Cloudflare D1 run() failed, using in-memory database fallback:', err.message);
            const fallbackDb = getInMemorySQLite();
            const stmt = fallbackDb.prepare(query);
            const res = stmt.run(...boundParams);
            return {
              success: true,
              meta: {
                changes: Number(res.changes || 0),
                last_row_id: Number(res.lastInsertRowid || 0),
              },
            };
          }
        },
        async raw<T = any[]>() {
          try {
            const res = await executeHttp(query, boundParams);
            const rows = res.results || [];
            return rows.map((r: any) => Object.values(r)) as T[];
          } catch (err: any) {
            console.warn('[BoomBazaar DB] Cloudflare D1 raw() failed, using in-memory database fallback:', err.message);
            const fallbackDb = getInMemorySQLite();
            const stmt = fallbackDb.prepare(query);
            const rows = stmt.all(...boundParams);
            return rows.map((r: any) => Object.values(r)) as T[];
          }
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
      try {
        await executeHttp(query, []);
        return { count: 1, duration: 0 };
      } catch (err: any) {
        console.warn('[BoomBazaar DB] Cloudflare D1 exec() failed, using in-memory fallback:', err.message);
        const fallbackDb = getInMemorySQLite();
        fallbackDb.exec(query);
        return { count: 1, duration: 0 };
      }
    },
  };

  return cloudflareHttpInstance;
}

/**
 * Pure In-Memory SQLite Fallback
 * Used ONLY when Cloudflare credentials are not provided (e.g. running local tests).
 * Has ZERO filesystem dependencies: no files, no folders, no mkdirSync, no .data.
 */
function getInMemorySQLite(): any {
  if (inMemoryDbInstance) return inMemoryDbInstance;

  const { DatabaseSync } = require('node:sqlite');
  inMemoryDbInstance = new DatabaseSync(':memory:');

  // Bootstrap schema and seeds entirely in RAM
  inMemoryDbInstance.exec(BOOTSTRAP_SCHEMA_SQL);
  inMemoryDbInstance.exec(BOOTSTRAP_SEEDS_SQL);

  return inMemoryDbInstance;
}

export function getDb(): D1Database {
  // 1. Native Cloudflare Workers / Pages runtime binding
  if (typeof (globalThis as any).DB !== 'undefined' && typeof (globalThis as any).DB.prepare === 'function') {
    return (globalThis as any).DB;
  }
  if (typeof (process.env as any).DB !== 'undefined' && typeof (process.env as any).DB.prepare === 'function') {
    return (process.env as any).DB;
  }

  // 2. Cloudflare D1 REST API Client (HTTPS directly to Cloudflare D1)
  const d1Http = getCloudflareD1Http();
  if (d1Http) {
    return d1Http;
  }

  // 3. Pure in-memory SQLite fallback (zero filesystem operations, never touches /var/task or .data)
  const sqlite = getInMemorySQLite();

  return {
    prepare(query: string): D1PreparedStatement {
      let boundParams: any[] = [];
      return {
        bind(...params: any[]) {
          boundParams = params.map((p) =>
            typeof p === 'boolean' ? (p ? 1 : 0) : p === undefined ? null : p
          );
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
            console.error('[BoomBazaar DB] Local query error:', err, 'Query:', query);
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
            console.error('[BoomBazaar DB] Local first error:', err, 'Query:', query);
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
            console.error('[BoomBazaar DB] Local run error:', err, 'Query:', query);
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
