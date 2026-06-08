# Install Tile Merge on your phone

Package: `app.autoapp.tilemerge`.

**Testing workflow:** use **Expo Go** for instant on-phone checks while developing; use **Expo cloud (EAS Build)** for final testing before release (real APK install).

## Quick dev on phone (Expo Go, SDK 54)

Phone Expo Go must match the project SDK (**54**).

```powershell
cd c:\Users\tejas.ve\Desktop\Tejas\Dev\Auto-App-tmp\Auto-App\apps\mobile\tile-merge
npm install --legacy-peer-deps
npm run start:lan
```

On phone: open **Expo Go** → enter the `exp://YOUR_PC_IP:8082` URL shown in the terminal (same Wi‑Fi).

For a real install without Expo Go, use the APK steps below.

## Prerequisites

- [Expo account](https://expo.dev/signup) (free)
- Google Play Developer account (for Play internal track later; **not required** for APK sideload)
- Node.js 20+ on your PC

## One-time setup

```powershell
cd c:\Users\tejas.ve\Desktop\Tejas\Dev\Auto-App-tmp\Auto-App\apps\mobile\tile-merge

# Generate launcher icons (if missing)
python ..\..\..\tools\mobile\generate-tile-merge-icons.py

npm install --legacy-peer-deps

# Install EAS CLI and log in (browser opens once)
npx eas-cli login
npx eas-cli init
```

When `eas init` asks to create/link a project, choose **Yes**. It writes `extra.eas.projectId` into `app.json`.

## Build preview APK (install link)

```powershell
npx eas-cli build --platform android --profile preview
```

- Build runs in Expo cloud (~10–20 min first time)
- When finished, terminal shows a **https://expo.dev/...** link
- Open that link **on your Android phone**
- Tap **Download** → install APK
- If blocked: Settings → allow install from browser / unknown sources

## Install on phone — step by step

1. Run the build command above on PC
2. Wait for **Build finished**
3. On phone, open the build URL from email or Expo dashboard
4. Download **APK**
5. Open downloaded file → **Install**
6. Launch **Tile Merge** from home screen

## Test checklist (on device)

- [ ] Swipe all four directions — tiles move and merge
- [ ] Score increases on merge
- [ ] Undo works
- [ ] New game resets board
- [ ] Best score survives force-close and reopen
- [ ] Mid-game board resumes after force-close and reopen
- [ ] Haptic feedback on merge (Android)
- [ ] Win at 2048 → overlay → continue or new game

Optional Maestro regression (with APK installed):

```powershell
cd c:\Users\tejas.ve\Desktop\Tejas\Dev\Auto-App-tmp\Auto-App
maestro test tools/mobile/maestro/tile-merge.yaml
```

## Rebuild after code changes

```powershell
cd apps\mobile\tile-merge
npx eas-cli build --platform android --profile preview
```

Re-download and install the new APK (or uninstall old version first if signing conflicts).

## Play Store internal testing (next)

See [PLAY_STORE.md](./PLAY_STORE.md) for full listing copy, privacy policy, and graphics checklist.

After APK testing passes:

```powershell
npx eas-cli build --platform android --profile production
```

Upload the **AAB** to Play Console → **Internal testing** → add testers by email.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Expo Go says SDK mismatch | Project must match Expo Go (currently **SDK 54**). Run `npm install --legacy-peer-deps` after pulling. |
| Expo Go won't connect | PC and phone on same Wi‑Fi; run `npm run start:lan`, enter URL in Expo Go manually |
| `eas: command not found` | Use `npx eas-cli` instead of `eas` |
| Not logged in | `npx eas-cli login` |
| Install blocked on phone | Enable unknown sources for Chrome/Files app |
| `projectId` missing | Run `npx eas-cli init` in `tile-merge` folder |
| Build fails on icons | Run `python tools/mobile/generate-tile-merge-icons.py` |
