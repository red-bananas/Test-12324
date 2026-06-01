# Extension scaffold (Chrome MV3) — agent guide

Read this before editing. This is a **read-only starter** — copy it, never edit in place.

## What this is

A minimal Manifest V3 Chrome extension: popup UI + background service worker + `chrome.storage` persistence. Vanilla JS, no build step.

## Bootstrap

```bash
cp -r scaffolds/extension-mv3 apps/extensions/{slug}
```

Then register it in `tools/extensions/extensions.json` (required — CI and validation read this registry):

```json
"{slug}": {
  "dir": "apps/extensions/{slug}",
  "displayName": "{Display Name}",
  "extensionIdSecret": "{SLUG}_EXTENSION_ID"
}
```

## Files

| File | Purpose |
|------|---------|
| `manifest.json` | MV3 manifest. Update `name`, `version`, `description`, `permissions`. |
| `popup.html` / `popup.css` / `popup.js` | Toolbar popup UI and logic. |
| `background.js` | Service worker. Runs on install + events. |
| `icons/png/icon{16,48,128}.png` | Toolbar + store icons. Replace with your own art. |
| `app.yaml` | Per-app metadata (name, category, status). Fill it in. |

## Rules

- **MV3 only.** No `manifest_version: 2`, no remote code, no `eval`.
- **Minimal permissions.** Only request what you use. Empty `permissions` is fine for pure-UI popups.
- **No brand copy.** Distinct name, original icons, no copied marketing.
- **Every referenced file must exist** — `validate.mjs` fails on dangling references.
- **Replace the icons.** The defaults are neutral placeholders.

## Verify (follow `.cursor/skills/extension-testing/SKILL.md`)

```bash
node tools/extensions/validate.mjs {slug}     # static manifest + reference check
npm run test:extensions                        # node unit tests for pure logic
npm run test:e2e:extensions                    # Playwright popup/content E2E (when UI changes)
```

## Release

```bash
node tools/extensions/validate.mjs {slug}
node tools/extensions/zip.mjs {slug}
```

CI runs on changes to `apps/extensions/**`. Release via tag `{slug}@v{version}` (see `.github/workflows/extensions-release.yml`).
