# Idea validation — persona panel + scorecard

A cheap thought-experiment to prove or kill an idea **before** building. Run it in your head/text; it costs minutes, a wrong build costs days.

## The persona panel

Score each idea's reaction per persona: 👍 likes · 😐 neutral · 👎 dislikes — with a one-line why.

| Persona | Age / type | Wants | Watch-outs |
|---------|-----------|-------|------------|
| **Kid** | 8–12 | Color, easy wins, playful surprise | Reading load, manipulative ads (parental risk) |
| **Teen** | 13–19 | Challenge, trends, share/flex, identity | Boredom, "cringe", anything slow |
| **Casual adult** | 25–45 | Short relaxing sessions, zero friction | Complexity, learning curves, interruptions |
| **Veteran / optimizer** | any | Depth, strategy, mastery, scores | Shallowness, RNG with no skill |
| **Older adult** | 55+ | Clarity, big targets, calm pace | Tiny UI, hidden gestures, clutter |
| **Parent (proxy buyer)** | 30–50 | Safe, fair, non-predatory for their kid | Forced ads, gambling-like loops |
| **Accessibility user** | any | Contrast, reduce-motion, screen-reader, one-hand | Motion-only feedback, color-only cues |

An idea doesn't need every 👍. It needs to **delight its target persona** without **alienating** the others. A unanimous 😐 is a quiet "no."

## The scorecard

For each candidate idea, fill:

| Dimension | Question | Rating |
|-----------|----------|--------|
| **Target delight** | Does the *primary* persona love it? | 👍 / 😐 / 👎 |
| **Broad tolerance** | Do the others at least not hate it? | 👍 / 😐 / 👎 |
| **Habit / retention** | Does it pull users back or deepen a session? | high / med / low |
| **Revenue moment** | Player-positive paying moment? (rewarded ad / Pro / share loop) | yes / weak / no |
| **Effort** | Build cost | S / M / L |
| **Cheapest prototype** | The smallest way to ship/test it | one line |
| **Risk** | Balance, clarity, scope-creep, a11y | one line |
| **Verdict** | | ship / prototype-in-one-mode / park |

## Worked example — "Freeze one tile" (Tile Merge)

**Idea:** Tap a tile to *freeze* it so it doesn't slide on the next move — a one-shot strategic save when a swipe would otherwise wreck your board.

### Persona panel

| Persona | Reaction | Why |
|---------|----------|-----|
| Kid | 😐 | Fun toy, but the *why* may not land without a hint |
| Teen | 👍 | Strategic flex; clip-worthy clutch saves |
| Casual adult | 😐→👍 | Loves the rescue once shown; risks confusion if undiscovered |
| Veteran / optimizer | 👍👍 | Real new decision layer; raises skill ceiling |
| Older adult | 😐 | Needs an obvious affordance (clear "freeze" badge), not a hidden gesture |
| Parent | 👍 | Fair, skill-based — not predatory |
| Accessibility | 😐 | Fine if freeze state has a non-color cue (icon + label, not just tint) |

### Scorecard

| Dimension | Rating |
|-----------|--------|
| Target delight (veterans/teens) | 👍👍 |
| Broad tolerance | 😐 acceptable (needs onboarding hint) |
| Habit / retention | high — adds replayable depth |
| Revenue moment | **yes** — limited free freezes then `Watch → freeze a tile`; signature AURA-mode verb |
| Effort | **M** — touches move logic, tile state, a UI affordance, and tests |
| Cheapest prototype | Ship **AURA-mode only**, 1 freeze/game; reuse undo's ad-gate UI + tile plumbing |
| Risk | Balance (could trivialize on Easy) · discoverability (needs a hint) · animation/grid **desync** (extend tile-grid-sync test) |
| **Verdict** | **Prototype in AURA mode**, A/B the allowance, then graduate to other modes if loved |

### Why this verdict

It scores high on depth and opens a clean, *wanted* rewarded-ad moment without touching the free core loop. The real risks are scope (limit to one mode first) and the known tile/grid desync class of bug (cover with a sync test before shipping). That's a classic **better/cheaper/faster** play: big perceived-value mechanic, small blast radius, reuses existing undo plumbing.

## Anti-bloat reminder

Run this panel on every shiny idea — most should end in **park**. Shipping 1 great signature mechanic beats shipping 5 mediocre ones. Parked ideas go in the spec's "Future ideas" list so they're remembered, not rebuilt-from-scratch later.
