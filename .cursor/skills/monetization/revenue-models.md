# Revenue models — realistic numbers & tech

Honest benchmarks so specs set believable targets. **All figures are blended indie estimates for a solo builder with little/no paid user acquisition.** Tier-1 (US/UK/CA) is higher; global blended is lower. Numbers move — verify current rates when it matters.

## The revenue equation

```
revenue = reach × retention × intent × yield
          (installs/  (DAU/visits  (% who hit a   (eCPM or
           visits)     that stick)  paying moment) conversion×price)
```

If `reach` is ~0, every other lever is irrelevant. **Spend effort on distribution and retention first**, monetization second.

## Mobile — rewarded ads (AdMob / AppLovin)

| Format | Blended eCPM (global) | Tier-1 eCPM | Notes |
|--------|----------------------|-------------|-------|
| Rewarded video | $3–$8 | $10–$20+ | Highest-value; opt-in |
| Interstitial | $2–$5 | $6–$12 | Capped, between sessions |
| Banner | $0.10–$0.80 | $0.50–$2 | Near-noise; often skip |

**Worked example (be sober about DAU):**

| Scenario | DAU | Rewarded views/DAU | eCPM | Monthly |
|----------|-----|--------------------|------|---------|
| Hobby launch | 50 | 2 | $5 | **~$15** |
| Modest traction | 500 | 3 | $6 | **~$270** |
| Real hit (rare) | 5,000 | 3 | $7 | **~$3,150** |

Most indie games **never pass ~100 organic DAU** without UA spend or virality. Plan Phase 1 around tens of dollars, not thousands. Revenue scales with installs, not with cleverness of placement.

## Web — display ads (AdSense / Ezoic)

| Niche | Page RPM | Reality |
|-------|----------|---------|
| Finance / SaaS / B2B | $8–$25 | High intent |
| General utility / dev tools | $2–$8 | Typical for our web lane |
| Games / entertainment | $1–$4 | Low |

Web ads need **real SEO traffic**. Below ~10k pageviews/mo it's lunch money. A tool ranking for a buyer-intent query beats a high-traffic toy.

## Freemium / SaaS — conversion

| Surface | Free→paid conversion | Typical price |
|---------|---------------------|---------------|
| Web micro-SaaS | 1–3% | $3–$9/mo or $9–$29 one-time |
| Chrome extension Pro | 0.5–2% of active | $3–$10 one-time or small sub |
| Mobile "Remove ads" IAP | 1–5% of engaged | $1.99–$4.99 one-time |

**Example:** 2,000 weekly-active extension users × 1% × $5 one-time = **~$100/mo** while WAU holds. Subscriptions compound but demand ongoing value (data, cloud, AI) to fight churn (~5–8%/mo typical).

## Tip-ware

- Conversion: **0.1–0.5%** of users tip. Average tip $3–$5.
- 10k monthly users × 0.2% × $4 ≈ **~$80/mo**. Goodwill, not a plan.
- Zero-friction to add → worth it for tools where ads/Pro feel wrong.

## Store / platform cuts

| Channel | Cut |
|---------|-----|
| Apple App Store / Google Play IAP | 30% (15% small-biz / <$1M) |
| Stripe | ~2.9% + 30¢ (you handle tax) |
| LemonSqueezy / Polar (merchant of record) | ~5% + fees, **handles global tax/VAT** |
| Buy Me a Coffee / Ko-fi | 0–5% |
| ExtensionPay (Chrome) | ~5% + Stripe |

## Payment / ad tech by lane (no custom backend needed)

| Lane | Ads | Payments |
|------|-----|----------|
| **Mobile** | `react-native-google-mobile-ads` (AdMob) — needs EAS dev build, breaks Expo Go | Store IAP via `expo-in-app-purchases` / RevenueCat |
| **Web** | AdSense (prod-only script) | LemonSqueezy / Polar / Stripe Checkout (hosted) |
| **Extensions** | (ads rarely fit) | **ExtensionPay** (extpay.com) — standard for Chrome MV3 |
| **Any** | — | Tip: Ko-fi / Buy Me a Coffee / GitHub Sponsors link |

RevenueCat (mobile) and LemonSqueezy (web) remove most billing/backend work — prefer them over hand-rolling.

## Model fit by category

| Category | Primary | Secondary |
|----------|---------|-----------|
| Casual game | Rewarded ads | Remove-ads IAP, tip |
| Dev/productivity tool | Freemium (Pro export/bulk) | Tip |
| AI-wrapper tool | Metered/subscription (covers API cost) | BYO-key free tier |
| Niche calculator/generator | Web ads + Pro export | Tip |
| Privacy/simple utility | Tip-ware | Optional Pro |
| Health/wellness tracker | Subscription | Free tier |

## Reality checklist for any revenue claim in a spec

- [ ] Stated DAU/visits assumption is **defended**, not wished.
- [ ] Phase-1 target uses the low end of eCPM/conversion.
- [ ] Distribution plan exists (store ASO, SEO query, cross-promo) — model is downstream of it.
- [ ] Chosen payment/ad tech needs **no backend we don't have**.
