# Tile Merge — Google Play Store

Package: `app.autoapp.tilemerge` · Expo slug: `tile-merge`

## Store listing (copy-paste) — en-GB default

### App name

**Merge Tiles: Offline Puzzle**

### Short description (80 chars max)

```
Offline merge puzzle. Slide tiles, reach 2048, undo moves. No account needed.
```

(72 characters)

### Full description

```
Merge Tiles: Offline Puzzle is a calm sliding-tile game you can play in two minutes or twenty — fully offline, no sign-in.

HOW TO PLAY
• Swipe up, down, left or right to move every tile on the board
• When two tiles with the same number touch, they merge into one
• Reach 2048, then keep merging for a higher score

WHY PLAYERS LIKE IT
• Works offline — no account, no login, no waiting
• Your game saves automatically — pick up where you left off
• Free undos every game, plus optional rewarded undos
• Dark theme, smooth animations and haptic feedback on merges
• Share your score after each run

PRIVACY FIRST
• Scores and settings stay on your device
• No account required — play offline anytime

Ideal for commutes, breaks and quick brain warm-ups. Free to play.
```

### Upload graphics (Main store listing)

All files in `store/upload/` — run `npm run screenshots:tile-merge` to regenerate.

| Play Console field | File |
|--------------------|------|
| App icon | `store/upload/store-icon-512.png` |
| Feature graphic | `store/upload/feature-graphic-1024x500.png` |
| Phone screenshot 1 | `store/upload/screenshot-1-phone.png` |
| Phone screenshot 2 | `store/upload/screenshot-2-phone.png` |
| Phone screenshot 3 | `store/upload/screenshot-3-phone.png` (optional — gameplay variants) |

Phone screenshots are 1080×1920 (9:16). Minimum 2 required; 4+ recommended for Play promotion.

### Category

**Puzzle** (or **Casual**)

### Tags (if prompted)

puzzle, 2048, merge, offline, brain, casual, tile

---

## Graphics checklist

Upload in Play Console → Main store listing.

| Asset | Size | Source |
|-------|------|--------|
| App icon | 512×512 PNG | `assets/icon.png` (scale up if needed) |
| Feature graphic | 1024×500 PNG/JPG | Create — charcoal `#1c1b22` + coral accent, show 4×4 board |
| Phone screenshots | ≥2, 16:9 or 9:16 | Capture from EAS preview APK or Expo Go |
| Tablet (optional) | 7" / 10" | Same as phone for v1 |

Suggested screenshots: (1) mid-game board + score, (2) win overlay 2048, (3) settings / calm UX.

---

## Privacy policy (required)

**URL to use in Play Console:**

```
https://tejas-veer.github.io/Auto-App/privacy/tile-merge.html
```

Do **not** use GitHub `blob/` links — Google Play's crawler often returns 404 for them. This HTML page is deployed from `docs/privacy/tile-merge.html` via GitHub Pages (`.github/workflows/pages.yml`).

Local source: [PRIVACY.md](./PRIVACY.md) · published HTML: [docs/privacy/tile-merge.html](../../../docs/privacy/tile-merge.html)

---

## One-time Play Console setup

Do this once before the first automated submit.

1. **Create app** at [Google Play Console](https://play.google.com/console)
   - App name: Tile Merge
   - Default language: English
   - App or game: **Game**
   - Free
   - Package name: **`app.autoapp.tilemerge`** (must match `app.json`)

2. **Set up → App content**
   - Privacy policy URL (above)
   - Ads declaration: **No** (Phase 1 — update when AdMob ships)
   - Content rating: complete IARC questionnaire (expect **Everyone** / PEGI 3)
   - Target audience: not primarily children under 13 (unless you target kids)
   - Data safety: **No data collected** (offline, local storage only)

3. **Release → Testing → Internal testing**
   - Create internal testing track
   - Add tester email list (your Gmail + team)

4. **Service account for API uploads** (required for EAS Submit + CI)
   - [Google Cloud Console](https://console.cloud.google.com/) → IAM → Service Accounts → Create
   - Grant role: none yet
   - Create JSON key → save securely
   - Play Console → **Users and permissions** → Invite user → paste service account email
   - Grant: **Release to testing tracks** (internal) + **View app information**

5. **Link Expo project** (already in `app.json` → `extra.eas.projectId`)

---

## One-time Expo / EAS setup

```bash
cd apps/mobile/tile-merge
npm install --legacy-peer-deps
npx eas-cli login
npx eas-cli whoami
```

Generate Android credentials (first time only — CI reuses these):

```bash
npx eas-cli build --platform android --profile production
# Follow prompts; EAS stores keystore on expo.dev
```

Optional: upload Google Play service account to Expo (so CI only needs `EXPO_TOKEN`):

```bash
# Save JSON as google-play-key.json locally (never commit)
npx eas-cli submit --platform android --profile production
# EAS will offer to store credentials on expo.dev
```

---

## GitHub secrets (automated publish)

Repo → **Settings → Secrets and variables → Actions**

| Secret | Required | Value |
|--------|----------|--------|
| `EXPO_TOKEN` | Yes | [expo.dev](https://expo.dev) → Account → Access tokens → Create |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY` | Yes* | Full JSON body of Play service account key |

\* Skip if you stored submit credentials on expo.dev via `eas submit` interactively.

---

## Automated publish (this repo)

Same pattern as Chrome extensions: **tag → CI builds AAB → submits to internal track**.

### Option A — Git tag (recommended)

```bash
git tag tile-merge@v1.0.0
git push origin tile-merge@v1.0.0
```

### Option B — GitHub Actions UI

**Actions → Release Mobile App → Run workflow**

- App: `tile-merge`
- Version: `1.0.0`
- Profile: `production` (AAB + submit) or `preview` (APK only, no store upload)

### Option C — npm script (local trigger)

```bash
npm run release:tile-merge -- 1.0.0
# Add -Watch to poll CI: npm run release:tile-merge -- 1.0.0 -Watch
```

### What CI does

1. Validates app + runs Jest tests
2. Syncs version in `app.json` / `package.json`
3. `eas build --platform android --profile production --non-interactive`
4. `eas submit --platform android --latest --non-interactive` → **internal** track
5. Commits version bump + creates GitHub Release

Monitor: **Actions → Release Mobile App**

---

## Manual publish (fallback)

```bash
cd apps/mobile/tile-merge
npm run typecheck && npm test

# Preview APK (sideload / testers)
npm run build:preview

# Production AAB + Play Store
npm run build:production
npx eas-cli submit --platform android --profile production --latest
```

Download builds: [expo.dev](https://expo.dev) → Projects → Tile Merge → Builds

---

## Version bumps

| Field | Where | CI updates |
|-------|-------|------------|
| `1.0.0` semver | `app.json` → `expo.version`, `package.json` | Yes (from tag) |
| `versionCode` | `app.json` → `expo.android.versionCode` | Yes (auto-increment) |
| EAS remote version | expo.dev | `autoIncrement: true` in `eas.json` |

---

## Pre-release checklist

- [ ] `npm run validate:mobile -- tile-merge`
- [ ] `npm run test:mobile -- tile-merge`
- [ ] EAS preview APK tested on real device
- [ ] Play Console app created + internal track ready
- [ ] Privacy policy URL live
- [ ] Store listing text + screenshots uploaded (can be draft before first AAB)
- [ ] GitHub secrets `EXPO_TOKEN` + `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY` set
- [ ] Tag `tile-merge@v*` pushed

---

## After internal testing

1. Fix bugs from tester feedback
2. Tag `tile-merge@v1.0.1` etc.
3. Promote internal → closed → open → production in Play Console when ready

See [docs/specs/tile-merge.md](../../../docs/specs/tile-merge.md) for product metrics.
