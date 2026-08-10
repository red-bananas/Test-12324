# Tile Merge — Play Store creatives brief

**App:** Merge Tiles: Offline Puzzle · `app.autoapp.tilemerge` · v1.1.0  
**Brand:** Charcoal `#1c1b22` · Coral accent `#ff7a59` · Soft `#ffb4a0` · Text `#f5f3ef`

## Upload folder

Final files for Play Console → **Main store listing** live in `store/upload/`.

Regenerate:

```bash
npm run screenshots:tile-merge
```

---

## Required assets (Play Console)

| Field | File | Size | Status |
|-------|------|------|--------|
| App icon | `upload/store-icon-512.png` | 512×512 PNG | Auto from `assets/icon.png` |
| Feature graphic | `upload/feature-graphic-1024x500.png` | 1024×500 PNG | Auto-generated |
| Phone screenshot 1 | `upload/screenshot-1-phone.png` | 1080×1920 | Gameplay + undo UI |
| Phone screenshot 2 | `upload/screenshot-2-phone.png` | 1080×1920 | Settings / offline trust |
| Phone screenshot 3 | `upload/screenshot-3-phone.png` | 1080×1920 | Mid-game board |
| Phone screenshot 4 | `upload/screenshot-4-phone.png` | 1080×1920 | Higher score state |

**Minimum:** 2 phone screenshots. **Recommended:** 4+ for promotion.

---

## Screenshot 1 — Gameplay

**Raw:** `store/source/screenshot-1-gameplay-source.png`

**Marketing headline (optional overlay):**  
`Swipe. Merge. Beat your best.`

**GPT / design prompt:**
> Android phone mockup, portrait. Screen shows dark puzzle game "Merge Tiles" with coral numbered tiles on a 4×4 grid, score header, Undo button with small badge. Headline at top: "Swipe. Merge. Beat your best." in bold white sans-serif. Background gradient charcoal #1c1b22 to #2a2833. Clean Google Play style. No competitor logos.

---

## Screenshot 2 — Settings & privacy

**Raw:** `store/source/screenshot-2-settings-source.png`

**Headline:** `Offline. No account. Your data stays on device.`

**GPT prompt:**
> Phone mockup showing settings sheet: haptics, reduce motion, stats, privacy policy link. Dark theme matching Merge Tiles. Headline: "Offline. No account." Subtext coral accent. Play Store marketing layout.

---

## Screenshot 3 — Board focus

**Raw:** `store/source/screenshot-3-board-source.png`

**Headline:** `One more move to a new high score`

---

## Screenshot 4 — Score progression

**Raw:** `store/source/screenshot-4-score-source.png`

**Headline:** `Chase 2048 and beyond`

---

## Screenshot 5 — Game over resume (manual from preview APK)

**Not auto-captured** — capture on device after preview build QA:

1. Install preview APK
2. Play until game over (or fill board)
3. Screenshot the **Board full** overlay with **Undo** (3-move resume)
4. Save as `store/source/screenshot-5-gameover-source.png`
5. Re-run `npm run screenshots:tile-merge` or composite manually to 1080×1920

**Headline:** `Watch ad to undo 3 moves and keep playing`

**GPT prompt:**
> Phone showing game over overlay on dark puzzle app. Center card: "Board full", score 1280, coral "Undo" button with count badge. Dimmed game board behind. Headline: "One ad. Three undos. Keep playing." Play Store style.

---

## Feature graphic (1024×500)

**File:** `upload/feature-graphic-1024x500.png`

Auto layout: app icon left, title **Merge Tiles**, subtitle **Offline puzzle · undo · rewarded resume**, decorative tiles right.

**Optional human polish prompt:**
> Wide banner 1024x500. Charcoal background #1c1b22. Left: app icon. Center: "Merge Tiles" large white text, subtitle "Offline 2048-style puzzle" in coral. Right: stylized 4x4 tile grid with numbers 2, 4, 8, 16. Minimal, no clutter.

---

## Store copy (paste into Play Console)

See `PLAY_STORE.md` for full short + long description.

**Short (80 chars):**
```
Offline merge puzzle. Slide tiles, reach 2048, undo moves. No account needed.
```

---

## Human review checklist

- [ ] No "Test Ad" visible in any screenshot (use gameplay/settings, not ad flow)
- [ ] Text readable at thumbnail size
- [ ] Icon matches installed app icon
- [ ] Screenshots show **Merge Tiles** title (not old "Tile Merge")
- [ ] Feature graphic has no rounded corners (Play crops full bleed)
- [ ] All PNGs correct dimensions (script validates on generate)

---

## Optional promo assets (later)

| Asset | Size | Notes |
|-------|------|-------|
| Promo video | 30s max | Screen record gameplay + merge haptic moment |
| Tablet screenshots | 7" / 10" | Same as phone for v1 |
| TV banner | If Android TV | Skip for v1 |
