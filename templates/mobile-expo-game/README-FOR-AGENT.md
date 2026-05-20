# Agent instructions — Mobile (Expo + Skia) game clone

You are building a **single-player, offline casual game** in this Expo (React Native) + TypeScript project. Read `clone-spec.json` at the repo root for the target spec.

## Hard rules (non-negotiable)

1. **Single-player, offline only.** No multiplayer, no server, no auth, no IAP, no leaderboard backend. State persists via `expo-secure-store` or `AsyncStorage` if needed.
2. **No brand copy.** Do NOT use the original game's name, character art descriptions, logo, brand colors, or marketing copy. Use `distinct_name` from the spec.
3. **Don't change these files:**
   - `package.json` scripts section
   - `app.json` slug, name, package, bundleIdentifier
   - `tests/smoke.test.tsx` (add more tests, but don't delete or weaken this one)
4. **Tests must pass.** `npm test` (Jest + jest-expo) must exit 0.

## Where to put things

- Routes live in `app/`. Home screen is `app/index.tsx`. Add screens as `app/<screen>.tsx` and link via `expo-router`.
- Game-loop logic goes in `game/` (create the folder). Keep the React tree thin and the game state in a single reducer or zustand store.
- Reusable UI in `components/`.
- Tests: `tests/*.test.tsx`, `@testing-library/react-native` + jest-expo preset.

## Game-loop pattern (important — read this carefully)

For real-time games (Snake, Tetris-likes, endless runners), use **`useFrameCallback`** from `react-native-reanimated`:

```tsx
import { useFrameCallback } from "react-native-reanimated";

useFrameCallback((info) => {
  // info.timeSincePreviousFrame_ms — use this to advance game state by dt
}, true);
```

For turn-based games (2048, Sudoku, Memory, Tic-tac-toe), no frame loop is needed — render on state change.

For rendering, prefer **`@shopify/react-native-skia`** for canvas-based visuals (grid, sprites drawn with shapes). Use plain React Native `<View>` for menus and simple grids.

## Build approach

1. Replace `app/index.tsx` with the main game screen.
2. Add a route `app/menu.tsx` if the spec needs a menu/start screen.
3. Put core game state (board, score, status) in `game/state.ts` as a pure reducer. Test the reducer directly with Jest — game logic tests are the most valuable kind.
4. Use `react-native-gesture-handler` for swipe/tap input. Avoid `PanResponder` (it's older).
5. Persist high score / progress in `AsyncStorage`.
6. Add at least 2 game-logic tests beyond the smoke test (e.g., "tile merge produces correct score", "game-over triggers when board full").

## Allowed dependency additions

You may add: `zustand`, `@react-native-async-storage/async-storage`, `expo-haptics`, `expo-av` (for sound effects — but generate your own audio, don't reference original game's audio), `clsx`.

For anything else, write it yourself.

## Visual identity

Pick a palette and shape language clearly distinct from the original. Examples:
- Original is bright/cartoon → use minimalist monochrome with one accent color.
- Original is dark/neon → use warm pastels.
- Never reuse the original sprite designs; build from primitives (rectangles, circles, gradients).

## When stuck

If a feature is too complex for one iteration, ship a working minimal version with a TODO comment. Keep `npm test` green at all times.
