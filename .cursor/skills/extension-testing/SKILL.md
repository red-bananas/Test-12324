---
name: extension-testing
description: >-
  Test Chrome MV3 extensions in Auto-App — static validate, Node unit tests for
  pure logic, Playwright E2E for popup and content scripts. Use when adding
  extension tests, fixing extension bugs, verifying before release, or when the
  user asks to test an extension.
---

# Extension Testing

Automated testing for extensions under `apps/extensions/{slug}/`. Follow [AGENTS.md](../../../AGENTS.md) for repo paths.

**References:** [Chrome unit testing](https://developer.chrome.com/docs/extensions/how-to/test/unit-testing), [Playwright Chrome extensions](https://playwright.dev/docs/chrome-extensions), [test checklist](test-checklist.md).

## When to use

| Situation | Start here |
|-----------|------------|
| Bugfix or new feature in an extension | Layer 1 → 2; Layer 3 if popup/UI touched |
| Before tag `{slug}@v*` release | All three layers for that slug |
| User says "test the extension" | Run commands below; add missing tests |
| Pure format/logic change (FormatKit) | Layer 2 required; add regression case |

**Skip E2E** for changes that only touch vendored libs or store markdown.

## Test pyramid (run in order)

```
Layer 1  validate.mjs + zip.mjs     static manifest & packaging (fast)
Layer 2  Node unit tests (node:test)   pure logic, no Chrome (fast)
Layer 3  Playwright E2E             real Chromium + unpacked extension (slower)
```

## Commands

From repo root:

```bash
# Layer 1 — all extensions or one slug
node tools/extensions/validate.mjs
node tools/extensions/validate.mjs formatkit
node tools/extensions/zip.mjs formatkit

# Layer 2 — unit tests
npm run test:extensions
npm run test:extensions -- formatkit

# Layer 3 — E2E (requires: npx playwright install chromium)
npm run test:e2e:extensions
npm run test:e2e:extensions -- formatkit
```

## Layer 1 — Static validation

Already in `.github/workflows/extensions-ci.yml`.

- `tools/extensions/validate.mjs` — manifest fields, referenced files exist
- `tools/extensions/zip.mjs` — build artifact

**Do not** weaken validate rules to make tests pass.

## Layer 2 — unit tests (Node built-in test runner)

**Location:** `tools/extensions/tests/{slug}/*.test.mjs`

**Run:** `npm run test:extensions` → `node --test tools/extensions/tests/**/*.test.mjs`

No extra test framework required (Node 20+). Optional: add `vitest` later if you prefer mocks/globals.

### Loading IIFE extension scripts in Node

Extensions use browser IIFEs on `window`. Use the shared loader:

```javascript
import { loadFormatKit } from '../helpers/load-formatkit.mjs';
const { registry, convert, highlight } = loadFormatKit();
```

For new extensions, add `tools/extensions/tests/helpers/load-{slug}.mjs` following the same pattern.

### Chrome API code

Per [Chrome docs](https://developer.chrome.com/docs/extensions/how-to/test/unit-testing):

1. **Prefer** extracting pure functions (dependency injection) and test without mocks.
2. **Otherwise** stub `globalThis.chrome` in `tools/extensions/tests/setup-chrome.mjs` (storage, runtime, tabs only what you use).
3. **Background service workers** — use Playwright E2E or `vitest-chrome-mv3` if heavy event testing is needed.

### Required regression cases (FormatKit)

| Case | Why |
|------|-----|
| JSON format / minify | Core path |
| JSON → YAML convert | Convert pipeline |
| Auto-detect YAML after convert | User keeps Format = Auto detect |
| Minify YAML content with `resolveFormat('auto', …)` | Must not minify as JSON |
| Highlight JSON | No leaked `tok-key">` artifacts in HTML |

Add a row to [test-checklist.md](test-checklist.md) when a user-reported bug is fixed.

## Layer 3 — Playwright E2E

**Location:** `tools/extensions/tests/e2e/{slug}.spec.mjs`

**Constraints** (from Playwright docs):

- **Chromium only** — use Playwright's bundled Chromium (`channel: 'chromium'`), not Chrome/Edge.
- **`launchPersistentContext`** with `--load-extension` and `--disable-extensions-except` — not `browser.newContext()`.
- **Extension ID** is dynamic — read from service worker URL (`split('/')[2]` for MV3).
- **Popup URL:** `chrome-extension://${extensionId}/popup.html`

Use fixtures in `tools/extensions/tests/e2e/fixtures.mjs`.

### Good E2E targets

- Popup opens; primary CTA works
- Status bar updates (valid/invalid)
- Convert + follow-up action (format/minify) with Auto detect
- Settings persist (`chrome.storage`) — optional

### Defer E2E

- Context menu on arbitrary pages (needs fixture site + selection)
- Chrome Web Store install flow

## Adding tests for a new extension

1. Ensure slug is in `tools/extensions/extensions.json`.
2. Layer 2: add `tools/extensions/tests/{slug}/` with at least one smoke test on core logic.
3. Layer 3: add `tools/extensions/tests/e2e/{slug}.spec.mjs` with popup load smoke test.
4. Add npm script alias if needed: `test:extensions -- {slug}` filters by path.
5. Run full pyramid locally before PR.

## CI

`.github/workflows/extensions-ci.yml` runs validate, zip, unit tests, and E2E on `ubuntu-latest`. E2E job installs Chromium via `npx playwright install chromium --with-deps`.

## Hard rules

- **Never weaken tests** to pass CI — fix extension code.
- **Never skip Layer 1** because unit tests pass.
- **Add a unit regression** for every logic bug that did not need the full browser.
- **Match web/mobile convention:** `npm run test:extensions` must exit 0 before claiming done.

## Pre-release checklist

See [test-checklist.md](test-checklist.md).
