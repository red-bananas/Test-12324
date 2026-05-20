# Auto-App

Autonomous pipeline that discovers trending apps, builds feature-parity clones with original UI, tests them, ships them, and reports back. Two lanes:

- **Web** — client-side utility tools (markdown editors, JSON formatters, drawing apps, timers, etc.) → Vercel
- **Mobile** — simple single-player casual games → Expo Go QR + sideload APK

Codegen runs on open-source models (DeepSeek V3 by default, Qwen 2.5 Coder fallback) via Aider.

## Status

Walking-skeleton in progress. Currently implemented:

- Typer CLI shell (`auto-app discover|triage|spec|build|test|deploy|monitor|digest|status`)
- State store (SQLAlchemy + libSQL/Turso, falls back to local SQLite)
- Budget controls (per-run / daily / monthly caps + kill-switch)
- LLM wrapper (LiteLLM, DeepSeek default, Qwen fallback)
- GitHub + Resend notification helpers
- `discover` stage: GitHub trending across both lanes with tractability filters
- `seed` stage: inserts curated first targets — Excalidraw (web) + 2048 (mobile)
- `triage|spec|build|test|deploy|monitor|digest`: stubs that print a clear message

## First targets

Day 1 deliberately runs the pipeline against two chosen real apps to debug the loop cleanly. Both ship to production — not throwaway fixtures.

| Lane   | Target     | Why                                                        | License |
|--------|------------|------------------------------------------------------------|---------|
| web    | Excalidraw | Iconic frontend-only drawing tool, real utility post-clone | MIT     |
| mobile | 2048       | Bounded state machine, perfect Skia + Reanimated fit       | MIT     |

`auto-app seed` inserts both into the `candidates` table. Day 2 onward, discovery is live across both lanes.

Next up: triage (GitHub issues + dashboard), spec (DeepSeek), build (Aider loop), templates (Next.js + Expo+Skia), dashboard, GitHub Actions workflows. See `/root/.claude/plans/we-thinking-to-build-precious-thimble.md` for the full plan.

## Quick start (local dev)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -e .

cp .env.example .env
# fill in DEEPSEEK_API_KEY, GH_PAT at minimum

auto-app status       # initializes local SQLite at data/local.db
auto-app discover     # pulls trending repos into the candidates table
auto-app discover --lane web
auto-app discover --lane mobile
```

With no Turso credentials, state lives in `data/local.db`. Set `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` to point at the cloud DB.

## Kill switch

Set `PIPELINE_PAUSED=true` (env var or GH Actions secret). Every stage calls `budgets.preflight()` which raises `KillSwitchEngaged` immediately. Flip back to `false` to resume.

## Budget caps

Defaults (override in `.env`):

```
COST_CAP_RUN_USD=1.00
COST_CAP_DAY_USD=2.00
COST_CAP_MONTH_USD=35.00
ITER_CAP=6
```

All LLM spend is recorded in `budget_ledger` via `pipeline/budgets.py:record(...)`. The preflight check trips a `BudgetExceeded` exception when any cap is hit, halting the run.

## Accounts to set up before first real run

- DeepSeek Platform (API key + $40/mo console cap)
- GitHub fine-grained PAT (scopes: `repo`, `workflow`, `issues`)
- Vercel team token
- Turso DB (`autoapp-prod`)
- Resend (email digests)
- Product Hunt developer app (web discovery)
- Plausible (web analytics)
- Expo + EAS (mobile builds, free tier)
- Firebase project (mobile analytics)

Deferred until Phase 2: Apple Developer ($99/yr) and Google Play Developer ($25). Not required for v1 — mobile ships via Expo Go QR + sideload APK.
