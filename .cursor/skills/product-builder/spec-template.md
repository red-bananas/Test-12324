# Product spec: {ProductName}

> Copy this template into `docs/specs/{slug}.md` or paste in chat before implementation.

## Overview

| Field | Value |
|-------|-------|
| **Slug** | `{slug}` |
| **Lane** | `mobile` (default) / `extensions` (maintenance) |
| **Archetype** | `game` / `utility` |
| **Path** | `apps/mobile/{slug}/` |
| **Origin** | `manual` |
| **Inspired by** | {competitor or category — not a trademark clone} |
| **Research score** | {total}/35 |

## Job-to-be-done

**User:** {who}

**Trigger:** {when they need this}

**Outcome:** {what they get in <30s}

## User story

As a **{user}**, I want **{action}** so that **{benefit}**.

## Features (v1 — max 5–8)

1. {feature}
2. {feature}
3. {feature}
4. {feature}
5. {feature}

## Differentiation (min 2)

| Wedge | How we deliver it |
|-------|-------------------|
| {e.g. Privacy-first} | {concrete behavior} |
| {e.g. Offline-first} | {concrete behavior} |

## Design notes

- **Primary screen:** {what user sees first}
- **Primary action:** {one main button/gesture}
- **Empty state:** {copy when no input}
- **Error state:** {friendly message}
- **Brand:** distinct name `{ProductName}` — no competitor logos/colors/taglines

## Technical constraints

- [ ] Client-only (no backend for v1)
- [ ] Offline after first launch
- [ ] `npm run typecheck && npm run lint && npm test` pass
- [ ] `npm run validate:mobile -- {slug}` pass
- [ ] USB dev build tested (`npm run android`) before release

## APK size budget

| Target | Limit |
|--------|-------|
| Preview APK (EAS) | < 50 MB ideal; investigate if > 80 MB |
| Heavy deps | Skia, video, large assets — justify in spec or cut |

See [app-size-optimization](../app-size-optimization/SKILL.md).

## Monetization

> Mobile: follow [mobile-ads-strategy](../mobile-ads-strategy/SKILL.md) + [monetization](../monetization/SKILL.md).

| Field | Value |
|-------|-------|
| **Primary model** | Rewarded ads (Phase 2) |
| **Phase 1** | Core free, no ads — validate retention |
| **Phase 2** | Opt-in rewarded at natural moments |
| **Reward moments** | {e.g. undo, hint, bonus coins / export unlock} |
| **Free path** | {how non-paying user still has good experience} |
| **AdMob units** | Placeholder test IDs in dev; production IDs in `game/monetization.ts` only after human provides them |

| Phase | Model |
|-------|-------|
| Phase 1 | {core gameplay/tool; $0 ads} |
| Phase 2 | {rewarded placements; honest $ target given expected DAU} |

## Device QA (human gate)

- [ ] USB dev build on physical Android phone
- [ ] Ads use test IDs until production build approved
- [ ] Haptics, persistence, back button behave correctly

## Success metrics (first 90 days)

| Metric | Target |
|--------|--------|
| Installs | {number} |
| DAU / retention D1 | {number} |
| Store rating | {≥ 4.0} |
| AdMob eCPM / revenue | {optional $ target} |

## Out of scope (v1)

- {explicitly not building}

## Future ideas (parked)

> Promising ideas from the [creative-engine](../creative-engine/SKILL.md) pass that didn't make v1.

| Idea | Why parked | Revisit when |
|------|-----------|--------------|
| {e.g. Freeze a tile} | {scope / needs validation} | {after core ships} |

## Ship checklist

- [ ] Spec approved by user
- [ ] Code in `apps/mobile/{slug}/`
- [ ] `PLAY_STORE.md` filled; `store/CREATIVES-BRIEF.md` started
- [ ] Validation / tests green
- [ ] EAS preview APK on device
- [ ] Human approves store submit
- [ ] Release tag `{slug}@v{version}`
