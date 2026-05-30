# File Info Extension

Chrome extension to inspect files and pages in the browser: image dimensions, file size, aspect ratio, video/audio metadata, PDF details, and webpage stats.

## Features

- **Hero summary** — large dimensions + type chip + image thumbnail
- **Copy dimensions** — one click (`1920x1080`)
- **Copy all** / **per-row copy** — click any detail row
- **Download file** — save the current image/PDF/video URL
- **Save details** — export metadata as `.txt`
- **Webpage mode** — title, domain, image/link counts
- **Context menu** — right-click any image → copy dimensions or download
- **Local files** — `file://` paths (size may be unavailable)
- **Light/dark** — follows system theme

## Development

```bash
npm run validate:file-info
npm run zip:file-info
```

Load unpacked: `chrome://extensions` → **Load unpacked** → `extensions/file-info`

## Release

```bash
git tag file-info@v1.1.0
git push origin file-info@v1.1.0
```

Store listing copy: [CHROME_WEB_STORE.md](./CHROME_WEB_STORE.md)

## Permissions

| Permission | Why |
|---|---|
| `activeTab` | Analyze the current tab |
| `downloads` | Download file + export details |
| `contextMenus` | Right-click image actions |
| `scripting` | Re-inject on tabs where the content script was not ready |
