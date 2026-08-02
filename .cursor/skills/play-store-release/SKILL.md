---
name: play-store-release
description: >-
  Google Play Store release checklist for Auto-App mobile apps. Use before first
  submit, version bumps, or when preparing listing copy, privacy policy, and
  Play Console declarations.
---

# Play Store Release

Human approves final submit. Agent prepares all artifacts.

Reference: [`apps/mobile/tile-merge/PLAY_STORE.md`](../../../apps/mobile/tile-merge/PLAY_STORE.md)

## Pre-flight checklist

### App package

- [ ] `app.yaml` complete (slug, androidPackage, monetization, status)
- [ ] `app.json` version + `android.versionCode` bumped
- [ ] `PLAY_STORE.md` listing copy current
- [ ] `PRIVACY.md` matches actual data collection
- [ ] Privacy policy URL live (GitHub Pages pattern from tile-merge)
- [ ] `npm run validate:mobile -- {slug}` passes
- [ ] All tests green + USB device QA approved

### EAS build

```bash
cd apps/mobile/{slug}
eas build --platform android --profile preview    # QA APK
eas build --platform android --profile production # AAB for store
```

- Preview: `EXPO_PUBLIC_USE_PRODUCTION_ADS=false`
- Production: `EXPO_PUBLIC_USE_PRODUCTION_ADS=true` (only if Phase 2 ads enabled)

### Play Console (agent drafts; human submits)

- [ ] App created with correct package name
- [ ] **Store listing:** title, short description (80 chars), full description
- [ ] **Graphics:** icon 512, feature graphic 1024×500, phone screenshots — see `store-creatives`
- [ ] **App content:** ads declaration, **Advertising ID** (must match manifest `AD_ID` permission), content rating questionnaire, target audience
- [ ] **Data safety:** declare local-only storage accurately
- [ ] **Testing track:** internal → closed → production (never skip internal first)
- [ ] Link AdMob app to Play listing

### Automated release (repo)

```bash
git tag {slug}@v{version} && git push origin {slug}@v{version}
```

Workflow: `.github/workflows/mobile-release.yml`

Secrets: `EXPO_TOKEN`, `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY`

## Listing copy rules

- Benefit-first title; include primary keyword naturally
- Short description = hook in 80 chars
- Full description: how to play/use, privacy, offline, no account
- No competitor trademark names
- Mention rewarded ads honestly if Phase 2 enabled

## Versioning

- Semantic version in `app.json` `expo.version`
- `android.versionCode` must increment every Play upload (integer)

## After submit

- [ ] Verify internal track install on phone
- [ ] Smoke test ads with test units on preview before production ads
- [ ] Start [`mobile-monitoring`](../mobile-monitoring/SKILL.md) week-1 review
