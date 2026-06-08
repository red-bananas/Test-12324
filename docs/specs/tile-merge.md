# Product spec: Tile Merge

## Overview

| Field | Value |
|-------|-------|
| **Slug** | `tile-merge` |
| **Lane** | `mobile` |
| **Path** | `apps/mobile/tile-merge/` |
| **Origin** | `manual` |
| **Inspired by** | Classic 4×4 sliding-tile merge puzzle (2048 category) |
| **Research score** | 25/30 |

## Job-to-be-done

**User:** Casual mobile player (commute, break, kids on family tablet)

**Trigger:** Wants a quick brain puzzle without account or tutorial

**Outcome:** Playable merge game in one tap; session 2–5 minutes

## User story

As a **casual player**, I want **to swipe tiles and merge numbers** so that **I can beat my high score offline**.

## Features (v1)

1. 4×4 grid with swipe controls (up/down/left/right)
2. Score + best score (persisted locally)
3. New game button
4. Undo last move (one step)
5. Win at 2048 tile with option to continue
6. Game over detection with restart
7. Dark theme, calm palette (distinct branding)

## Differentiation

| Wedge | How we deliver it |
|-------|-------------------|
| Calm UX | No mid-game popups; ads deferred until post-launch |
| Better UX | Undo, haptics on merge, readable tiles, dark theme |

## Design notes

- **Primary screen:** Score bar + 4×4 board + swipe anywhere
- **Primary action:** Swipe to move tiles
- **Empty state:** N/A (board always has tiles after start)
- **Error state:** Game over overlay with New Game
- **Brand:** **Tile Merge** — warm charcoal + coral accent, not original 2048 colors

## Technical constraints

- [x] Client-only (no backend for v1)
- [x] Works offline
- [x] Tests pass (`npm test`)

## Monetization

| Phase | Model |
|-------|-------|
| Phase 1 | Free, no ads (measure retention) |
| Phase 2 | AdMob interstitial on game over; rewarded undo; remove-ads IAP |

## Success metrics (first 90 days)

| Metric | Target |
|--------|--------|
| Play Store internal → production | 1 listing |
| Installs | 500+ organic |
| Store rating | 4.0+ |
| Revenue | AdMob after 500 installs |

## Out of scope (v1)

- Multiplayer, accounts, cloud save, IAP store, AdMob integration

## Ship checklist

- [x] Spec approved
- [x] Code in `apps/mobile/tile-merge/`
- [x] Validation / tests green
- [x] Resume game on relaunch (local save)
- [x] Play Store listing draft (`PLAY_STORE.md`)
- [x] Privacy policy (`PRIVACY.md` + URL for Play Console)
- [x] Mobile release CI (`mobile-release.yml` — tag `tile-merge@v*` → EAS build + internal submit)
- [ ] GitHub secrets: `EXPO_TOKEN`, `GOOGLE_PLAY_SERVICE_ACCOUNT_KEY`
- [ ] Play Console app + internal testers configured
- [ ] EAS production AAB build (first run)
- [ ] Play Store internal testing track live
