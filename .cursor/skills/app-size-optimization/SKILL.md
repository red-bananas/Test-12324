---
name: app-size-optimization
description: >-
  Reduce Android APK/AAB size for Expo mobile apps without changing behavior.
  Use during build polish or when user asks to make the app smaller.
---

# App Size Optimization

Run after feature-complete, before EAS production build. Goal: smallest APK that passes all tests and device QA.

## Quick wins (check in order)

1. **Remove unused dependencies** — `npm ls` + search imports; drop Skia if not used.
2. **No dev deps in production** — verify `package.json` separation.
3. **Enable minify** — `expo-build-properties` → `enableMinifyInReleaseBuilds: true` (test thoroughly — can break reflection).
4. **ProGuard rules** — only add keeps for libs that need them (AdMob rules in tile-merge `app.json`).
5. **Asset audit** — compress PNGs; no 4K splash if unnecessary.
6. **Lazy import** — heavy screens via `React.lazy` / dynamic `import()` where safe.
7. **Hermes** — default on Expo 54; keep enabled.

## Do not do without human approval

- Remove features to save size
- Add new compression native modules
- Strip ad SDK (if monetization enabled)

## Measure

```bash
cd apps/mobile/{slug}
eas build --platform android --profile preview
# Check build page for APK size
```

Compare before/after in solution doc.

## Spec field

Add to `docs/specs/{slug}.md`:

```markdown
## APK size budget
- Target: < {X} MB download size on Play Store
- Current: {measure after preview build}
```

## Reference

`apps/mobile/tile-merge/app.json` — `enableMinifyInReleaseBuilds: false` (conservative); enable only after QA pass.
