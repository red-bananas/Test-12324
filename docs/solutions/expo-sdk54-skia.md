# Expo SDK 54 — Skia version

## Symptom

`expo install --check` fails or Skia crashes in Expo Go with wrong version.

## Root cause

Expo SDK 54 patch pins `@shopify/react-native-skia` to **2.2.12**. Versions 2.4.x crash on RN 0.81 in Expo Go.

## Fix

```bash
npx expo install @shopify/react-native-skia
# Trust expo install --check output
```

Default scaffold omits Skia — add only when spec requires canvas rendering.

## Prevention

Run `npx expo install --check` after dependency changes. Document in spec if Skia needed.
