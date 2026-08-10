# Play Store — Image to PDF

## Listing

| Field | Value |
|-------|-------|
| **Title** | Free Image to PDF - Offline |
| **Short description** | No watermark. 100% offline. Turn photos into PDF — free forever. |
| **Category** | Productivity |
| **Package** | `app.autoapp.imagetopdf` |

## Privacy policy (Play Console)

```
https://red-bananas.github.io/Test-12324/privacy/image-to-pdf.html
```

Paste that URL in **Play Console → App content → Privacy policy**.

- Source HTML: `docs/privacy/image-to-pdf.html`
- Markdown source: [PRIVACY.md](./PRIVACY.md)
- Deployed by GitHub Pages when `main` is pushed (see `.github/workflows/pages.yml`)
- Do **not** use a `github.com/.../blob/...` link — use the `github.io` URL above

**One-time GitHub setup:** Repo **Settings → Pages → Build and deployment → GitHub Actions**. After the first `main` push with `docs/privacy/`, wait ~1–2 minutes and open the URL in a browser to confirm it loads.

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
