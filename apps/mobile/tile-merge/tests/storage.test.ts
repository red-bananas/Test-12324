import AsyncStorage from "@react-native-async-storage/async-storage";
import { loadBestScore, saveBestScore, BEST_SCORE_KEY } from "../game/storage";

jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);

describe("best score storage", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("returns 0 when nothing is stored", async () => {
    await expect(loadBestScore()).resolves.toBe(0);
  });

  it("loads a stored best score", async () => {
    await AsyncStorage.setItem(BEST_SCORE_KEY, "128");
    await expect(loadBestScore()).resolves.toBe(128);
  });

  it("returns 0 for invalid stored values", async () => {
    await AsyncStorage.setItem(BEST_SCORE_KEY, "not-a-number");
    await expect(loadBestScore()).resolves.toBe(0);
  });

  it("persists best score", async () => {
    await saveBestScore(256);
    await expect(AsyncStorage.getItem(BEST_SCORE_KEY)).resolves.toBe("256");
  });

  it("does not throw when storage read fails", async () => {
    jest.spyOn(AsyncStorage, "getItem").mockRejectedValueOnce(new Error("blocked"));
    await expect(loadBestScore()).resolves.toBe(0);
  });

  it("does not throw when storage write fails", async () => {
    jest.spyOn(AsyncStorage, "setItem").mockRejectedValueOnce(new Error("blocked"));
    await expect(saveBestScore(64)).resolves.toBeUndefined();
  });
});
