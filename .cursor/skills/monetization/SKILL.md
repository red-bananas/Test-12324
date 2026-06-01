---
name: monetization
description: >-
  Revenue strategy and monetization design for Auto-App products — rewarded ads
  (player-positive), freemium/SaaS, and tip-ware ("buy me a coffee"). Use when
  deciding how an app earns, designing ad placements, adding a Pro tier, planning
  revenue, or when the user asks how to make money from an app/game/extension.
---

# Monetization

Pick and design the **revenue model** for any Auto-App product. Apply this with [`product-builder`](../product-builder/SKILL.md) — model fit is part of the research gate, not an afterthought. North star: [STRATEGY.md](../../../STRATEGY.md).

## Core belief

> **The monetization model is the easy part. Distribution and retention are the bottleneck.**

Revenue ≈ `reach × retention × intent × yield`. A perfect ad placement on an app nobody opens earns $0. Design for the model, but never assume the model creates the users. Be realistic about numbers — see [revenue-models.md](revenue-models.md).

## The three models we use

| Model | User pays with | Best for | Friction |
|-------|----------------|----------|----------|
| **Rewarded ads** | Attention (opt-in) | Casual games, high-session utilities | Low — feels free |
| **Freemium / SaaS** | Money (recurring or one-time) | Tools that save time/money, pro workflows | High — needs clear ROI |
| **Tip-ware** | Goodwill (optional) | Loved tools where ads/Pro feel wrong | Lowest — but lowest yield |

These are **not exclusive**. A polished game often ships: rewarded ads (default) + "Remove ads" IAP (Pro) + optional tip. A dev tool ships: free core + Pro export + tip link.

## Decision tree

```
Does the app have repeated in-session "moments of desire"
(retry, hint, unlock, more, continue)?
  → YES: Rewarded ads as primary + Remove-ads IAP.        (most games)
  → NO ↓

Does it save the user time/money or unlock pro output
they'd pay for (export, bulk, automation, AI)?
  → YES: Freemium — free core, Pro tier (one-time or sub).  (SaaS / tools)
  → NO ↓

Is it a small, beloved, one-job tool where ads/Pro
would cheapen it (privacy tool, simple converter)?
  → YES: Tip-ware ("buy me a coffee") + optional Pro later.
  → NO: Ship free, instrument usage, revisit once it has users.
```

## Player-positive ad design (non-negotiable for ad apps)

The user's goal: **users should be glad to see the ad.** That only happens with *rewarded, opt-in* ads — never forced interruptions. Rules:

1. **Opt-in only for rewarded.** The user taps "Watch to get X." Never auto-play a reward ad.
2. **Show the exchange first.** Button reads the reward, e.g. `Watch ad → +1 Undo`, not just "Watch ad."
3. **Offer at the moment of desire.** Failed run, wants a hint, out of moves — when the reward is genuinely wanted.
4. **Never block the core loop behind ads.** There must always be a free path to keep playing.
5. **Reward must matter but not break balance.** Helpful, not pay-to-win that ruins the game.
6. **Frequency caps.** Never interrupt active play; cap interstitials (e.g. 1 per 2–3 min, after every Nth game), respect a cooldown.
7. **Give control.** "Remove ads" IAP and honest settings. No misleading or mistap-bait buttons.

Full placement catalog and the Tile Merge mapping: [rewarded-ux-patterns.md](rewarded-ux-patterns.md).

## Ad format cheat-sheet

| Format | Player feeling | Use | Avoid |
|--------|----------------|-----|-------|
| **Rewarded video** | Positive (chose it) | Primary earner — undo, hint, continue, 2× | Forcing it |
| **Interstitial** | Tolerable if rare | Natural breaks: after game over, between levels | During active play; back-to-back |
| **Banner** | Mildly annoying | Menus/settings only, if at all | In the play area; we usually skip for premium feel |
| **App Open** | Intrusive | Rarely; cold start only, capped | Every resume |

## Freemium / SaaS design

- **Free tier must be useful alone** — it's the funnel, not a crippled demo. A user who never pays should still recommend it.
- **Gate on value, not core function.** Charge for *more*, *faster*, *bulk*, or *output*, never for the basic job.
- **Pricing:** one-time unlock ($3–$15) is easiest for micro-tools; subscription ($3–$9/mo) only if you deliver *ongoing* value (updated data, cloud sync, AI cost) — otherwise churn eats you.
- **Payment infra** (no custom backend needed): web → LemonSqueezy / Polar / Stripe; extensions → ExtensionPay; mobile → store IAP / RevenueCat. See [revenue-models.md](revenue-models.md).

### What to gate (the Pro line)

| Free (the hook) | Pro (the charge) |
|-----------------|------------------|
| Core action, single item | Bulk / batch processing |
| On-screen result | Export (PDF/CSV/PNG/markdown), copy-all |
| Last N items / session only | History, saved presets, cloud sync |
| Manual run | Automation, scheduling, integrations |
| Reasonable daily limit | Higher/unlimited limits |
| BYO API key (AI tools) | Managed AI runs, higher quotas |
| Solo use | Team / shared workspace |

**Conversion levers (honest ones):** let the user *hit* the value moment (try to export, then "Pro unlocks export"), show the Pro feature greyed-in context (not a separate pricing page), and offer a one-time unlock for tools people use in bursts rather than forcing a subscription. Never cripple the free path to manufacture urgency.

### AI-wrapper tools (cost-aware)

If the app calls a paid AI/API, the model **must** cover variable cost:
- **BYO-key** free tier (user pays the provider) + a managed paid tier, or
- Metered/credit pricing where each run maps to real cost + margin.
- Never offer unlimited managed AI on a flat low price — that's a losing unit economic.

## Tip-ware design

- One unobtrusive link/button: "Buy me a coffee" (Ko-fi, Buy Me a Coffee, GitHub Sponsors, or a fixed LemonSqueezy product).
- Place in About/Settings or a one-time gentle prompt after repeated use — never mid-task.
- Expect very low conversion (see numbers); treat as goodwill, not a revenue plan.

## Anti-patterns (never ship these)

- Forced/unskippable ads in the middle of a task or active gameplay.
- Fake "X" buttons, invisible click targets, accidental-tap ads.
- Hard-gating the core loop behind ads or paywalls with no free path.
- Pay-to-win that destroys game balance.
- Asking for a tip before the user got value.
- Banner ads stacked over interactive UI.
- Begging for reviews before delivering value.

These kill retention and store ratings — which kills the only thing that actually makes money (reach × retention).

## Monetization gate (do this in the spec)

Before building, the spec's Monetization section must answer:

1. **Primary model** (ads / freemium / tip) + why, via the decision tree.
2. **Moments of desire** (for ads) or **value gates** (for Pro) — list them concretely.
3. **Free path** — how a non-paying user still has a good time.
4. **Realistic Phase-1 target** — honest $ given expected reach (don't fantasize DAU).
5. **Tech** — which SDK / payment provider, and whether it needs a backend.

Add this to [spec-template.md](../product-builder/spec-template.md) Monetization table; score "Monetization fit" in [research-checklist.md](../product-builder/research-checklist.md).

## Integration patterns (keep code testable)

Wrap every ad/payment SDK behind a thin interface so logic stays pure and tests don't touch native modules (same discipline as `game/haptics.ts`):

```ts
// ads/rewarded.ts — provider-agnostic, no-op safe on web/sim/tests
export interface RewardedAd {
  isReady(): boolean;
  show(reward: string): Promise<{ completed: boolean }>;
}

export async function showRewarded(reward: string): Promise<boolean> {
  // platform guard + try/catch; return false if unavailable so the
  // free fallback path always works. Unit-test the *caller*, mock this.
}
```

- Mobile: `react-native-google-mobile-ads` (AdMob) — needs a dev/EAS build, **not** Expo Go.
- Web: AdSense script gated to production; never block render on it.
- Always ship a **no-op fallback** so reduced-motion/offline/test paths never crash.

## What you must NOT do

- Add an ad/payment SDK before the app has a working, tested core loop.
- Promise revenue numbers without grounding them in reach assumptions.
- Introduce a backend for payments when ExtensionPay / LemonSqueezy / store IAP suffices.
- Use dark patterns to lift short-term eCPM at the cost of ratings.
- Wire AdMob into the Expo Go dev path (it breaks Expo Go — use EAS build).
