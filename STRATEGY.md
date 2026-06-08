# Auto-App strategy

North star for the monorepo: ship useful products that **earn** — via player-positive ads, fair Pro/SaaS tiers, or tips — while we learn, then automate and innovate. Be creative and open across categories; be realistic about reach.

## Target problem

Solo builders waste time re-explaining product intent, picking stacks, and wiring release tooling. Auto-App is the **factory**: one repo for web tools, browser extensions, and mobile games/apps, with CI/CD and (later) an autonomous pipeline. We use the internet + AI agents to research, design, build, and monetize efficiently.

## Revenue-first principle

Every product declares a monetization model **before** build, via [`.cursor/skills/monetization/`](.cursor/skills/monetization/). We earn three ways and mix them per product:

| Model | User pays with | Typical product |
|-------|----------------|-----------------|
| **Rewarded ads** (player-positive, opt-in) | Attention | Casual games, high-session utilities |
| **Freemium / SaaS** | Money | Tools that save time/money, pro workflows |
| **Tip-ware** ("buy me a coffee") | Goodwill | Loved one-job tools where ads/Pro feel wrong |

**The model is the easy part — distribution and retention are the bottleneck.** Reach × retention × intent × yield; design every product so users *want* the paying moment (rewarding ads, valuable Pro), never dark patterns.

## Approach

1. **Manual-first (now)** — research and build in Cursor; agent follows [`product-builder`](.cursor/skills/product-builder/) + [`monetization`](.cursor/skills/monetization/).
2. **Be open-minded** — any category, simple to complex; learn from proven products; same job, better UX/privacy/niche; never copy brand assets.
3. **Revenue + reach portfolio** — ship a few earners and grow their distribution before experimental categories.
4. **Automate later** — pipeline discovers, specs, and builds into the same `apps/` paths.
5. **Innovate last** — new categories only after repeat ship velocity is proven.

## Users

| User | Need |
|------|------|
| Builder (you) | Fast research → spec → ship with minimal re-explaining |
| End users | Free, fast, private utilities that solve one job well |
| Future pipeline | Approved candidates that pass tractability filters |

## Lanes

| Lane | Path | Distribution | Cash-cow potential |
|------|------|--------------|-------------------|
| Extensions | `apps/extensions/` | Chrome Web Store | **High** — low ops, repeat installs |
| Web tools | `apps/web/` | SEO, shareable URLs | **Medium** — needs niche + time |
| Mobile games | `apps/mobile/` | Expo Go, APK, stores later | **Lower** short-term — learning + ads |

## Key metrics (90-day walking skeleton)

| Metric | Target |
|--------|--------|
| Shipped products (manual) | 3+ (1 per lane or 3 extensions) |
| Extensions with CWS listing | 3+ maintained |
| Weekly release cadence | 1 improvement or 1 new micro-product |
| Pipeline runs (automated) | Optional; not gating revenue yet |

## Revenue thesis

- **Phase 1:** Ship polished core + chosen model (rewarded ads / free Pro funnel / tip link) → installs, reviews, trust.
- **Phase 2:** Turn on monetization at scale — rewarded ads + Remove-ads IAP on games, Pro tier on tools, ads on web traffic.
- **Phase 3:** Portfolio cross-promotion and distribution loops (shareable modes, extension ↔ web tool for same job).

Revenue is **not** automatic from the repo — it follows distribution and polish. See [`monetization/revenue-models.md`](.cursor/skills/monetization/revenue-models.md) for realistic eCPM/conversion targets; plan Phase-1 in tens of dollars, not thousands.

## Tracks of work

### Track A — Portfolio (manual + Cursor)

- [x] Monorepo: `apps/`, `scaffolds/`, extension CI/release
- [x] Product-builder skill in daily use
- [x] Tile Merge (`apps/mobile/tile-merge/`) — Jest + web E2E + Maestro flow
- [x] Mobile CI: `mobile-ci.yml`, `tools/mobile/`, `mobile-testing` skill
- [ ] Play Store internal listing for Tile Merge — [PLAY_STORE.md](apps/mobile/tile-merge/PLAY_STORE.md)
- [x] Mobile release workflow (`mobile-release.yml`) + EAS submit to internal track
- [ ] Sudoku mobile
- [ ] Per-lane `app.yaml` + CI for web/mobile

### Track B — Automation (pipeline)

- [x] Discover, seed, build, deploy stages (walking skeleton)
- [ ] Respect `origin: manual` — do not wipe manual apps
- [ ] Extension lane in pipeline (optional)

### Track C — Distribution

- [x] Extension zip + CWS publish workflow
- [ ] Store listing templates per extension
- [ ] Web: Vercel deploy per app

## Principles (non-negotiable)

- Client-only for web v1 unless user requests backend
- Distinct branding on all clones
- Tests and validate scripts must pass before "done"
- Engagement through usefulness, not dark patterns

## Related docs

- [AGENTS.md](AGENTS.md) — repo paths and commands
- [.cursor/skills/product-builder/SKILL.md](.cursor/skills/product-builder/SKILL.md) — how to think before building
- [.cursor/skills/monetization/SKILL.md](.cursor/skills/monetization/SKILL.md) — how each product earns
- [README.md](README.md) — quick start
