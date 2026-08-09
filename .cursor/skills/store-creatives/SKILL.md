---
name: store-creatives
description: >-
  Play Store screenshot and graphic workflow for Auto-App mobile apps. Agent
  captures raw screenshots and writes creative briefs; human designs finals in
  GPT Images or design tools.
---

# Store Creatives

**Human designs final store graphics.** Agent provides raw assets + prompts.

## Per-app rule (mandatory)

When working on `apps/mobile/{slug}/`, **maintain every icon and asset in that app's folder only:**

```
apps/mobile/{slug}/
├── assets/              # launcher, splash, in-app icons (generated)
├── store/source/        # human inputs: logo.png, raw screenshots
└── store/upload/        # Play Console finals for this app (exports)
```

- **Do** read/write paths under `apps/mobile/{slug}/` only.
- **Do not** use `scaffolds/mobile-expo-game/assets/`, another app's `assets/` or `store/`, or draft files scattered in `store/upload/`.
- **Scaffold** icons are one-time copy placeholders — after scaffold, the app owns its own assets under `{slug}/`.

## Folder layout (per app)

```
apps/mobile/{slug}/store/
├── source/           # raw inputs: screenshots, canonical logo (see below)
├── upload/           # Play Console finals (generated exports or human listing art)
└── CREATIVES-BRIEF.md  # prompts + layout spec (agent)
```

## App icon workflow (all mobile apps)

**One source file only:** `store/source/logo.png` — square PNG, final approved art from human.

**Never use `store/upload/` as icon source.** That folder is for Play Console listing exports and other finals, not launcher artwork input.

**Generate app + store icons** (from repo root):

```bash
python tools/mobile/generate-mobile-icons.py {slug}
```

Writes:

| Output | Purpose |
|--------|---------|
| `assets/icon.png` | Launcher (1024) |
| `assets/adaptive-icon.png` | Android adaptive foreground |
| `assets/splash-icon.png` | Splash screen |
| `assets/app-logo.png` | In-app header / branding |
| `store/upload/store-icon-512.png` | Play Store listing icon (export) |

Then refresh native resources: `cd apps/mobile/{slug} && npx expo prebuild --platform android --no-install`

**Do not:** hardcode per-app logo filenames (`logo 2.png`, etc.), read drafts from `store/upload/`, create app-specific icon scripts, or reference `scaffolds/mobile-expo-game/assets/` when working on `apps/mobile/{slug}/` — use `generate-mobile-icons.py {slug}` only.

## Step 1 — Capture raw screenshots (agent)

Options:

- Playwright web export if app runs in browser (`expo start --web`)
- Maestro flow on device → save frames
- Manual: human screenshots on phone → drop in `store/source/`

Minimum set:

| Asset | Size | Source |
|-------|------|--------|
| Phone screenshot 1–4 | 16:9 or Play-required | In-app states |
| Feature graphic | 1024×500 | Composed in brief |
| Icon | 512×512 | Run `python tools/mobile/generate-mobile-icons.py {slug}` → `store/upload/store-icon-512.png` |

## Step 2 — Write CREATIVES-BRIEF.md (agent)

For each screenshot, include:

```markdown
### Screenshot 1 — {screen name}

**Raw file:** `store/source/01-home.png`

**Headline text:** "{short benefit}"

**GPT image prompt:**
> Phone mockup showing {app name} on Android. Screen displays {description}.
> Add headline "{text}" in bold sans-serif at top. Background gradient {colors}.
> Clean Play Store marketing style. No competitor logos.

**Layout notes:**
- Headline: top 15%, centered
- Safe zone: keep UI visible in center 70%
- Brand colors: {hex list}
```

Reference competitor *style* only — never copy logos or exact layouts.

## Step 3 — Human produces finals

- GPT Images, Figma, or Canva using prompts above
- Save to `store/upload/` with Play Console field names in `PLAY_STORE.md`

## Step 4 — Validate dimensions (agent)

Check before upload:

| File | Required |
|------|----------|
| Icon | 512×512 PNG |
| Feature graphic | 1024×500 |
| Phone screenshots | Per current Play Console spec |

Add dimension check script to `tools/mobile/` when needed.

## Optional: Cursor GenerateImage

Draft only — human must approve before `store/upload/`. Never auto-upload AI art without review.

## tile-merge reference

`apps/mobile/tile-merge/store/` — run app's screenshot script if defined in `package.json`.
