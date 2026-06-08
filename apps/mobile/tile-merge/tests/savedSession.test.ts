import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSession } from "../hooks/useGameSession";
import {
  loadSavedSession,
  saveSavedSession,
  SAVED_SESSION_KEY,
} from "../game/savedSession";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

jest.mock("../game/haptics", () => ({
  triggerMergeHaptic: jest.fn(),
  triggerInvalidMoveHaptic: jest.fn(),
}));

describe("saved session persistence", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("round-trips a session with undo allowance and move count", async () => {
    const session = {
      ...createSession(128),
      freeUndosLeft: 2,
      moveCount: 14,
    };

    await saveSavedSession(session);
    const loaded = await loadSavedSession();

    expect(loaded?.game.best).toBe(128);
    expect(loaded?.freeUndosLeft).toBe(2);
    expect(loaded?.moveCount).toBe(14);
    expect(loaded?.tiles.length).toBeGreaterThan(0);
  });

  it("returns null for invalid stored payloads", async () => {
    await AsyncStorage.setItem(SAVED_SESSION_KEY, JSON.stringify({ broken: true }));
    expect(await loadSavedSession()).toBeNull();
  });
});
