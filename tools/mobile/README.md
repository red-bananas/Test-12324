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

## Release (automated)

Tag or dispatch → EAS build → Play **internal** track. Full guide: [apps/mobile/tile-merge/PLAY_STORE.md](../../apps/mobile/tile-merge/PLAY_STORE.md).

```bash
# From repo root — dispatch CI
npm run release:tile-merge -- -Version 1.0.0 -Watch

# Or git tag (same workflow)
git tag tile-merge@v1.0.0 && git push origin tile-merge@v1.0.0
```

**GitHub secrets required:** `EXPO_TOKEN`, `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY`

```bash
node tools/mobile/sync-version.mjs tile-merge 1.0.0   # manual version sync (CI runs this)
```

See [`.cursor/skills/mobile-testing/SKILL.md`](../../.cursor/skills/mobile-testing/SKILL.md).
