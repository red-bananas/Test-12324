import AsyncStorage from "@react-native-async-storage/async-storage";
import type { GameSession } from "./sessionTypes";
import { monetizationConfig } from "./monetization";
import { ensureUniqueTileIds, type DisplayTile } from "./tiles";

export const SAVED_SESSION_KEY = "tile-merge-saved-session";
const SCHEMA_VERSION = 1;

interface StoredSessionPayload {
  version: number;
  session: GameSession;
}

function normalizeSession(raw: Partial<GameSession>): GameSession | null {
  if (!raw.game?.grid || !Array.isArray(raw.tiles)) {
    return null;
  }

  return {
    game: raw.game,
    tiles: ensureUniqueTileIds(raw.tiles as DisplayTile[]),
    history: Array.isArray(raw.history) ? raw.history : [],
    freeUndosLeft:
      typeof raw.freeUndosLeft === "number"
        ? Math.max(0, raw.freeUndosLeft)
        : monetizationConfig.freeUndosPerGame,
    rewardedUndosUsed:
      typeof raw.rewardedUndosUsed === "number"
        ? Math.max(0, raw.rewardedUndosUsed)
        : 0,
    moveCount: typeof raw.moveCount === "number" ? Math.max(0, raw.moveCount) : 0,
  };
}

export async function loadSavedSession(): Promise<GameSession | null> {
  try {
    const stored = await AsyncStorage.getItem(SAVED_SESSION_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as StoredSessionPayload | GameSession;

    if ("version" in parsed && parsed.version === SCHEMA_VERSION) {
      return normalizeSession(parsed.session);
    }

    return normalizeSession(parsed as Partial<GameSession>);
  } catch {
    return null;
  }
}

export async function saveSavedSession(session: GameSession): Promise<void> {
  try {
    const payload: StoredSessionPayload = {
      version: SCHEMA_VERSION,
      session,
    };
    await AsyncStorage.setItem(SAVED_SESSION_KEY, JSON.stringify(payload));
  } catch {
    // Resume save failure must not break gameplay.
  }
}

export async function clearSavedSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVED_SESSION_KEY);
  } catch {
    // Non-critical.
  }
}
