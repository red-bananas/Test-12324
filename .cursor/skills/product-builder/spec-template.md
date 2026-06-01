# Product spec: {ProductName}

> Copy this template into `docs/specs/{slug}.md` or paste in chat before implementation.

## Overview

| Field | Value |
|-------|-------|
| **Slug** | `{slug}` |
| **Lane** | `web` / `mobile` / `extensions` |
| **Path** | `apps/{lane}/{slug}/` |
| **Origin** | `manual` |
| **Inspired by** | {competitor or category — not a trademark clone} |
| **Research score** | {total}/30 |

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
| {e.g. LLM paste mode} | {concrete behavior} |

## Design notes

- **Primary screen:** {what user sees first}
- **Primary action:** {one main button/shortcut}
- **Empty state:** {copy when no input}
- **Error state:** {friendly message}
- **Brand:** distinct name `{ProductName}` — no competitor logos/colors/taglines

## Technical constraints

- [ ] Client-only (no backend for v1)
- [ ] MV3-compliant (extensions only)
- [ ] Works offline after load (web/extension)
- [ ] Tests pass (`validate.mjs` or `npm test`)

## Monetization

> Choose via the [monetization](../monetization/SKILL.md) decision tree.

| Field | Value |
|-------|-------|
| **Primary model** | {rewarded ads / freemium-SaaS / tip-ware} |
| **Why** | {one line — fits the decision tree because…} |
| **Moments of desire / value gates** | {e.g. undo, hint, continue / export, bulk, automation} |
| **Free path** | {how a non-paying user still has a good experience} |
| **Tech** | {AdMob / LemonSqueezy / ExtensionPay / store IAP — backend needed? y/n} |

| Phase | Model |
|-------|-------|
| Phase 1 | {core + chosen model; honest $ target given expected reach} |
| Phase 2 | {Remove-ads IAP / Pro tier / affiliate / scale} |

## Success metrics (first 90 days)

| Metric | Target |
|--------|--------|
| {installs / visits / weekly active} | {number} |
| {store rating / bounce rate} | {number} |
| Revenue | {optional $ target} |

## Out of scope (v1)

- {explicitly not building}

## Future ideas (parked)

> Promising ideas from the [creative-engine](../creative-engine/SKILL.md) pass that didn't make v1. Kept so they're remembered, not rebuilt from scratch.

| Idea | Why parked | Revisit when |
|------|-----------|--------------|
| {e.g. Freeze a tile} | {scope / needs validation} | {after core ships / in AURA mode} |

## Ship checklist

- [ ] Spec approved by user
- [ ] Code in `apps/{lane}/{slug}/`
- [ ] Validation / tests green
- [ ] Listing copy or landing page draft
- [ ] Release tag or deploy notes
