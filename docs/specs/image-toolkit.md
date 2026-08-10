# Product spec & context: PixShrink (Image Toolkit)

> Handoff doc for a fresh chat. Contains the decision rationale, market evidence, goal-fit, and the build-ready spec. Start work from the "Build plan" section.

## TL;DR

Build a **mobile, offline image compressor + resizer** (Expo / React Native). Core job: shrink/resize a photo to a target size in under 30 seconds, fully on-device. Fast-follow: format convert + batch + photo→PDF. Monetize with respectful rewarded ads + a one-time Pro unlock (no subscription).

## Overview

| Field | Value |
|-------|-------|
| **Slug** | `image-toolkit` |
| **Display name** | PixShrink |
| **Lane** | `mobile` |
| **Path** | `apps/mobile/image-toolkit/` |
| **Origin** | `manual` |
| **Inspired by** | Image compressor / resizer category (e.g. "Compress Image", "Image Toolbox") — category only, no brand/logo/copy cloned |
| **Research score** | 30/35 (see scorecard) |

## How we chose it (decision trail)

Process: listed broad app/game ideas → narrowed to mobile tools → ran live market research (demand, competition, ad revenue) → scored against our goal.

### Market evidence (researched Jun 2026)

| Signal | Finding | Source |
|--------|---------|--------|
| Demand | Image compression = the single most-used file-processing tool; image resize + convert also top-ranked; PDF tools = 36% of tool views | MiOffice 2026 File Processing Report |
| Mobile share | ~47% of file-tool usage is on mobile — strong demand for on-device | same |
| Competition gap | Top compressors (63K–317K reviews) are **hated** for "7 ads per photo", "$3.99/week" subscription traps, stripped EXIF/timestamps, hidden output files, poor UX | Google Play reviews |
| Proven ad earner | Indie playbooks list utilities (compressors, converters, QR, flashlight) as reliable AdMob earners — low eCPM but high repeat opens | Rork indie monetization playbook |
| Ad rates | Utilities rewarded video $7–17; games higher (~$15–30) but need scale + live-ops | Playwire / AdMob 2026 guides |
| Subscription fatigue | Users actively avoid recurring fees → one-time unlock converts better for micro-tools | Play reviews + SaaS commentary |

### Why not a game (for now)

Casual games earn higher eCPM but the market shifts fast (Block Blast already dethroned by arrow-puzzles in May 2026) and the leaders win on live-ops, meta-progression, and art — high risk for a solo, manual-first build. A tool is lower-risk, evergreen, and has a clear competitor weakness to exploit.

### Scorecard (our goal-fit)

| Dimension | Score /5 | Note |
|-----------|----------|------|
| Demand (proven, evergreen) | 5 | #1 file tool, mobile-heavy |
| Competition weakness to exploit | 5 | Ad/subscription dark patterns everywhere |
| Build effort (manual-first, 1–3 sessions) | 4 | Core is small via `expo-image-manipulator` |
| Offline / no backend | 5 | Fully on-device |
| Monetization fit | 4 | Ads + one-time Pro; utility eCPM modest |
| Stickiness (kept installed) | 4 | Recurring need; survives respectful ads |
| Differentiation clarity | 3 | Honest/offline angle strong but category crowded |
| **Total** | **30/35** | Above the 26 build gate |

## How it meets our goal (STRATEGY.md)

- **Earns:** ad-supported free + one-time Pro — declared before build (revenue-first principle).
- **Clone with improvements:** same job as proven winners, but honest ads, privacy-first, keeps EXIF, transparent output location.
- **Cash-cow:** small utility, repeat use, low ops — exactly the "high cash-cow potential" profile.
- **Manual-first → auto:** ships via Cursor now; later the pipeline can build into the same `apps/mobile/image-toolkit/` path.
- **Fills a lane gap:** mobile is our focus; complements existing `tile-merge` game.

## Job-to-be-done

**User:** Anyone needing to upload/share a photo under a size limit (job forms, ID/diploma upload, WhatsApp/email, web upload).

**Trigger:** "This image is too big" — upload rejected or slow.

**Outcome:** Compressed/resized image at a chosen target, saved to gallery and shareable, in <30s, offline.

## User story

As a **phone user**, I want **to shrink or resize a photo to a target size/dimensions** so that **I can upload or share it without a size error — without losing my photo's date or fighting ads**.

## Features (v1 — keep tight)

1. Pick image(s) from gallery (and camera optional).
2. Compress to a target (quality slider **and** target file size, e.g. "≤ 500 KB").
3. Resize by dimensions or percentage (keep aspect ratio).
4. Before/after preview with **exact saved size** (e.g. "3.1 MB → 240 KB, 92% smaller").
5. Save to gallery + share, and **show where it was saved**.
6. Preserve EXIF/timestamp by default (toggle to strip for privacy).
7. Clean one-screen flow, dark mode.

## Fast-follow (v1.1, not v1)

- Format convert: JPG ↔ PNG ↔ WebP, HEIC → JPG.
- Batch processing (multi-select).
- Photo → PDF (single + merge).

## Differentiation (the wedge)

| Wedge | How we deliver it |
|-------|-------------------|
| Privacy-first | 100% offline; "photos never leave your phone" — store hook |
| Honest ads | No ads during work; ad only **after** a successful save, capped |
| Keeps metadata | Preserve EXIF/timestamp by default (top competitor complaint) |
| Transparent output | Show exact saved size + file location; easy to find results |
| No subscription trap | One-time Pro unlock, never a weekly sub |

## Design notes

- **Primary screen:** big "Pick image" → controls (quality/size, dimensions) → before/after card → Save/Share.
- **Primary action:** one "Compress / Save" button.
- **Empty state:** "Pick a photo to shrink it." with the privacy line.
- **Error state:** friendly "Couldn't read that image — try another format."
- **Brand:** **PixShrink** — distinct name + palette; no competitor logos/colors/taglines.

## Technical constraints

- [ ] Client-only, no backend (v1).
- [ ] Works fully offline.
- [ ] Tests pass (`npm test`) + `npm run typecheck` + `npm run lint` in app dir.
- [ ] Built on the SDK 54 mobile scaffold.

## Tech / libraries (Expo-friendly)

| Need | Library | Note |
|------|---------|------|
| Resize/compress/rotate/crop/format | `expo-image-manipulator` | Core engine; jpeg/png/webp |
| Pick image | `expo-image-picker` | Gallery + camera |
| Save to gallery | `expo-media-library` | Needs **EAS dev build**, not Expo Go |
| File size / IO | `expo-file-system` | Read sizes, temp files |
| Share | `expo-sharing` | Share sheet |
| Ads (Phase 2) | `react-native-google-mobile-ads` (AdMob) | **Dev build only**, behind a thin no-op interface (see monetization skill) |

> Keep ad/payment SDKs behind a thin interface (`ads/rewarded.ts`) so logic stays pure and tests don't touch native modules. Ship a no-op fallback so test/Expo-Go paths never crash.

## Monetization

> Decision tree: tool that saves time → freemium; high repeat opens → ads also fit. Use a hybrid.

| Field | Value |
|-------|-------|
| **Primary model** | Ad-supported free + one-time Pro unlock |
| **Why** | Utility with repeat opens (ads add up) but users hate subscriptions → one-time Pro converts |
| **Value gates / moments of desire** | Rewarded: unlock larger batch / max-quality export once. Interstitial: after a save, capped. |
| **Free path** | Full single-image compress/resize/save free, forever |
| **Tech** | AdMob (dev build), Pro via store IAP / RevenueCat — no backend |

| Phase | Model |
|-------|-------|
| Phase 1 | Free, **no ads** — ship clean, gather installs + reviews + retention |
| Phase 2 | Rewarded (batch/quality) + interstitial after save + **Remove-ads / Pro** one-time IAP |

## Success metrics (first 90 days)

| Metric | Target |
|--------|--------|
| Play Store internal → production | 1 listing |
| Installs | 1,000+ organic (utility SEO via store keywords) |
| Store rating | 4.3+ (win on "no ad spam, keeps date") |
| Revenue | Turn on ads after ~500 installs; honest Phase-1 target tens of $/mo |

## Out of scope (v1)

- Background removal, OCR, document edge-scan, video — need heavier ML/native; revisit later.
- Cloud, accounts, subscription, AdMob (Phase 1 is ad-free).

## Future ideas (parked)

| Idea | Why parked | Revisit when |
|------|-----------|--------------|
| Background remover (on-device ML) | Native + dev build, heavy | After core tool ships + has users |
| OCR "copy text from image" | On-device ML, larger scope | Phase 2 differentiation |
| Bulk EXIF editor / privacy scrub | Niche | If reviews ask for it |

## Build plan (for the new chat)

Follow `.cursor/skills/product-builder/SKILL.md` + `.cursor/skills/mobile-testing/SKILL.md`.

1. **Bootstrap** (copy scaffold, never edit it in place):
   ```powershell
   Copy-Item -Recurse scaffolds\mobile-expo-game apps\mobile\image-toolkit
   ```
2. **Fill `apps/mobile/image-toolkit/app.yaml`** (slug `image-toolkit`, displayName PixShrink, androidPackage e.g. `app.autoapp.pixshrink`, status in-progress).
3. **Install core libs** in the app dir:
   ```powershell
   cd apps\mobile\image-toolkit
   npx expo install expo-image-manipulator expo-image-picker expo-media-library expo-file-system expo-sharing
   ```
4. **Build v1 feature set** above. Keep one screen; put pure logic (size math, target-size search) in `lib/` and unit-test it.
5. **Verify (must be green):**
   ```powershell
   npm run typecheck
   npm run lint
   npm test
   ```
6. **Device test:** Expo Go for UI; **EAS dev build** for gallery save (`expo-media-library`).
7. **Then** fast-follow (convert/batch/PDF) and Phase-2 monetization.

## Ship checklist

- [x] Spec approved by user
- [x] Code in `apps/mobile/image-toolkit/`
- [x] `app.yaml` filled
- [x] typecheck + lint + tests green (33 Jest + 4 Playwright web, Layer 1 validate OK)
- [ ] EAS dev build verifies gallery save (needs device/cloud build)
- [x] Play Store listing draft + privacy policy (offline angle) — `PLAY_STORE.md`, `PRIVACY.md`
- [ ] Mobile release CI wired (tag `image-toolkit@v*`)

## Key repo references

- Build rules / paths: `AGENTS.md`
- North star: `STRATEGY.md`
- How to think: `.cursor/skills/product-builder/SKILL.md`
- Revenue: `.cursor/skills/monetization/SKILL.md`
- Testing: `.cursor/skills/mobile-testing/SKILL.md`
- Scaffold to copy: `scaffolds/mobile-expo-game/` (Expo SDK 54)
