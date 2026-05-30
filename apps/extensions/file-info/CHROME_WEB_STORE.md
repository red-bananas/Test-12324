# Chrome Web Store listing — File Info

Copy these into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/8ea1988d-a1dc-4143-b2c5-0a92909dab25/mjddfbocnhlabkjnggpcpaecchngebgk/edit) for your extension item.

**Extension ID:** `mjddfbocnhlabkjnggpcpaecchngebgk`

**Positioning:** Use plain words people search for—**image size**, **width × height**, **aspect ratio**, **file details**, **copy dimensions**. Avoid jargon like “metadata inspector” or “MIME analyzer.”

---

## Store listing

| Field | Text |
|---|---|
| **Name** | File Info — Image Size, Dimensions, Aspect Ratio, File Details |
| **Summary** (short) | Image size, width × height & aspect ratio in one click. Copy dimensions, download file, export metadata. PDF, video, audio, local. |
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

File Info shows width, height, file size, aspect ratio, and more for whatever is open in your current tab. Perfect for designers, developers, content teams, and anyone who checks image specs during the day.

✨ WHAT YOU GET

📐 Image dimensions (width × height)
See exact pixel size for JPG, PNG, GIF, WebP, SVG, and other images—whether they open in a tab or load from a URL.

📏 Aspect ratio
Get the ratio (like 16:9 or 4:3) calculated for you. Handy for banners, social posts, and responsive layouts.

💾 File size
View human-readable size (KB, MB, GB) when the server allows it.

📋 One-click copy dimensions
Copy width × height—or all file details—to your clipboard in one tap. Paste into tickets, specs, or chat.

⬇️ Download file from URL
Save the current file to your computer with one click when the source allows it.

📄 Export metadata as txt
Download a plain-text summary of everything File Info found—great for records, QA, or sharing with teammates.

🎬 PDF, video, audio & local file:// support
Works on direct file URLs and pages that embed media. Open a local file in Chrome (file://) and inspect it the same way.

🌐 Webpage stats
On regular web pages, see title, domain, and counts of images and links on the page.

🔒 Private by design
• No account
• No analytics or tracking
• Analysis runs on the current tab only
• Your files stay on your device

For web designers checking hero images, developers verifying assets, marketers auditing page weight, and anyone who asks “what size is this?” more than once a week.

KNOWN LIMITATIONS (honest)
• File size may show as unavailable on some cross-origin URLs because of browser CORS rules—the site must allow the request.
• Very large remote files may not report size until fully accessible; local and same-origin files work best.
• Download works for http(s) and data URLs; local file:// paths are analyzed but not re-downloaded through the browser.
• Some embedded or dynamically loaded media may need a refresh after the page finishes loading.

WHY WE ASK FOR PERMISSIONS
• activeTab — read info from the page you have open when you click the icon
• tabs — identify the current tab’s URL and file type
• file:///* — inspect local files you open in Chrome
• downloads — save a copy of the current file when you choose Download (only when you click; no background fetching)
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

## Release notes (v1.0)

```
• Inspect images, PDFs, videos, audio, and local file:// pages
• Show width × height, aspect ratio, file size, MIME type, and duration
• One-click copy all file details or click path/URL to copy
• Download file from URL when permitted
• Export metadata as a plain-text file
• Webpage mode: title, domain, image count, link count
• Clean popup UI with refresh and keyboard shortcuts (Ctrl+C, F5)
```

---

## Reviewer notes (private — paste in “Notes for certification” if asked)

```
Single purpose: display file and webpage metadata for the active tab.

activeTab — analyze only the tab the user is viewing when they open the popup.
tabs — resolve the active tab URL and communicate with the content script.
file:///* — allow inspection of local files opened in the browser.
downloads — initiate a user-requested download of the current file URL only; no background or bulk downloading.

No remote servers, analytics, or user accounts. File analysis uses the page DOM, fetch/HEAD where CORS allows, and media element metadata. Download and export run only on explicit user action.
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

After merging to `main`, create a release tag:

```bash
git tag file-info@v1.0
git push origin file-info@v1.0
```

Or: **GitHub Actions → Release Extension →** `file-info` / `1.0`

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
