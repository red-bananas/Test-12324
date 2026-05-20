# Agent instructions — Web (Next.js 15) clone

You are building a **client-side-only** web app clone in this Next.js 15 + TypeScript + Tailwind project. Read `clone-spec.json` at the repo root for the target spec.

## Hard rules (non-negotiable)

1. **No backend.** No API routes, no `fetch` to a server, no database, no auth. Everything runs in the browser. State persists via `localStorage` if needed.
2. **No brand copy.** Do NOT use the original product's name, logo, brand colors, tagline, or marketing copy anywhere in the code, UI, or metadata. Use `distinct_name` and `tagline` from the spec.
3. **Don't change these files:**
   - `package.json` scripts section
   - `vitest.config.ts`
   - `tests/smoke.test.tsx` (you may ADD more test files, but don't delete or weaken this one)
4. **Tests must pass.** `npm test` must exit 0. `npx next build` must exit 0. If your changes break either, fix them in the same iteration.

## Where to put things

- Pages live in `app/`. The home page is `app/page.tsx`. Add routes as `app/<route>/page.tsx`.
- Reusable components go in `components/`. Create the folder if it doesn't exist.
- Hooks go in `hooks/`. State helpers go in `lib/`.
- Styles: Tailwind utility classes. Global styles in `app/globals.css`.
- Tests: `tests/*.test.tsx`, vitest + @testing-library/react.

## Build approach

1. Replace `app/page.tsx` with the main UI for the cloned tool.
2. Implement each feature in `spec.features[]` as either a component or a page route.
3. Use React state (`useState`, `useReducer`) for ephemeral state; `localStorage` for persistence.
4. For canvas/drawing tools, use HTML5 `<canvas>` directly or `react-konva` (add to dependencies if needed).
5. Keep components small (< 200 lines). Split when they grow.
6. Add at least 2 more meaningful tests in `tests/` beyond the smoke test — one for a key feature interaction.

## Allowed dependency additions

You may add these without asking: `react-konva`, `konva`, `zustand`, `clsx`, `tailwind-merge`, `lucide-react`, `date-fns`, `nanoid`, `idb-keyval`, `react-hot-toast`, `framer-motion`.

For anything else, prefer writing the code yourself over adding a dep.

## Visual identity

Use the `ui_direction` and `brand_distance_notes` from `clone-spec.json` to pick a palette and feel that is **clearly distinct** from the original. If the spec doesn't specify, choose a neutral palette (slate/zinc/emerald or similar) — never the original brand's colors.

## When stuck

If a feature in the spec is too complex to fit in one iteration, implement a clearly-stubbed version with a TODO comment naming the missing capability. Keep `npm test` green.
