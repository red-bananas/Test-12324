# USB dev build (Android)

## Symptom

AdMob or native modules do not work; only Expo Go tested.

## Root cause

Expo Go is a sandbox without custom native binaries.

## Fix

One-time setup:

```powershell
# From repo root (Windows)
powershell -ExecutionPolicy Bypass -File tools/mobile/setup-android-cli.ps1
```

Per session:

1. Enable USB debugging on phone
2. Connect USB; verify `adb devices`
3. In app dir: `npm install --legacy-peer-deps && npm run android`

First build slow (~5–15 min); later builds incremental.

## Prevention

`mobile-testing` skill tier B = USB dev build, not Expo Go default.
