# Red Hat Diagram Designer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based WYSIWYG diagram creator that enforces Red Hat brand standards and exports production-ready SVG/PNG files.

**Architecture:** React + TypeScript app with Konva.js canvas. Left panel for dragging components, center canvas with 5px grid, right panel for properties. All client-side — no backend. State managed via React context with an undo/redo history stack.

**Tech Stack:** React 18, TypeScript, Konva.js, react-konva, Vite

---

## File Structure

```
src/
├── main.tsx                      — App entry point, renders App
├── App.tsx                       — Top-level layout: Toolbar, ComponentPanel, Canvas, PropertiesPanel, StatusBar
├── App.css                       — Global styles, layout grid
├── types.ts                      — All shared TypeScript types (DiagramElement, Connector, AppState, etc.)
├── constants.ts                  — Colors, font sizes, grid settings, export settings
├── state/
│   ├── DiagramContext.tsx         — React context provider for diagram state
│   └── historyReducer.ts         — Reducer with undo/redo stack
├── components/
│   ├── Toolbar.tsx                — Top bar: file ops, undo/redo, zoom, align, export
│   ├── Toolbar.css                — Toolbar styles
│   ├── ComponentPanel.tsx         — Left sidebar: draggable shape/icon/connector list
│   ├── ComponentPanel.css         — Component panel styles
│   ├── PropertiesPanel.tsx        — Right sidebar: selected element properties
│   ├── PropertiesPanel.css        — Properties panel styles
│   ├── StatusBar.tsx              — Bottom bar: dimensions, zoom, snap toggle
│   ├── StatusBar.css              — Status bar styles
│   ├── Canvas.tsx                 — Konva Stage + Layer, grid rendering, drop target
│   ├── Canvas.css                 — Canvas container styles
│   ├── ExportModal.tsx            — Export dialog with filename generation
│   └── ExportModal.css            — Export modal styles
├── shapes/
│   ├── RectShape.tsx              — Konva Rect + Text for box variants
│   ├── CircleCallout.tsx          — Numbered circle callout
│   ├── IconShape.tsx              — SVG icon with label
│   ├── TextLabel.tsx              — Standalone text block
│   ├── ConnectorLine.tsx          — Line/arrow connector between shapes
│   └── iconPaths.ts              — SVG path data for the 6 Red Hat icons
├── utils/
│   ├── exportSvg.ts              — Generate clean SVG from canvas state
│   ├── exportPng.ts              — Generate PNG at 2x from canvas
│   ├── snapGrid.ts               — Snap coordinate to grid
│   ├── alignmentGuides.ts        — Calculate alignment guide positions
│   └── projectFile.ts            — Save/load JSON project files
├── __tests__/
│   ├── constants.test.ts          — Verify color palette, font sizes, grid values
│   ├── historyReducer.test.ts     — Undo/redo state management
│   ├── snapGrid.test.ts          — Grid snapping logic
│   ├── alignmentGuides.test.ts   — Alignment guide calculations
│   ├── exportSvg.test.ts         — SVG generation
│   ├── projectFile.test.ts       — Save/load round-trip
│   └── App.test.tsx              — Smoke test: app renders without crashing
index.html                        — Vite HTML entry
package.json                      — Dependencies and scripts
tsconfig.json                     — TypeScript config
vite.config.ts                    — Vite config
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/App.css`

- [ ] **Step 1: Initialize project with Vite**

```bash
cd /home/aireilly/rh-diagrams-designer
npm create vite@latest . -- --template react-ts
```

When prompted about existing files, choose to overwrite/ignore (the `docs/` dir will be preserved).

- [ ] **Step 2: Install dependencies**

```bash
npm install konva react-konva
npm install -D @types/react @types/react-dom vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] **Step 3: Configure Vitest**

Replace the contents of `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
```

Create `src/test-setup.ts`:

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Update tsconfig.json**

Ensure `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Replace App.tsx with skeleton layout**

```tsx
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="toolbar">Toolbar</header>
      <aside className="component-panel">Components</aside>
      <main className="canvas-area">Canvas</main>
      <aside className="properties-panel">Properties</aside>
      <footer className="status-bar">Status</footer>
    </div>
  );
}

export default App;
```

- [ ] **Step 6: Replace App.css with layout grid**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --toolbar-height: 48px;
  --statusbar-height: 32px;
  --panel-width: 240px;
  --bg-color: #f5f5f5;
  --border-color: #d0d0d0;
}

body {
  font-family: 'Red Hat Text', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
}

.app {
  display: grid;
  grid-template-columns: var(--panel-width) 1fr var(--panel-width);
  grid-template-rows: var(--toolbar-height) 1fr var(--statusbar-height);
  grid-template-areas:
    "toolbar toolbar toolbar"
    "component-panel canvas properties-panel"
    "statusbar statusbar statusbar";
  height: 100vh;
  width: 100vw;
}

.toolbar {
  grid-area: toolbar;
  background: #ffffff;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 12px;
  gap: 8px;
}

.component-panel {
  grid-area: component-panel;
  background: #ffffff;
  border-right: 1px solid var(--border-color);
  overflow-y: auto;
  padding: 12px;
}

.canvas-area {
  grid-area: canvas;
  background: var(--bg-color);
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.properties-panel {
  grid-area: properties-panel;
  background: #ffffff;
  border-left: 1px solid var(--border-color);
  overflow-y: auto;
  padding: 12px;
}

.status-bar {
  grid-area: statusbar;
  background: #ffffff;
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  padding: 0 12px;
  font-size: 12px;
  color: #595959;
}
```

- [ ] **Step 7: Write smoke test**

Create `src/__tests__/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the layout skeleton', () => {
    render(<App />);
    expect(screen.getByText('Toolbar')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Canvas')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
```

- [ ] **Step 8: Run tests**

```bash
npx vitest run
```

Expected: 1 test passes.

- [ ] **Step 9: Verify dev server**

```bash
npm run dev
```

Expected: App loads in browser showing 5-panel layout grid.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + Konva project with layout grid"
```

---

## Task 2: Types and Constants

**Files:**
- Create: `src/types.ts`, `src/constants.ts`, `src/__tests__/constants.test.ts`

- [ ] **Step 1: Write the failing test for constants**

Create `src/__tests__/constants.test.ts`:

```typescript
import { COLORS, FONT_SIZES, FONT_WEIGHTS, GRID, CANVAS, EXPORT_SETTINGS, LINE_WEIGHTS, ARROWHEAD } from '../constants';

describe('constants', () => {
  describe('COLORS', () => {
    it('has all required palette colors', () => {
      expect(COLORS.BLUE_PRIMARY).toBe('#0066cc');
      expect(COLORS.BLUE_TINT_LIGHT).toBe('#99c2eb');
      expect(COLORS.BLUE_TINT_LIGHTER).toBe('#d9e8f7');
      expect(COLORS.DARK_GRAY).toBe('#262626');
      expect(COLORS.MEDIUM_GRAY).toBe('#595959');
      expect(COLORS.LIGHT_GRAY).toBe('#e5e5e5');
      expect(COLORS.ICON_GRAY).toBe('#7f7f7f');
      expect(COLORS.WHITE).toBe('#ffffff');
      expect(COLORS.WATERMARK_GRAY).toBe('#ececec');
    });
  });

  describe('FONT_SIZES', () => {
    it('has all discrete font size steps', () => {
      expect(FONT_SIZES).toEqual([16, 14, 12, 11, 10]);
    });
  });

  describe('FONT_WEIGHTS', () => {
    it('has bold and medium', () => {
      expect(FONT_WEIGHTS).toEqual(['bold', 'medium']);
    });
  });

  describe('GRID', () => {
    it('has 5px minor and 10px major', () => {
      expect(GRID.MINOR).toBe(5);
      expect(GRID.MAJOR).toBe(10);
    });
  });

  describe('CANVAS', () => {
    it('has correct dimensions', () => {
      expect(CANVAS.WIDTH).toBe(760);
      expect(CANVAS.MAX_HEIGHT).toBe(900);
      expect(CANVAS.DEFAULT_HEIGHT).toBe(600);
    });
  });

  describe('EXPORT_SETTINGS', () => {
    it('has correct PNG export values', () => {
      expect(EXPORT_SETTINGS.PNG_WIDTH).toBe(1520);
      expect(EXPORT_SETTINGS.DPI).toBe(192);
      expect(EXPORT_SETTINGS.PHYS_DPI).toBe(96);
      expect(EXPORT_SETTINGS.BACKGROUND).toBe('#ffffffff');
    });
  });

  describe('LINE_WEIGHTS', () => {
    it('has default and network weights', () => {
      expect(LINE_WEIGHTS.DEFAULT).toBe(1);
      expect(LINE_WEIGHTS.NETWORK).toBe(2);
    });
  });

  describe('ARROWHEAD', () => {
    it('has correct arrowhead dimensions', () => {
      expect(ARROWHEAD.SIZE_X).toBe(1.6);
      expect(ARROWHEAD.SIZE_Y).toBe(1.6);
      expect(ARROWHEAD.PADDING).toBe(2.5);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/constants.test.ts
```

Expected: FAIL — module `../constants` not found.

- [ ] **Step 3: Create types.ts**

Create `src/types.ts`:

```typescript
export type ShapeType = 'rect' | 'circle' | 'icon' | 'text';
export type ConnectorType = 'solid' | 'dashed';
export type ArrowDirection = 'forward' | 'bidirectional' | 'none';
export type FontWeight = 'bold' | 'medium';
export type BoxVariant = 'filled' | 'outlined' | 'gray' | 'white';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface DiagramElement {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text: string;
  fontSize: number;
  fontWeight: FontWeight;
  textColor: string;
  variant?: BoxVariant;
  iconId?: string;
  groupId?: string | null;
}

export interface Connector {
  id: string;
  fromId: string;
  toId: string;
  lineType: ConnectorType;
  arrowDirection: ArrowDirection;
  strokeWidth: number;
  stroke: string;
  points: number[];
  isElbow: boolean;
}

export interface DiagramState {
  elements: DiagramElement[];
  connectors: Connector[];
  selectedIds: string[];
  canvasHeight: number;
  zoom: number;
  snapEnabled: boolean;
  tool: ToolType;
}

export type ToolType = 'select' | 'connector-solid' | 'connector-dashed' | 'text';

export type DiagramAction =
  | { type: 'ADD_ELEMENT'; element: DiagramElement }
  | { type: 'UPDATE_ELEMENT'; id: string; changes: Partial<DiagramElement> }
  | { type: 'DELETE_ELEMENTS'; ids: string[] }
  | { type: 'MOVE_ELEMENT'; id: string; x: number; y: number }
  | { type: 'ADD_CONNECTOR'; connector: Connector }
  | { type: 'UPDATE_CONNECTOR'; id: string; changes: Partial<Connector> }
  | { type: 'DELETE_CONNECTORS'; ids: string[] }
  | { type: 'SET_SELECTION'; ids: string[] }
  | { type: 'SET_CANVAS_HEIGHT'; height: number }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_SNAP'; enabled: boolean }
  | { type: 'SET_TOOL'; tool: ToolType }
  | { type: 'LOAD_STATE'; state: DiagramState }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export interface HistoryState {
  past: DiagramState[];
  present: DiagramState;
  future: DiagramState[];
}

export interface ExportOptions {
  issueNumber: string;
  productFamily: string;
  description: string;
  date: string;
  format: 'svg' | 'png' | 'both';
}
```

- [ ] **Step 4: Create constants.ts**

Create `src/constants.ts`:

```typescript
export const COLORS = {
  BLUE_PRIMARY: '#0066cc',
  BLUE_TINT_LIGHT: '#99c2eb',
  BLUE_TINT_LIGHTER: '#d9e8f7',
  DARK_GRAY: '#262626',
  MEDIUM_GRAY: '#595959',
  LIGHT_GRAY: '#e5e5e5',
  ICON_GRAY: '#7f7f7f',
  WHITE: '#ffffff',
  WATERMARK_GRAY: '#ececec',
} as const;

export const COLOR_SWATCHES = [
  { name: 'Red Hat Blue', hex: COLORS.BLUE_PRIMARY },
  { name: 'Blue Tint Light', hex: COLORS.BLUE_TINT_LIGHT },
  { name: 'Blue Tint Lighter', hex: COLORS.BLUE_TINT_LIGHTER },
  { name: 'Dark Gray', hex: COLORS.DARK_GRAY },
  { name: 'Medium Gray', hex: COLORS.MEDIUM_GRAY },
  { name: 'Light Gray', hex: COLORS.LIGHT_GRAY },
  { name: 'Icon Gray', hex: COLORS.ICON_GRAY },
  { name: 'White', hex: COLORS.WHITE },
  { name: 'Watermark Gray', hex: COLORS.WATERMARK_GRAY },
] as const;

export const FONT_SIZES = [16, 14, 12, 11, 10] as const;

export const FONT_WEIGHTS = ['bold', 'medium'] as const;

export const FONT_FAMILY = 'Red Hat Text';

export const GRID = {
  MINOR: 5,
  MAJOR: 10,
} as const;

export const CANVAS = {
  WIDTH: 760,
  MAX_HEIGHT: 900,
  DEFAULT_HEIGHT: 600,
} as const;

export const EXPORT_SETTINGS = {
  PNG_WIDTH: 1520,
  DPI: 192,
  PHYS_DPI: 96,
  BACKGROUND: '#ffffffff',
} as const;

export const LINE_WEIGHTS = {
  DEFAULT: 1,
  NETWORK: 2,
} as const;

export const ARROWHEAD = {
  SIZE_X: 1.6,
  SIZE_Y: 1.6,
  PADDING: 2.5,
} as const;

export const CALLOUT_CIRCLE = {
  RADIUS: 15,
  FILL: COLORS.DARK_GRAY,
  TEXT_COLOR: COLORS.WHITE,
  FONT_SIZE: 16,
} as const;

export const BOX_VARIANTS = {
  filled: { fill: COLORS.BLUE_PRIMARY, stroke: '', strokeWidth: 0, textColor: COLORS.WHITE },
  outlined: { fill: '', stroke: COLORS.BLUE_PRIMARY, strokeWidth: 2, textColor: COLORS.DARK_GRAY },
  gray: { fill: COLORS.LIGHT_GRAY, stroke: '', strokeWidth: 0, textColor: COLORS.DARK_GRAY },
  white: { fill: COLORS.WHITE, stroke: '', strokeWidth: 0, textColor: COLORS.DARK_GRAY },
} as const;

export const ZOOM = {
  MIN: 0.25,
  MAX: 4,
  STEP: 0.1,
} as const;
```

- [ ] **Step 5: Run tests**

```bash
npx vitest run src/__tests__/constants.test.ts
```

Expected: All tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/types.ts src/constants.ts src/__tests__/constants.test.ts
git commit -m "feat: add type definitions and design system constants"
```

---

## Task 3: Grid Snapping Utility

**Files:**
- Create: `src/utils/snapGrid.ts`, `src/__tests__/snapGrid.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/snapGrid.test.ts`:

```typescript
import { snapToGrid, snapPosition } from '../utils/snapGrid';

describe('snapToGrid', () => {
  it('snaps a value to the nearest 5px grid point', () => {
    expect(snapToGrid(12, 5)).toBe(10);
    expect(snapToGrid(13, 5)).toBe(15);
    expect(snapToGrid(15, 5)).toBe(15);
    expect(snapToGrid(0, 5)).toBe(0);
    expect(snapToGrid(3, 5)).toBe(5);
  });

  it('snaps to 10px increments for resizing', () => {
    expect(snapToGrid(124, 10)).toBe(120);
    expect(snapToGrid(126, 10)).toBe(130);
  });
});

describe('snapPosition', () => {
  it('snaps both x and y to 5px grid', () => {
    expect(snapPosition(12, 17, 5)).toEqual({ x: 10, y: 15 });
  });

  it('returns exact values when increment is 1', () => {
    expect(snapPosition(12.7, 17.3, 1)).toEqual({ x: 13, y: 17 });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/snapGrid.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement snapGrid.ts**

Create `src/utils/snapGrid.ts`:

```typescript
export function snapToGrid(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function snapPosition(x: number, y: number, increment: number): { x: number; y: number } {
  return {
    x: snapToGrid(x, increment),
    y: snapToGrid(y, increment),
  };
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/__tests__/snapGrid.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/utils/snapGrid.ts src/__tests__/snapGrid.test.ts
git commit -m "feat: add grid snapping utility"
```

---

## Task 4: History Reducer (Undo/Redo State Management)

**Files:**
- Create: `src/state/historyReducer.ts`, `src/__tests__/historyReducer.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/historyReducer.test.ts`:

```typescript
import { historyReducer, createInitialHistoryState } from '../state/historyReducer';
import { DiagramState, DiagramElement } from '../types';

function makeElement(overrides: Partial<DiagramElement> = {}): DiagramElement {
  return {
    id: 'el-1',
    type: 'rect',
    x: 0,
    y: 0,
    width: 180,
    height: 100,
    rotation: 0,
    fill: '#0066cc',
    stroke: '',
    strokeWidth: 0,
    text: 'Test',
    fontSize: 16,
    fontWeight: 'bold',
    textColor: '#ffffff',
    groupId: null,
    ...overrides,
  };
}

describe('historyReducer', () => {
  const initial = createInitialHistoryState();

  it('starts with empty elements and connectors', () => {
    expect(initial.present.elements).toEqual([]);
    expect(initial.present.connectors).toEqual([]);
    expect(initial.past).toEqual([]);
    expect(initial.future).toEqual([]);
  });

  it('ADD_ELEMENT adds to elements and pushes to past', () => {
    const el = makeElement();
    const next = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    expect(next.present.elements).toHaveLength(1);
    expect(next.present.elements[0].id).toBe('el-1');
    expect(next.past).toHaveLength(1);
    expect(next.future).toEqual([]);
  });

  it('UNDO restores previous state', () => {
    const el = makeElement();
    const afterAdd = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    const afterUndo = historyReducer(afterAdd, { type: 'UNDO' });
    expect(afterUndo.present.elements).toEqual([]);
    expect(afterUndo.past).toEqual([]);
    expect(afterUndo.future).toHaveLength(1);
  });

  it('REDO restores undone state', () => {
    const el = makeElement();
    const afterAdd = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    const afterUndo = historyReducer(afterAdd, { type: 'UNDO' });
    const afterRedo = historyReducer(afterUndo, { type: 'REDO' });
    expect(afterRedo.present.elements).toHaveLength(1);
    expect(afterRedo.future).toEqual([]);
  });

  it('UNDO does nothing when past is empty', () => {
    const afterUndo = historyReducer(initial, { type: 'UNDO' });
    expect(afterUndo).toBe(initial);
  });

  it('REDO does nothing when future is empty', () => {
    const afterRedo = historyReducer(initial, { type: 'REDO' });
    expect(afterRedo).toBe(initial);
  });

  it('new action clears future', () => {
    const el1 = makeElement({ id: 'el-1' });
    const el2 = makeElement({ id: 'el-2' });
    const s1 = historyReducer(initial, { type: 'ADD_ELEMENT', element: el1 });
    const s2 = historyReducer(s1, { type: 'UNDO' });
    expect(s2.future).toHaveLength(1);
    const s3 = historyReducer(s2, { type: 'ADD_ELEMENT', element: el2 });
    expect(s3.future).toEqual([]);
  });

  it('UPDATE_ELEMENT updates element properties', () => {
    const el = makeElement();
    const s1 = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    const s2 = historyReducer(s1, { type: 'UPDATE_ELEMENT', id: 'el-1', changes: { text: 'Updated' } });
    expect(s2.present.elements[0].text).toBe('Updated');
  });

  it('DELETE_ELEMENTS removes elements by id', () => {
    const el = makeElement();
    const s1 = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    const s2 = historyReducer(s1, { type: 'DELETE_ELEMENTS', ids: ['el-1'] });
    expect(s2.present.elements).toHaveLength(0);
  });

  it('MOVE_ELEMENT updates x and y', () => {
    const el = makeElement();
    const s1 = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    const s2 = historyReducer(s1, { type: 'MOVE_ELEMENT', id: 'el-1', x: 100, y: 200 });
    expect(s2.present.elements[0].x).toBe(100);
    expect(s2.present.elements[0].y).toBe(200);
  });

  it('SET_SELECTION does not push to history', () => {
    const s1 = historyReducer(initial, { type: 'SET_SELECTION', ids: ['el-1'] });
    expect(s1.present.selectedIds).toEqual(['el-1']);
    expect(s1.past).toEqual([]);
  });

  it('SET_ZOOM does not push to history', () => {
    const s1 = historyReducer(initial, { type: 'SET_ZOOM', zoom: 2 });
    expect(s1.present.zoom).toBe(2);
    expect(s1.past).toEqual([]);
  });

  it('SET_SNAP does not push to history', () => {
    const s1 = historyReducer(initial, { type: 'SET_SNAP', enabled: false });
    expect(s1.present.snapEnabled).toBe(false);
    expect(s1.past).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/historyReducer.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement historyReducer.ts**

Create `src/state/historyReducer.ts`:

```typescript
import { DiagramState, DiagramAction, HistoryState } from '../types';
import { CANVAS } from '../constants';

function createInitialDiagramState(): DiagramState {
  return {
    elements: [],
    connectors: [],
    selectedIds: [],
    canvasHeight: CANVAS.DEFAULT_HEIGHT,
    zoom: 1,
    snapEnabled: true,
    tool: 'select',
  };
}

export function createInitialHistoryState(): HistoryState {
  return {
    past: [],
    present: createInitialDiagramState(),
    future: [],
  };
}

function diagramReducer(state: DiagramState, action: DiagramAction): DiagramState {
  switch (action.type) {
    case 'ADD_ELEMENT':
      return { ...state, elements: [...state.elements, action.element] };

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, ...action.changes } : el
        ),
      };

    case 'DELETE_ELEMENTS':
      return {
        ...state,
        elements: state.elements.filter((el) => !action.ids.includes(el.id)),
        selectedIds: state.selectedIds.filter((id) => !action.ids.includes(id)),
      };

    case 'MOVE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, x: action.x, y: action.y } : el
        ),
      };

    case 'ADD_CONNECTOR':
      return { ...state, connectors: [...state.connectors, action.connector] };

    case 'UPDATE_CONNECTOR':
      return {
        ...state,
        connectors: state.connectors.map((c) =>
          c.id === action.id ? { ...c, ...action.changes } : c
        ),
      };

    case 'DELETE_CONNECTORS':
      return {
        ...state,
        connectors: state.connectors.filter((c) => !action.ids.includes(c.id)),
      };

    case 'SET_SELECTION':
      return { ...state, selectedIds: action.ids };

    case 'SET_CANVAS_HEIGHT':
      return { ...state, canvasHeight: action.height };

    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom };

    case 'SET_SNAP':
      return { ...state, snapEnabled: action.enabled };

    case 'SET_TOOL':
      return { ...state, tool: action.tool };

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}

const NON_HISTORY_ACTIONS: DiagramAction['type'][] = [
  'SET_SELECTION',
  'SET_ZOOM',
  'SET_SNAP',
  'SET_TOOL',
];

export function historyReducer(state: HistoryState, action: DiagramAction): HistoryState {
  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
    };
  }

  if (action.type === 'REDO') {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return {
      past: [...state.past, state.present],
      present: next,
      future: state.future.slice(1),
    };
  }

  const newPresent = diagramReducer(state.present, action);

  if (NON_HISTORY_ACTIONS.includes(action.type)) {
    return { ...state, present: newPresent };
  }

  return {
    past: [...state.past, state.present],
    present: newPresent,
    future: [],
  };
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/__tests__/historyReducer.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/state/historyReducer.ts src/__tests__/historyReducer.test.ts
git commit -m "feat: add history reducer with undo/redo support"
```

---

## Task 5: Diagram Context Provider

**Files:**
- Create: `src/state/DiagramContext.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create DiagramContext.tsx**

Create `src/state/DiagramContext.tsx`:

```tsx
import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { DiagramAction, DiagramState, HistoryState, DiagramElement, Connector } from '../types';
import { historyReducer, createInitialHistoryState } from './historyReducer';

interface DiagramContextValue {
  state: DiagramState;
  canUndo: boolean;
  canRedo: boolean;
  dispatch: (action: DiagramAction) => void;
  addElement: (element: DiagramElement) => void;
  updateElement: (id: string, changes: Partial<DiagramElement>) => void;
  deleteSelected: () => void;
  moveElement: (id: string, x: number, y: number) => void;
  addConnector: (connector: Connector) => void;
  setSelection: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
}

const DiagramContext = createContext<DiagramContextValue | null>(null);

export function DiagramProvider({ children }: { children: ReactNode }) {
  const [history, dispatch] = useReducer(historyReducer, undefined, createInitialHistoryState);

  const addElement = useCallback((element: DiagramElement) => {
    dispatch({ type: 'ADD_ELEMENT', element });
  }, []);

  const updateElement = useCallback((id: string, changes: Partial<DiagramElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, changes });
  }, []);

  const deleteSelected = useCallback(() => {
    const ids = history.present.selectedIds;
    if (ids.length === 0) return;
    const connectorIds = history.present.connectors
      .filter((c) => ids.includes(c.fromId) || ids.includes(c.toId))
      .map((c) => c.id);
    if (connectorIds.length > 0) {
      dispatch({ type: 'DELETE_CONNECTORS', ids: connectorIds });
    }
    dispatch({ type: 'DELETE_ELEMENTS', ids });
  }, [history.present.selectedIds, history.present.connectors]);

  const moveElement = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_ELEMENT', id, x, y });
  }, []);

  const addConnector = useCallback((connector: Connector) => {
    dispatch({ type: 'ADD_CONNECTOR', connector });
  }, []);

  const setSelection = useCallback((ids: string[]) => {
    dispatch({ type: 'SET_SELECTION', ids });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  const value: DiagramContextValue = {
    state: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    dispatch,
    addElement,
    updateElement,
    deleteSelected,
    moveElement,
    addConnector,
    setSelection,
    undo,
    redo,
  };

  return <DiagramContext.Provider value={value}>{children}</DiagramContext.Provider>;
}

export function useDiagram(): DiagramContextValue {
  const ctx = useContext(DiagramContext);
  if (!ctx) throw new Error('useDiagram must be used within DiagramProvider');
  return ctx;
}
```

- [ ] **Step 2: Wrap App with DiagramProvider**

Update `src/App.tsx`:

```tsx
import './App.css';
import { DiagramProvider } from './state/DiagramContext';

function App() {
  return (
    <DiagramProvider>
      <div className="app">
        <header className="toolbar">Toolbar</header>
        <aside className="component-panel">Components</aside>
        <main className="canvas-area">Canvas</main>
        <aside className="properties-panel">Properties</aside>
        <footer className="status-bar">Status</footer>
      </div>
    </DiagramProvider>
  );
}

export default App;
```

- [ ] **Step 3: Run existing tests to verify nothing broke**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/state/DiagramContext.tsx src/App.tsx
git commit -m "feat: add DiagramContext provider with undo/redo"
```

---

## Task 6: Canvas with Grid

**Files:**
- Create: `src/components/Canvas.tsx`, `src/components/Canvas.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Canvas.tsx**

Create `src/components/Canvas.tsx`:

```tsx
import { useRef, useCallback } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import { useDiagram } from '../state/DiagramContext';
import { CANVAS, GRID, COLORS } from '../constants';
import './Canvas.css';

function GridLines({ width, height }: { width: number; height: number }) {
  const lines = [];

  for (let x = 0; x <= width; x += GRID.MINOR) {
    const isMajor = x % GRID.MAJOR === 0;
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={isMajor ? '#c0c0c0' : '#e0e0e0'}
        strokeWidth={isMajor ? 0.5 : 0.25}
        listening={false}
      />
    );
  }

  for (let y = 0; y <= height; y += GRID.MINOR) {
    const isMajor = y % GRID.MAJOR === 0;
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke={isMajor ? '#c0c0c0' : '#e0e0e0'}
        strokeWidth={isMajor ? 0.5 : 0.25}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
}

export default function Canvas() {
  const { state, setSelection } = useDiagram();
  const stageRef = useRef<ReturnType<typeof Stage> | null>(null);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        setSelection([]);
      }
    },
    [setSelection]
  );

  const width = CANVAS.WIDTH;
  const height = state.canvasHeight;

  return (
    <div className="canvas-container">
      <Stage
        ref={stageRef as React.RefObject<never>}
        width={width * state.zoom}
        height={height * state.zoom}
        scaleX={state.zoom}
        scaleY={state.zoom}
        onClick={handleStageClick}
        className="diagram-stage"
      >
        <Layer>
          {/* White background */}
          <Rect x={0} y={0} width={width} height={height} fill={COLORS.WHITE} listening={false} />
          {/* Grid */}
          {state.snapEnabled && <GridLines width={width} height={height} />}
        </Layer>
        <Layer>
          {/* Shape and connector layers will be added in later tasks */}
        </Layer>
      </Stage>
    </div>
  );
}
```

- [ ] **Step 2: Create Canvas.css**

Create `src/components/Canvas.css`:

```css
.canvas-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #f0f0f0;
  padding: 20px;
}

.diagram-stage {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

- [ ] **Step 3: Wire Canvas into App.tsx**

Update `src/App.tsx`:

```tsx
import './App.css';
import { DiagramProvider } from './state/DiagramContext';
import Canvas from './components/Canvas';

function App() {
  return (
    <DiagramProvider>
      <div className="app">
        <header className="toolbar">Toolbar</header>
        <aside className="component-panel">Components</aside>
        <main className="canvas-area">
          <Canvas />
        </main>
        <aside className="properties-panel">Properties</aside>
        <footer className="status-bar">Status</footer>
      </div>
    </DiagramProvider>
  );
}

export default App;
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Expected: White 760px canvas with a 5px grid visible, centered in the viewport.

- [ ] **Step 6: Commit**

```bash
git add src/components/Canvas.tsx src/components/Canvas.css src/App.tsx
git commit -m "feat: add Konva canvas with 5px grid rendering"
```

---

## Task 7: Icon SVG Path Data

**Files:**
- Create: `src/shapes/iconPaths.ts`

- [ ] **Step 1: Create iconPaths.ts**

Extract the 6 icon SVG path data from the Red Hat template SVG file. Create `src/shapes/iconPaths.ts`:

```typescript
export interface IconDefinition {
  id: string;
  name: string;
  viewBox: string;
  path: string;
  width: number;
  height: number;
}

export const ICONS: IconDefinition[] = [
  {
    id: 'server',
    name: 'Server',
    viewBox: '0 0 58 32',
    path: 'M15.763 7.303c-0.003-0-0.006-0-0.009-0-0.101 0-0.197 0.021-0.284 0.059l-7.723 3.284c-0.258 0.115-0.435 0.369-0.435 0.664 0 0.070 0.010 0.137 0.028 0.2-0.018 0.058-0.038 0.118-0.038 0.183v12.274c0 0.403 0.327 0.73 0.73 0.73h42.010c0.403 0 0.73-0.327 0.73-0.73v-12.274c0.003-0.066-0.020-0.128-0.037-0.188 0.018-0.059 0.028-0.127 0.028-0.198 0-0.28-0.16-0.523-0.395-0.642l-6.72-3.288c-0.093-0.047-0.203-0.074-0.319-0.074h-27.567zM15.908 8.761h27.255l4.498 2.205h-36.926l5.173-2.205zM8.763 12.606h40.552v10.631h-40.552v-10.631zM40.359 14.54c-0.203 0-0.365 0.163-0.365 0.365v5.842c0 0.202 0.162 0.365 0.365 0.365h2.191c0.202 0 0.365-0.163 0.365-0.365v-5.842c0-0.202-0.163-0.365-0.365-0.365h-2.191zM44.74 14.54c-0.202 0-0.365 0.163-0.365 0.365v5.842c0 0.202 0.163 0.365 0.365 0.365h2.191c0.199 0 0.365-0.163 0.365-0.365v-5.842c0-0.202-0.166-0.365-0.365-0.365h-2.191zM40.724 15.27h1.461v5.112h-1.461v-5.112zM45.105 15.27h1.461v5.112h-1.461v-5.112zM12.457 16.879c-0.555 0-1.004 0.45-1.004 1.004s0.45 1.004 1.004 1.004c0.555 0 1.004-0.45 1.004-1.004s-0.45-1.004-1.004-1.004zM16.020 16.879c-0.555 0-1.004 0.45-1.004 1.004s0.45 1.004 1.004 1.004c0.555 0 1.004-0.45 1.004-1.004s-0.45-1.004-1.004-1.004z',
    width: 36,
    height: 20,
  },
  {
    id: 'person',
    name: 'Person',
    viewBox: '0 0 23 32',
    path: 'M11.377 2.913c-2.256 0-4.090 1.835-4.090 4.091 0 2.254 1.834 4.089 4.090 4.089 2.254 0 4.091-1.835 4.091-4.089 0-2.256-1.836-4.090-4.091-4.090zM11.377 3.502c1.931 0 3.501 1.572 3.501 3.502 0 1.929-1.569 3.499-3.501 3.499-1.93 0-3.501-1.57-3.501-3.499 0-1.933 1.571-3.502 3.501-3.502zM9.419 11.884c-5.69 0-6.033 4.176-6.216 6.421l-0.289 3.621v0.024c0 2.054 1.193 3.099 2.521 4.074l0.337 0.248-0.088 1.435 0.218 0.189c0.524 0.444 1.932 1.19 5.475 1.19 3.441 0 4.87-0.713 5.416-1.139l0.243-0.19-0.084-1.461 0.341-0.251c1.394-1.023 2.548-2.037 2.548-4.095l-0.288-3.657c-0.221-2.24-0.631-6.41-6.214-6.41h-3.92z',
    width: 18,
    height: 24,
  },
  {
    id: 'provisioning',
    name: 'Software',
    viewBox: '0 0 37 32',
    path: 'M16.023 5.008c-0.827 0-1.502 0.674-1.502 1.501v4.593c0.002 0.828 0.674 1.499 1.502 1.5h4.59c0.828-0.001 1.499-0.672 1.5-1.5v-4.593c-0.001-0.828-0.672-1.499-1.5-1.501h-4.591zM16.023 5.634h4.59c0.483 0 0.874 0.394 0.874 0.875v4.593c0 0.483-0.391 0.874-0.874 0.874h-4.59c-0.483 0-0.876-0.391-0.876-0.874v-4.591c0-0.483 0.393-0.876 0.876-0.876zM10.929 14c-0.303 0-0.757 0.1-1.032 0.227l-4.062 1.887c-0.061 0.031-0.11 0.079-0.14 0.137-0.157 0.145-0.254 0.349-0.254 0.577v1.605c0.001 0.433 0.351 0.784 0.785 0.785h1.352l-2.273 0.971c-0.164 0.070-0.281 0.251-0.238 0.417-0.008 0.032-0.059 0.062-0.059 0.095v5.906c0 0.194 0.239 0.384 0.434 0.384h25.697c0.196 0 0.436-0.19 0.436-0.384v-5.905c-0.002-0.034-0.052-0.062-0.060-0.092 0.041-0.158-0.048-0.331-0.2-0.406l-2.004-0.987h1.083c0.434 0 0.786-0.351 0.786-0.785v-1.605c0-0.233-0.103-0.441-0.265-0.585-0.028-0.050-0.068-0.091-0.116-0.118l-3.477-1.865c-0.272-0.147-0.726-0.26-1.036-0.26h-15.357z',
    width: 24,
    height: 24,
  },
  {
    id: 'terminal',
    name: 'Terminal',
    viewBox: '0 0 44 32',
    path: 'm 6.374,6.125 c -0.269,0 -0.487,0.218 -0.487,0.486 l 0,27.197 c 0,0.268 0.218,0.486 0.488,0.486 l 31.624,0 c 0.268,0 0.486,-0.217 0.486,-0.486 l 0,-27.197 c 0,-0.268 -0.218,-0.486 -0.486,-0.486 l -31.624,0 z m 0.498,0.974 30.627,0 0,4.943 -30.627,0 0,-4.943 z m -0.001,5.714 30.627,0 0,20.544 -30.640,0 0,-20.549 z m 9.206,6.534 c -0.092,0 -0.178,0.024 -0.253,0.067 -0.158,0.088 -0.264,0.257 -0.264,0.451 0,0.199 0.113,0.372 0.278,0.458 l 3.894,2.251 -3.891,2.252 c -0.15,0.091 -0.248,0.254 -0.248,0.439 0,0.088 0.022,0.17 0.061,0.242 0.09,0.16 0.262,0.262 0.449,0.262 0.083,0 0.161,-0.019 0.23,-0.053 l 5.468,-3.143 -5.471,-3.144 c -0.075,-0.049 -0.166,-0.079 -0.264,-0.082 z m 6.186,5.387 c -0.286,0 -0.517,0.231 -0.517,0.517 0,0.286 0.231,0.517 0.517,0.517 l 6.291,0 c 0.286,0 0.517,-0.231 0.517,-0.517 0,-0.286 -0.231,-0.517 -0.517,-0.517 l -6.291,0 z',
    width: 28,
    height: 24,
  },
  {
    id: 'scale',
    name: 'Scale',
    viewBox: '0 0 32 32',
    path: 'M10.907 3.075c-1.009 0-1.874 0.817-1.874 1.874v10.282h-4.084c-1.009 0-1.874 0.817-1.874 1.874v9.946c0 1.009 0.817 1.874 1.874 1.874h9.946c1.009 0 1.874-0.817 1.874-1.874v-3.94h10.427c1.009 0 1.874-0.817 1.874-1.874v-16.336c0.048-1.010-0.817-1.826-1.826-1.826h-16.336z',
    width: 24,
    height: 24,
  },
  {
    id: 'cost',
    name: 'Cost',
    viewBox: '0 0 18 32',
    path: 'M7.725 1.969c-0.128 0-0.238 0.078-0.284 0.191-0.019 0.038-0.031 0.083-0.031 0.131v1.984c-2.909 0.495-4.777 2.487-4.777 5.141 0 3.19 1.86 4.276 4.777 5.218v5.048c-1.115-0.306-2.181-0.951-2.973-1.808-0.056-0.057-0.133-0.092-0.219-0.092-0.084 0-0.161 0.034-0.216 0.089l-1.89 1.862c-0.056 0.056-0.091 0.133-0.091 0.218s0.034 0.161 0.089 0.217c1.36 1.59 3.247 2.609 5.339 2.894v2.404l-1.625-0.716c-0.245-0.123-0.509-0.044-0.668 0.196-0.063 0.094-0.182 0.352 0.079 0.702l3.559 4.302c0.057 0.068 0.142 0.11 0.237 0.11s0.18-0.043 0.236-0.11l3.568-4.314c0.177-0.234 0.205-0.492 0.072-0.69-0.160-0.241-0.423-0.318-0.655-0.202l-1.638 0.721v-2.474c3.19-0.536 4.946-2.492 4.946-5.54 0-3.205-2.162-4.422-4.947-5.349v-4.373c0.715 0.258 1.345 0.674 1.955 1.297 0.060 0.061 0.14 0.093 0.219 0.093 0.044 0 0.086-0.011 0.125-0.029 0.042-0.015 0.082-0.038 0.115-0.072l1.842-1.873c0.053-0.055 0.086-0.131 0.086-0.214 0-0.087-0.036-0.165-0.093-0.221-1.293-1.251-2.693-2.011-4.27-2.325v-2.038c0-0.093-0.044-0.174-0.111-0.231-0.055-0.057-0.131-0.092-0.216-0.092h-2.522z',
    width: 14,
    height: 24,
  },
];
```

- [ ] **Step 2: Commit**

```bash
git add src/shapes/iconPaths.ts
git commit -m "feat: add Red Hat icon SVG path data"
```

---

## Task 8: Shape Components — RectShape

**Files:**
- Create: `src/shapes/RectShape.tsx`

- [ ] **Step 1: Create RectShape.tsx**

Create `src/shapes/RectShape.tsx`:

```tsx
import { useRef } from 'react';
import { Group, Rect, Text } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { FONT_FAMILY, GRID } from '../constants';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram } from '../state/DiagramContext';

interface RectShapeProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function RectShape({ element, isSelected }: RectShapeProps) {
  const { updateElement, moveElement, setSelection, state } = useDiagram();
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    const x = snapToGrid(e.target.x(), increment);
    const y = snapToGrid(e.target.y(), increment);
    moveElement(element.id, x, y);
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (e.evt.shiftKey) {
      const ids = state.selectedIds.includes(element.id)
        ? state.selectedIds.filter((id) => id !== element.id)
        : [...state.selectedIds, element.id];
      setSelection(ids);
    } else {
      setSelection([element.id]);
    }
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const increment = state.snapEnabled ? GRID.MAJOR : 1;
    updateElement(element.id, {
      x: snapToGrid(node.x(), state.snapEnabled ? GRID.MINOR : 1),
      y: snapToGrid(node.y(), state.snapEnabled ? GRID.MINOR : 1),
      width: snapToGrid(Math.max(40, element.width * scaleX), increment),
      height: snapToGrid(Math.max(20, element.height * scaleY), increment),
    });
  };

  const handleDblClick = () => {
    const textNode = textRef.current;
    if (!textNode) return;
    const stage = textNode.getStage();
    if (!stage) return;

    const textPosition = textNode.getAbsolutePosition();
    const stageBox = stage.container().getBoundingClientRect();

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = element.text;
    textarea.style.position = 'absolute';
    textarea.style.top = `${stageBox.top + textPosition.y * state.zoom}px`;
    textarea.style.left = `${stageBox.left + textPosition.x * state.zoom}px`;
    textarea.style.width = `${element.width * state.zoom}px`;
    textarea.style.height = `${element.height * state.zoom}px`;
    textarea.style.fontSize = `${element.fontSize * state.zoom}px`;
    textarea.style.fontFamily = FONT_FAMILY;
    textarea.style.textAlign = 'center';
    textarea.style.border = '2px solid #4a90d9';
    textarea.style.padding = '4px';
    textarea.style.margin = '0';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.zIndex = '1000';

    textarea.focus();

    const finishEditing = () => {
      updateElement(element.id, { text: textarea.value });
      document.body.removeChild(textarea);
    };

    textarea.addEventListener('blur', finishEditing);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
        textarea.blur();
      }
    });
  };

  return (
    <Group
      ref={groupRef}
      x={element.x}
      y={element.y}
      draggable
      onClick={handleClick}
      onDblClick={handleDblClick}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      <Rect
        width={element.width}
        height={element.height}
        fill={element.fill || undefined}
        stroke={element.stroke || undefined}
        strokeWidth={element.strokeWidth}
        cornerRadius={0}
      />
      <Text
        ref={textRef}
        text={element.text}
        width={element.width}
        height={element.height}
        align="center"
        verticalAlign="middle"
        fontSize={element.fontSize}
        fontFamily={FONT_FAMILY}
        fontStyle={element.fontWeight === 'bold' ? 'bold' : '500'}
        fill={element.textColor}
        listening={false}
        padding={8}
      />
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
          stroke="#4a90d9"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shapes/RectShape.tsx
git commit -m "feat: add RectShape component with drag, select, resize"
```

---

## Task 9: Shape Components — CircleCallout, TextLabel, IconShape

**Files:**
- Create: `src/shapes/CircleCallout.tsx`, `src/shapes/TextLabel.tsx`, `src/shapes/IconShape.tsx`

- [ ] **Step 1: Create CircleCallout.tsx**

Create `src/shapes/CircleCallout.tsx`:

```tsx
import { Group, Circle, Text } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { CALLOUT_CIRCLE, FONT_FAMILY, GRID } from '../constants';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram } from '../state/DiagramContext';

interface CircleCalloutProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function CircleCallout({ element, isSelected }: CircleCalloutProps) {
  const { moveElement, setSelection, state } = useDiagram();

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    moveElement(element.id, snapToGrid(e.target.x(), increment), snapToGrid(e.target.y(), increment));
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (e.evt.shiftKey) {
      const ids = state.selectedIds.includes(element.id)
        ? state.selectedIds.filter((id) => id !== element.id)
        : [...state.selectedIds, element.id];
      setSelection(ids);
    } else {
      setSelection([element.id]);
    }
  };

  return (
    <Group x={element.x} y={element.y} draggable onClick={handleClick} onDragEnd={handleDragEnd}>
      <Circle
        radius={CALLOUT_CIRCLE.RADIUS}
        fill={CALLOUT_CIRCLE.FILL}
      />
      <Text
        text={element.text}
        fontSize={CALLOUT_CIRCLE.FONT_SIZE}
        fontFamily={FONT_FAMILY}
        fontStyle="bold"
        fill={CALLOUT_CIRCLE.TEXT_COLOR}
        align="center"
        verticalAlign="middle"
        width={CALLOUT_CIRCLE.RADIUS * 2}
        height={CALLOUT_CIRCLE.RADIUS * 2}
        offsetX={CALLOUT_CIRCLE.RADIUS}
        offsetY={CALLOUT_CIRCLE.RADIUS}
        listening={false}
      />
      {isSelected && (
        <Circle
          radius={CALLOUT_CIRCLE.RADIUS + 2}
          stroke="#4a90d9"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}
```

- [ ] **Step 2: Create TextLabel.tsx**

Create `src/shapes/TextLabel.tsx`:

```tsx
import { useRef } from 'react';
import { Group, Text, Rect } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { FONT_FAMILY, GRID } from '../constants';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram } from '../state/DiagramContext';

interface TextLabelProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function TextLabel({ element, isSelected }: TextLabelProps) {
  const { moveElement, setSelection, updateElement, state } = useDiagram();
  const textRef = useRef<Konva.Text>(null);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    moveElement(element.id, snapToGrid(e.target.x(), increment), snapToGrid(e.target.y(), increment));
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (e.evt.shiftKey) {
      const ids = state.selectedIds.includes(element.id)
        ? state.selectedIds.filter((id) => id !== element.id)
        : [...state.selectedIds, element.id];
      setSelection(ids);
    } else {
      setSelection([element.id]);
    }
  };

  const handleDblClick = () => {
    const textNode = textRef.current;
    if (!textNode) return;
    const stage = textNode.getStage();
    if (!stage) return;

    const textPosition = textNode.getAbsolutePosition();
    const stageBox = stage.container().getBoundingClientRect();

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = element.text;
    textarea.style.position = 'absolute';
    textarea.style.top = `${stageBox.top + textPosition.y * state.zoom}px`;
    textarea.style.left = `${stageBox.left + textPosition.x * state.zoom}px`;
    textarea.style.width = `${element.width * state.zoom}px`;
    textarea.style.fontSize = `${element.fontSize * state.zoom}px`;
    textarea.style.fontFamily = FONT_FAMILY;
    textarea.style.border = '2px solid #4a90d9';
    textarea.style.padding = '4px';
    textarea.style.margin = '0';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.zIndex = '1000';

    textarea.focus();

    const finishEditing = () => {
      updateElement(element.id, { text: textarea.value });
      document.body.removeChild(textarea);
    };

    textarea.addEventListener('blur', finishEditing);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
        textarea.blur();
      }
    });
  };

  return (
    <Group x={element.x} y={element.y} draggable onClick={handleClick} onDragEnd={handleDragEnd} onDblClick={handleDblClick}>
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
          stroke="#4a90d9"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
      <Text
        ref={textRef}
        text={element.text}
        width={element.width}
        fontSize={element.fontSize}
        fontFamily={FONT_FAMILY}
        fontStyle={element.fontWeight === 'bold' ? 'bold' : '500'}
        fill={element.textColor}
      />
    </Group>
  );
}
```

- [ ] **Step 3: Create IconShape.tsx**

Create `src/shapes/IconShape.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import { Group, Path, Text, Rect } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { COLORS, FONT_FAMILY, GRID } from '../constants';
import { ICONS } from './iconPaths';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram } from '../state/DiagramContext';

interface IconShapeProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function IconShape({ element, isSelected }: IconShapeProps) {
  const { moveElement, setSelection, state } = useDiagram();
  const icon = ICONS.find((i) => i.id === element.iconId);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    moveElement(element.id, snapToGrid(e.target.x(), increment), snapToGrid(e.target.y(), increment));
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (e.evt.shiftKey) {
      const ids = state.selectedIds.includes(element.id)
        ? state.selectedIds.filter((id) => id !== element.id)
        : [...state.selectedIds, element.id];
      setSelection(ids);
    } else {
      setSelection([element.id]);
    }
  };

  if (!icon) return null;

  const labelHeight = 16;
  const totalHeight = icon.height + labelHeight + 4;
  const totalWidth = Math.max(icon.width, 60);

  return (
    <Group x={element.x} y={element.y} draggable onClick={handleClick} onDragEnd={handleDragEnd}>
      <Path
        data={icon.path}
        fill={COLORS.ICON_GRAY}
        x={(totalWidth - icon.width) / 2}
        y={0}
        scaleX={icon.width / parseFloat(icon.viewBox.split(' ')[2])}
        scaleY={icon.height / parseFloat(icon.viewBox.split(' ')[3])}
      />
      <Text
        text={element.text || icon.name}
        y={icon.height + 4}
        width={totalWidth}
        fontSize={12}
        fontFamily={FONT_FAMILY}
        fontStyle="500"
        fill={COLORS.DARK_GRAY}
        align="center"
        listening={false}
      />
      {isSelected && (
        <Rect
          x={-2}
          y={-2}
          width={totalWidth + 4}
          height={totalHeight + 4}
          stroke="#4a90d9"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/shapes/CircleCallout.tsx src/shapes/TextLabel.tsx src/shapes/IconShape.tsx
git commit -m "feat: add CircleCallout, TextLabel, and IconShape components"
```

---

## Task 10: Connector Line Component

**Files:**
- Create: `src/shapes/ConnectorLine.tsx`

- [ ] **Step 1: Create ConnectorLine.tsx**

Create `src/shapes/ConnectorLine.tsx`:

```tsx
import { Arrow, Line, Group } from 'react-konva';
import type Konva from 'konva';
import { Connector, DiagramElement } from '../types';
import { ARROWHEAD, COLORS } from '../constants';
import { useDiagram } from '../state/DiagramContext';

interface ConnectorLineProps {
  connector: Connector;
  isSelected: boolean;
}

function getEdgePoint(
  el: DiagramElement,
  targetX: number,
  targetY: number
): { x: number; y: number } {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;

  if (Math.abs(dx) === 0 && Math.abs(dy) === 0) {
    return { x: cx, y: cy };
  }

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const hw = el.width / 2;
  const hh = el.height / 2;

  let ix: number, iy: number;

  if (absDx / hw > absDy / hh) {
    ix = cx + (dx > 0 ? hw : -hw);
    iy = cy + (dy * hw) / absDx;
  } else {
    iy = cy + (dy > 0 ? hh : -hh);
    ix = cx + (dx * hh) / absDy;
  }

  return { x: ix, y: iy };
}

export default function ConnectorLine({ connector, isSelected }: ConnectorLineProps) {
  const { state, setSelection } = useDiagram();

  const fromEl = state.elements.find((e) => e.id === connector.fromId);
  const toEl = state.elements.find((e) => e.id === connector.toId);

  if (!fromEl || !toEl) return null;

  const fromCenter = { x: fromEl.x + fromEl.width / 2, y: fromEl.y + fromEl.height / 2 };
  const toCenter = { x: toEl.x + toEl.width / 2, y: toEl.y + toEl.height / 2 };

  const fromEdge = getEdgePoint(fromEl, toCenter.x, toCenter.y);
  const toEdge = getEdgePoint(toEl, fromCenter.x, fromCenter.y);

  // Apply arrowhead padding
  const angle = Math.atan2(toEdge.y - fromEdge.y, toEdge.x - fromEdge.x);
  const padX = Math.cos(angle) * ARROWHEAD.PADDING;
  const padY = Math.sin(angle) * ARROWHEAD.PADDING;

  const endX = toEdge.x - padX;
  const endY = toEdge.y - padY;

  let startX = fromEdge.x;
  let startY = fromEdge.y;

  if (connector.arrowDirection === 'bidirectional') {
    startX = fromEdge.x + padX;
    startY = fromEdge.y + padY;
  }

  const points = connector.isElbow
    ? [startX, startY, startX, endY, endX, endY]
    : [startX, startY, endX, endY];

  const dashEnabled = connector.lineType === 'dashed';
  const dash = dashEnabled ? [2, 2] : undefined;
  const arrowSize = ARROWHEAD.SIZE_X * 5;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setSelection([connector.id]);
  };

  const commonProps = {
    points,
    stroke: connector.stroke || COLORS.DARK_GRAY,
    strokeWidth: connector.strokeWidth,
    dash,
    dashEnabled,
    hitStrokeWidth: 10,
    onClick: handleClick,
  };

  if (connector.arrowDirection === 'none') {
    return (
      <Line
        {...commonProps}
        strokeScaleEnabled={false}
      />
    );
  }

  return (
    <Arrow
      {...commonProps}
      pointerLength={arrowSize}
      pointerWidth={arrowSize}
      fill={connector.stroke || COLORS.DARK_GRAY}
      strokeScaleEnabled={false}
    />
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shapes/ConnectorLine.tsx
git commit -m "feat: add ConnectorLine with edge detection and arrowheads"
```

---

## Task 11: Wire Shapes and Connectors into Canvas

**Files:**
- Modify: `src/components/Canvas.tsx`

- [ ] **Step 1: Update Canvas.tsx to render all shapes and connectors**

Update `src/components/Canvas.tsx`:

```tsx
import { useRef, useCallback, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import { useDiagram } from '../state/DiagramContext';
import { CANVAS, GRID, COLORS } from '../constants';
import RectShape from '../shapes/RectShape';
import CircleCallout from '../shapes/CircleCallout';
import TextLabel from '../shapes/TextLabel';
import IconShape from '../shapes/IconShape';
import ConnectorLine from '../shapes/ConnectorLine';
import './Canvas.css';

function GridLines({ width, height }: { width: number; height: number }) {
  const lines = [];

  for (let x = 0; x <= width; x += GRID.MINOR) {
    const isMajor = x % GRID.MAJOR === 0;
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={isMajor ? '#c0c0c0' : '#e0e0e0'}
        strokeWidth={isMajor ? 0.5 : 0.25}
        listening={false}
      />
    );
  }

  for (let y = 0; y <= height; y += GRID.MINOR) {
    const isMajor = y % GRID.MAJOR === 0;
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke={isMajor ? '#c0c0c0' : '#e0e0e0'}
        strokeWidth={isMajor ? 0.5 : 0.25}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
}

interface CanvasProps {
  stageRef?: React.RefObject<Konva.Stage | null>;
}

export default function Canvas({ stageRef: externalStageRef }: CanvasProps) {
  const { state, setSelection, deleteSelected, undo, redo } = useDiagram();
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalStageRef;
  const transformerRef = useRef<Konva.Transformer>(null);

  const width = CANVAS.WIDTH;
  const height = state.canvasHeight;

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        setSelection([]);
      }
    },
    [setSelection]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, undo, redo]);

  // Update transformer selection
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const selectedNodes = state.selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((node): node is Konva.Node => node !== undefined);

    transformer.nodes(selectedNodes);
    transformer.getLayer()?.batchDraw();
  }, [state.selectedIds]);

  const renderElement = (el: typeof state.elements[0]) => {
    const isSelected = state.selectedIds.includes(el.id);
    const props = { key: el.id, element: el, isSelected };

    switch (el.type) {
      case 'rect':
        return <RectShape {...props} />;
      case 'circle':
        return <CircleCallout {...props} />;
      case 'text':
        return <TextLabel {...props} />;
      case 'icon':
        return <IconShape {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className="canvas-container">
      <Stage
        ref={stageRef}
        width={width * state.zoom}
        height={height * state.zoom}
        scaleX={state.zoom}
        scaleY={state.zoom}
        onClick={handleStageClick}
        className="diagram-stage"
      >
        <Layer>
          <Rect x={0} y={0} width={width} height={height} fill={COLORS.WHITE} listening={false} />
          {state.snapEnabled && <GridLines width={width} height={height} />}
        </Layer>
        <Layer>
          {state.connectors.map((c) => (
            <ConnectorLine
              key={c.id}
              connector={c}
              isSelected={state.selectedIds.includes(c.id)}
            />
          ))}
          {state.elements.map(renderElement)}
          <Transformer
            ref={transformerRef}
            borderStroke="#4a90d9"
            anchorStroke="#4a90d9"
            anchorSize={8}
            anchorCornerRadius={2}
            rotateEnabled={false}
          />
        </Layer>
      </Stage>
    </div>
  );
}
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/Canvas.tsx
git commit -m "feat: wire shape and connector rendering into canvas"
```

---

## Task 12: Component Panel (Drag-and-Drop Shape Library)

**Files:**
- Create: `src/components/ComponentPanel.tsx`, `src/components/ComponentPanel.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create ComponentPanel.tsx**

Create `src/components/ComponentPanel.tsx`:

```tsx
import { useDiagram } from '../state/DiagramContext';
import { COLORS, FONT_FAMILY, BOX_VARIANTS, CALLOUT_CIRCLE } from '../constants';
import { DiagramElement } from '../types';
import { ICONS } from '../shapes/iconPaths';
import './ComponentPanel.css';

let nextId = 1;
function generateId(prefix: string): string {
  return `${prefix}-${nextId++}`;
}

function createBoxElement(variant: keyof typeof BOX_VARIANTS): DiagramElement {
  const v = BOX_VARIANTS[variant];
  return {
    id: generateId('rect'),
    type: 'rect',
    x: 50,
    y: 50,
    width: 180,
    height: 60,
    rotation: 0,
    fill: v.fill,
    stroke: v.stroke,
    strokeWidth: v.strokeWidth,
    text: 'Label',
    fontSize: 16,
    fontWeight: 'bold',
    textColor: v.textColor,
    variant,
    groupId: null,
  };
}

function createCircleElement(): DiagramElement {
  return {
    id: generateId('circle'),
    type: 'circle',
    x: 50,
    y: 50,
    width: CALLOUT_CIRCLE.RADIUS * 2,
    height: CALLOUT_CIRCLE.RADIUS * 2,
    rotation: 0,
    fill: CALLOUT_CIRCLE.FILL,
    stroke: '',
    strokeWidth: 0,
    text: '1',
    fontSize: CALLOUT_CIRCLE.FONT_SIZE,
    fontWeight: 'bold',
    textColor: CALLOUT_CIRCLE.TEXT_COLOR,
    groupId: null,
  };
}

function createIconElement(iconId: string): DiagramElement {
  const icon = ICONS.find((i) => i.id === iconId);
  return {
    id: generateId('icon'),
    type: 'icon',
    x: 50,
    y: 50,
    width: icon?.width ?? 24,
    height: (icon?.height ?? 24) + 20,
    rotation: 0,
    fill: COLORS.ICON_GRAY,
    stroke: '',
    strokeWidth: 0,
    text: icon?.name ?? 'Icon',
    fontSize: 12,
    fontWeight: 'medium',
    textColor: COLORS.DARK_GRAY,
    iconId,
    groupId: null,
  };
}

function createTextElement(): DiagramElement {
  return {
    id: generateId('text'),
    type: 'text',
    x: 50,
    y: 50,
    width: 160,
    height: 24,
    rotation: 0,
    fill: '',
    stroke: '',
    strokeWidth: 0,
    text: 'Label Example',
    fontSize: 14,
    fontWeight: 'medium',
    textColor: COLORS.DARK_GRAY,
    groupId: null,
  };
}

export default function ComponentPanel() {
  const { addElement, addConnector, state, dispatch } = useDiagram();

  const handleAddBox = (variant: keyof typeof BOX_VARIANTS) => {
    addElement(createBoxElement(variant));
  };

  const handleAddCircle = () => {
    addElement(createCircleElement());
  };

  const handleAddIcon = (iconId: string) => {
    addElement(createIconElement(iconId));
  };

  const handleAddText = () => {
    addElement(createTextElement());
  };

  const handleSelectConnectorTool = (tool: string) => {
    dispatch({ type: 'SET_TOOL', tool: tool as 'connector-solid' | 'connector-dashed' });
  };

  return (
    <aside className="component-panel">
      <h3 className="panel-title">Components</h3>

      <section className="panel-section">
        <h4 className="section-title">Boxes</h4>
        <div className="component-grid">
          <button className="component-btn" onClick={() => handleAddBox('filled')}>
            <div className="preview-box preview-filled">Filled</div>
          </button>
          <button className="component-btn" onClick={() => handleAddBox('outlined')}>
            <div className="preview-box preview-outlined">Outlined</div>
          </button>
          <button className="component-btn" onClick={() => handleAddBox('gray')}>
            <div className="preview-box preview-gray">Gray</div>
          </button>
          <button className="component-btn" onClick={() => handleAddBox('white')}>
            <div className="preview-box preview-white">White</div>
          </button>
        </div>
      </section>

      <section className="panel-section">
        <h4 className="section-title">Callout</h4>
        <button className="component-btn" onClick={handleAddCircle}>
          <div className="preview-circle">1</div>
          <span>Numbered</span>
        </button>
      </section>

      <section className="panel-section">
        <h4 className="section-title">Icons</h4>
        <div className="component-grid">
          {ICONS.map((icon) => (
            <button key={icon.id} className="component-btn" onClick={() => handleAddIcon(icon.id)}>
              <span className="icon-label">{icon.name}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel-section">
        <h4 className="section-title">Text</h4>
        <button className="component-btn" onClick={handleAddText}>
          <span>Text Label</span>
        </button>
      </section>

      <section className="panel-section">
        <h4 className="section-title">Connectors</h4>
        <div className="component-grid">
          <button
            className={`component-btn ${state.tool === 'connector-solid' ? 'active' : ''}`}
            onClick={() => handleSelectConnectorTool('connector-solid')}
          >
            <span>Solid Arrow</span>
          </button>
          <button
            className={`component-btn ${state.tool === 'connector-dashed' ? 'active' : ''}`}
            onClick={() => handleSelectConnectorTool('connector-dashed')}
          >
            <span>Dashed Arrow</span>
          </button>
        </div>
      </section>
    </aside>
  );
}
```

- [ ] **Step 2: Create ComponentPanel.css**

Create `src/components/ComponentPanel.css`:

```css
.panel-title {
  font-size: 14px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e5e5;
}

.panel-section {
  margin-bottom: 16px;
}

.section-title {
  font-size: 11px;
  font-weight: 500;
  color: #595959;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.component-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}

.component-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: #ffffff;
  cursor: pointer;
  font-family: 'Red Hat Text', sans-serif;
  font-size: 11px;
  color: #595959;
  transition: border-color 0.15s, background-color 0.15s;
}

.component-btn:hover {
  border-color: #0066cc;
  background-color: #f8f9fa;
}

.component-btn.active {
  border-color: #0066cc;
  background-color: #d9e8f7;
}

.preview-box {
  width: 100%;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
  border-radius: 2px;
}

.preview-filled {
  background: #0066cc;
  color: #ffffff;
}

.preview-outlined {
  border: 2px solid #0066cc;
  color: #262626;
}

.preview-gray {
  background: #e5e5e5;
  color: #262626;
}

.preview-white {
  background: #ffffff;
  border: 1px solid #d0d0d0;
  color: #262626;
}

.preview-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #262626;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.icon-label {
  font-size: 10px;
  text-align: center;
}
```

- [ ] **Step 3: Wire ComponentPanel into App.tsx**

Update `src/App.tsx`:

```tsx
import './App.css';
import { DiagramProvider } from './state/DiagramContext';
import Canvas from './components/Canvas';
import ComponentPanel from './components/ComponentPanel';

function App() {
  return (
    <DiagramProvider>
      <div className="app">
        <header className="toolbar">Toolbar</header>
        <ComponentPanel />
        <main className="canvas-area">
          <Canvas />
        </main>
        <aside className="properties-panel">Properties</aside>
        <footer className="status-bar">Status</footer>
      </div>
    </DiagramProvider>
  );
}

export default App;
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 5: Verify in browser**

```bash
npm run dev
```

Expected: Left panel shows boxes, callout, icons, text, and connector buttons. Clicking adds elements to canvas.

- [ ] **Step 6: Commit**

```bash
git add src/components/ComponentPanel.tsx src/components/ComponentPanel.css src/App.tsx
git commit -m "feat: add component panel with shape library"
```

---

## Task 13: Properties Panel

**Files:**
- Create: `src/components/PropertiesPanel.tsx`, `src/components/PropertiesPanel.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create PropertiesPanel.tsx**

Create `src/components/PropertiesPanel.tsx`:

```tsx
import { useDiagram } from '../state/DiagramContext';
import { COLOR_SWATCHES, FONT_SIZES, FONT_WEIGHTS } from '../constants';
import { FontWeight } from '../types';
import './PropertiesPanel.css';

export default function PropertiesPanel() {
  const { state, updateElement } = useDiagram();

  const selectedId = state.selectedIds[0];
  const element = state.elements.find((e) => e.id === selectedId);
  const connector = state.connectors.find((c) => c.id === selectedId);

  if (!element && !connector) {
    return (
      <aside className="properties-panel">
        <h3 className="panel-title">Properties</h3>
        <p className="empty-message">Select an element to edit its properties.</p>
      </aside>
    );
  }

  if (connector) {
    return (
      <aside className="properties-panel">
        <h3 className="panel-title">Connector</h3>
        <p className="prop-label">Type: {connector.lineType}</p>
        <p className="prop-label">Direction: {connector.arrowDirection}</p>
      </aside>
    );
  }

  if (!element) return null;

  return (
    <aside className="properties-panel">
      <h3 className="panel-title">Properties</h3>

      {/* Text */}
      <div className="prop-group">
        <label className="prop-label">Text</label>
        <input
          className="prop-input"
          type="text"
          value={element.text}
          onChange={(e) => updateElement(element.id, { text: e.target.value })}
        />
      </div>

      {/* Font Size */}
      {(element.type === 'rect' || element.type === 'text') && (
        <div className="prop-group">
          <label className="prop-label">Font Size</label>
          <div className="prop-button-row">
            {FONT_SIZES.map((size) => (
              <button
                key={size}
                className={`prop-btn ${element.fontSize === size ? 'active' : ''}`}
                onClick={() => updateElement(element.id, { fontSize: size })}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Font Weight */}
      {(element.type === 'rect' || element.type === 'text') && (
        <div className="prop-group">
          <label className="prop-label">Font Weight</label>
          <div className="prop-button-row">
            {FONT_WEIGHTS.map((weight) => (
              <button
                key={weight}
                className={`prop-btn ${element.fontWeight === weight ? 'active' : ''}`}
                onClick={() => updateElement(element.id, { fontWeight: weight as FontWeight })}
              >
                {weight}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Fill Color */}
      {element.type === 'rect' && (
        <div className="prop-group">
          <label className="prop-label">Fill</label>
          <div className="swatch-row">
            <button
              className={`swatch ${!element.fill ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { fill: '' })}
              title="None"
            >
              <span className="swatch-none">X</span>
            </button>
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.hex}
                className={`swatch ${element.fill === c.hex ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => {
                  const isDark = c.hex === '#0066cc' || c.hex === '#262626' || c.hex === '#595959';
                  updateElement(element.id, {
                    fill: c.hex,
                    textColor: isDark ? '#ffffff' : '#262626',
                  });
                }}
                title={`${c.name} (${c.hex})`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Stroke Color */}
      {element.type === 'rect' && (
        <div className="prop-group">
          <label className="prop-label">Stroke</label>
          <div className="swatch-row">
            <button
              className={`swatch ${!element.stroke ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { stroke: '', strokeWidth: 0 })}
              title="None"
            >
              <span className="swatch-none">X</span>
            </button>
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.hex}
                className={`swatch ${element.stroke === c.hex ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => updateElement(element.id, { stroke: c.hex, strokeWidth: 2 })}
                title={`${c.name} (${c.hex})`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size */}
      {element.type === 'rect' && (
        <div className="prop-group">
          <label className="prop-label">Size</label>
          <div className="prop-size-row">
            <label className="prop-size-label">
              W
              <input
                className="prop-input prop-input-small"
                type="number"
                step={10}
                min={40}
                value={element.width}
                onChange={(e) => updateElement(element.id, { width: Number(e.target.value) })}
              />
            </label>
            <label className="prop-size-label">
              H
              <input
                className="prop-input prop-input-small"
                type="number"
                step={10}
                min={20}
                value={element.height}
                onChange={(e) => updateElement(element.id, { height: Number(e.target.value) })}
              />
            </label>
          </div>
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 2: Create PropertiesPanel.css**

Create `src/components/PropertiesPanel.css`:

```css
.empty-message {
  font-size: 12px;
  color: #595959;
  font-style: italic;
}

.prop-group {
  margin-bottom: 14px;
}

.prop-label {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: #595959;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.prop-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-family: 'Red Hat Text', sans-serif;
  font-size: 13px;
  color: #262626;
}

.prop-input:focus {
  outline: none;
  border-color: #0066cc;
}

.prop-input-small {
  width: 70px;
}

.prop-button-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.prop-btn {
  padding: 4px 10px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-family: 'Red Hat Text', sans-serif;
  color: #262626;
}

.prop-btn:hover {
  border-color: #0066cc;
}

.prop-btn.active {
  background: #0066cc;
  color: #ffffff;
  border-color: #0066cc;
}

.swatch-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.swatch {
  width: 24px;
  height: 24px;
  border: 2px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  padding: 0;
}

.swatch:hover {
  border-color: #4a90d9;
}

.swatch.active {
  border-color: #0066cc;
  box-shadow: 0 0 0 1px #0066cc;
}

.swatch-none {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 10px;
  color: #999;
  border: 1px solid #d0d0d0;
  border-radius: 2px;
}

.prop-size-row {
  display: flex;
  gap: 8px;
}

.prop-size-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #595959;
}
```

- [ ] **Step 3: Wire PropertiesPanel into App.tsx**

Update `src/App.tsx`:

```tsx
import './App.css';
import { DiagramProvider } from './state/DiagramContext';
import Canvas from './components/Canvas';
import ComponentPanel from './components/ComponentPanel';
import PropertiesPanel from './components/PropertiesPanel';

function App() {
  return (
    <DiagramProvider>
      <div className="app">
        <header className="toolbar">Toolbar</header>
        <ComponentPanel />
        <main className="canvas-area">
          <Canvas />
        </main>
        <PropertiesPanel />
        <footer className="status-bar">Status</footer>
      </div>
    </DiagramProvider>
  );
}

export default App;
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/PropertiesPanel.tsx src/components/PropertiesPanel.css src/App.tsx
git commit -m "feat: add properties panel with color swatches and font controls"
```

---

## Task 14: Toolbar (Undo/Redo, Zoom, Alignment)

**Files:**
- Create: `src/components/Toolbar.tsx`, `src/components/Toolbar.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create Toolbar.tsx**

Create `src/components/Toolbar.tsx`:

```tsx
import { useDiagram } from '../state/DiagramContext';
import { ZOOM } from '../constants';
import './Toolbar.css';

interface ToolbarProps {
  onExport: () => void;
}

export default function Toolbar({ onExport }: ToolbarProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useDiagram();

  const handleZoomIn = () => {
    const next = Math.min(state.zoom + ZOOM.STEP, ZOOM.MAX);
    dispatch({ type: 'SET_ZOOM', zoom: Math.round(next * 100) / 100 });
  };

  const handleZoomOut = () => {
    const next = Math.max(state.zoom - ZOOM.STEP, ZOOM.MIN);
    dispatch({ type: 'SET_ZOOM', zoom: Math.round(next * 100) / 100 });
  };

  const handleZoomFit = () => {
    dispatch({ type: 'SET_ZOOM', zoom: 1 });
  };

  const handleSelectTool = () => {
    dispatch({ type: 'SET_TOOL', tool: 'select' });
  };

  return (
    <header className="toolbar">
      <div className="toolbar-group">
        <button
          className={`toolbar-btn ${state.tool === 'select' ? 'active' : ''}`}
          onClick={handleSelectTool}
          title="Select (V)"
        >
          Select
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button className="toolbar-btn" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          Redo
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={handleZoomOut} title="Zoom Out">
          -
        </button>
        <span className="toolbar-zoom-label">{Math.round(state.zoom * 100)}%</span>
        <button className="toolbar-btn" onClick={handleZoomIn} title="Zoom In">
          +
        </button>
        <button className="toolbar-btn" onClick={handleZoomFit} title="Zoom to Fit">
          Fit
        </button>
      </div>

      <div className="toolbar-spacer" />

      <div className="toolbar-group">
        <button className="toolbar-btn toolbar-btn-primary" onClick={onExport}>
          Export
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create Toolbar.css**

Create `src/components/Toolbar.css`:

```css
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar-separator {
  width: 1px;
  height: 24px;
  background: #d0d0d0;
  margin: 0 8px;
}

.toolbar-spacer {
  flex: 1;
}

.toolbar-btn {
  padding: 6px 12px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  background: #ffffff;
  cursor: pointer;
  font-family: 'Red Hat Text', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #262626;
  transition: background-color 0.15s, border-color 0.15s;
}

.toolbar-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #0066cc;
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: default;
}

.toolbar-btn.active {
  background: #d9e8f7;
  border-color: #0066cc;
}

.toolbar-btn-primary {
  background: #0066cc;
  color: #ffffff;
  border-color: #0066cc;
}

.toolbar-btn-primary:hover:not(:disabled) {
  background: #004d99;
}

.toolbar-zoom-label {
  font-size: 12px;
  font-weight: 500;
  color: #262626;
  min-width: 40px;
  text-align: center;
}
```

- [ ] **Step 3: Wire Toolbar into App.tsx**

Update `src/App.tsx`:

```tsx
import { useState } from 'react';
import './App.css';
import { DiagramProvider } from './state/DiagramContext';
import Canvas from './components/Canvas';
import ComponentPanel from './components/ComponentPanel';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';

function App() {
  const [showExport, setShowExport] = useState(false);

  return (
    <DiagramProvider>
      <div className="app">
        <Toolbar onExport={() => setShowExport(true)} />
        <ComponentPanel />
        <main className="canvas-area">
          <Canvas />
        </main>
        <PropertiesPanel />
        <footer className="status-bar">Status</footer>
      </div>
    </DiagramProvider>
  );
}

export default App;
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/Toolbar.tsx src/components/Toolbar.css src/App.tsx
git commit -m "feat: add toolbar with undo/redo, zoom, and export button"
```

---

## Task 15: StatusBar

**Files:**
- Create: `src/components/StatusBar.tsx`, `src/components/StatusBar.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create StatusBar.tsx**

Create `src/components/StatusBar.tsx`:

```tsx
import { useDiagram } from '../state/DiagramContext';
import { CANVAS } from '../constants';
import './StatusBar.css';

export default function StatusBar() {
  const { state, dispatch } = useDiagram();

  const toggleSnap = () => {
    dispatch({ type: 'SET_SNAP', enabled: !state.snapEnabled });
  };

  return (
    <footer className="status-bar">
      <span className="status-item">
        Canvas: {CANVAS.WIDTH} x {state.canvasHeight} px
      </span>
      <span className="status-item">
        Zoom: {Math.round(state.zoom * 100)}%
      </span>
      <button className={`status-snap-btn ${state.snapEnabled ? 'active' : ''}`} onClick={toggleSnap}>
        Snap: {state.snapEnabled ? 'ON' : 'OFF'}
      </button>
      <span className="status-item">
        Elements: {state.elements.length}
      </span>
    </footer>
  );
}
```

- [ ] **Step 2: Create StatusBar.css**

Create `src/components/StatusBar.css`:

```css
.status-item {
  margin-right: 16px;
}

.status-snap-btn {
  padding: 2px 8px;
  border: 1px solid #d0d0d0;
  border-radius: 3px;
  background: #ffffff;
  cursor: pointer;
  font-family: 'Red Hat Text', sans-serif;
  font-size: 11px;
  color: #595959;
  margin-right: 16px;
}

.status-snap-btn.active {
  background: #d9e8f7;
  border-color: #0066cc;
  color: #0066cc;
}
```

- [ ] **Step 3: Wire StatusBar into App.tsx**

Update `src/App.tsx`:

```tsx
import { useState } from 'react';
import './App.css';
import { DiagramProvider } from './state/DiagramContext';
import Canvas from './components/Canvas';
import ComponentPanel from './components/ComponentPanel';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';

function App() {
  const [showExport, setShowExport] = useState(false);

  return (
    <DiagramProvider>
      <div className="app">
        <Toolbar onExport={() => setShowExport(true)} />
        <ComponentPanel />
        <main className="canvas-area">
          <Canvas />
        </main>
        <PropertiesPanel />
        <StatusBar />
      </div>
    </DiagramProvider>
  );
}

export default App;
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/StatusBar.tsx src/components/StatusBar.css src/App.tsx
git commit -m "feat: add status bar with snap toggle and canvas info"
```

---

## Task 16: Connector Creation on Canvas

**Files:**
- Modify: `src/components/Canvas.tsx`

- [ ] **Step 1: Add connector creation logic to Canvas.tsx**

Update `src/components/Canvas.tsx` — add a `pendingConnectorFrom` ref and handle clicks on shapes when a connector tool is active:

Add these imports at the top (alongside existing ones):

```typescript
import { useState } from 'react';
```

Add inside the `Canvas` component function, before the return:

```typescript
const [pendingFrom, setPendingFrom] = useState<string | null>(null);

const handleShapeClickForConnector = useCallback(
  (elementId: string) => {
    if (state.tool !== 'connector-solid' && state.tool !== 'connector-dashed') return;

    if (!pendingFrom) {
      setPendingFrom(elementId);
    } else if (pendingFrom !== elementId) {
      const lineType = state.tool === 'connector-solid' ? 'solid' : 'dashed';
      addConnector({
        id: `conn-${Date.now()}`,
        fromId: pendingFrom,
        toId: elementId,
        lineType,
        arrowDirection: 'forward',
        strokeWidth: 1,
        stroke: COLORS.DARK_GRAY,
        points: [],
        isElbow: false,
      });
      setPendingFrom(null);
      dispatch({ type: 'SET_TOOL', tool: 'select' });
    }
  },
  [state.tool, pendingFrom, addConnector, dispatch]
);
```

Then pass `onShapeClickForConnector={handleShapeClickForConnector}` as a prop to each shape component. Update each shape component to accept and call this callback in their `handleClick` when a connector tool is active.

Alternatively, add a click listener on the shapes layer that checks if a connector tool is active:

After the existing `handleStageClick`, add to the `<Stage>` `onContentClick` or handle this in the shape components by checking `state.tool`. The simplest approach is to modify the `handleStageClick`:

```typescript
const handleStageClick = useCallback(
  (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelection([]);
      setPendingFrom(null);
      return;
    }

    // Check if a connector tool is active and a shape was clicked
    if (state.tool === 'connector-solid' || state.tool === 'connector-dashed') {
      const clickedId = e.target.parent?.id() || e.target.id();
      if (!clickedId) return;
      // Find if this ID belongs to an element
      const el = state.elements.find(
        (el) => el.id === clickedId || e.target.parent?.id() === el.id
      );
      if (!el) return;

      if (!pendingFrom) {
        setPendingFrom(el.id);
      } else if (pendingFrom !== el.id) {
        const lineType = state.tool === 'connector-solid' ? 'solid' : 'dashed';
        addConnector({
          id: `conn-${Date.now()}`,
          fromId: pendingFrom,
          toId: el.id,
          lineType,
          arrowDirection: 'forward',
          strokeWidth: 1,
          stroke: COLORS.DARK_GRAY,
          points: [],
          isElbow: false,
        });
        setPendingFrom(null);
        dispatch({ type: 'SET_TOOL', tool: 'select' });
      }
    }
  },
  [setSelection, state.tool, state.elements, pendingFrom, addConnector, dispatch]
);
```

Also update the `renderElement` function to set `id` on the Konva Group by passing it through. Update each shape component to add `id={element.id}` to their root `<Group>`.

- [ ] **Step 2: Update shape components to set Konva Group id**

In each of `RectShape.tsx`, `CircleCallout.tsx`, `TextLabel.tsx`, `IconShape.tsx`, add `id={element.id}` to the root `<Group>` element.

For example in `RectShape.tsx`:

```tsx
<Group
  id={element.id}
  ref={groupRef}
  x={element.x}
  ...
```

- [ ] **Step 3: Verify in browser**

```bash
npm run dev
```

Expected: Click "Solid Arrow" in component panel, then click a shape, then click another shape. An arrow appears connecting them.

- [ ] **Step 4: Commit**

```bash
git add src/components/Canvas.tsx src/shapes/RectShape.tsx src/shapes/CircleCallout.tsx src/shapes/TextLabel.tsx src/shapes/IconShape.tsx
git commit -m "feat: add connector creation by clicking source then target shape"
```

---

## Task 17: Project Save/Load

**Files:**
- Create: `src/utils/projectFile.ts`, `src/__tests__/projectFile.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/projectFile.test.ts`:

```typescript
import { serializeProject, deserializeProject } from '../utils/projectFile';
import { DiagramState } from '../types';

describe('projectFile', () => {
  const sampleState: DiagramState = {
    elements: [
      {
        id: 'el-1',
        type: 'rect',
        x: 100,
        y: 200,
        width: 180,
        height: 60,
        rotation: 0,
        fill: '#0066cc',
        stroke: '',
        strokeWidth: 0,
        text: 'Test',
        fontSize: 16,
        fontWeight: 'bold',
        textColor: '#ffffff',
        groupId: null,
      },
    ],
    connectors: [],
    selectedIds: [],
    canvasHeight: 600,
    zoom: 1,
    snapEnabled: true,
    tool: 'select',
  };

  it('round-trips state through serialize/deserialize', () => {
    const json = serializeProject(sampleState);
    const parsed = deserializeProject(json);
    expect(parsed.elements).toEqual(sampleState.elements);
    expect(parsed.connectors).toEqual(sampleState.connectors);
    expect(parsed.canvasHeight).toBe(sampleState.canvasHeight);
  });

  it('strips selectedIds and resets tool on deserialize', () => {
    const stateWithSelection = { ...sampleState, selectedIds: ['el-1'], tool: 'connector-solid' as const };
    const json = serializeProject(stateWithSelection);
    const parsed = deserializeProject(json);
    expect(parsed.selectedIds).toEqual([]);
    expect(parsed.tool).toBe('select');
  });

  it('serializes to valid JSON', () => {
    const json = serializeProject(sampleState);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/projectFile.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement projectFile.ts**

Create `src/utils/projectFile.ts`:

```typescript
import { DiagramState } from '../types';

interface ProjectFile {
  version: 1;
  elements: DiagramState['elements'];
  connectors: DiagramState['connectors'];
  canvasHeight: number;
}

export function serializeProject(state: DiagramState): string {
  const project: ProjectFile = {
    version: 1,
    elements: state.elements,
    connectors: state.connectors,
    canvasHeight: state.canvasHeight,
  };
  return JSON.stringify(project, null, 2);
}

export function deserializeProject(json: string): DiagramState {
  const project: ProjectFile = JSON.parse(json);
  return {
    elements: project.elements,
    connectors: project.connectors,
    selectedIds: [],
    canvasHeight: project.canvasHeight,
    zoom: 1,
    snapEnabled: true,
    tool: 'select',
  };
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function loadFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    };
    input.click();
  });
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/__tests__/projectFile.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/utils/projectFile.ts src/__tests__/projectFile.test.ts
git commit -m "feat: add project save/load with JSON serialization"
```

---

## Task 18: SVG Export

**Files:**
- Create: `src/utils/exportSvg.ts`, `src/__tests__/exportSvg.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/exportSvg.test.ts`:

```typescript
import { generateSvg } from '../utils/exportSvg';
import { DiagramState } from '../types';

describe('generateSvg', () => {
  const state: DiagramState = {
    elements: [
      {
        id: 'el-1',
        type: 'rect',
        x: 50,
        y: 50,
        width: 180,
        height: 60,
        rotation: 0,
        fill: '#0066cc',
        stroke: '',
        strokeWidth: 0,
        text: 'Test Box',
        fontSize: 16,
        fontWeight: 'bold',
        textColor: '#ffffff',
        groupId: null,
      },
    ],
    connectors: [],
    selectedIds: [],
    canvasHeight: 600,
    zoom: 1,
    snapEnabled: true,
    tool: 'select',
  };

  it('generates valid SVG with correct dimensions', () => {
    const svg = generateSvg(state);
    expect(svg).toContain('width="760"');
    expect(svg).toContain('height="600"');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('includes rect element', () => {
    const svg = generateSvg(state);
    expect(svg).toContain('<rect');
    expect(svg).toContain('fill="#0066cc"');
    expect(svg).toContain('width="180"');
  });

  it('includes text element', () => {
    const svg = generateSvg(state);
    expect(svg).toContain('Test Box');
    expect(svg).toContain('Red Hat Text');
  });

  it('includes font-face reference', () => {
    const svg = generateSvg(state);
    expect(svg).toContain('Red Hat Text');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/exportSvg.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement exportSvg.ts**

Create `src/utils/exportSvg.ts`:

```typescript
import { DiagramState, DiagramElement, Connector } from '../types';
import { CANVAS, FONT_FAMILY, CALLOUT_CIRCLE, COLORS, ARROWHEAD } from '../constants';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderRect(el: DiagramElement): string {
  const parts: string[] = [];

  if (el.fill) {
    parts.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" />`);
  }
  if (el.stroke) {
    parts.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="none" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" />`);
  }
  if (!el.fill && !el.stroke) {
    parts.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="none" />`);
  }

  if (el.text) {
    const fontStyle = el.fontWeight === 'bold' ? 'font-weight:bold' : 'font-weight:500';
    const tx = el.x + el.width / 2;
    const ty = el.y + el.height / 2;
    parts.push(`  <text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="${el.fontSize}" fill="${el.textColor}" style="${fontStyle}">${escapeXml(el.text)}</text>`);
  }

  return parts.join('\n');
}

function renderCircle(el: DiagramElement): string {
  const parts: string[] = [];
  parts.push(`  <circle cx="${el.x}" cy="${el.y}" r="${CALLOUT_CIRCLE.RADIUS}" fill="${CALLOUT_CIRCLE.FILL}" />`);
  parts.push(`  <text x="${el.x}" y="${el.y}" text-anchor="middle" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="${CALLOUT_CIRCLE.FONT_SIZE}" font-weight="bold" fill="${CALLOUT_CIRCLE.TEXT_COLOR}">${escapeXml(el.text)}</text>`);
  return parts.join('\n');
}

function renderText(el: DiagramElement): string {
  const fontStyle = el.fontWeight === 'bold' ? 'font-weight:bold' : 'font-weight:500';
  return `  <text x="${el.x}" y="${el.y + el.fontSize}" font-family="${FONT_FAMILY}" font-size="${el.fontSize}" fill="${el.textColor}" style="${fontStyle}">${escapeXml(el.text)}</text>`;
}

function renderConnector(connector: Connector, elements: DiagramElement[]): string {
  const fromEl = elements.find((e) => e.id === connector.fromId);
  const toEl = elements.find((e) => e.id === connector.toId);
  if (!fromEl || !toEl) return '';

  const fromCx = fromEl.x + fromEl.width / 2;
  const fromCy = fromEl.y + fromEl.height / 2;
  const toCx = toEl.x + toEl.width / 2;
  const toCy = toEl.y + toEl.height / 2;

  const markerId = `arrow-${connector.id}`;
  const dashAttr = connector.lineType === 'dashed' ? ' stroke-dasharray="2,2"' : '';

  const parts: string[] = [];
  parts.push(`  <defs><marker id="${markerId}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="${ARROWHEAD.SIZE_X * 5}" markerHeight="${ARROWHEAD.SIZE_Y * 5}" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${connector.stroke || COLORS.DARK_GRAY}" /></marker></defs>`);
  parts.push(`  <line x1="${fromCx}" y1="${fromCy}" x2="${toCx}" y2="${toCy}" stroke="${connector.stroke || COLORS.DARK_GRAY}" stroke-width="${connector.strokeWidth}" marker-end="url(#${markerId})"${dashAttr} />`);

  return parts.join('\n');
}

function renderElement(el: DiagramElement): string {
  switch (el.type) {
    case 'rect':
      return renderRect(el);
    case 'circle':
      return renderCircle(el);
    case 'text':
      return renderText(el);
    case 'icon':
      return renderText(el); // Icons export as labeled text for simplicity in v1
    default:
      return '';
  }
}

export function generateSvg(state: DiagramState): string {
  const width = CANVAS.WIDTH;
  const height = state.canvasHeight;

  const svgParts: string[] = [];
  svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  svgParts.push(`  <rect width="${width}" height="${height}" fill="#ffffff" />`);

  for (const el of state.elements) {
    svgParts.push(renderElement(el));
  }

  for (const conn of state.connectors) {
    svgParts.push(renderConnector(conn, state.elements));
  }

  svgParts.push(`</svg>`);
  return svgParts.join('\n');
}
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/__tests__/exportSvg.test.ts
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/utils/exportSvg.ts src/__tests__/exportSvg.test.ts
git commit -m "feat: add SVG export generation"
```

---

## Task 19: PNG Export

**Files:**
- Create: `src/utils/exportPng.ts`

- [ ] **Step 1: Create exportPng.ts**

Create `src/utils/exportPng.ts`:

```typescript
import Konva from 'konva';
import { EXPORT_SETTINGS, CANVAS } from '../constants';

export function exportPng(stage: Konva.Stage): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const scale = EXPORT_SETTINGS.PNG_WIDTH / CANVAS.WIDTH;

    stage.toBlob({
      pixelRatio: scale,
      mimeType: 'image/png',
      callback: (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate PNG'));
        }
      },
    });
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/exportPng.ts
git commit -m "feat: add PNG export at 2x resolution"
```

---

## Task 20: Export Modal

**Files:**
- Create: `src/components/ExportModal.tsx`, `src/components/ExportModal.css`
- Modify: `src/App.tsx`

- [ ] **Step 1: Create ExportModal.tsx**

Create `src/components/ExportModal.tsx`:

```tsx
import { useState } from 'react';
import { useDiagram } from '../state/DiagramContext';
import { generateSvg } from '../utils/exportSvg';
import { downloadFile, serializeProject } from '../utils/projectFile';
import './ExportModal.css';

interface ExportModalProps {
  onClose: () => void;
  stageRef: React.RefObject<unknown>;
}

function generateFilename(issue: string, product: string, desc: string, date: string): string {
  const parts = [issue, product, desc, date].filter(Boolean);
  return parts.join('_').replace(/\s+/g, '_').toLowerCase();
}

export default function ExportModal({ onClose, stageRef }: ExportModalProps) {
  const { state } = useDiagram();
  const [issueNumber, setIssueNumber] = useState('');
  const [productFamily, setProductFamily] = useState('');
  const [description, setDescription] = useState('');

  const now = new Date();
  const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getFullYear()).slice(-2)}`;

  const filename = generateFilename(issueNumber, productFamily, description, dateStr);

  const handleExportSvg = () => {
    const svg = generateSvg(state);
    downloadFile(svg, `${filename || 'diagram'}.svg`, 'image/svg+xml');
  };

  const handleExportPng = async () => {
    const stage = stageRef?.current as { toBlob?: (opts: Record<string, unknown>) => void } | null;
    if (!stage?.toBlob) return;

    const { EXPORT_SETTINGS, CANVAS } = await import('../constants');
    const scale = EXPORT_SETTINGS.PNG_WIDTH / CANVAS.WIDTH;
    stage.toBlob({
      pixelRatio: scale,
      mimeType: 'image/png',
      callback: (blob: Blob | null) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename || 'diagram'}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      },
    });
  };

  const handleSaveProject = () => {
    const json = serializeProject(state);
    downloadFile(json, `${filename || 'diagram'}.json`, 'application/json');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Export Diagram</h2>

        <div className="modal-field">
          <label>Issue Number</label>
          <input
            type="text"
            placeholder="e.g., 123"
            value={issueNumber}
            onChange={(e) => setIssueNumber(e.target.value)}
          />
        </div>

        <div className="modal-field">
          <label>Product Family</label>
          <input
            type="text"
            placeholder="e.g., OpenShift"
            value={productFamily}
            onChange={(e) => setProductFamily(e.target.value)}
          />
        </div>

        <div className="modal-field">
          <label>Description</label>
          <input
            type="text"
            placeholder="e.g., network_topology"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="modal-field">
          <label>Generated Filename</label>
          <span className="modal-filename">{filename || 'diagram'}.[svg|png]</span>
        </div>

        <div className="modal-actions">
          <button className="modal-btn" onClick={handleExportSvg}>
            Export SVG
          </button>
          <button className="modal-btn" onClick={handleExportPng}>
            Export PNG
          </button>
          <button className="modal-btn modal-btn-secondary" onClick={handleSaveProject}>
            Save Project (.json)
          </button>
          <button className="modal-btn modal-btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ExportModal.css**

Create `src/components/ExportModal.css`:

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  width: 420px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #262626;
  margin-bottom: 16px;
}

.modal-field {
  margin-bottom: 12px;
}

.modal-field label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #595959;
  margin-bottom: 4px;
}

.modal-field input {
  width: 100%;
  padding: 8px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-family: 'Red Hat Text', sans-serif;
  font-size: 14px;
}

.modal-field input:focus {
  outline: none;
  border-color: #0066cc;
}

.modal-filename {
  font-size: 13px;
  color: #262626;
  font-family: monospace;
  background: #f5f5f5;
  padding: 6px 8px;
  border-radius: 4px;
  display: block;
}

.modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.modal-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #0066cc;
  color: #ffffff;
  cursor: pointer;
  font-family: 'Red Hat Text', sans-serif;
  font-size: 13px;
  font-weight: 500;
}

.modal-btn:hover {
  background: #004d99;
}

.modal-btn-secondary {
  background: #e5e5e5;
  color: #262626;
}

.modal-btn-secondary:hover {
  background: #d0d0d0;
}

.modal-btn-cancel {
  background: transparent;
  color: #595959;
  border: 1px solid #d0d0d0;
}

.modal-btn-cancel:hover {
  background: #f5f5f5;
}
```

- [ ] **Step 3: Wire ExportModal into App.tsx**

Update `src/App.tsx`:

```tsx
import { useState, useRef } from 'react';
import type Konva from 'konva';
import './App.css';
import { DiagramProvider } from './state/DiagramContext';
import Canvas from './components/Canvas';
import ComponentPanel from './components/ComponentPanel';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import ExportModal from './components/ExportModal';

function App() {
  const [showExport, setShowExport] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);

  return (
    <DiagramProvider>
      <div className="app">
        <Toolbar onExport={() => setShowExport(true)} />
        <ComponentPanel />
        <main className="canvas-area">
          <Canvas stageRef={stageRef} />
        </main>
        <PropertiesPanel />
        <StatusBar />
      </div>
      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} stageRef={stageRef} />
      )}
    </DiagramProvider>
  );
}

export default App;
```

- [ ] **Step 4: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/ExportModal.tsx src/components/ExportModal.css src/App.tsx
git commit -m "feat: add export modal with SVG/PNG download and filename generation"
```

---

## Task 21: Project Load via Toolbar

**Files:**
- Modify: `src/components/Toolbar.tsx`

- [ ] **Step 1: Add Save/Load buttons to Toolbar**

Update `src/components/Toolbar.tsx` — add file operations. Add after the existing imports:

```typescript
import { serializeProject, deserializeProject, downloadFile, loadFile } from '../utils/projectFile';
```

Add inside the component, before the return, after the existing handlers:

```typescript
const handleSave = () => {
  const json = serializeProject(state);
  downloadFile(json, 'diagram.json', 'application/json');
};

const handleLoad = async () => {
  try {
    const json = await loadFile();
    const loaded = deserializeProject(json);
    dispatch({ type: 'LOAD_STATE', state: loaded });
  } catch {
    // User cancelled file picker
  }
};
```

Add buttons inside the first `toolbar-group`, before the Select button:

```tsx
<button className="toolbar-btn" onClick={handleSave} title="Save Project">
  Save
</button>
<button className="toolbar-btn" onClick={handleLoad} title="Load Project">
  Load
</button>
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/components/Toolbar.tsx
git commit -m "feat: add save/load project buttons to toolbar"
```

---

## Task 22: Final Integration & Smoke Test

**Files:**
- Modify: `src/__tests__/App.test.tsx`

- [ ] **Step 1: Update App smoke test**

Update `src/__tests__/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders all major layout sections', () => {
    render(<App />);
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Redo')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('renders component panel sections', () => {
    render(<App />);
    expect(screen.getByText('Boxes')).toBeInTheDocument();
    expect(screen.getByText('Callout')).toBeInTheDocument();
    expect(screen.getByText('Icons')).toBeInTheDocument();
    expect(screen.getByText('Connectors')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run all tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 3: Verify full app in browser**

```bash
npm run dev
```

Expected:
- 5-panel layout visible
- Left panel: clickable boxes, icons, callout, text, connectors
- Center: 760px white canvas with 5px grid
- Right panel: shows properties when a shape is selected
- Toolbar: Save, Load, Select, Undo, Redo, Zoom, Export
- Status bar: canvas dimensions, zoom %, snap toggle
- Export modal opens with filename generation

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Red Hat Diagram Designer v1 integration"
```
