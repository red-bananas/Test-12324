# Auto-App strategy

North star: ship **Play Store mobile apps** (games + utilities) that **earn** via player-positive ads, while learning and iterating fast with Cursor agents.

## Current focus (2026)

| Priority | Lane | Status |
|----------|------|--------|
| **Primary** | `apps/mobile/` | Active — tile-merge first ship, then utilities |
| Maintenance | `apps/extensions/` | Existing apps only; no new extension factory work |
| Archived | `apps/web/` | No new web development |

**Not in scope now:** Python `auto-app` pipeline automation. The factory is **skills + hooks + scaffolding + CI**, not headless agents.

## Target problem

Solo builder wastes time re-explaining product intent, ad strategy, device testing, and Play Store prep. Auto-App is the **mobile factory**: research → spec → build → test on USB device → store → monitor → iterate.

## Revenue-first principle

Every mobile app declares monetization **before** build via [`.cursor/skills/monetization/`](.cursor/skills/monetization/) and [`.cursor/skills/mobile-ads-strategy/`](.cursor/skills/mobile-ads-strategy/).

Default for casual games: **rewarded opt-in ads** + capped interstitials + optional remove-ads IAP. Phase 1 = no ads (trust); Phase 2 = monetize.

See [`monetization/revenue-models.md`](.cursor/skills/monetization/revenue-models.md) for realistic eCPM targets.

## Approach

1. **Manual-first** — Cursor agents follow [`mobile-dev-cycle`](.cursor/skills/mobile-dev-cycle/SKILL.md).
2. **Human reviewer** at spec approval, device QA, and store submit.
3. **USB dev builds** (`expo run:android --device`) for daily native testing — not Expo Go-only.
4. **Spec-driven** — approved `docs/specs/{slug}.md` before code.
5. **Memory** — `docs/solutions/` after every painful debug or store rejection.
6. **Automate later** — pipeline optional; not gating revenue.

## Tech stack

- **Expo-managed React Native** (SDK 54+) — not Expo Go sandbox; dev builds + EAS for Play Store.
- **Package manager:** npm (not pnpm until shared `packages/` workspace exists).
- **New dependencies:** human approval before `npm install` anything not in scaffold `package.json`.

## Key metrics (90-day)

| Metric | Target |
|--------|--------|
| Mobile apps through full cycle | 2+ (tile-merge live + 1 new) |
| Spec with ad placement map | 100% |
| USB dev build before store submit | 100% |
| Weekly improvement or new app | 1 |

## Tracks of work

### Track A — Mobile factory (active)

- [x] Monorepo, mobile CI, tile-merge reference app
- [x] Mobile release workflow (EAS → Play internal/production)
- [ ] Tile Merge Play Store production listing
- [ ] Mobile dev factory skills + scaffold rebuild — [design spec](docs/superpowers/specs/2026-08-02-mobile-dev-factory-design.md)
- [ ] Second mobile app through full cycle

### Track B — Automation (deferred)

- Pipeline stages exist but **not used** for mobile factory workflow
- Revisit when manual cycle is proven on 3+ apps

### Track C — Extensions / web (maintenance / archived)

- Extensions: maintain utc-clock-pro, formatkit, file-info
- Web: archived

## Principles

- Distinct branding; no trademark clones
- Tests + validate must pass before "done"
- Engagement through usefulness, not dark patterns
- Never click production AdMob ads in dev — test units only

## Related docs

- [AGENTS.md](AGENTS.md)
- [docs/superpowers/specs/2026-08-02-mobile-dev-factory-design.md](docs/superpowers/specs/2026-08-02-mobile-dev-factory-design.md)
- [.cursor/skills/mobile-dev-cycle/SKILL.md](.cursor/skills/mobile-dev-cycle/SKILL.md)
