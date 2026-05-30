# UTC Clock Pro

A Chrome extension that shows a live world clock on your toolbar and in a multi-timezone popup.

## Features

- **Toolbar icon** — Dynamic label for your primary timezone (e.g. `UTC`, `EST`, `IST`) with live time on the badge
- **Optional seconds** — Toggle seconds on the toolbar badge
- **Multiple clocks** — Add, edit, reorder, and remove clocks for 84 timezones
- **First clock = toolbar** — Drag to reorder; the top clock drives the icon and badge
- **Reliable updates** — Uses Chrome alarms so time stays current after sleep

## Installation (development)

1. Clone this monorepo
2. Open `chrome://extensions` → **Developer mode** → **Load unpacked**
3. Select `extensions/utc-clock-pro`

## Chrome Web Store

See [CHROME_WEB_STORE.md](./CHROME_WEB_STORE.md) for listing copy and release steps.

## Files

| File | Purpose |
|---|---|
| `manifest.json` | Extension metadata |
| `background.js` | Dynamic icon, badge, alarms |
| `timezones.js` | Timezone list and labels |
| `popup.html` / `popup.js` | Popup UI |

## Build zip

From repo root:

```bash
npm run zip:utc
```

Output: `dist/utc-clock-pro/utc-clock-pro.zip`
