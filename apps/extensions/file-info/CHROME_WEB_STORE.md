# Chrome Web Store listing — File Info

Copy these into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/8ea1988d-a1dc-4143-b2c5-0a92909dab25/mjddfbocnhlabkjnggpcpaecchngebgk/edit) for your extension item.

**Extension ID:** `mjddfbocnhlabkjnggpcpaecchngebgk`

**Positioning:** Use plain words people search for—**image size**, **width × height**, **aspect ratio**, **file details**, **copy dimensions**. Avoid jargon like “metadata inspector” or “MIME analyzer.”

---

## Store listing

| Field | Text |
|---|---|
| **Name** | File Info — Image Size, Dimensions, Aspect Ratio, File Details |
| **Summary** (short, ≤132) | Image size, width × height & aspect ratio in one click. Copy dimensions or code, read EXIF, download & export. PDF, video, local. |
| **Category** | Productivity |
| **Language** | English |

### Extension title (Name field)

Chrome allows up to **75 characters**. Use simple words people search for.

### Extension title (Name field) — **FINAL**

**Final title (62 / 75 chars):**
```
File Info — Image Size, Dimensions, Aspect Ratio, File Details
```

| Part | Plain meaning |
|---|---|
| **File Info** | Your brand — keep this |
| **Image Size** | Search term for “how big is this image” |
| **Dimensions** | Width × height in pixels |
| **Aspect Ratio** | 16:9, 4:3, etc. |
| **File Details** | Size, type, duration, and more |

| Title option | Chars | Verdict |
|---|---|---|
| **`File Info — Image Size, Dimensions, Aspect Ratio, File Details`** | **62** | **Use this** |
| `File Info — Image Dimensions, Size, Aspect Ratio, Copy & Download` | 65 | Good backup; action words |
| `Image File Info — Size, Width × Height, Aspect Ratio, Metadata` | 60 | ❌ Brand change — avoid |
| `File Details — Image Size, Dimensions, Aspect Ratio Checker` | 58 | ❌ Brand change — avoid |

**Dashboard:** Store listing → **Name** → paste the same string as `manifest.json` → Save.

### One-line tagline (promo tile / screenshot headline)

```
Image size · Width × height · Aspect ratio · Copy · Download · Export
```

### Alternative taglines (screenshots)

```
How big is this image? One click to find out.
```

```
Copy 1920×1080 dimensions without opening DevTools.
```

```
PDF, video, audio, and local files — all in one popup.
```

---

## Detailed description

```
Open any image, PDF, video, audio file, or webpage in Chrome. Click File Info. See the details instantly—no DevTools, no guesswork.

File Info shows width, height, file size, aspect ratio, and more for whatever is open in your current tab. Built for designers, developers, content teams, and anyone who checks image specs all day.

✨ WHAT YOU GET

📐 Image dimensions (width × height)
Exact pixel size for JPG, PNG, GIF, WebP, SVG, and more—whether the image opens in a tab or loads from a URL.

📏 Aspect ratio
The ratio (16:9, 4:3, …) calculated for you. Handy for banners, social posts, and responsive layouts.

💾 File size & type
Human-readable size (KB, MB, GB) and MIME type when the server allows it.

📋 One-click copy
Copy width × height—or every detail—to your clipboard in one tap. Paste into tickets, specs, or chat.

</> Copy as code
Generate an <img> tag (with width/height baked in), a Markdown image, a CSS background, or just the URL—ready to paste into your project.

🛰️ On-device EXIF for photos
See camera make/model, capture date, and GPS location, parsed locally on your device. If a photo embeds GPS, File Info warns you before you share it.

🎥 Video & audio
Video resolution and duration, plus audio duration—read straight from the player.

📄 PDFs, documents & archives
PDFs, Office docs, ZIPs, and other downloads show file size and type at a glance.

💻 Local files (file://)
Open a file from your computer in Chrome and inspect it the same way—nothing is uploaded.

⬇️ Download & export
Save the current file from its URL, or export a plain-text summary of everything File Info found—great for records, QA, or sharing.

🌐 Webpage stats
On regular pages, see title, domain, and counts of images and links.

🔒 PRIVATE BY DESIGN
• No account, no analytics, no tracking
• Nothing runs until you click the icon
• Analysis happens on the current tab, on your device
• Your files never leave your computer

WHY THE PERMISSIONS (kept to a minimum)
• activeTab — read the page you're on, only when you click the icon
• scripting — run the analyzer in the current tab on demand (only after you click)
• contextMenus — right-click "Copy image dimensions" / "Download image"
• downloads — save the current file when you choose Download (no background fetching)
• file:///* (optional) — inspect local files you open in Chrome; requested only if you enable file access

HONEST LIMITATIONS
• File size may be unavailable on some cross-origin URLs because of browser CORS rules—the site must allow the request.
• Very large remote files may not report size until fully accessible; local and same-origin files work best.
• Download works for http(s) and data URLs; local file:// paths are analyzed but not re-downloaded through the browser.
• Some dynamically loaded media may need a page refresh after the page finishes loading.
```

---

## Keywords (for description & screenshots — not a separate CWS field)

Use these naturally in copy and screenshot text overlays:

```
image size, image dimensions, width height, aspect ratio, pixel size, file size checker, image metadata, copy dimensions, download image, file info chrome, image properties, photo dimensions, png size, jpg dimensions, pdf file size, video resolution, audio duration, local file info, webpage stats
```

---

## Screenshot copy (paste as text overlays in promo images)

| # | Headline | Subline |
|---|---|---|
| 1 | **Image size in one click** | Width × height without DevTools |
| 2 | **Aspect ratio calculated** | 16:9, 4:3, and more |
| 3 | **Copy dimensions** | One tap to clipboard |
| 4 | **Download from URL** | Save the file you're viewing |
| 5 | **Export as txt** | Share metadata anywhere |
| 6 | **PDF, video, audio, local** | One popup for every file type |
| 7 | **Webpage stats** | Title, domain, image & link counts |

**Promo tile layout:**
- Left: popup showing `1920 × 1080px` · `16:9` · `245 KB`
- Right headline: **File Info**
- Subline: **Image size · Dimensions · Aspect ratio · Copy · Download**

---

## Release notes (v1.2.0)

```
• New: Copy as code — URL, <img> tag, Markdown, or CSS background in one tap
• New: On-device EXIF for photos — camera, capture date, GPS, with a privacy warning
• Privacy upgrade: removed broad site access. Runs only on click via activeTab + on-demand injection (no persistent content scripts, no <all_urls>)
• Refreshed dark UI matching the suite, full keyboard navigation and reduced-motion support
• Inspect images, PDFs, videos, audio, and local file:// pages
• Show width × height, aspect ratio, file size, MIME type, and duration
• Download file from URL and export metadata as a plain-text file
• Webpage mode: title, domain, image count, link count
```

---

## Reviewer notes (private — paste in “Notes for certification” if asked)

```
Single purpose: display file and webpage metadata for the active tab.

activeTab — analyze only the tab the user is viewing, granted on the user's click.
scripting — inject the analyzer into the active tab on demand (no persistent content scripts, no <all_urls>).
contextMenus — provide right-click "Copy image dimensions" and "Download image".
downloads — initiate a user-requested download of the current file URL only; no background or bulk downloading.
file:///* — optional; requested only when the user enables file access to inspect local files.

No persistent host permissions, no remote servers, analytics, or user accounts. The extension runs nothing until the user clicks. File analysis uses the page DOM, fetch/HEAD where CORS allows, media element metadata, and on-device EXIF parsing. Download and export run only on explicit user action.
```

---

## Assets checklist

- [ ] 128×128 icon (included in package)
- [ ] **Screenshot 1:** Image tab — popup showing WxH, aspect ratio, file size
- [ ] **Screenshot 2:** Copy dimensions / copy-all toast confirmation
- [ ] **Screenshot 3:** Download button saving a file from URL
- [ ] **Screenshot 4:** Export metadata as .txt
- [ ] **Screenshot 5:** PDF or video file with duration/resolution
- [ ] **Screenshot 6:** Local file:// path in popup
- [ ] **Screenshot 7:** Webpage stats (title, domain, image/link counts)
- [ ] Promo tile 440×280 with headline “Image size · One click”
- [ ] Privacy policy URL (if required — extension collects no personal data)

---

## Automated publish (this repo)

After merging to `master`, create a release tag:

```bash
git tag file-info@v1.2.0
git push origin file-info@v1.2.0
```

Or: **GitHub Actions → Release Extension →** `file-info` / `1.2.0`

Requires GitHub secrets on **browser-extensions**:

| Secret | File Info value |
|---|---|
| `FILE_INFO_EXTENSION_ID` | `mjddfbocnhlabkjnggpcpaecchngebgk` |
| `CHROME_CLIENT_ID` | from Google Cloud OAuth client |
| `CHROME_CLIENT_SECRET` | from Google Cloud OAuth client |
| `CHROME_REFRESH_TOKEN` | from `scripts/get-refresh-token.ps1` |

Settings: https://github.com/tejas-veer/browser-extensions/settings/secrets/actions

Verify before publish:

```powershell
$env:CHROME_CLIENT_ID="..."
$env:CHROME_CLIENT_SECRET="..."
$env:CHROME_REFRESH_TOKEN="..."
$env:FILE_INFO_EXTENSION_ID="mjddfbocnhlabkjnggpcpaecchngebgk"
node scripts/verify-cws-item.mjs file-info
```
