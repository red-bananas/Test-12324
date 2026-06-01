# Mobile apps tooling

Mirrors `tools/extensions/` for Expo apps under `apps/mobile/{slug}/`.

## Registry

`mobile.json` lists shipped mobile apps, Android package names, and paths.

## Commands (from repo root)

```bash
node tools/mobile/validate.mjs
node tools/mobile/validate.mjs tile-merge
npm run test:mobile
npm run test:mobile -- tile-merge
npm run test:e2e:mobile
npm run test:e2e:mobile -- tile-merge
```

## Device testing

| Method | When |
|--------|------|
| Expo Go | Daily dev — `cd apps/mobile/tile-merge && npx expo start --tunnel` |
| EAS preview APK | Real installed app — `eas build --platform android --profile preview` |
| Maestro | Pre-release swipe/regression — `maestro test tools/mobile/maestro/tile-merge.yaml` |
| Play internal | After Play Console setup — upload AAB to internal track |

See [`.cursor/skills/mobile-testing/SKILL.md`](../../.cursor/skills/mobile-testing/SKILL.md).
