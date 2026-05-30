# Chrome Web Store listing — FormatKit

Copy these into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole) for your extension item.

**Positioning:** One popup for **JSON formatter**, **YAML formatter**, **XML beautifier**, **TOML editor**, **CSV tidy**, and **convert between formats**. Emphasize **offline**, **no upload**, **developer utility**.

---

## Store listing

| Field | Text |
|---|---|
| **Name** | FormatKit — JSON, YAML, XML, TOML Formatter & Converter |
| **Summary** (short) | Format, minify, validate, and convert JSON, YAML, XML, TOML, CSV, SQL, and properties. Works offline in one click. |
| **Category** | Developer Tools |
| **Language** | English |

### Description (long)

FormatKit is a fast, offline formatter for developers and power users.

**Format & beautify**
- JSON — pretty-print, minify, sort keys
- YAML — readable multi-line output
- XML — indented tags with declaration
- TOML — clean config files
- CSV — aligned columns
- SQL — keyword casing and line breaks
- Properties — sorted `key=value` files

**Validate**
- Catch syntax errors before you paste into production
- Clear error messages in the popup status bar

**Convert**
- JSON ↔ YAML
- JSON ↔ XML
- JSON ↔ TOML
- JSON ↔ Properties
- YAML ↔ TOML
- YAML ↔ XML

**Productivity**
- Auto-detect format or choose manually
- Search and go-to-line in the editor
- Copy, paste, download output
- Light / dark theme
- Right-click selected JSON on any page → format and copy

**Privacy**
- 100% local processing
- No analytics, no servers, no account

Perfect for API responses, config files, CI logs, and quick data transforms.

---

## Screenshots (suggested)

1. JSON formatted with toolbar visible (1280×800 or 1280×720)
2. YAML → JSON conversion with format selector
3. Dark theme with XML output
4. Validate error state (optional)

---

## Privacy practices

| Question | Answer |
|---|---|
| Single purpose | Format and convert structured text locally |
| Data collected | None |
| Data use | N/A — offline only |
| Data shared | None |

---

## Tags / keywords

json formatter, yaml formatter, xml formatter, toml formatter, json to yaml, yaml to json, json beautifier, developer tools, offline formatter

---

## Release checklist

- [ ] Upload `dist/formatkit/formatkit.zip` from CI or `npm run zip:formatkit`
- [ ] Set `FORMATKIT_EXTENSION_ID` GitHub secret after first CWS item created
- [ ] Tag `formatkit@v2.0.0` to trigger release workflow
