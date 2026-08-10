import AsyncStorage from "@react-native-async-storage/async-storage";

export const STATS_KEY = "tile-merge-player-stats";

export interface PlayerStats {
  gamesPlayed: number;
  totalMerges: number;
  highestTileEver: number;
  dailyBest: number;
  dailyBestDate: string;
  lastPlayedDate: string;
  currentStreak: number;
  longestStreak: number;
}

export const defaultStats: PlayerStats = {
  gamesPlayed: 0,
  totalMerges: 0,
  highestTileEver: 0,
  dailyBest: 0,
  dailyBestDate: "",
  lastPlayedDate: "",
  currentStreak: 0,
  longestStreak: 0,
};

export function todayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function yesterdayKey(date = new Date()): string {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return todayKey(yesterday);
}

export function recordPlayDay(stats: PlayerStats, date = new Date()): PlayerStats {
  const today = todayKey(date);
  if (stats.lastPlayedDate === today) {
    return stats;
  }

  const continuedFromYesterday = stats.lastPlayedDate === yesterdayKey(date);
  const currentStreak = continuedFromYesterday ? stats.currentStreak + 1 : 1;

  return {
    ...stats,
    lastPlayedDate: today,
    currentStreak,
    longestStreak: Math.max(stats.longestStreak, currentStreak),
  };
}

export function recordMerge(stats: PlayerStats): PlayerStats {
  return {
    ...stats,
    totalMerges: stats.totalMerges + 1,
  };
}

export function recordGameCompleted(
  stats: PlayerStats,
  score: number,
  highestTile: number,
  date = new Date(),
): PlayerStats {
  const today = todayKey(date);
  const withDay = recordPlayDay(stats, date);
  const dailyBest =
    withDay.dailyBestDate === today
      ? Math.max(withDay.dailyBest, score)
      : score;

  return {
    ...withDay,
    gamesPlayed: withDay.gamesPlayed + 1,
    highestTileEver: Math.max(withDay.highestTileEver, highestTile),
    dailyBest,
    dailyBestDate: today,
  };
}

export async function loadStats(): Promise<PlayerStats> {
  try {
    const stored = await AsyncStorage.getItem(STATS_KEY);
    if (!stored) {
      return { ...defaultStats };
    }
    const parsed = JSON.parse(stored) as Partial<PlayerStats>;
    return { ...defaultStats, ...parsed };
  } catch {
    return { ...defaultStats };
  }
}

export async function saveStats(stats: PlayerStats): Promise<void> {
  try {
    await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Non-critical persistence.
  }
}
