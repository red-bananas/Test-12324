# Solutions memory

Postmortems and verified fixes. Agents read this before repeating mistakes.

## When to write

After: painful debug, store rejection, SDK version pitfall, AdMob incident, EAS build failure.

## Template

Create `docs/solutions/{topic}.md`:

```markdown
# {Topic}

## Symptom
What went wrong.

## Root cause
Verified cause (not guess).

## Fix
Exact commands or file changes.

## Prevention
Skill, CI check, or rule to add.
```

## Index

| Doc | Topic |
|-----|-------|
| [expo-sdk54-skia.md](expo-sdk54-skia.md) | Skia version for Expo SDK 54 |
| [admob-test-ids.md](admob-test-ids.md) | Safe AdMob testing |
| [play-ad-id-permission.md](play-ad-id-permission.md) | Play Console AD_ID manifest vs declaration |
| [usb-dev-build.md](usb-dev-build.md) | USB Android dev build setup |
