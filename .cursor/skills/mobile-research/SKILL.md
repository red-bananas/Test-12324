---
name: mobile-research
description: >-
  Play Store mobile app idea research for Auto-App. Use when the user wants app
  ideas, market research, competitor analysis, or help picking the next mobile
  app to build.
---

# Mobile Research

Run before spec writing. Output: **shortlist of 3 ideas** with scores — human picks one.

Pair with [`product-builder`](../product-builder/SKILL.md) scoring and [`creative-engine`](../creative-engine/SKILL.md) for differentiation angles.

## Research steps

1. **Category pick** — casual puzzle, arcade, utility (offline tools), or hybrid. Match user direction.
2. **Play Store scan** — search top apps in category; note install ranges, ratings, update frequency.
3. **Review mining** — read 1–2 star reviews of top 5 competitors. Extract complaints (ads spam, bugs, ugly UI, missing offline).
4. **Keyword check** — growing search terms in category (manual Play search + optional web search).
5. **Monetization fit** — can rewarded ads work without ruining UX? See [`mobile-ads-strategy`](../mobile-ads-strategy/SKILL.md).
6. **Tractability** — buildable in 1–3 Cursor sessions with our scaffold?
7. **Differentiation** — pick 2+ wedges from product-builder (privacy, calm UX, offline, niche).

## Scoring (use product-builder checklist)

Minimum **26/35** to recommend build. Below 26 → propose alternatives.

## Output format

```markdown
## Mobile research: {date}

### Idea A: {name}
- Category: {puzzle | utility | arcade}
- Archetype: game | utility
- Job-to-be-done: {one line}
- Competitor complaints: {bullets}
- Differentiation: {2 wedges}
- Ad model: {rewarded / none phase 1 / etc.}
- Score: {n}/35
- Risk: {low | medium | high}

### Idea B: ...
### Idea C: ...

**Recommendation:** Idea {X} because {reason}.
```

Save research notes into the spec draft or `docs/specs/{slug}-research.md` if spec not started.

## Lane

All ideas land in `apps/mobile/{slug}/` — games and utilities share the same scaffold (`archetype` in `app.yaml`).

## Do not

- Promise revenue figures ($30k/month etc.)
- Recommend apps requiring backend unless user explicitly wants it
- Skip review mining — complaints are the differentiation map
