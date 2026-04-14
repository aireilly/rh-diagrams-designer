# CLAUDE.md — Red Hat Diagrams Designer

## What this project is

A browser-based WYSIWYG block diagram editor for Red Hat technical documentation. It enforces Red Hat brand standards (colors, fonts, shapes) so every diagram is on-brand. Runs entirely client-side with no backend.

## Quick reference

```bash
npm install          # install dependencies
npm run dev          # start dev server → http://localhost:5173
npm run build        # type-check (tsc) + production build → dist/
npm run lint         # run ESLint
npx vitest run       # run tests once
npx vitest           # run tests in watch mode
make help            # show all Makefile targets
```

## Tech stack

- **React 18** + **TypeScript** (strict mode)
- **Konva.js** / **react-konva** for 2D canvas rendering
- **Vite** for bundling and dev server
- **Vitest** + **React Testing Library** for tests
- **ESLint** with typescript-eslint, react-hooks, and react-refresh plugins
- **GitHub Actions** deploys to GitHub Pages on push to `main`

## Project structure

```
src/
├── components/      # UI panels: Canvas, Toolbar, ComponentPanel, PropertiesPanel, StatusBar, ExportModal
├── shapes/          # Canvas shape renderers: RectShape, CircleCallout, TextLabel, IconShape, ConnectorLine
├── state/           # DiagramContext (React Context provider) + historyReducer (undo/redo)
├── utils/           # exportSvg, exportPng, projectFile (save/load JSON), snapGrid
├── __tests__/       # Test files (colocated in one directory)
├── __mocks__/       # Konva mocks for tests (canvas can't run in jsdom)
├── constants.ts     # Brand colors, fonts, grid settings, canvas dimensions
├── types.ts         # All TypeScript interfaces and type aliases
└── App.tsx          # Root layout composing all panels
```

## Architecture

**State management:** React Context + useReducer. `DiagramContext.tsx` provides state and dispatch via `useDiagram()` hook. `historyReducer.ts` wraps the diagram reducer with undo/redo (past/present/future stacks). State auto-persists to localStorage.

**Data flow:** User action -> `dispatch(action)` -> `diagramReducer` -> state update -> re-render. All actions are typed in `types.ts` as the `DiagramAction` union.

**Canvas rendering:** Konva `<Stage>` with `<Layer>` containing shape components. Each shape type has its own component in `src/shapes/`.

**Export pipeline:** `exportSvg.ts` and `exportPng.ts` read the Konva stage to generate downloads at specified dimensions (SVG: 760px, PNG: 1520px @ 192 DPI).

## Coding conventions

### TypeScript
- Strict mode is on (`strict: true`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)
- All types go in `src/types.ts`; all constants in `src/constants.ts`
- Use `as const` for constant objects and arrays

### React
- Functional components with hooks only (no class components)
- State injection via Context — no prop drilling
- Use `useDiagram()` to access state and dispatch
- Component files are PascalCase (e.g., `Canvas.tsx`)
- One CSS file per component, same name (e.g., `Canvas.css`)

### Style
- Each component imports its own `.css` file
- Use Red Hat brand colors from `COLORS` in `constants.ts` — never hardcode hex values in components
- Font family is always `Red Hat Text`

### Testing
- Tests live in `src/__tests__/`
- Konva must be mocked in tests (see `src/__mocks__/`)
- Use Vitest + React Testing Library conventions
- Run `npx vitest run` to verify changes don't break existing tests

### Git commits
- Format: `type: description` (e.g., `feat:`, `fix:`, `style:`, `docs:`, `refactor:`, `test:`)
- Keep messages concise (one line preferred)

## Brand constraints

This editor intentionally limits choices to enforce Red Hat brand compliance:

- **Colors:** Only the 13 palette colors defined in `COLORS` / `COLOR_SWATCHES` in `constants.ts`
- **Fonts:** Red Hat Text only, sizes 10-16px, weights bold/medium
- **Canvas:** Fixed width 760px, max height 900px
- **Grid:** 5px minor / 10px major snap grid
- **Box variants:** filled (blue), outlined (blue stroke), gray, white — defined in `BOX_VARIANTS`

Do not add arbitrary colors, fonts, or unconstrained styling options.

## Common contribution patterns

### Adding a new shape type
1. Add the type to `ShapeType` in `src/types.ts`
2. Create a renderer component in `src/shapes/`
3. Register it in `Canvas.tsx` render logic
4. Add a drag source in `ComponentPanel.tsx`
5. Handle its properties in `PropertiesPanel.tsx`

### Adding a new icon
1. Add the SVG path data to `src/shapes/iconPaths.ts`
2. It will automatically appear in the ComponentPanel icon grid

### Adding a new color
1. Add it to `COLORS` and `COLOR_SWATCHES` in `src/constants.ts`
2. Verify it is an approved Red Hat brand color

### Adding a new action
1. Add the action type to the `DiagramAction` union in `src/types.ts`
2. Handle it in `diagramReducer` inside `src/state/DiagramContext.tsx`
3. History-tracked actions are wrapped automatically by `historyReducer.ts`

## CI/CD

- GitHub Actions runs on every push to `main` (`.github/workflows/deploy.yml`)
- Pipeline: checkout -> Node 20 setup -> `npm ci` -> `npm run build` -> deploy to GitHub Pages
- There is no CI test step yet — run tests locally before pushing

## Before submitting changes

1. `npm run lint` — no ESLint errors
2. `npx vitest run` — all tests pass
3. `npm run build` — clean build with no type errors
4. Test your changes visually in the browser (`npm run dev`)
