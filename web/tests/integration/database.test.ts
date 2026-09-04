import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  closeDatabaseForTests,
  getDatabase,
  importLegacyAuctionState,
  importLegacyTelemetry,
  readAuctionState,
  writeAuctionState,
  touchActiveSession,
  writeTelemetryPageView,
} from "@/lib/database";
import type { AppState } from "@/lib/types";

let fixtureDirectory = "";

function stateFixture(): AppState {
  return {
    currentKing: {
      id: "king-fixture",
      nickname: "Fixture",
      tagline: "Persisted",
      mediaUrl: "https://example.test/fixture.png",
      mediaType: "image",
      paidAmountUsd: 1,
      cryptoCurrency: "SOL",
      crownedAt: 1,
    },
    nextMinPriceUsd: 2,
    stats: { longestReignKing: "Fixture", longestReignSeconds: 1, settledCrownCount: 0, targetGoalUsd: 100, totalDethronements: 1, totalRaisedUsd: 1 },
    hallOfFame: [],
    recentEvents: [],
    walletConfig: { evmAddress: "", solanaAddress: "", usdtTrc20Address: "" },
  };
}

beforeEach(() => {
  closeDatabaseForTests();
  fixtureDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "kots-db-"));
  process.env.KOTS_DATABASE_PATH = path.join(fixtureDirectory, "kots.sqlite");
});

afterEach(() => {
  closeDatabaseForTests();
  delete process.env.KOTS_DATABASE_PATH;
  fs.rmSync(fixtureDirectory, { force: true, recursive: true });
});

describe("durable auction storage", () => {
  it("initializes WAL tables and persists state", () => {
    const database = getDatabase();
    expect(database.pragma("journal_mode", { simple: true })).toBe("wal");
    expect(database.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'reward_jobs'").get()).toBeTruthy();

    writeAuctionState(stateFixture());
    expect(readAuctionState()).toMatchObject({ currentKing: { id: "king-fixture" }, nextMinPriceUsd: 2 });

    writeTelemetryPageView("/");
    expect(database.prepare("SELECT COUNT(*) AS count FROM telemetry").get()).toEqual({ count: 1 });

    touchActiveSession("session123");
    expect(database.prepare("SELECT COUNT(*) AS count FROM active_sessions").get()).toEqual({ count: 1 });
  });

  it("imports legacy state once without overwriting durable state", () => {
    const legacyPath = path.join(fixtureDirectory, "state.json");
    fs.writeFileSync(legacyPath, JSON.stringify(stateFixture()));

    expect(importLegacyAuctionState(legacyPath)).toMatchObject({ currentKing: { id: "king-fixture" } });
    expect(importLegacyAuctionState(legacyPath)).toBeNull();
  });

  it("imports only safe legacy page views once", () => {
    const legacyPath = path.join(fixtureDirectory, "telemetry.jsonl");
    fs.writeFileSync(legacyPath, [
      JSON.stringify({ timestamp: "2026-01-01T00:00:00.000Z", type: "USER", event: "PAGE_VIEW", details: { path: "/" } }),
      JSON.stringify({ type: "USER", event: "WALLET_CONNECTED", details: { path: "/", signature: "secret" } }),
      "not-json",
    ].join("\n"));

    expect(importLegacyTelemetry(legacyPath)).toBe(1);
    expect(importLegacyTelemetry(legacyPath)).toBe(0);
    expect(getDatabase().prepare("SELECT event_type, path FROM telemetry").all()).toEqual([{ event_type: "PAGE_VIEW", path: "/" }]);
  });

  it("backs up and restores a consistent SQLite snapshot", () => {
    writeAuctionState(stateFixture());
    closeDatabaseForTests();

    const backupPath = path.join(fixtureDirectory, "backup.sqlite");
    execFileSync(process.execPath, ["scripts/db-backup.mjs", backupPath], {
      cwd: path.resolve(process.cwd()),
      env: process.env,
    });

    const restoredPath = path.join(fixtureDirectory, "restored.sqlite");
    process.env.KOTS_DATABASE_PATH = restoredPath;
    execFileSync(process.execPath, ["scripts/db-restore.mjs", backupPath], {
      cwd: path.resolve(process.cwd()),
      env: process.env,
    });

    expect(readAuctionState()).toMatchObject({ currentKing: { id: "king-fixture" } });
  });

  it("returns SQLITE_BUSY to a second writer without corrupting data", () => {
    const database = getDatabase();
    database.exec("BEGIN IMMEDIATE");
    try {
      const writer = spawnSync(process.execPath, ["-e", `
        const Database = require("better-sqlite3");
        const database = new Database(process.env.KOTS_DATABASE_PATH);
        database.pragma("busy_timeout = 25");
        try {
          database.prepare("INSERT INTO telemetry (event_type, path, created_at, updated_at) VALUES ('PAGE_VIEW', '/', 1, 1)").run();
          process.exit(0);
        } catch (error) {
          process.exit(error && error.code === "SQLITE_BUSY" ? 2 : 1);
        } finally {
          database.close();
        }
      `], { env: process.env });
      expect(writer.status).toBe(2);
    } finally {
      database.exec("ROLLBACK");
    }

    expect(database.prepare("SELECT COUNT(*) AS count FROM telemetry").get()).toEqual({ count: 0 });
  });
});
