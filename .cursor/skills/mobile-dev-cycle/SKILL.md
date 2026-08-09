---
name: mobile-dev-cycle
description: >-
  Master orchestrator for Auto-App mobile Play Store factory. Use at the start of
  any mobile session, when starting a new app, or when unsure which skill or
  stage comes next. Covers research through monitor with human review gates.
---

# Mobile Dev Cycle

Orchestrator for shipping Play Store apps from this monorepo. Human is reviewer at **spec**, **device QA**, and **store submit**.

Design spec: [docs/superpowers/specs/2026-08-02-mobile-dev-factory-design.md](../../../docs/superpowers/specs/2026-08-02-mobile-dev-factory-design.md)

## Stage map

| Stage | Skill(s) | Human gate | Artifact |
|-------|----------|------------|----------|
| 1 Research | `mobile-research`, `product-builder`, `creative-engine` | Pick 1 idea | Shortlist + score |
| 2 Spec | `product-builder`, `mobile-ads-strategy`, `monetization`, mock-first design review (`visualize`; `figma-generate-design` when Figma is requested) | **Approve spec + mocks** | `docs/specs/{slug}.md` |
| 3 Build | App `README-FOR-AGENT.md`, `app-size-optimization` | Optional chunk review | `apps/mobile/{slug}/` |
| 4 Test | `mobile-testing` | CI green | Passing tests |
| 5 Device QA | `mobile-testing` (USB tier) | **Approve on phone** | Dev build / preview APK |
| 6 Store | `play-store-release`, `store-creatives` | Design graphics; approve submit | `PLAY_STORE.md`, `store/upload/` |
| 7 Monitor | `mobile-monitoring` | Prioritize vNext | `docs/solutions/{slug}-retro.md` |

**Rules:**
- No code before approved spec.
- **Per-app assets:** icons and store graphics belong in `apps/mobile/{slug}/` only — never `scaffolds/` or another app's folder.
- Verify fail → back to Build.
- Device reject → back to Build.
- After painful debug or store rejection → write `docs/solutions/`.

## Dependency approval (mandatory)

Before `npm install <package>`:

1. State package, version, why, APK impact.
2. **Wait for human approval.**
3. Then install.

**Pre-approved** (no ask): packages in scaffold `package.json` + allowlist in scaffold `README-FOR-AGENT.md`.

## Tech conventions

- Expo-managed React Native; daily testing via `npm run android` (USB dev build).
- npm only (not pnpm).
- AdMob: test units in dev; production only on EAS production profile. See `.cursor/rules/admob-testing.mdc`.

## Quick commands

```bash
# New app
cp -r scaffolds/mobile-expo-game apps/mobile/{slug}

# Verify
cd apps/mobile/{slug} && npm install --legacy-peer-deps
npm run typecheck && npm run lint && npm test
npm run validate:mobile -- {slug}   # from repo root

# USB device
npm run android   # phone connected, USB debugging on
```

## What skill next?

| User says | Invoke |
|-----------|--------|
| "research app ideas" | `mobile-research` |
| "write spec" / "plan features" | `product-builder` + `mobile-ads-strategy` |
| "build the app" | Only if spec approved; then app README |
| "test" | `mobile-testing` |
| "play store" / "release" | `play-store-release` + `store-creatives` |
| "screenshots" | `store-creatives` |
| "ads strategy" | `mobile-ads-strategy` |
| "metrics" / "how is app doing" | `mobile-monitoring` |
| "smaller APK" | `app-size-optimization` |
