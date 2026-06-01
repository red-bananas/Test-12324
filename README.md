# Auto-App

Autonomous pipeline that discovers trending apps, builds feature-parity clones with original UI, tests them, ships them, and reports back.

## Repository layout

```
Auto-App/
├── apps/                 # All shipped app source code
│   ├── web/              # Next.js utility clones
│   ├── mobile/           # Expo game clones
│   └── extensions/       # Chrome extensions (MV3)
├── scaffolds/            # Agent starter templates (do not edit in place)
├── pipeline/             # CLI + automation stages
├── dashboard/            # FastAPI operator UI
├── tools/extensions/     # Extension validate, zip, release helpers
└── data/                 # Runtime SQLite (gitignored)
```

**Pipeline lanes:** web → Vercel, mobile → Expo Go / sideload APK, extensions → Chrome Web Store (manual/agent workflow today).

Codegen runs on open-source models (DeepSeek V3 by default, Qwen 2.5 Coder fallback) via Aider.

## Status

Walking-skeleton with working stages:

- Typer CLI (`auto-app discover|triage|spec|build|test|deploy|monitor|digest|status|run-all`)
- State store (SQLAlchemy + libSQL/Turso, falls back to local SQLite)
- Budget controls + kill-switch
- `discover`, `seed`, `triage`, `spec`, `build`, `test`, `deploy` stages
- Browser extensions monorepo merged under `apps/extensions/`

Pipeline builds land directly in `apps/{lane}/{slug}/`. See [AGENTS.md](AGENTS.md) for manual agent workflows.

## First targets

| Lane   | Target     | Why                                                        | License |
|--------|------------|------------------------------------------------------------|---------|
| web    | Excalidraw | Iconic frontend-only drawing tool, real utility post-clone | MIT     |
| mobile | 2048       | Bounded state machine, perfect Skia + Reanimated fit       | MIT     |

`auto-app seed` inserts both into the `candidates` table.

## Quick start (pipeline)

```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -e .

cp .env.example .env
# fill in DEEPSEEK_API_KEY, GH_PAT at minimum

auto-app status
auto-app seed
auto-app discover
auto-app discover --lane web
auto-app discover --lane mobile
```

With no Turso credentials, state lives in `data/local.db`.

## Quick start (extensions)

```bash
node tools/extensions/validate.mjs              # validate all
node tools/extensions/validate.mjs utc-clock-pro
node tools/extensions/zip-all.mjs               # build zips → dist/
npm run validate                                # via root package.json
```

Load unpacked from `apps/extensions/<slug>/` in `chrome://extensions`.

## Kill switch

Set `PIPELINE_PAUSED=true` (env var or GH Actions secret). Every stage calls `budgets.preflight()` which raises `KillSwitchEngaged` immediately.

## Budget caps

Defaults (override in `.env`):

```
COST_CAP_RUN_USD=1.00
COST_CAP_DAY_USD=2.00
COST_CAP_MONTH_USD=35.00
ITER_CAP=6
```

## Accounts to set up before first real run

- DeepSeek Platform (API key)
- GitHub fine-grained PAT (scopes: `repo`, `workflow`, `issues`)
- Vercel team token
- Turso DB (`autoapp-prod`)
- Resend (email digests)
- Product Hunt developer app (web discovery)
- Plausible (web analytics)
- Expo + EAS (mobile builds)
- Firebase project (mobile analytics)
- Chrome Web Store OAuth (extensions release workflow)

Deferred until Phase 2: Apple Developer ($99/yr) and Google Play Developer ($25).
