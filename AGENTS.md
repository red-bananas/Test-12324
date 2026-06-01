# Agent guide — adding apps to this monorepo

This repo separates **app code** (`apps/`) from **automation** (`pipeline/`, `dashboard/`). When a user asks you to build or add an app, work in `apps/` only.

**New products:** Before research or implementation, follow [`.cursor/skills/product-builder/SKILL.md`](.cursor/skills/product-builder/SKILL.md) (market research, design, spec gate), invent and validate ideas with [`.cursor/skills/creative-engine/SKILL.md`](.cursor/skills/creative-engine/SKILL.md) (proactive ideation + persona validation), and pick the revenue model with [`.cursor/skills/monetization/SKILL.md`](.cursor/skills/monetization/SKILL.md) (rewarded ads, freemium/SaaS, tip-ware). Strategy: [STRATEGY.md](STRATEGY.md). Save approved specs under `docs/specs/`.

**UI/UX work:** Before designing or reviewing interfaces (web, mobile, extensions), follow [`.cursor/skills/ui-ux-pro-max/SKILL.md`](.cursor/skills/ui-ux-pro-max/SKILL.md) (accessibility, layout, typography, interaction patterns, pre-delivery checklist).

## Folder map

| Path | Purpose |
|------|---------|
| `apps/web/{name}/` | Next.js client-side web utilities |
| `apps/mobile/{name}/` | Expo + React Native games |
| `apps/extensions/{slug}/` | Chrome MV3 extensions |
| `scaffolds/` | Read-only starter templates — copy, never edit in place |
| `pipeline/` | Auto-App CLI and stages — do not modify unless asked |
| `tools/extensions/` | Extension validate/zip scripts |
| `tools/mobile/` | Mobile validate/test scripts |

## Manual add workflow

1. **Pick a lane** — `web`, `mobile`, or `extensions`.
2. **Create the app directory** under `apps/{lane}/{name}/`.
3. **Bootstrap from a scaffold** — copy, never edit the scaffold in place:
   - Web: copy `scaffolds/web-nextjs/` → `apps/web/{name}/`
   - Mobile: copy `scaffolds/mobile-expo-game/` → `apps/mobile/{name}/`
   - Extension: copy `scaffolds/extension-mv3/` → `apps/extensions/{slug}/`, then **register the slug in `tools/extensions/extensions.json`** (CI and `check:drift` read this registry).
4. **Fill in `app.yaml`** in the new app dir (slug, displayName, status, monetization).
5. **Implement** the feature in the app directory. Do not change files under `scaffolds/` or `pipeline/`.
6. **Verify:**
   - Web: `npm install && npm run typecheck && npm run lint && npm test && npx next build`
   - Mobile: `npm install && npm run typecheck && npm test`, then follow [`.cursor/skills/mobile-testing/SKILL.md`](.cursor/skills/mobile-testing/SKILL.md) — `validate:mobile`, `test:mobile`, `test:e2e:mobile`
   - Mobile on device: **Expo Go** for instant phone tests while developing; **EAS cloud build (preview APK)** for final pre-release sign-off
   - Extensions: `npm run check:drift`, then follow [`.cursor/skills/extension-testing/SKILL.md`](.cursor/skills/extension-testing/SKILL.md) — `validate.mjs`, `npm run test:extensions`, `npm run test:e2e:extensions` when UI changes

## Pipeline add workflow (automated)

The Auto-App pipeline handles discovery → triage → spec → build → test → deploy:

```bash
auto-app seed          # optional curated targets
auto-app discover
auto-app triage
auto-app approve {id}  # or approve via dashboard
auto-app run-all {id}  # spec → build → test → deploy
```

Built clones land in `apps/{lane}/{slug}/` automatically.

## Hard rules

- **No backend** for web clones — client-side only, `localStorage` for persistence.
- **No brand copy** — use distinct names, never copy logos or marketing from the original.
- **Do not weaken tests** — fix app code to pass existing smoke tests.
- **Distinct slugs** — pipeline rebuilds wipe `apps/{lane}/{slug}/`; use a unique slug for manual work you want to keep.

## Extension release

```bash
node tools/extensions/validate.mjs {slug}
node tools/extensions/zip.mjs {slug}
```

CI runs on changes to `apps/extensions/**`. Release via tag `{slug}@v{version}` (see `.github/workflows/extensions-release.yml`).
