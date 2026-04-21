# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A browser-based WYSIWYG block diagram editor for Red Hat technical documentation. Enforces Red Hat brand standards (colors, fonts, shapes) so every diagram is on-brand. Runs entirely client-side with no backend. Deployed to GitHub Pages at `/rh-diagrams-designer/`.

## Commands

```bash
npm install                          # install dependencies
npm run dev                          # dev server → http://localhost:5173
npm run build                        # type-check (tsc -b) + production build → dist/
npm run lint                         # ESLint
npx vitest run                       # run all tests once
npx vitest run src/__tests__/foo.ts  # run a single test file
npx vitest                           # watch mode
```

## Architecture

**State management:** React Context + useReducer in two layers. `historyReducer.ts` wraps `diagramReducer` with undo/redo (past/present/future stacks). `DiagramContext.tsx` exposes both via the `useDiagram()` hook. State auto-persists to localStorage (excluding `selectedIds`, `tool`, and `networkLineColor`).

**History vs non-history actions:** Actions listed in `NON_HISTORY_ACTIONS` (`SET_SELECTION`, `SET_ZOOM`, `SET_SNAP`, `SET_TOOL`, `SET_NETWORK_LINE_COLOR`) update state without pushing to the undo stack. All other actions are history-tracked automatically.

**Data flow:** User action → `dispatch(action)` → `historyReducer` → `diagramReducer` → state update → re-render. All actions are the `DiagramAction` union in `types.ts`.

**Canvas rendering:** Konva `<Stage>` with `<Layer>`. Each shape type (`rect`, `circle`, `icon`, `text`, `network-line`) has its own component in `src/shapes/`. Shared behaviors (`useGroupDrag`, `useShapeClick`) live in `DiagramContext.tsx`. The Stage is 300px larger than the canvas on each side (`CANVAS.STAGE_PADDING`) so shapes can be parked off-canvas while laying out diagrams. Both Layers are offset by the padding; all pointer-to-canvas conversions use the `pointerToCanvas` helper in `Canvas.tsx`.

**Export pipeline:** `exportSvg.ts` and `exportPng.ts` read the Konva stage to produce downloads (SVG: 760px, PNG: 1520px @ 192 DPI). Only elements overlapping the canvas area are included — off-canvas shapes are filtered via `isOnCanvas()` from `elementBounds.ts`.

**Diagram file format:** JSON with `{ version: 1, elements, connectors, canvasHeight }`. Serialized via `src/utils/projectFile.ts`. Can also be loaded via URL hash: `#data=<base64-encoded-json>` (parsed by `src/utils/hashImport.ts`).

## Coding conventions

- **Types** go in `src/types.ts`; **constants** in `src/constants.ts`. Use `as const` for constant objects/arrays.
- Functional components only. Access state via `useDiagram()` — no prop drilling.
- PascalCase component files, each with a co-located `.css` file of the same name.
- Use `COLORS` from `constants.ts` — never hardcode hex values in components. Font is always `Red Hat Text`.
- Git commits: `type: description` (`feat:`, `fix:`, `style:`, `refactor:`, `test:`, `docs:`, `chore:`).

## Testing

Tests live in `src/__tests__/`. Konva cannot run in jsdom, so `vite.config.ts` aliases `konva` and `react-konva` to mock implementations in `src/__mocks__/`. If you add a new Konva API usage in a tested component, you may need to extend those mocks.

## Brand constraints

This editor intentionally limits choices for Red Hat brand compliance:

- **Colors:** Only the 13 palette colors in `COLORS` / `COLOR_SWATCHES` in `constants.ts`
- **Fonts:** Red Hat Text only, sizes 10–16px, weights bold/medium
- **Canvas:** Fixed width 760px, max height 900px
- **Grid:** 5px minor / 10px major snap grid
- **Box variants:** filled (blue), outlined (blue stroke), gray, white — defined in `BOX_VARIANTS`

Do not add arbitrary colors, fonts, or unconstrained styling options.

## Common contribution patterns

### Adding a new shape type
1. Add the type to `ShapeType` in `src/types.ts`
2. Create a renderer in `src/shapes/`
3. Register it in `Canvas.tsx` render logic
4. Add a drag source in `ComponentPanel.tsx`
5. Handle its properties in `PropertiesPanel.tsx`

### Adding a new icon
Add SVG path data to `src/shapes/iconPaths.ts` — it auto-appears in ComponentPanel.

### Adding a new action
1. Add to the `DiagramAction` union in `src/types.ts`
2. Handle in `diagramReducer` inside `src/state/historyReducer.ts`
3. If the action should NOT be undoable, add its type to `NON_HISTORY_ACTIONS`

### Adding a new color
Add to both `COLORS` and `COLOR_SWATCHES` in `src/constants.ts`. Must be an approved Red Hat brand color.

## Claude Code skills

Two skills in `.claude/skills/` generate diagram JSON files and open them in the browser:

- **`diagram-builder`** — Interactive Q&A flow. Asks structured multiple-choice questions about elements, connections, and layout, then generates the JSON. Use when building a diagram from scratch with no visual reference.
- **`screenshot-to-diagram`** — Analyzes a screenshot/image of an existing diagram and converts it to RH brand style. Runs a 6-phase pipeline: inventory → classify → layout → annotate (non-name text becomes numbered callout circles) → confirm with user → generate. Use when converting an existing diagram.

Both skills write to `./diagram.json` and open via URL hash: `xdg-open "https://aireilly.github.io/rh-diagrams-designer/#data=$(base64 -w0 ./diagram.json)"`.

## CI/CD

GitHub Actions (`.github/workflows/deploy.yml`) runs on push to `main`: checkout → Node 20 → `npm ci` → `npm run build` → deploy to GitHub Pages. No CI test step — run tests locally before pushing.

## Before submitting changes

1. `npm run lint` — no errors
2. `npx vitest run` — all tests pass
3. `npm run build` — clean build, no type errors
4. Test visually in the browser (`npm run dev`)
