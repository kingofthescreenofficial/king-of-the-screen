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
