# Research checklist

Use this before writing code for any new app, extension, or web tool.

## Step 1 — Define the job-to-be-done

Answer in 2–3 sentences:

- Who is the user? (role, not demographic fluff)
- What recurring moment triggers the need?
- What does "done" look like in under 30 seconds?

## Step 2 — Competitor scan (15–30 min)

Find **3–5** existing products (Chrome Web Store, Google top results, Product Hunt, GitHub stars).

For each competitor record:

| Field | Notes |
|-------|-------|
| Name + URL | |
| Est. users / traffic signal | installs, reviews, SimilarWeb hint |
| Core job | one line |
| Top complaint | from 1–3 star reviews or Reddit |
| Monetization | free, ads, subscription, none |

**Opportunity signal:** stale updates + high installs, or sub-4.5 rating with 500+ reviews.

## Step 3 — Score the idea (1–5 each)

| # | Criterion | 1 = weak | 5 = strong |
|---|-----------|----------|------------|
| 1 | **Recurring use** | one-time curiosity | daily/weekly habit |
| 2 | **Client-only feasible** | needs server/AI API | runs fully in browser/extension |
| 3 | **Discoverability** | no search volume | clear SEO or store queries |
| 4 | **Competitor gap** | dominated by giants | reviews show fixable pain |
| 5 | **Monetization path** | none imaginable | ads, Pro, affiliate, B2B |
| 6 | **Build time** | >2 weeks solo | shippable in 1–3 Cursor sessions |
| 7 | **Monetization fit** | model feels bolted-on/dark-pattern | natural "moment of desire" or clear value gate (see [monetization](../monetization/SKILL.md)) |

**Total:** ___ / 35

- **26–35:** Proceed — fill [spec-template.md](spec-template.md)
- **19–25:** Refine niche, differentiation, or revenue model before build
- **<19:** Park idea; propose alternative

**Monetization-fit override:** a genuinely useful idea is *not* rejected for scoring low on monetization fit alone. If criteria 1–6 are strong but #7 is weak, default the product to **tip-ware or free-for-now** (see [monetization](../monetization/SKILL.md)), ship it, instrument usage, and revisit the model once it has users.

## Step 4 — Differentiation picker

Check at least **two** that you will ship in v1:

- [ ] Privacy-first (zero network calls)
- [ ] Faster / fewer clicks than leader
- [ ] Niche vertical (e.g. "for Shopify devs" not "for everyone")
- [ ] Better UX (keyboard shortcuts, dark mode, clear empty states)
- [ ] Export/share (markdown, iCal, permalink)
- [ ] LLM workflow (clean paste into ChatGPT/Claude)

Write one sentence per checked item explaining the wedge.

## Step 5 — Lane recommendation

| Signal | Lane |
|--------|------|
| User selects text / needs page context | `apps/extensions/` |
| User shares links, SEO, docs reference | `apps/web/` |
| Offline casual play | `apps/mobile/` |

## Step 6 — Risk check

- [ ] No trademark / brand copy in name or UI
- [ ] Target license MIT or clean-room implementation for clones
- [ ] No dependency on paid API for core v1 path
- [ ] Slug does not collide with pipeline-owned folder in `apps/`

## Output

Deliver to the user:

1. Score table with total
2. Competitor summary (3 bullets max)
3. Recommended lane + slug
4. Filled spec-template (or link to `docs/specs/{slug}.md`)
5. Explicit go / no-go recommendation
