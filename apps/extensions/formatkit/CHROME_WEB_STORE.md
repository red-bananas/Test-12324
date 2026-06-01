# Chrome Web Store listing — FormatKit

Copy these into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) for your extension item.

**Positioning:** One popup for **JSON formatter**, **YAML formatter**, **XML beautifier**, **TOML editor**, **CSV tidy**, and **convert between formats**. Emphasize **offline**, **no upload**, **developer utility**.

---

## Store listing

| Field | Text |
|---|---|
| **Name** | FormatKit — Format & Convert JSON, YAML, XML, TOML, CSV, SQL |
| **Summary** (short, max 132 chars) | JSON & YAML formatter, beautifier & converter. Pretty-print, minify, validate & convert JSON↔YAML↔XML offline — no upload. |
| **Category** | Developer Tools |
| **Language** | English |

### Description (long) — paste into Store listing

FormatKit is a free **JSON formatter**, **YAML formatter**, and **data converter** for developers. Format, beautify, minify, validate, and convert structured text in one Chrome popup — **100% offline**, with no account and no data sent to any server.

Use it as your **JSON beautifier** for messy API responses, a **YAML prettifier** for Kubernetes and Docker configs, an **XML formatter** for feeds and SOAP payloads, or a **JSON to YAML converter** when moving between config formats.

**Format & beautify (pretty-print & minify)**
• **JSON formatter** — indent minified API responses; compress to a single line
• **YAML formatter** — turn flow-style YAML into readable block layout
• **XML beautifier** — indent tags and keep declarations tidy
• **TOML formatter** — clean up config files for Rust, Python, and tooling
• **CSV formatter** — align columns for quick inspection
• **SQL formatter** — keyword casing and readable line breaks
• **Properties formatter** — tidy Java `.properties` and env-style key=value files

**Validate before you ship**
• Instant syntax check for JSON, YAML, XML, TOML, and more
• Clear error messages — fix broken payloads before paste or deploy

**Convert between formats**
• **JSON to YAML** and **YAML to JSON**
• **JSON to XML** and **XML to JSON**
• **JSON to TOML** and **TOML to JSON**
• **JSON to Properties** and **Properties to JSON**
• **YAML to TOML** and **TOML to YAML**
• **YAML to XML** and **XML to YAML**

**Built for developer workflows**
• Auto-detect format or pick JSON, YAML, XML, TOML, CSV, SQL, or Properties
• Syntax highlighting, line numbers, search, and go-to-line
• Copy, paste, and download output
• Undo / redo for edits and conversions
• Light and dark theme
• Right-click selected JSON on any page → format and copy to clipboard

**Private by design**
• All processing runs locally in your browser
• No analytics, no cloud upload, no sign-in

**Great for:** REST API debugging, OpenAPI/Swagger payloads, `package.json` and `tsconfig.json`, GitHub Actions YAML, Helm charts, `.env` and config files, log inspection, and quick data transforms during development.

**Keywords:** json formatter, yaml formatter, xml formatter, json beautifier, json prettifier, json minifier, json validator, json to yaml, yaml to json, json to xml, toml formatter, offline json editor, developer tools, format json chrome extension.

---

## Screenshots

Captured automatically from the popup (1280×800 for Chrome Web Store):

```bash
npm run screenshots:formatkit
```

Upload from `apps/extensions/formatkit/store/upload/`:

| File | Shows |
|---|---|
| `screenshot-1-json-formatted` | Pretty JSON + toolbar |
| `screenshot-2-json-to-yaml` | JSON → YAML convert |
| `screenshot-3-flow-yaml` | Flow-style YAML formatted |
| `screenshot-4-xml-formatted` | XML beautify |
| `promo-small-440x280` | Promo tile (from screenshot 1) |

---

## Privacy practices

| Question | Answer |
|---|---|
| Single purpose | Format and convert structured text locally |
| Data collected | None |
| Data use | N/A — offline only |
| Data shared | None |
| Remote code | **No**, I am not using remote code |
| Policy certification | Check the box certifying compliance with Developer Program Policies |

---

## Permission justifications (Privacy practices tab)

Copy each block into the matching field in the Chrome Web Store dashboard.

**storage**
```
FormatKit saves your editor content, format preferences (source/target format, indent size), and theme choice locally on your device using chrome.storage.local. This lets the popup restore your last session when reopened. No data is transmitted to any server.
```

**clipboardRead**
```
The Paste button reads text from your clipboard only when you click Paste (or use paste from the empty-state prompt). Clipboard content is loaded into the local editor for formatting or conversion. The extension does not read the clipboard in the background.
```

**contextMenus**
```
When you select text on a web page, FormatKit adds a right-click menu item: "Format selection as JSON". This lets you format copied JSON from API docs, logs, or DevTools without opening the popup first.
```

**activeTab**
```
Used only when you use the context menu on the current page. The extension needs access to the active tab to run a one-time script that copies the formatted JSON result to your clipboard. No page content is collected or sent anywhere.
```

**scripting**
```
Used only for the context-menu feature: a small script runs on the active tab to write the formatted JSON to the clipboard after you choose "Format selection as JSON" from the right-click menu. No remote code is loaded; the script is bundled with the extension.
```

**Remote code justification** (if dashboard asks)
```
FormatKit does not use remote code. All JavaScript (popup, formatter, converter, background service worker) is bundled inside the extension package. No code is fetched from external servers at runtime.
```

---

## Tags / keywords

Primary: json formatter, yaml formatter, xml formatter, json beautifier, json to yaml, yaml to json, json prettifier, json minifier, json validator, offline formatter

Secondary: toml formatter, json to xml, yaml to toml, xml beautifier, csv formatter, sql formatter, developer tools, api response formatter, config file editor, chrome json extension, format json online offline

---

## FormatKit Chrome Web Store item

| Field | Value |
|---|---|
| **Extension ID** | `dgajmljkkmcebpdjakaldpggecdpmdjc` |
| **Dashboard** | [Edit listing](https://chrome.google.com/webstore/devconsole/8ea1988d-a1dc-4143-b2c5-0a92909dab25/dgajmljkkmcebpdjakaldpggecdpmdjc/edit) |
| **GitHub secret** | `FORMATKIT_EXTENSION_ID` = `dgajmljkkmcebpdjakaldpggecdpmdjc` |

**Not** the UTC Clock Pro listing (`ihnkfiacnefbigkmolfnelfnepmhmlan`).

---

## First publish — new listing (not UTC Clock Pro)

FormatKit is a **separate Chrome Web Store item**. Do **not** upload to the UTC Clock Pro listing (`ihnkfiacnefbigkmolfnelfnepmhmlan`).

1. Open [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Click **New item** (not an existing extension)
3. Upload `dist/formatkit/formatkit.zip` (`npm run zip:formatkit`)
4. Copy the **new** extension ID from the dashboard URL (`…/edit/<extension-id>`)
5. Add GitHub secret **`FORMATKIT_EXTENSION_ID`** = `dgajmljkkmcebpdjakaldpggecdpmdjc` (repo: `tejas-veer/Auto-App`)
6. Reuse existing Chrome OAuth secrets: `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`
7. Trigger release:
   ```bash
   npm run release:formatkit
   ```
   Or tag: `git tag formatkit@v1.0.0 && git push origin formatkit@v1.0.0`

Verify before automated publish:

```powershell
$env:FORMATKIT_EXTENSION_ID="dgajmljkkmcebpdjakaldpggecdpmdjc"
$env:CHROME_CLIENT_ID="..."
$env:CHROME_CLIENT_SECRET="..."
$env:CHROME_REFRESH_TOKEN="..."
node tools/extensions/verify-cws-item.mjs formatkit
node tools/extensions/publish-cws.mjs formatkit
```

## Release checklist

- [ ] Create **new** CWS item (not UTC Clock Pro)
- [ ] Upload `dist/formatkit/formatkit.zip`
- [ ] Set `FORMATKIT_EXTENSION_ID` GitHub secret (new ID only)
- [ ] Tag `formatkit@v1.0.0` or run `npm run release:formatkit`
