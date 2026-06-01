# Mobile test checklist

Per-app checklist before Play Store / EAS production release.

## Tile Merge (`tile-merge`)

### Automated (required)

- [ ] `npm run validate:mobile -- tile-merge`
- [ ] `npm run test:mobile -- tile-merge` (33+ tests green)
- [ ] `npm run test:e2e:mobile -- tile-merge`

### Device manual — instant (Expo Go, during dev)

- [ ] `npm run start:lan` — app loads in Expo Go (SDK matches project)
- [ ] Swipe all four directions; merges feel correct
- [ ] Undo / new game work

### Device manual — final (EAS cloud APK, before release)

- [ ] `eas build --profile preview` — install APK from Expo cloud
- [ ] Swipe all four directions merges correctly (standalone app)
- [ ] Undo restores previous board
- [ ] New game clears history
- [ ] Best score persists after app restart
- [ ] Win overlay at 2048; continue works
- [ ] Game over overlay; restart works
- [ ] Haptics on merge (native only — silent on web)

### Maestro (recommended before release)

- [ ] `maestro test tools/mobile/maestro/tile-merge.yaml`

### Play Console (first release)

- [ ] App created with package `app.autoapp.tilemerge`
- [ ] Internal testing track populated
- [ ] Store listing: icon, screenshots, short description
- [ ] Privacy policy URL (required even for offline games)
- [ ] Content rating questionnaire complete
- [ ] Target audience / ads declaration (when AdMob added)

## Regression log

| Date | Bug | Test added |
|------|-----|------------|
| 2026-05 | Haptics crash on web swipe | `haptics.test.ts`, Playwright e2e |
| 2026-05 | Down swipe wrong direction | `game.test.ts` all-directions case |
