# Chrome Web Store listing — UTC Clock Pro

Copy these into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) for your extension item.

**Positioning:** Use plain words users understand—**icon clock**, **seconds**, **time zone on the logo**, **many clocks in one view**. Avoid jargon like “toolbar” or “badge.”

---

## Store listing

| Field | Text |
|---|---|
| **Name** | UTC Clock Pro — World Clock, Live Icon, Seconds, Time Zone Logo, Multi View |
| **Summary** (short) | Live clock on your Chrome icon—with seconds. Time zone name on the logo. See many clocks in one view. Free, works offline. |
| **Category** | Productivity |
| **Language** | English |

### Extension title (Name field)

Chrome allows up to **75 characters**. Use simple words people search for.

### Extension title (Name field) — **FINAL**

**Keep the brand `UTC Clock Pro`.** Do not switch to “Clock Pro — UTC & World TZ” — you’d lose existing users, reviews, and search rank for “UTC Clock Pro.”

**Final title (75 / 75 chars — full limit):**
```
UTC Clock Pro — World Clock, Live Icon, Seconds, Time Zone Logo, Multi View
```

| Part | Plain meaning |
|---|---|
| **UTC Clock Pro** | Your brand — keep this |
| **World Clock** | Search term (like competitor “UTC Time & World Clock”) |
| **Live Icon** | Time always on your Chrome icon |
| **Seconds** | Exact time on the icon |
| **Time Zone Logo** | UTC, EST, IST on the icon — change anytime |
| **Multi View** | Many time zones in one window |

| Title option | Chars | Verdict |
|---|---|---|
| **`UTC Clock Pro — World Clock, Live Icon, Seconds, Time Zone Logo, Multi View`** | **75** | **Use this** |
| `UTC Clock Pro — Live Icon Clock, Seconds, Time Zone Logo, Multi-Clock View` | 74 | Good backup; no “World Clock” search term |
| `Clock Pro — UTC & World Time Zones, Live Icon, Seconds, Multi View` | 66 | ❌ Rebrand — avoid |
| `UTC & World Clock Pro — Live Icon, Seconds, Zone Logo, Multi View` | 65 | ❌ Brand change — avoid |

**Dashboard:** Store listing → **Name** → paste the same string as `manifest.json` → Save.

### One-line tagline (promo tile / screenshot headline)

```
Live clock on your icon · Seconds · Time zone on the logo · Many zones in one view
```

### Alternative taglines (screenshots)

```
See the time on your Chrome icon—no new tab needed
```

```
UTC, EST, IST on the logo. Change it anytime.
```

```
One click. All your time zones in one place.
```

---

## Detailed description

```
See the time on your Chrome icon—always there, always updating. No new tab. No search. Just look up.

UTC Clock Pro is a simple world clock that lives on your extension icon. Open one small window to see many time zones at once.

✨ WHAT YOU GET

🕐 Live clock on your icon
The time stays on your Chrome icon so you can check it in one glance—while you browse, work, or join a call.

⏱️ Seconds on the icon—for exact time
Turn seconds on when you need precise time: meetings, deadlines, handoffs, or scheduling across countries.

🏷️ Time zone name on the logo
The icon shows a short label—UTC, EST, IST, and more—so you always know which place you’re looking at.

🔄 Change which time zone sits on the icon
Move any clock to the top of your list and that zone becomes your icon clock. Switch from London to New York in one step.

🌍 Many time zones in one view
Add clocks for cities you care about. See them together in one clean list. Edit or remove any clock in a tap.

🗺️ 84 time zones to pick from
Americas, Europe, Asia, Australia, and more. Pick from a simple list with a quick preview before you add.

🔋 Keeps running after sleep
Your icon clock keeps updating even after your laptop sleeps—no frozen or wrong time.

🔒 Private and free
• No account
• No tracking
• Works offline
• Your clocks stay on your device only

For remote workers, teams across countries, and anyone who checks the time more than once a day.

WHY WE ASK FOR PERMISSIONS
• Storage — remember your clocks and settings
• Alarms — keep the icon clock updating on time
```

---

## Screenshot copy (paste as text overlays in promo images)

| # | Headline | Subline |
|---|---|---|
| 1 | **Clock on your icon** | Always visible—no new tab |
| 2 | **Time zone on the logo** | See UTC, EST, IST on the icon |
| 3 | **Seconds on the icon** | Exact time when you need it |
| 4 | **Many clocks, one view** | All your cities in one list |
| 5 | **Pick your icon clock** | Move any zone to the top |
| 6 | **84 time zones** | Easy list with preview |

**Promo tile layout:**
- Left: Chrome icon showing `UTC` label + live time
- Right headline: **UTC Clock Pro**
- Subline: **Icon clock · Seconds · Time zone on logo · Many zones**

---

## Release notes (v2.0.1)

```
• Redesigned popup: multi-clock list, drag to reorder, add/edit panel
• Dynamic toolbar icon shows your active timezone label (UTC, EST, IST, etc.)
• Live time on the icon badge with optional seconds
• Timezone list aligned with timeanddate.com — no duplicates, correct standard/daylight names
• Choose any clock as your toolbar clock—drag to top
• Cleaner layout and improved accessibility
```

## Release notes (v2.0.3 — 12h / 24h)

```
• New toggle: switch popup clocks between 12-hour and 24-hour format
• Toolbar tooltip follows your format choice
• Same row as “Show seconds” — tap 12h or 24h buttons
```

## Release notes (v2.0.2 — listing refresh)

```
• New name and listing: icon clock, seconds, time zone on logo
• Easier to understand: many time zones in one view
```

---

## Reviewer notes (private — paste in “Notes for certification” if asked)

```
Single purpose: display world time on the toolbar and in a popup.

alarms — schedule badge updates so time stays current after sleep/idle.
storage — persist user-selected timezones and the “show seconds” toggle locally.

No remote servers, analytics, or user accounts. No host permissions.
```

---

## Assets checklist

- [x] 128×128 icon (included in package)
- [x] **Screenshot 1:** Icon clock + multi-clock popup — `store/upload/screenshot-1-icon-clock-multi-view.jpg`
- [x] **Screenshot 2:** Seconds in logo + popup — `store/upload/screenshot-2-seconds-in-logo.jpg`
- [ ] **Screenshot 3 (optional):** Add-clock panel or drag-to-reorder close-up
- [x] Promo tile 440×280 — `store/upload/promo-small-440x280.jpg`
- [x] Store icon 128×128 — `store/upload/store-icon-128x128.jpg`

### Store images (upload these)

**Use only `apps/extensions/utc-clock-pro/store/upload/`** — every file is the exact size Chrome requires.

| Dashboard field | File | Size |
|---|---|---|
| Screenshot #1 | `screenshot-1-icon-clock-multi-view.jpg` | 1280×800 |
| Screenshot #2 | `screenshot-2-seconds-in-logo.jpg` | 1280×800 |
| Small promo tile | `promo-small-440x280.jpg` | 440×280 (cropped from screenshot 1) |
| Store icon | `store-icon-128x128.jpg` | 128×128 |

Each asset also has a `.png` twin (24-bit RGB, no alpha). **Prefer `.jpg` if the dashboard rejects PNG.**

Regenerate after editing source art:

```powershell
python tools/extensions/prepare-store-images.py utc-clock-pro
```

**Common mistake:** uploading `*-source*.png` from `store/` or `store/source/` — those are **1280×720** and will fail with *“The image size is incorrect.”*

### Upload to Chrome Web Store (manual)

Listing images are **not** uploaded by `publish-cws.mjs` (that only ships the extension zip).

1. Open [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Select **UTC Clock Pro** (`ihnkfiacnefbigkmolfnelfnepmhmlan`)
3. **Store listing**:
   - **Screenshots** → upload both `screenshot-*.jpg` from `store/upload/`
   - **Small promo tile** → `promo-small-440x280.jpg`
   - **Store icon** → `store-icon-128x128.jpg`
4. **Save draft** → submit with your next extension version

Requirements: screenshots **1280×800** or **640×400**; promo **440×280**; icon **128×128**; JPEG or 24-bit PNG (no alpha).

---

## Automated publish (this repo)

After merging to `main`, create a release tag:

```bash
git tag utc-clock-pro@v2.0.2
git push origin utc-clock-pro@v2.0.2
```

Or: **GitHub Actions → Release Extension →** `utc-clock-pro` / `2.0.2`

Requires GitHub secrets on **browser-extensions**:

| Secret | UTC Clock Pro value |
|---|---|
| `UTC_CLOCK_EXTENSION_ID` | `ihnkfiacnefbigkmolfnelfnepmhmlan` |
| `CHROME_CLIENT_ID` | from Google Cloud OAuth client |
| `CHROME_CLIENT_SECRET` | from Google Cloud OAuth client |
| `CHROME_REFRESH_TOKEN` | from `scripts/get-refresh-token.ps1` |

Settings: https://github.com/tejas-veer/browser-extensions/settings/secrets/actions

Verify before publish:

```powershell
$env:CHROME_CLIENT_ID="..."
$env:CHROME_CLIENT_SECRET="..."
$env:CHROME_REFRESH_TOKEN="..."
$env:UTC_CLOCK_EXTENSION_ID="ihnkfiacnefbigkmolfnelfnepmhmlan"
node scripts/verify-cws-item.mjs utc-clock-pro
```
