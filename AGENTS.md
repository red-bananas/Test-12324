# Agent guide — Auto-App monorepo

**Primary lane: mobile Play Store apps** (`apps/mobile/`). Read [`.cursor/skills/mobile-dev-cycle/SKILL.md`](.cursor/skills/mobile-dev-cycle/SKILL.md) at the start of any mobile work.

Web (`apps/web/`) is **archived** — no new web apps. Extensions (`apps/extensions/`) are **maintenance-only** — no new extension factory work unless the user explicitly asks.

## Hard rules

- **Human approves** `docs/specs/{slug}.md` before any implementation code.
- **Dependency approval:** ask the human before `npm install` any package **not** already in the scaffold `package.json` or the scaffold allowlist in `README-FOR-AGENT.md`.
- **Package manager:** npm only (not pnpm).
- **No brand copy** — distinct names, never copy logos or marketing.
- **Do not weaken tests** — fix app code to pass existing smoke tests.
- **Do not edit** `scaffolds/` or `pipeline/` unless asked.
- **Per-app assets:** icons, logos, splash, and store graphics live only under `apps/mobile/{slug}/` (`assets/`, `store/source/`, `store/upload/`). Never read or update another app's folder or `scaffolds/` when working on `{slug}`. See [`store-creatives`](.cursor/skills/store-creatives/SKILL.md).

## New mobile app workflow

1. **Research** — [`mobile-research`](.cursor/skills/mobile-research/SKILL.md) + [`product-builder`](.cursor/skills/product-builder/SKILL.md) + [`creative-engine`](.cursor/skills/creative-engine/SKILL.md).
2. **Spec** — fill [`spec-template`](.cursor/skills/product-builder/spec-template.md) + [`mobile-ads-strategy`](.cursor/skills/mobile-ads-strategy/SKILL.md) → save `docs/specs/{slug}.md` → **wait for human approval**.
3. **Scaffold** — copy `scaffolds/mobile-expo-game/` → `apps/mobile/{slug}/` (never edit scaffold in place).
4. **Fill** `app.yaml` (slug, archetype `game` | `utility`, androidPackage, monetization).
5. **Build** — follow app `README-FOR-AGENT.md` + [`ui-ux-pro-max`](.cursor/skills/ui-ux-pro-max/SKILL.md).
6. **Verify:**
   ```bash
   cd apps/mobile/{slug}
   npm install --legacy-peer-deps
   npm run typecheck && npm run lint && npm test
   ```
   From repo root: `npm run validate:mobile -- {slug}` && `npm run test:mobile -- {slug}`
7. **Device QA (USB):** `npm run android` with phone connected — see [`mobile-testing`](.cursor/skills/mobile-testing/SKILL.md). Human must approve UX.
8. **Store prep** — [`play-store-release`](.cursor/skills/play-store-release/SKILL.md) + [`store-creatives`](.cursor/skills/store-creatives/SKILL.md).
9. **Release** — EAS preview APK first, then production tag — see app's `PLAY_STORE.md`.
10. **Monitor** — [`mobile-monitoring`](.cursor/skills/mobile-monitoring/SKILL.md) → `docs/solutions/{slug}-retro.md`.

## Folder map

| Path | Purpose |
|------|---------|
| `apps/mobile/{slug}/` | Expo + React Native Play Store apps — **all app icons/assets stay here** |
| `apps/mobile/{slug}/assets/` | Generated launcher, splash, in-app icons |
| `apps/mobile/{slug}/store/` | Icon source + Play Store creatives for that app only |
| `scaffolds/mobile-expo-game/` | Read-only mobile starter (copy once, never edit; not used at runtime) |
| `docs/specs/` | Approved product specs |
| `docs/solutions/` | Learnings and postmortems |
| `tools/mobile/` | validate, test, E2E scripts |
| `apps/extensions/` | Maintenance only |
| `apps/web/` | Archived |
| `pipeline/` | Deferred automation — do not modify unless asked |

## Mobile commands (repo root)

```bash
npm run validate:mobile -- {slug}
npm run test:mobile -- {slug}
npm run test:e2e:mobile
```

## Mobile release

```bash
git tag {slug}@v{version} && git push origin {slug}@v{version}
```

See `apps/mobile/{slug}/PLAY_STORE.md` and `.github/workflows/mobile-release.yml`.

## Windows native builds (short path)

If `npm run android` fails with CMake / path-too-long errors on Windows, **only** use:

`C:\Users\tejas.ve\temp 12`

Do **not** create other short paths (`C:\iap`, `subst` drives, etc.).

1. Copy or sync `apps/mobile/{slug}/` → `C:\Users\tejas.ve\temp 12\{slug}` (include `node_modules` or run `npm install` there).
2. Regenerate icons in the **repo** first (`python tools/mobile/generate-mobile-icons.py {slug}`), then sync assets into temp 12.
3. Build from temp 12: `cd "C:\Users\tejas.ve\temp 12\{slug}" && npm run android`
4. Keep source code canonical in the git repo — temp 12 is a build workspace only.

Launcher icon and splash screen **require** a successful native install; Metro reload cannot update them.

## Reference apps

| App | Use as reference for |
|-----|---------------------|
| `tile-merge` | Games, AdMob, rewarded ads, EAS, PLAY_STORE |
| `image-toolkit` | Utility apps, image processing |

Strategy: [STRATEGY.md](STRATEGY.md) · Design: [docs/superpowers/specs/2026-08-02-mobile-dev-factory-design.md](docs/superpowers/specs/2026-08-02-mobile-dev-factory-design.md)
