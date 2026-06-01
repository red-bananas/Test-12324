# FormatKit Extension

Chrome extension to format, minify, validate, and convert structured text — JSON, YAML, XML, TOML, CSV, SQL, and Java properties.

## Features

- **Multi-format** — Auto-detect or pick JSON, YAML, XML, TOML, CSV, SQL, Properties
- **Format & minify** — Pretty-print or compress with configurable indent (2 or 4 spaces)
- **Validate** — Instant syntax check with error messages in the status bar
- **Convert** — JSON ↔ YAML, JSON ↔ XML, JSON ↔ TOML, JSON ↔ Properties, YAML ↔ TOML, YAML ↔ XML
- **Sort keys** — Alphabetize JSON object keys
- **Editor** — Reliable monospace textarea with search, go-to-line, word wrap
- **Clipboard** — Copy, paste, download output
- **Context menu** — Right-click selected JSON → format and copy
- **Offline** — All processing runs locally; no network calls

## Development

```bash
npm run validate:formatkit
npm run zip:formatkit
```

Load unpacked: `chrome://extensions` → **Load unpacked** → `apps/extensions/formatkit`

## Release

```bash
git tag formatkit@v1.0.0
git push origin formatkit@v1.0.0
```

Store listing copy: [CHROME_WEB_STORE.md](./CHROME_WEB_STORE.md)

## Permissions

| Permission | Why |
|---|---|
| `storage` | Save editor content and settings between sessions |
| `clipboardRead` | Paste from clipboard into the editor |
| `contextMenus` | Format selected JSON from the page |
| `activeTab` / `scripting` | Copy formatted JSON to clipboard from context menu |

## Vendored libraries

- [js-yaml](https://github.com/nodeca/js-yaml) (MIT) — YAML parse/format
- [@ltd/j-toml](https://github.com/SuperchupuDev/tomljs) (MIT) — TOML parse/format
