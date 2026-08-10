# Play Console AD_ID permission mismatch

## Symptom

Play Console error when uploading AAB to internal/production:

> Your advertising ID declaration says the app uses advertising ID, but a manifest in your active artifacts doesn't include `com.google.android.gms.permission.AD_ID`.

## Root cause

Play Console **Advertising ID = Yes** (required for AdMob) but `app.json` did not declare the Android permission. On API 33+, the advertising ID is zeroed without this permission.

## Fix

In `app.json`:

```json
"android": {
  "permissions": [
    "com.google.android.gms.permission.AD_ID"
  ]
}
```

Commit, rebuild production AAB, re-upload (new `versionCode`).

## Prevention

| Layer | What |
|-------|------|
| Scaffold | `scaffolds/mobile-expo-game/app.json` includes `AD_ID` when AdMob plugin is present |
| CI gate | `npm run validate:mobile -- {slug}` fails if AdMob plugin without `AD_ID` |
| Docs | `PLAY_STORE.md` ads checklist, `.cursor/rules/admob-testing.mdc` |
| Workflow | Commit before `eas build` — see `.cursor/rules/eas-build-workflow.mdc` |

## Alternative (no ads)

If you declare **Advertising ID = No**, remove AdMob from production builds and do not use real ad units. Do not use this path for rewarded-ad apps.
