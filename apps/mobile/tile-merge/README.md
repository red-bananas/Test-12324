# Tile Merge

Offline 4×4 sliding-tile puzzle for Android/iOS (Expo).

## Run locally

```bash
cd apps/mobile/tile-merge
npm install --legacy-peer-deps
npm test
npm start          # Expo Go on phone (scan QR)
npm run web        # Browser at http://localhost:8081
```

Scan the QR code with **Expo Go** on your phone (same Wi‑Fi), or open **http://localhost:8081** in a browser for quick testing.

**Web controls:** arrow keys or WASD. Haptics are native-only and safely skipped on web.

## Build APK (internal testing)

```bash
npx eas-cli build --platform android --profile preview
```

Requires an [Expo](https://expo.dev) account and `eas login`.

## Features (v1)

- Swipe to merge tiles
- Score + best score (saved locally)
- Undo last move
- Win at 2048 with continue option
- Resume where you left off (auto-save)
- Dark theme, haptic feedback

## Play Store

Listing copy, privacy policy, and release checklist: [PLAY_STORE.md](./PLAY_STORE.md).

## Spec

See [docs/specs/tile-merge.md](../../../docs/specs/tile-merge.md).

## Test from repo root

```bash
npm run validate:mobile -- tile-merge
npm run test:mobile -- tile-merge
npm run test:e2e:mobile -- tile-merge
maestro test tools/mobile/maestro/tile-merge.yaml
```

See [`.cursor/skills/mobile-testing/SKILL.md`](../../../.cursor/skills/mobile-testing/SKILL.md).
