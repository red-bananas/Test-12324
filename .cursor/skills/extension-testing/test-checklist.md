# Extension test checklist

Use before merging extension work or tagging `{slug}@v*`.

## All extensions

- [ ] `node tools/extensions/validate.mjs {slug}` passes
- [ ] `node tools/extensions/zip.mjs {slug}` produces zip under `dist/{slug}/`
- [ ] `npm run test:extensions` passes (unit)
- [ ] No secrets or `.env` in extension folder

## FormatKit (`formatkit`)

- [ ] JSON format produces valid indented output
- [ ] JSON → YAML convert works
- [ ] After convert, auto-detect identifies YAML (not JSON)
- [ ] Minify on YAML content produces compact flow style (`{...}`); Format expands back to block YAML
- [ ] Syntax highlight HTML has no broken nested spans (`class=<span`) or slot leaks
- [ ] E2E: popup opens, Format sets Valid: yes on sample JSON
- [ ] E2E: Convert JSON→YAML then Minify does not re-JSON-minify

## utc-clock-pro / file-info

- [ ] validate + zip pass
- [ ] Manual smoke: load unpacked in Chrome (until E2E added)

## When fixing a bug

1. Add failing unit or E2E test that reproduces the bug.
2. Fix code.
3. Confirm all layers green.
4. Note the case in this file if it is non-obvious.
