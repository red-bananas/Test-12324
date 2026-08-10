# Play Store — Image to PDF

## Listing

| Field | Value |
|-------|-------|
| **Title** | Free Image to PDF - Offline |
| **Short description** | No watermark. 100% offline. Turn photos into PDF — free forever. |
| **Category** | Productivity |
| **Package** | `app.autoapp.imagetopdf` |

## Graphics (this app only)

**Do not use `scaffolds/mobile-expo-game/assets/`** — those are read-only template placeholders.

| Asset | Path |
|-------|------|
| Icon source (human) | `store/source/logo.png` |
| Launcher / splash / in-app | `assets/icon.png`, `adaptive-icon.png`, `splash-icon.png`, `app-logo.png` |
| Play Store listing | `store/upload/store-icon-512.png` |

Regenerate after changing the source logo:

```bash
python tools/mobile/generate-mobile-icons.py image-to-pdf
cd apps/mobile/image-to-pdf && npx expo prebuild --platform android --no-install
```

Native rebuild (`npm run android` or EAS) required for home-screen launcher icon to change on device.

On Windows path-too-long errors, build from `C:\Users\tejas.ve\temp 12\{slug}` only — see `AGENTS.md`.

## Release

Tag: `image-to-pdf@v1.0.0`

Phase 1: no ads. Phase 2 ads only after 500 installs + human approval.

## Device testing

```bash
cd apps/mobile/image-to-pdf
npm run android
```

Test: hub → camera/gallery → editor → export → share → recents update.
