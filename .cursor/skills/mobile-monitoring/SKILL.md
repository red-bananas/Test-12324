---
name: mobile-monitoring
description: >-
  Post-launch monitoring for Play Store mobile apps — AdMob, Play Console
  metrics, reviews, and iteration planning. Use weekly after ship or when user
  asks how an app is performing.
---

# Mobile Monitoring

Weekly ritual after Play Store launch. Output: short summary + proposed `docs/specs/{slug}.md` vNext items.

Human decides what to build next.

## Data sources

| Source | Metrics |
|--------|---------|
| **Play Console** | Installs, uninstalls, crashes, ANRs, ratings, reviews |
| **AdMob** | Impressions, eCPM, match rate, rewarded show rate, estimated earnings |
| **In-app** (if added later) | Session length, feature usage |

No automated pipeline yet — human exports or screenshots; agent structures analysis.

## Week-1 review template

```markdown
# {App name} — Week {N} monitor ({date})

## Installs & retention
- Total installs:
- D1 retention (if available):
- Crash-free rate:

## Ads (Phase 2 only)
- Impressions / DAU:
- Rewarded show rate:
- eCPM:
- Estimated ARPDAU:
- User complaints mentioning ads in reviews: Y/N

## Reviews (last 7 days)
- Avg rating:
- Top praise:
- Top complaints:

## Hypotheses
1. {observation} → {possible cause} → {proposed fix}

## Recommended vNext (priority order)
1. {small fix} — effort S
2. {feature} — effort M

## Do NOT change yet
- {metric still early / insufficient data}
```

Save copy to `docs/solutions/{slug}-week{N}.md` or append to retro doc.

## Review reply (human-in-loop)

Agent drafts replies; human posts in Play Console.

| Review type | Response tone |
|-------------|---------------|
| Crash | Apologize + fix in next version |
| Too many ads | Acknowledge + point to remove-ads / explain opt-in |
| Feature request | Thank + consider for update |
| Positive | Short thanks |

## When to iterate vs wait

| Signal | Action |
|--------|--------|
| Crash rate > 1% | Hotfix priority |
| D1 retention drop after enabling ads | Reduce interstitial frequency |
| Low rewarded show rate | Placement too hidden — UX fix |
| < 100 installs | Focus distribution/ASO, not ad optimization |

## Link to cycle

Approved vNext items → update spec → [`mobile-dev-cycle`](../mobile-dev-cycle/SKILL.md) stage 2 → build.
