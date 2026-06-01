---
name: mobile-testing
description: >-
  Test Expo mobile apps in Auto-App — static validate, Jest unit tests, Playwright
  web smoke E2E, Maestro device flows. Use when adding mobile tests, fixing mobile
  bugs, verifying before Play release, or when the user asks to test a mobile app.
---

# Mobile Testing

Automated testing for apps under `apps/mobile/{slug}/`. Follow [AGENTS.md](../../../AGENTS.md) for repo paths.

**References:** [Expo testing](https://docs.expo.dev/develop/unit-testing/), [Maestro](https://maestro.mobile.dev/), [test checklist](test-checklist.md), [tools/mobile/README.md](../../../tools/mobile/README.md).

## Device testing strategy (team convention)

Two tiers — do not skip straight to cloud builds for everyday iteration.

| Tier | When | How |
|------|------|-----|
| **Instant on phone** | While coding, bugfixes, quick UX checks | **Expo Go** — `npm run start:lan` (or `--tunnel`), same Wi‑Fi, SDK must match phone Expo Go |
| **Final on phone** | Pre-release, store upload, real install behavior | **Expo cloud (EAS Build)** — preview APK / production AAB, sideload or internal track |

**Expo Go** = fast feedback, hot reload, no build wait.  
**EAS cloud** = standalone app, correct icons/signing, haptics, persistence, Play-internal — treat as the gate before release.

Do not use Expo Go alone as sign-off for Play Store. Do not use EAS for every code tweak.

## When to use

| Situation | Start here |
|-----------|------------|
| Bugfix or new feature in a mobile app | Layer 1 → 2; Layer 3 if UI/input touched; **Expo Go** for instant phone check |
| Before Play Store / EAS production build | All layers + **EAS preview APK** + Maestro on device |
| User says "test the mobile app" | Run commands below |
| Pure game logic change | Layer 2 required; add regression case |

**Skip Maestro** for docs-only or color-only changes with passing Layer 2–3.

## Test pyramid (run in order)

```
Layer 1  validate.mjs              app.json, eas.json, required tests exist
Layer 2  Jest (in app dir)         game logic, hooks, haptics guard, smoke
Layer 3  Playwright web E2E      UI + keyboard + no web haptics crash
Layer 4  Maestro (device)          real swipes — before release only
```

## Commands

From repo root:

```bash
# Layer 1
npm run validate:mobile
npm run validate:mobile -- tile-merge

# Layer 2
npm run test:mobile
npm run test:mobile -- tile-merge

# Layer 3 — starts Expo web automatically (or reuses localhost:8081)
npm run test:e2e:mobile
npm run test:e2e:mobile -- tile-merge

# Layer 4 — device/emulator with APK installed
maestro test tools/mobile/maestro/tile-merge.yaml
```

From app directory:

```bash
cd apps/mobile/tile-merge
npm test
npm run web          # manual browser test
npx expo start --tunnel   # phone via Expo Go
```

## Layer 1 — Static validation

`tools/mobile/validate.mjs` checks:

- Registry entry in `tools/mobile/mobile.json`
- `app.json` slug, name, `android.package`
- `eas.json`, `package.json` test script
- Required test files exist

## Layer 2 — Jest unit tests

**Location:** `apps/mobile/{slug}/tests/`

| File | Purpose |
|------|---------|
| `game.test.ts` | Pure reducer / grid logic |
| `session.test.ts` | Undo, history, new game |
| `haptics.test.ts` | Web must not call native haptics |
| `storage.test.ts` | Best score persistence failures |
| `smoke.test.tsx` | Screen renders |

**Run:** `npm run test:mobile` or `npm test` inside app dir.

### Platform-safe native APIs

Wrap `expo-haptics`, AdMob, etc. with platform guards (`Platform.OS === 'web'`) and unit test the wrapper. Never call native modules directly from UI handlers.

## Layer 3 — Playwright web smoke

**Location:** `tools/mobile/tests/e2e/{slug}.spec.mjs`

Uses Expo web (`expo start --web`) as a fast regression surface. Catches:

- Render crashes
- Haptics errors on web
- Button / keyboard interactions

**Not a substitute** for Maestro swipe testing on real devices.

## Layer 4 — Maestro (device)

**Location:** `tools/mobile/maestro/{slug}.yaml`

Requires app installed (`app.autoapp.tilemerge` for Tile Merge):

- EAS preview APK, or
- Play internal track build

Install Maestro CLI once, then run flows before release.

## Phone testing during development

| Goal | Command |
|------|---------|
| **Instant test on phone (default)** | `npm run start:lan` + **Expo Go** (`exp://PC_IP:8082`) |
| Tunnel when LAN blocked | `npm run start:tunnel` + Expo Go |
| **Final test on phone (pre-release)** | `eas build --platform android --profile preview` → install APK from Expo cloud |
| Play Store internal | Upload AAB after `eas build --profile production` |

## CI

`.github/workflows/mobile-ci.yml` runs validate → Jest → Playwright web on changes to `apps/mobile/**`.

Maestro is **local/pre-release** (device/emulator not in CI yet).

## Adding tests for a new mobile app

1. Add slug to `tools/mobile/mobile.json`.
2. Copy scaffold → `apps/mobile/{slug}/`.
3. Add `app.yaml` with `lane: mobile`, `origin: manual`.
4. Ensure Jest tests pass (`tests/game.test.ts`, `tests/smoke.test.tsx` minimum).
5. Add `tools/mobile/tests/e2e/{slug}.spec.mjs`.
6. Add `tools/mobile/maestro/{slug}.yaml` before first Play release.
7. Run full pyramid locally before PR.

## Hard rules

- **Never weaken tests** to pass CI — fix app code.
- **Never skip Layer 1** because unit tests pass.
- **Add a unit regression** for every logic bug (e.g. move direction, haptics).
- **`npm run test:mobile` must exit 0** before claiming done.

## Pre-release checklist

See [test-checklist.md](test-checklist.md).
