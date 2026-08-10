jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

import {
  defaultStats,
  recordGameCompleted,
  recordMerge,
  recordPlayDay,
  todayKey,
} from "../game/stats";

describe("player stats", () => {
  it("starts a streak on first play day", () => {
    const next = recordPlayDay(defaultStats, new Date("2026-06-02"));
    expect(next.currentStreak).toBe(1);
    expect(next.lastPlayedDate).toBe("2026-06-02");
  });

  it("extends streak when playing on consecutive days", () => {
    const dayOne = recordPlayDay(defaultStats, new Date("2026-06-01"));
    const dayTwo = recordPlayDay(dayOne, new Date("2026-06-02"));
    expect(dayTwo.currentStreak).toBe(2);
    expect(dayTwo.longestStreak).toBe(2);
  });

  it("resets streak after a missed day", () => {
    const dayOne = recordPlayDay(defaultStats, new Date("2026-06-01"));
    const dayThree = recordPlayDay(dayOne, new Date("2026-06-03"));
    expect(dayThree.currentStreak).toBe(1);
    expect(dayThree.longestStreak).toBe(1);
  });

  it("increments merge count", () => {
    const next = recordMerge(defaultStats);
    expect(next.totalMerges).toBe(1);
  });

  it("records game completion with daily best", () => {
    const next = recordGameCompleted(defaultStats, 512, 64, new Date("2026-06-02"));
    expect(next.gamesPlayed).toBe(1);
    expect(next.dailyBest).toBe(512);
    expect(next.dailyBestDate).toBe("2026-06-02");
    expect(next.highestTileEver).toBe(64);
  });

  it("uses local date for todayKey", () => {
    expect(todayKey(new Date("2026-06-02T10:00:00"))).toBe("2026-06-02");
  });
});
