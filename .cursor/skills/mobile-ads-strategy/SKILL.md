---
name: mobile-ads-strategy
description: >-
  Senior ad manager playbook for Play Store mobile apps. Use during spec writing
  to define ad formats, placements, phase 1/2 rollout, caps, and metrics. Run
  before build for any ad-monetized app.
---

# Mobile Ads Strategy

Fill the **Ad strategy** section of `docs/specs/{slug}.md` before implementation. Pair with [`monetization/rewarded-ux-patterns.md`](../monetization/rewarded-ux-patterns.md) for placement catalog.

## Decision questionnaire (answer all in spec)

### 1. Primary model

| App type | Default |
|----------|---------|
| Casual game | Rewarded opt-in + capped interstitial + remove-ads IAP |
| Utility | Rewarded for premium action OR interstitial after job done; avoid banners |
| Kids / family | **No ads** or ads-off by default — Families policy |

### 2. Phase rollout

| Phase | Ads | Trigger to enable Phase 2 |
|-------|-----|---------------------------|
| **1** | None | Ship v1.0; collect reviews |
| **2** | On | e.g. 100+ installs, v1.1, or 2 weeks post-launch |

Set `monetizationConfig.phase` in `game/monetization.ts`.

### 3. Ad formats (pick max 2–3)

| Format | eCPM | UX risk | Use when |
|--------|------|---------|----------|
| **Rewarded** | Higher | Low (opt-in) | Player wants bonus (undo, hint, continue) |
| **Interstitial** | Medium | Medium | Between sessions only — never mid-action |
| **Banner** | Low | High (ugly) | Avoid unless utility with persistent screen |
| **App open** | Medium | High | Avoid for games |

### 4. Placement map (required table in spec)

| Feature | Format | Trigger moment | Reward | Free path | Cap |
|---------|--------|----------------|--------|-----------|-----|
| e.g. Undo | Rewarded | Tap undo when free used | +1 undo | 1 free/game | 3 rewarded/game |

### 5. Frequency rules

- Skip ads on **first session** (earn trust).
- Never interstitial immediately after rewarded video.
- Interstitial: max every N games OR every M minutes — whichever is **rarer**.
- Document caps in spec and implement in code.

### 6. Remove-ads IAP

- One-time purchase disables interstitials; rewarded stays optional.
- Price: $1.99–$3.99 for casual games.
- Product ID in `monetization.ts`.

### 7. AdMob setup checklist

- [ ] Create AdMob app + ad units (rewarded, interstitial if used)
- [ ] Put app ID in `app.json` plugin + `monetization.ts`
- [ ] Test IDs in dev (`EXPO_PUBLIC_USE_PRODUCTION_ADS` unset/false)
- [ ] Production IDs only on EAS `production` profile
- [ ] Link AdMob to Play Console app
- [ ] Play Console → Ads declaration filled

### 8. Testing safety

See `.cursor/rules/admob-testing.mdc`:

- **Never click production ads** in dev.
- Expo Go cannot load AdMob — use USB dev build or EAS preview APK.
- Jest mocks `game/ads/*` — no native module in unit tests.

### 9. Metrics to track (post-launch)

| Metric | Why |
|--------|-----|
| D1 / D7 retention | Ad density vs churn |
| Rewarded show rate | Placement too hidden? |
| eCPM / ARPDAU | Revenue health |
| Interstitial frequency | Complaints in reviews |

### 10. Realistic revenue expectations

India-tier rewarded eCPM often **$1–5**. Plan Phase 1 in **tens of dollars/month**, not thousands. Reach and retention beat placement optimization early on.

## Spec template block

Copy into `docs/specs/{slug}.md`:

```markdown
## Ad strategy

| Field | Value |
|-------|-------|
| Model | rewarded + interstitial + remove-ads IAP |
| Phase 1 end trigger | {e.g. v1.1 after 50 installs} |
| AdMob app ID | ca-app-pub-XXXX~YYYY (set before store) |

### Placement map

| Feature | Format | Trigger | Reward | Free path | Cap |
|---------|--------|---------|--------|-----------|-----|
| ... | ... | ... | ... | ... | ... |

### Frequency

- First session: no interstitials
- Interstitial: every N games
- Rewarded cap: M per session
```

## Reference implementation

`apps/mobile/tile-merge/game/monetization.ts`, `game/ads/rewarded.ts`, `game/rewards.ts`
