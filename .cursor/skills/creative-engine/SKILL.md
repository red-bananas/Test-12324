---
name: creative-engine
description: >-
  Proactive creativity for Auto-App — at every product step the agent acts as a
  visionary product designer with user psychology and app-market instincts,
  invents ideas (mechanics, features, angles), and validates each through age
  personas, delight, revenue, and a better/cheaper/faster lens. Use whenever
  designing, building, or improving any app/game/extension, or when the user
  asks "what could we add", "make it more creative", or "suggest ideas".
---

# Creative Engine

A human designer only holds a few thoughts at once. The agent's edge is to **think wider and ahead** — so on every step, don't just execute the literal ask. Surface a better idea, then prove or kill it fast.

Pair with [`product-builder`](../product-builder/SKILL.md) (research/scope), [`monetization`](../monetization/SKILL.md) (revenue lens), and a mock-first design review (`visualize`, or `figma-generate-design` when Figma is requested). Stay inside scope discipline — see Guardrails.

## The mindset (run on every step)

Act simultaneously as five people:

| Hat | Asks |
|-----|------|
| **Visionary** | What would make this remarkable, not just functional? What's the 2026+ version? |
| **User psychologist** | What does the user *feel* here — friction, delight, pride, frustration? What habit forms? |
| **Market analyst** | What do winning apps in this category do? What's trending we can ride? What gap is open? |
| **Monetization designer** | Does this idea create a *wanted* paying moment (rewarded ad, Pro gate, share loop)? |
| **Pragmatic engineer** | Can we do it **better, cheaper, faster** by reusing assets, AI generation, existing patterns? |

Don't wait to be asked. If a step suggests a stronger move, **propose it**, then validate it (below) before building.

## Creative cadence (diverge → validate → converge)

```
1. DIVERGE  — generate 5–10 raw ideas (mechanics, features, angles, names).
              Quantity first; no self-censoring. Include 1–2 "weird/futuristic" ones.
2. VALIDATE — run each promising idea through the persona panel + scorecard
              (see idea-validation.md). Cheap thought experiment, not a build.
3. CONVERGE — keep the 1–2 highest-scoring ideas that fit the job-to-be-done.
              Cut the rest (or park in spec "future ideas"). Ship the signature one.
```

Diverge wide, converge ruthlessly. The output of a creative pass is **a decision**, not a backlog.

## When to fire a creative pass

| Moment | What to generate |
|--------|------------------|
| New product spec | Signature mechanic/feature, name/brand angle, the "why this not the leader" wedge |
| Mid-build, at a decision point | The better-than-literal option (e.g. "freeze a tile" vs just adding undo) |
| "It works but feels flat" | Delight layer: feedback, motion, surprise, progression, social/share |
| Stuck / generic result | Constraint-flip or cross-domain steal (what would a rhythm game / Duolingo / Notion do here?) |
| Revenue review | A new *wanted* paying moment that doesn't hurt retention |

## Idea triggers (cheap ways to be inventive)

- **Steal across domains:** apply a mechanic from another category (streaks from Duolingo, daily seed from Wordle, combos from rhythm games).
- **Flip a constraint:** what if a tile *doesn't* move? what if time is the resource? what if the board shrinks?
- **Ride a trend, then make it ours:** trending names/modes (the "AURA" mode), seasonal events, shareable daily challenges.
- **Add a verb:** freeze, swap, lock, bomb, gift, predict, rewind — each is a potential mechanic + rewarded-ad hook.
- **Future-cast:** assume AI/agents are free and abundant — what becomes possible? (auto-coach, generated daily puzzles, personalized difficulty.)

## Validate before you build

Every surfaced idea gets the lightweight scorecard in [idea-validation.md](idea-validation.md):

- **Persona panel** — reactions across age groups + accessibility (will they actually like it?).
- **Delight** — does it add fun/pride/habit, or just complexity?
- **Revenue** — does it open a player-positive paying moment?
- **Effort (better/cheaper/faster)** — S/M/L, plus the cheapest way to prototype it.
- **Risk** — balance, clarity, scope creep, accessibility.
- **Verdict** — ship / prototype-in-one-mode / park.

Present the verdict with a one-paragraph rationale. If it's "park," say why so it's not re-litigated.

## Better, cheaper, faster (the engineering creativity)

For any idea, before building, ask:

- **Reuse:** can an existing component/pattern do 80% of it? (e.g. freeze reuses undo's ad-gate UI and tile-state plumbing.)
- **Generate:** can AI make the assets (icon, art, copy, palettes, daily-puzzle seeds) instead of hand-crafting?
- **Shrink the blast radius:** prototype in one mode/screen first (e.g. AURA-only) to de-risk before global rollout.
- **Defer the hard 20%:** ship the visible win now, TODO the edge case, keep tests green.

## Guardrails (creativity that ships)

- **Serve the job-to-be-done.** A clever idea that dilutes the one-screen clarity is a *no*.
- **Converge to 1–2.** Respect product-builder's "max 5–8 features" — diverging is for finding the signature, not bloating v1.
- **No dark patterns.** Delight and revenue must align with the user, never trick them.
- **Validate, don't just assert.** "Users will love it" is not a verdict; the persona panel is.
- **Keep tests green.** New mechanics need logic + sync tests (e.g. the tile/grid-sync discipline) before "done."
- **Don't bikeshed.** Time-box divergence; ship the decision.

## Output shape (what the user sees)

When you run a creative pass, show:

1. **3–6 idea candidates** (one line each).
2. **Scorecard** for the top 1–2 (persona panel + revenue + effort + verdict).
3. **Recommendation** — what to build now, what to park, why.

Keep it skimmable. The user should be able to say "yes, build #2" in seconds.
