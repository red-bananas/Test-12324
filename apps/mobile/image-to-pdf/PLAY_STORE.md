# Play Store — Image to PDF

## Listing

| Field | Value |
|-------|-------|
| **Title** | Free Image to PDF - Offline |
| **Short description** | No watermark. 100% offline. Turn photos into PDF — free forever. |
| **Category** | Productivity |
| **Package** | `app.autoapp.imagetopdf` |

## Release

Tag: `image-to-pdf@v1.0.0`

Phase 1: no ads. Phase 2 ads only after 500 installs + human approval.

## Device testing

```bash
cd apps/mobile/image-to-pdf
npm run android
```

Test: hub → camera/gallery → editor → export → share → recents update.
