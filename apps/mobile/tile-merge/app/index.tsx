import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedGameBoard } from "../components/AnimatedGameBoard";
import { GameOverlay } from "../components/GameOverlay";
import { MilestoneToast } from "../components/MilestoneToast";
import { NewGameDialog } from "../components/NewGameDialog";
import { OnboardingOverlay } from "../components/OnboardingOverlay";
import { ScoreHeader } from "../components/ScoreHeader";
import { ScorePop } from "../components/ScorePop";
import { SettingsSheet } from "../components/SettingsSheet";
import { initRewardedAds, preloadRewardedAd } from "../game/ads/rewarded";
import { palette } from "../game/colors";
import { monetizationConfig } from "../game/monetization";
import {
  defaultStats,
  loadStats,
  recordGameCompleted,
  recordMerge,
  recordPlayDay,
  saveStats,
  type PlayerStats,
} from "../game/stats";
import {
  loadBestScore,
  saveBestScore,
} from "../game/storage";
import {
  loadSavedSession,
  saveSavedSession,
} from "../game/savedSession";
import {
  loadLastRunScore,
  loadSettings,
  saveLastRunScore,
  saveSettings,
} from "../game/settings";
import { useGameSession } from "../hooks/useGameSession";
import { useKeyboardControls } from "../hooks/useKeyboardControls";

const SWIPE_DISTANCE = 24;

export default function Home() {
  const { width, height } = useWindowDimensions();
  const boardSize = Math.min(
    Math.max(width - 40, 280),
    Math.max(height * 0.48, 320),
    520,
  );

  const {
    session,
    move,
    newGame,
    undo,
    rewardedUndo,
    continuePlaying,
    hydrateBest,
    restoreSession,
    canUndo,
    canRewardedUndo,
    rewardedUndoPending,
    rewardedUndosRemaining,
    freeUndosLeft,
    moveCount,
    highestTile,
    moveFeedback,
    clearMoveFeedback,
    settings,
    updateSettings,
  } = useGameSession();

  const { game, tiles } = session;
  const hydrated = useRef(false);
  const [comparisonScore, setComparisonScore] = useState(0);
  const [shakeToken, setShakeToken] = useState(0);
  const [scorePopToken, setScorePopToken] = useState(0);
  const [activeMilestone, setActiveMilestone] = useState<number | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newGameOpen, setNewGameOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(defaultStats);
  const previousStatus = useRef(game.status);

  useEffect(() => {
    if (monetizationConfig.phase === 2) {
      void initRewardedAds().then(() => preloadRewardedAd());
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function hydrate() {
      const [best, previousRun, storedSettings, savedSession, stats] = await Promise.all([
        loadBestScore(),
        loadLastRunScore(),
        loadSettings(),
        loadSavedSession(),
        loadStats(),
      ]);
      if (!active) {
        return;
      }
      setComparisonScore(previousRun);
      updateSettings(storedSettings);
      setShowOnboarding(!storedSettings.onboardingSeen);
      const statsWithDay = recordPlayDay(stats);
      setPlayerStats(statsWithDay);
      if (statsWithDay.lastPlayedDate !== stats.lastPlayedDate) {
        void saveStats(statsWithDay);
      }

      if (savedSession) {
        restoreSession(savedSession);
        if (best > savedSession.game.best) {
          hydrateBest(best);
        }
      } else if (best > 0) {
        hydrateBest(best);
      }

      hydrated.current = true;
      setAppReady(true);
    }

    void hydrate();
    return () => {
      active = false;
    };
  }, [hydrateBest, restoreSession, updateSettings]);

  useEffect(() => {
    if (!hydrated.current) {
      return;
    }
    void saveSavedSession(session);
  }, [session]);

  useEffect(() => {
    if (!hydrated.current) {
      return;
    }
    void saveBestScore(game.best);
  }, [game.best]);

  useEffect(() => {
    if (
      hydrated.current &&
      previousStatus.current === "playing" &&
      (game.status === "lost" || game.status === "won")
    ) {
      void saveLastRunScore(game.score);
      setPlayerStats((current) => {
        const next = recordGameCompleted(current, game.score, highestTile);
        void saveStats(next);
        return next;
      });
    }
    previousStatus.current = game.status;
  }, [game.status, game.score, highestTile]);

  useEffect(() => {
    if (!moveFeedback) {
      return;
    }

    if (moveFeedback.type === "invalid") {
      setShakeToken((token) => token + 1);
      return;
    }

    if (moveFeedback.pointsGained > 0) {
      setScorePopToken((token) => token + 1);
    }

    if (moveFeedback.milestone) {
      setActiveMilestone(moveFeedback.milestone);
    }

    if (moveFeedback.merged) {
      setPlayerStats((current) => {
        const next = recordMerge(current);
        void saveStats(next);
        return next;
      });
    }
  }, [moveFeedback]);

  const handleSettingsChange = useCallback(
    (next: typeof settings) => {
      updateSettings(next);
      void saveSettings(next);
    },
    [updateSettings],
  );

  const finishOnboarding = useCallback(() => {
    const next = { ...settings, onboardingSeen: true };
    updateSettings(next);
    void saveSettings(next);
    setShowOnboarding(false);
    setOnboardingStep(0);
  }, [settings, updateSettings]);

  const gameplayBlocked =
    showOnboarding || settingsOpen || newGameOpen || game.status !== "playing";

  const guardedMove = useCallback(
    (direction: Parameters<typeof move>[0]) => {
      if (gameplayBlocked) {
        return;
      }
      move(direction);
    },
    [gameplayBlocked, move],
  );

  useKeyboardControls(guardedMove);

  const isNewBest = game.score > 0 && game.score >= game.best;

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .enabled(!gameplayBlocked)
        .onEnd((event) => {
          const { translationX, translationY } = event;
          if (
            Math.abs(translationX) < SWIPE_DISTANCE &&
            Math.abs(translationY) < SWIPE_DISTANCE
          ) {
            return;
          }

          if (Math.abs(translationX) > Math.abs(translationY)) {
            guardedMove(translationX > 0 ? "right" : "left");
            return;
          }

          guardedMove(translationY > 0 ? "down" : "up");
        }),
    [guardedMove, gameplayBlocked],
  );

  const handleNewGameRequest = useCallback(() => {
    if (settings.confirmNewGame && game.score > 0 && game.status === "playing") {
      setNewGameOpen(true);
      return;
    }
    newGame();
  }, [game.score, game.status, newGame, settings.confirmNewGame]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      {appReady ? (
      <View style={styles.container}>
        <ScoreHeader
          best={game.best}
          canRewardedUndo={canRewardedUndo}
          canUndo={canUndo}
          freeUndosLeft={freeUndosLeft}
          isNewBest={isNewBest}
          onNewGame={handleNewGameRequest}
          onOpenSettings={() => setSettingsOpen(true)}
          onRewardedUndo={() => {
            void rewardedUndo();
          }}
          onUndo={undo}
          reduceMotion={settings.reduceMotion}
          rewardedUndoPending={rewardedUndoPending}
          rewardedUndosRemaining={rewardedUndosRemaining}
          score={game.score}
        />

        <GestureDetector gesture={panGesture}>
          <View
            accessibilityLabel="Game board. Swipe or use arrow keys to move tiles."
            style={styles.boardWrap}
          >
            <AnimatedGameBoard
              reduceMotion={settings.reduceMotion}
              shakeToken={shakeToken}
              size={boardSize}
              tiles={tiles}
            />
            <ScorePop
              points={moveFeedback?.pointsGained ?? 0}
              reduceMotion={settings.reduceMotion}
              token={scorePopToken}
            />
            <MilestoneToast
              milestone={activeMilestone}
              onDone={() => {
                setActiveMilestone(null);
                clearMoveFeedback();
              }}
              reduceMotion={settings.reduceMotion}
            />
            <GameOverlay
              best={game.best}
              highestTile={highestTile}
              lastRunScore={comparisonScore}
              moveCount={moveCount}
              onContinue={continuePlaying}
              onRestart={() => {
                setComparisonScore(game.score);
                newGame();
              }}
              score={game.score}
              status={game.status}
            />
          </View>
        </GestureDetector>
      </View>
      ) : null}

      <SettingsSheet
        onChange={handleSettingsChange}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        stats={playerStats}
        visible={settingsOpen}
      />

      <NewGameDialog
        onCancel={() => setNewGameOpen(false)}
        onConfirm={() => {
          setNewGameOpen(false);
          newGame();
        }}
        score={game.score}
        visible={newGameOpen}
      />

      <OnboardingOverlay
        onNext={() => {
          if (onboardingStep >= 2) {
            finishOnboarding();
            return;
          }
          setOnboardingStep((step) => step + 1);
        }}
        onSkip={finishOnboarding}
        step={onboardingStep}
        visible={showOnboarding}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: palette.background,
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  boardWrap: {
    alignSelf: "center",
    maxWidth: 520,
    width: "100%",
  },
});
