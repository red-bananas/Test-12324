# Image to PDF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `apps/mobile/image-to-pdf/` — offline utility to capture/pick images, reorder/crop, export watermark-free PDF with hub + recents UI.

**Architecture:** Copy `scaffolds/mobile-expo-game` → utility layout mirroring `image-toolkit`: pure logic in `lib/`, lazy native imports, expo-router multi-screen flow (hub → camera | gallery → editor → success). PDF via `react-native-pdf-from-image`. Phase 1 excludes AdMob binary.

**Tech Stack:** Expo SDK 54, expo-router, expo-camera, expo-image-picker, expo-image-manipulator, expo-file-system, expo-sharing, react-native-pdf-from-image

**Spec:** [`docs/specs/image-to-pdf.md`](../../specs/image-to-pdf.md) (approved 2026-08-04)

---

## File map

| Path | Responsibility |
|------|----------------|
| `app/_layout.tsx` | Stack navigator, gesture + safe area |
| `app/index.tsx` | Hub: Camera/Gallery cards + Recent PDFs |
| `app/camera.tsx` | Full-screen `expo-camera` multi-page capture |
| `app/editor.tsx` | Page preview, reorder, crop, rotate, export CTA |
| `app/success.tsx` | Export result: path, size, share, create another |
| `app/settings.tsx` | Paper size, JPEG quality, theme |
| `lib/types.ts` | `PdfPage`, `PdfDocument`, `RecentPdf`, `ExportSettings` |
| `lib/theme.ts` | Design tokens (distinct accent from PixShrink) |
| `lib/pages.ts` | Pure: reorder, rotate, cap at 500, warn at 50+ |
| `lib/pdf.ts` | PDF export orchestrator (injectable deps for tests) |
| `lib/recents.ts` | Load/save recent PDF metadata (AsyncStorage) |
| `lib/picker.ts` | Lazy `launchImageLibraryAsync` multi-select |
| `lib/fs.ts` | Documents/ImageToPDF paths, file size formatting |
| `lib/share.ts` | Lazy expo-sharing wrapper |
| `lib/haptics.ts` | Tap/success haptics |
| `lib/monetization.ts` | `phase: 1` stub only |
| `components/ui.tsx` | Card, buttons, ToastBanner (from image-toolkit pattern) |
| `components/HubActions.tsx` | Camera + Gallery action cards |
| `components/RecentList.tsx` | Recent PDF rows |
| `components/PageStrip.tsx` | Thumbnail strip + drag reorder |
| `tests/game.test.ts` | Unit tests for `lib/pages.ts`, `lib/pdf.ts`, `lib/recents.ts` |
| `tests/smoke.test.tsx` | Hub render smoke (update strings, don't weaken) |

---

## Task 1: Scaffold and config

**Files:**
- Create: `apps/mobile/image-to-pdf/` (copy from `scaffolds/mobile-expo-game`)
- Modify: `app.yaml`, `app.json`, `package.json`, `eas.json`

- [ ] **Step 1:** Copy scaffold

```powershell
Copy-Item -Recurse scaffolds\mobile-expo-game apps\mobile\image-to-pdf
```

- [ ] **Step 2:** Fill `app.yaml`

```yaml
slug: image-to-pdf
lane: mobile
origin: manual
displayName: Image to PDF
androidPackage: app.autoapp.imagetopdf
iosBundleId: app.autoapp.imagetopdf
status: in-progress
archetype: utility
monetization: interstitial-phase2
store: google-play
version: 1.0.0
```

- [ ] **Step 3:** Update `app.json` — remove AdMob plugin for Phase 1; add camera + picker permissions

```json
{
  "expo": {
    "name": "Image to PDF",
    "slug": "image-to-pdf",
    "android": {
      "package": "app.autoapp.imagetopdf",
      "permissions": ["android.permission.CAMERA"]
    },
    "plugins": [
      "expo-router",
      ["expo-build-properties", { "android": { "minSdkVersion": 24, "enableMinifyInReleaseBuilds": false } }],
      ["expo-camera", { "cameraPermission": "Allow Image to PDF to take photos for your PDF documents." }],
      ["expo-image-picker", { "photosPermission": "Allow Image to PDF to pick photos to convert into a PDF." }]
    ]
  }
}
```

- [ ] **Step 4:** Install approved deps

```powershell
cd apps\mobile\image-to-pdf
npm install --legacy-peer-deps
npx expo install expo-camera expo-image-picker expo-image-manipulator expo-file-system expo-sharing expo-media-library
npm install react-native-pdf-from-image --legacy-peer-deps
```

- [ ] **Step 5:** Remove unused game scaffold files (`game/` folder) and AdMob from `package.json` if present

- [ ] **Step 6:** Register app in `tools/mobile/mobile.json` (follow image-toolkit entry pattern)

---

## Task 2: Theme and shared UI

**Files:**
- Create: `lib/theme.ts`, `components/ui.tsx`, `lib/haptics.ts`
- Reference: `apps/mobile/image-toolkit/lib/theme.ts`, `components/ui.tsx`

- [ ] **Step 1:** Copy `theme.ts` — change accent to indigo `#6366f1` (distinct from PixShrink teal)

- [ ] **Step 2:** Copy `ui.tsx` primitives: `Card`, `PrimaryButton`, `SecondaryButton`, `ToastBanner`

- [ ] **Step 3:** Copy `haptics.ts` from image-toolkit

- [ ] **Step 4:** Update `app/_layout.tsx` — Stack screens: `index`, `camera`, `editor`, `success`, `settings`

---

## Task 3: Pure page logic (TDD)

**Files:**
- Create: `lib/types.ts`, `lib/pages.ts`
- Test: `tests/game.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/game.test.ts
import { reorderPages, rotatePage, canAddPage, shouldWarnLargeDoc } from "../lib/pages";
import type { PdfPage } from "../lib/types";

const page = (id: string): PdfPage => ({ id, uri: `file://${id}.jpg`, width: 100, height: 100, rotation: 0 });

describe("pages", () => {
  it("reorders pages", () => {
    const pages = [page("a"), page("b"), page("c")];
    expect(reorderPages(pages, 0, 2).map((p) => p.id)).toEqual(["b", "c", "a"]);
  });

  it("rotates page 90 degrees", () => {
    const rotated = rotatePage(page("a"));
    expect(rotated.rotation).toBe(90);
  });

  it("caps at 500 pages", () => {
    expect(canAddPage(500)).toBe(false);
    expect(canAddPage(499)).toBe(true);
  });

  it("warns at 50+ pages", () => {
    expect(shouldWarnLargeDoc(49)).toBe(false);
    expect(shouldWarnLargeDoc(50)).toBe(true);
  });
});
```

- [ ] **Step 2:** Run `npm test` — expect FAIL

- [ ] **Step 3:** Implement `lib/types.ts` + `lib/pages.ts`

- [ ] **Step 4:** Run `npm test` — expect PASS

---

## Task 4: PDF export orchestrator (TDD)

**Files:**
- Create: `lib/pdf.ts`, `lib/fs.ts`
- Test: `tests/game.test.ts` (add describe block)

- [ ] **Step 1: Write failing test with mocked deps**

```typescript
import { exportPdf } from "../lib/pdf";

it("exportPdf calls createPdf with ordered image paths", async () => {
  const createPdf = jest.fn().mockResolvedValue({ filePath: "/tmp/out.pdf" });
  const pages = [page("a"), page("b")];
  const result = await exportPdf(pages, { paperSize: "A4", jpegQuality: 0.85 }, { createPdf });
  expect(createPdf).toHaveBeenCalledWith(
    expect.objectContaining({ imagePaths: expect.arrayContaining([expect.stringContaining("a")]) })
  );
  expect(result.filePath).toContain(".pdf");
});
```

- [ ] **Step 2:** Implement `lib/pdf.ts` — lazy import `react-native-pdf-from-image`; map `rotation` via manipulator pre-pass if needed

- [ ] **Step 3:** Implement `lib/fs.ts` — `getExportDir()`, `formatFileSize(bytes)`, `getUniquePdfName()`

- [ ] **Step 4:** Tests pass

---

## Task 5: Recents + picker

**Files:**
- Create: `lib/recents.ts`, `lib/picker.ts`
- Test: `tests/game.test.ts`

- [ ] **Step 1:** `lib/recents.ts` — AsyncStorage list, max 20 recents, `{ id, name, path, sizeBytes, pageCount, createdAt }`

- [ ] **Step 2:** `lib/picker.ts` — `pickImagesFromGallery()` → `launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 1 })`

- [ ] **Step 3:** Unit test recents add/list sort by date desc

---

## Task 6: Hub screen

**Files:**
- Create: `app/index.tsx`, `components/HubActions.tsx`, `components/RecentList.tsx`
- Test: `tests/smoke.test.tsx`

- [ ] **Step 1:** Hub layout per mockup — title "Image to PDF", gear → settings, two action cards, recent list

- [ ] **Step 2:** Camera card → `router.push("/camera")`

- [ ] **Step 3:** Gallery card → call `pickImagesFromGallery()` → on success `router.push({ pathname: "/editor", params: { source: "gallery" } })` with pages in context (use React context or route params via temp store in `lib/session.ts`)

- [ ] **Step 4:** Recent row tap → share or open via `lib/share.ts`

- [ ] **Step 5:** Empty recents: "Your exported PDFs appear here"

- [ ] **Step 6:** Update smoke test — expect "Image to PDF" and "Camera" accessibility labels

---

## Task 7: Camera screen

**Files:**
- Create: `app/camera.tsx`

- [ ] **Step 1:** Full-screen `CameraView` from expo-camera

- [ ] **Step 2:** Shutter captures photo → append to session pages in `lib/session.ts`

- [ ] **Step 3:** Thumbnail strip + `Done (N)` → `router.push("/editor")`

- [ ] **Step 4:** ✕ cancel — 0 pages → hub; with pages → confirm discard dialog

- [ ] **Step 5:** Permission denied → Alert + Linking.openSettings()

---

## Task 8: Editor screen

**Files:**
- Create: `app/editor.tsx`, `components/PageStrip.tsx`

- [ ] **Step 1:** Large page preview with swipe between pages

- [ ] **Step 2:** Crop via `expo-image-manipulator` crop action; Rotate via `lib/pages.rotatePage`

- [ ] **Step 3:** Drag reorder in `PageStrip` (use `react-native-gesture-handler` or simple move-left/right buttons for v1 if drag is heavy)

- [ ] **Step 4:** Delete page; `+` add more → hub or inline picker/camera

- [ ] **Step 5:** Export PDF button — if `shouldWarnLargeDoc` show Alert before proceed

- [ ] **Step 6:** Export → navigate to progress overlay then `success`

---

## Task 9: Export success screen

**Files:**
- Create: `app/success.tsx`

- [ ] **Step 1:** Show filename, `formatFileSize`, page count, full path

- [ ] **Step 2:** Share + Open in Files (`expo-sharing` + Intent)

- [ ] **Step 3:** `addRecent()` on successful export

- [ ] **Step 4:** "Create another" → `router.replace("/")` clears session

---

## Task 10: Settings screen

**Files:**
- Create: `app/settings.tsx`

- [ ] **Step 1:** Paper size (A4 default), JPEG quality slider, theme (system)

- [ ] **Step 2:** Persist settings in AsyncStorage

- [ ] **Step 3:** Privacy line: "100% offline — photos never leave your device"

---

## Task 11: Store docs and verify

**Files:**
- Create: `PLAY_STORE.md`, `PRIVACY.md`, `store/CREATIVES-BRIEF.md`

- [ ] **Step 1:** PLAY_STORE.md — title `Free Image to PDF - Offline`, short desc with "No watermark"

- [ ] **Step 2:** PRIVACY.md — offline, no data collection

- [ ] **Step 3:** Full verify

```powershell
cd apps\mobile\image-to-pdf
npm run typecheck && npm run lint && npm test
cd ..\..\..
npm run validate:mobile -- image-to-pdf
```

- [ ] **Step 4:** Record EAS preview APK size in spec `APK size budget` section after first build

---

## Task 12: E2E hook (optional but recommended)

**Files:**
- Create: `tools/mobile/tests/e2e/image-to-pdf.spec.mjs`
- Modify: `tools/mobile/mobile.json`

- [ ] **Step 1:** Web export smoke — hub renders, `?e2e=1` fixture loads editor with fake pages (mirror image-toolkit pattern)

---

## Spec coverage self-review

| Spec requirement | Task |
|------------------|------|
| Hub launch, no home | Task 6 |
| Custom full-screen camera | Task 7 |
| Native gallery multi-select | Task 5, 6 |
| Reorder, crop, rotate | Task 8 |
| 500 page cap, warn 50+ | Task 3 |
| Export + path + size | Task 4, 9 |
| Recent PDFs | Task 5, 6 |
| Phase 1 no ads | Task 1 (remove AdMob) |
| < 25 MB target | Task 1, 11 (measure) |
| No watermark | Task 9, 11 (store copy) |

---

## Human gates (do not skip)

- [ ] USB dev build: `npm run android` — camera, gallery, export, recents
- [ ] Human device QA approval before store
- [ ] Human approves store submit
- [ ] Production tag: `image-to-pdf@v1.0.0`
