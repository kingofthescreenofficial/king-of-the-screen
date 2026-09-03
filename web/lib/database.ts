import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

import type { AppState } from "@/lib/types";

const DEFAULT_DATABASE_PATH = path.join(process.cwd(), "data", "kots.sqlite");

let connection: Database.Database | null = null;

export function getDatabasePath(): string {
  return process.env.KOTS_DATABASE_PATH || DEFAULT_DATABASE_PATH;
}

function migrate(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS auction_state (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      state_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS payment_intents (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      intent_id TEXT,
      signature TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (intent_id) REFERENCES payment_intents(id)
    );
    CREATE TABLE IF NOT EXISTS reigns (
      id TEXT PRIMARY KEY,
      payment_id TEXT UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (payment_id) REFERENCES payments(id)
    );
    CREATE TABLE IF NOT EXISTS content_submissions (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS terms_acceptances (
      id TEXT PRIMARY KEY,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS reward_jobs (
      id TEXT PRIMARY KEY,
      idempotency_key TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS nft_mints (
      id TEXT PRIMARY KEY,
      reward_job_id TEXT UNIQUE,
      status TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (reward_job_id) REFERENCES reward_jobs(id)
    );
    CREATE TABLE IF NOT EXISTS telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_type TEXT NOT NULL,
      path TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS active_sessions (
      id TEXT PRIMARY KEY,
      last_seen_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);
}

export function getDatabase(): Database.Database {
  if (connection) return connection;

  const databasePath = getDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  connection = new Database(databasePath);
  connection.pragma("journal_mode = WAL");
  connection.pragma("foreign_keys = ON");
  connection.pragma("busy_timeout = 5000");
  migrate(connection);
  return connection;
}

export function closeDatabaseForTests(): void {
  connection?.close();
  connection = null;
}

export function withImmediateTransaction<T>(operation: (database: Database.Database) => T): T {
  const database = getDatabase();
  database.exec("BEGIN IMMEDIATE");
  try {
    const result = operation(database);
    database.exec("COMMIT");
    return result;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

export function readAuctionState(): AppState | null {
  const row = getDatabase().prepare("SELECT state_json FROM auction_state WHERE id = 1").get() as { state_json: string } | undefined;
  return row ? JSON.parse(row.state_json) as AppState : null;
}

export function writeAuctionState(state: AppState): void {
  const now = Date.now();
  getDatabase().prepare(`
    INSERT INTO auction_state (id, state_json, created_at, updated_at)
    VALUES (1, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
  `).run(JSON.stringify(state), now, now);
}

export function importLegacyAuctionState(filePath: string): AppState | null {
  if (readAuctionState() || !fs.existsSync(filePath)) return null;

  const candidate = JSON.parse(fs.readFileSync(filePath, "utf-8")) as AppState;
  writeAuctionState(candidate);
  return candidate;
}

export function writeTelemetryPageView(pagePath: string): void {
  const now = Date.now();
  getDatabase().prepare(
    "INSERT INTO telemetry (event_type, path, created_at, updated_at) VALUES (?, ?, ?, ?)",
  ).run("PAGE_VIEW", pagePath, now, now);
}

type LegacyTelemetryEntry = {
  timestamp?: unknown;
  type?: unknown;
  event?: unknown;
  details?: { path?: unknown };
};

function isLegacyPageView(entry: LegacyTelemetryEntry): entry is LegacyTelemetryEntry & { details: { path: string } } {
  return entry.type === "USER"
    && entry.event === "PAGE_VIEW"
    && typeof entry.details?.path === "string"
    && entry.details.path.startsWith("/")
    && entry.details.path.length <= 200;
}

export function importLegacyTelemetry(filePath: string): number {
  const database = getDatabase();
  const migrationKey = "legacy_telemetry_v1_imported";
  const completed = database.prepare("SELECT value FROM settings WHERE key = ?").get(migrationKey);
  if (completed || !fs.existsSync(filePath)) return 0;

  const insert = database.prepare(
    "INSERT INTO telemetry (event_type, path, created_at, updated_at) VALUES (?, ?, ?, ?)",
  );
  const markCompleted = database.prepare(
    "INSERT INTO settings (key, value, created_at, updated_at) VALUES (?, ?, ?, ?)",
  );

  return withImmediateTransaction(() => {
    let count = 0;
    for (const line of fs.readFileSync(filePath, "utf-8").split("\n")) {
      if (!line.trim()) continue;
      try {
        const entry = JSON.parse(line) as LegacyTelemetryEntry;
        if (!isLegacyPageView(entry)) continue;
        const parsedTime = typeof entry.timestamp === "string" ? Date.parse(entry.timestamp) : Number.NaN;
        const createdAt = Number.isFinite(parsedTime) ? parsedTime : Date.now();
        insert.run("PAGE_VIEW", entry.details.path, createdAt, createdAt);
        count += 1;
      } catch {
        // Invalid historical records are not imported.
      }
    }
    const now = Date.now();
    markCompleted.run(migrationKey, "true", now, now);
    return count;
  });

}

export function touchActiveSession(sessionId: string): void {
  const now = Date.now();
  const database = getDatabase();
  database.prepare("DELETE FROM active_sessions WHERE last_seen_at < ?").run(now - 30_000);
  database.prepare(`
    INSERT INTO active_sessions (id, last_seen_at, created_at, updated_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET last_seen_at = excluded.last_seen_at, updated_at = excluded.updated_at
  `).run(sessionId, now, now, now);
}
