# AdMob test IDs

## Symptom

Risk of invalid traffic / account suspension from clicking own ads in dev.

## Root cause

Production ad unit IDs wired in dev or preview builds.

## Fix

- `game/ads/rewarded.ts` returns Google test IDs unless `EXPO_PUBLIC_USE_PRODUCTION_ADS=true`
- EAS `preview` profile: `EXPO_PUBLIC_USE_PRODUCTION_ADS=false`
- EAS `production` profile: `EXPO_PUBLIC_USE_PRODUCTION_ADS=true`

Test rewarded unit: `ca-app-pub-3940256099942544/5224354917`

## Prevention

See `.cursor/rules/admob-testing.mdc`. Never test ads in Expo Go.

For Play Console **Advertising ID** declaration errors, see [play-ad-id-permission.md](./play-ad-id-permission.md).
