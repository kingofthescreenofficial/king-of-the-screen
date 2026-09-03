import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  closeDatabaseForTests,
  getDatabase,
  importLegacyAuctionState,
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
    stats: { longestReignKing: "Fixture", longestReignSeconds: 1, targetGoalUsd: 100, totalDethronements: 1, totalRaisedUsd: 1 },
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
});
