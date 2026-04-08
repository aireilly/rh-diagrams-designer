# Red Hat Diagrams Designer

A browser-based WYSIWYG block diagram editor for Red Hat technical documentation. Create production-ready diagrams that comply with Red Hat brand standards — no design skills required.

Built with React, TypeScript, and Konva.js. Runs entirely client-side.

## Features

- **Constrained palette** — enforced Red Hat colors, fonts, and shapes so every diagram is on-brand
- **Shape library** — filled/outlined/gray/white boxes, numbered callouts, 6 Red Hat icons (Server, Person, Software, Terminal, Scale, Cost), text labels, and connectors (solid/dashed, with arrow options)
- **Snap-to-grid canvas** — 5 px minor grid, 10 px major grid, toggleable snap
- **Zoom & pan** — 25 %–400 % zoom, middle-click or Space+drag to pan
- **Inline text editing** — double-click any shape to edit text directly on the canvas
- **Undo / redo** — full history stack (Ctrl+Z / Ctrl+Shift+Z)
- **Properties panel** — edit font size, weight, fill color, stroke color, and dimensions for the selected element
- **Export** — SVG (760 px wide, embedded font references) and PNG (2x resolution, 192 DPI)
- **Save / load** — persist your work as a versioned JSON project file

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production (`dist/`) |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Tech stack

- [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Konva.js](https://konvajs.org/) / [react-konva](https://konvajs.org/docs/react/) — 2D canvas rendering
- [Vite](https://vite.dev/) — build tooling
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) — tests

## Project structure

```
src/
├── components/      # UI panels: Canvas, Toolbar, ComponentPanel, PropertiesPanel, StatusBar, ExportModal
├── shapes/          # Canvas shape components: RectShape, CircleCallout, TextLabel, IconShape, ConnectorLine
├── state/           # DiagramContext (React context) + historyReducer (undo/redo)
├── utils/           # Export (SVG, PNG), project save/load, grid snapping
├── constants.ts     # Colors, fonts, grid settings, canvas dimensions
├── types.ts         # TypeScript interfaces
└── App.tsx          # Root layout
```

## Export workflow

1. Click **Export** in the toolbar.
2. Fill in issue number, product family, and description.
3. Choose **SVG** or **PNG** — the filename is generated automatically as `<issue>_<product>_<description>_<mmyy>`.
4. Or click **Save Project** to download a JSON file you can reload later.

## Color palette

| Color | Hex | Usage |
|-------|-----|-------|
| Red Hat Blue | `#0066cc` | Primary fills, strokes |
| Blue Tint Light | `#99c2eb` | Secondary fills |
| Blue Tint Lighter | `#d9e8f7` | Tertiary fills |
| Dark Gray | `#262626` | Text, lines, arrows |
| Medium Gray | `#595959` | Secondary text |
| Light Gray | `#e5e5e5` | Backgrounds |
| White | `#ffffff` | Light fills, text on dark |

## License

Internal Red Hat tooling.
