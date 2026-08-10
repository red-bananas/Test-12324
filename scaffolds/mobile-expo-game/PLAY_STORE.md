# {App Name} — Google Play Store

Package: `{android.package}` · Expo slug: `{slug}`

## Store listing (copy-paste)

### App name

**{Store listing title — max 30 chars}**

### Short description (80 chars max)

```
{One-line benefit. Offline. No account.}
```

### Full description

```
{Full Play Store description — how to use, privacy, offline, ads honesty if Phase 2}
```

## Pre-launch checklist

- [ ] Privacy policy URL live → update `game/monetization.ts` `PRIVACY_POLICY_URL`
- [ ] AdMob app ID in `app.json` + `game/monetization.ts`
- [ ] `npm run validate:mobile -- {slug}` passes
- [ ] USB dev build tested (`npm run android`)
- [ ] EAS preview APK tested on phone
- [ ] Store graphics in `store/upload/` — see `store/CREATIVES-BRIEF.md`
- [ ] Play Console: ads declaration, **Advertising ID = Yes** (if real ads), content rating, data safety
- [ ] `app.json` → `expo.android.permissions` includes `com.google.android.gms.permission.AD_ID` when AdMob plugin is enabled

## Release

```bash
git tag {slug}@v{version} && git push origin {slug}@v{version}
```

See `.github/workflows/mobile-release.yml` and [play-store-release skill](../../../.cursor/skills/play-store-release/SKILL.md).
