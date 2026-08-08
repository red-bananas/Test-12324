# Agent instructions — Mobile (Expo) Play Store app

Read [`docs/specs/{slug}.md`](../../../docs/specs/) — **must be human-approved** before coding. Orchestrator: [`.cursor/skills/mobile-dev-cycle/SKILL.md`](../../../.cursor/skills/mobile-dev-cycle/SKILL.md).

## Archetype (`app.yaml`)

| `archetype` | Code layout |
|-------------|-------------|
| `game` | `game/state.ts` reducer + `components/` + gesture input |
| `utility` | `lib/` + `features/` + screen flows (no `game/` loop) |

Both use shared `game/monetization.ts` + `game/ads/` for AdMob (rename path to `lib/ads/` for utilities if you prefer — keep monetization config either way).

## Hard rules

1. **Spec approved** before implementation.
2. **Dependency approval:** ask human before `npm install` any package **not** in this scaffold's `package.json`.
3. **No brand copy** — distinct name, no competitor logos/colors.
4. **Don't change:** `package.json` scripts, `tests/smoke.test.tsx`, `tests/game.test.ts` (add tests, don't weaken).
5. **Tests must pass:** `npm run typecheck && npm run lint && npm test`.
6. **AdMob:** test units only in dev; see `.cursor/rules/admob-testing.mdc`. Ads need USB dev build (`npm run android`), not Expo Go.

## Pre-approved dependencies (no ask)

Already in `package.json`. You may also add without asking:

- `zustand`, `clsx`, `expo-av`, `expo-image-picker`, `expo-file-system`, `expo-sharing`

For **Skia** (`@shopify/react-native-skia`) — ask human first; run `npx expo install @shopify/react-native-skia`.

## Where to put things

| Path | Purpose |
|------|---------|
| `app/` | expo-router screens |
| `game/` | Game archetype: state, logic, ads |
| `lib/` | Utility archetype: pure logic |
| `components/` | UI |
| `tests/` | Jest |
| `PLAY_STORE.md` | Listing copy |
| `store/` | Screenshots + creative brief |

## Build approach (game)

1. Replace `app/index.tsx` with main screen.
2. Core state in `game/state.ts` — test reducer in `tests/game.test.ts`.
3. `react-native-gesture-handler` for input.
4. `expo-haptics` on key moments.
5. AsyncStorage for persistence.
6. Wire ads via `game/rewards.ts` — Phase 1 grants free; Phase 2 shows rewarded.

## Build approach (utility)

1. Replace `app/index.tsx` with main tool screen.
2. Logic in `lib/` — unit test each module.
3. Multi-step flow: `app/step-*.tsx` or single screen with sections.
4. Ads: rewarded after job done (see `mobile-ads-strategy` skill).

## Device testing

```bash
npm install --legacy-peer-deps
npm run android   # USB + Android SDK — daily driver
```

EAS preview before store: `npm run build:preview`

See [`.cursor/skills/mobile-testing/SKILL.md`](../../../.cursor/skills/mobile-testing/SKILL.md).

## Ship

[`play-store-release`](../../../.cursor/skills/play-store-release/SKILL.md) + [`store-creatives`](../../../.cursor/skills/store-creatives/SKILL.md).

Reference apps: `apps/mobile/tile-merge` (game), `apps/mobile/image-toolkit` (utility).
