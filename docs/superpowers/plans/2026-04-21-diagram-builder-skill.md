# Diagram Builder Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Paste from JSON" import flow (button + URL hash) to the Diagram Designer app, and create a self-contained Claude Code skill that builds diagram JSON through interactive prompts.

**Architecture:** The app gets a paste modal for manual JSON import and a URL hash reader for programmatic import. A new Claude Code skill file guides users through a phased questionnaire, generates valid project JSON, writes it to disk, and opens it in the browser via the hash import mechanism.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, Claude Code Skills (Markdown)

---

### Task 1: PasteModal Component

**Files:**
- Create: `src/components/PasteModal.tsx`
- Create: `src/components/PasteModal.css`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/PasteModal.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DiagramProvider } from '../state/DiagramContext';
import PasteModal from '../components/PasteModal';

function renderModal(onClose = vi.fn()) {
  return render(
    <DiagramProvider>
      <PasteModal onClose={onClose} />
    </DiagramProvider>
  );
}

describe('PasteModal', () => {
  it('renders textarea and buttons', () => {
    renderModal();
    expect(screen.getByPlaceholderText(/paste/i)).toBeInTheDocument();
    expect(screen.getByText('Load')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    renderModal(onClose);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows error for invalid JSON', () => {
    renderModal();
    const textarea = screen.getByPlaceholderText(/paste/i);
    fireEvent.change(textarea, { target: { value: 'not json' } });
    fireEvent.click(screen.getByText('Load'));
    expect(screen.getByText(/invalid/i)).toBeInTheDocument();
  });

  it('loads valid JSON and closes', () => {
    const onClose = vi.fn();
    renderModal(onClose);
    const validJson = JSON.stringify({
      version: 1,
      elements: [],
      connectors: [],
      canvasHeight: 600,
    });
    const textarea = screen.getByPlaceholderText(/paste/i);
    fireEvent.change(textarea, { target: { value: validJson } });
    fireEvent.click(screen.getByText('Load'));
    expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/PasteModal.test.tsx`
Expected: FAIL — module `../components/PasteModal` not found

- [ ] **Step 3: Create PasteModal.css**

Create `src/components/PasteModal.css`:

```css
.paste-modal-textarea {
  width: 100%;
  height: 200px;
  padding: 8px;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-family: monospace;
  font-size: 13px;
  resize: vertical;
}

.paste-modal-textarea:focus {
  outline: none;
  border-color: #0066cc;
}

.paste-modal-error {
  color: #f0561d;
  font-size: 13px;
  margin-top: 8px;
}
```

- [ ] **Step 4: Create PasteModal.tsx**

Create `src/components/PasteModal.tsx`:

```tsx
import { useState } from 'react';
import { useDiagram } from '../state/DiagramContext';
import { deserializeProject } from '../utils/projectFile';
import './PasteModal.css';

interface PasteModalProps {
  onClose: () => void;
}

export default function PasteModal({ onClose }: PasteModalProps) {
  const { dispatch } = useDiagram();
  const [json, setJson] = useState('');
  const [error, setError] = useState('');

  const handleLoad = () => {
    try {
      const state = deserializeProject(json);
      dispatch({ type: 'LOAD_STATE', state });
      onClose();
    } catch {
      setError('Invalid JSON — check the format and try again.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Paste Diagram JSON</h2>
        <textarea
          className="paste-modal-textarea"
          placeholder="Paste project JSON here..."
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            setError('');
          }}
        />
        {error && <p className="paste-modal-error">{error}</p>}
        <div className="modal-actions">
          <button className="modal-btn" onClick={handleLoad}>
            Load
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

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/__tests__/PasteModal.test.tsx`
Expected: PASS — all 4 tests

- [ ] **Step 6: Commit**

```bash
git add src/components/PasteModal.tsx src/components/PasteModal.css src/__tests__/PasteModal.test.tsx
git commit -m "feat: add PasteModal component for JSON import"
```

---

### Task 2: Replace Select Button with Paste Button in Toolbar

**Files:**
- Modify: `src/components/Toolbar.tsx:36-38` (remove `handleSelectTool`)
- Modify: `src/components/Toolbar.tsx:217-233` (replace Select button with Paste button)
- Modify: `src/__tests__/App.test.tsx` (update test expectations)

- [ ] **Step 1: Write the failing test**

Add to `src/__tests__/App.test.tsx`:

```tsx
it('renders Paste button instead of Select button', () => {
  render(<App />);
  expect(screen.getByText('Paste')).toBeInTheDocument();
  expect(screen.queryByText('Select')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/App.test.tsx`
Expected: FAIL — "Paste" not found, "Select" still present

- [ ] **Step 3: Modify Toolbar.tsx**

In `src/components/Toolbar.tsx`:

Add import at the top (after existing imports):

```tsx
import { useState } from 'react';  // already imported — just add PasteModal
import PasteModal from './PasteModal';
```

Add state for the paste modal inside the `Toolbar` component (after `const [distributeGap, setDistributeGap] = ...`):

```tsx
const [showPaste, setShowPaste] = useState(false);
```

Remove the `handleSelectTool` function (lines 36-38):

```tsx
// DELETE:
// const handleSelectTool = () => {
//   dispatch({ type: 'SET_TOOL', tool: 'select' });
// };
```

Replace the Select button block (lines 226-231) with:

```tsx
        <button className="toolbar-btn" onClick={() => setShowPaste(true)} title="Paste Diagram JSON">
          Paste
        </button>
```

Add the PasteModal render at the end of the return, just before the closing `</header>`:

```tsx
      {showPaste && <PasteModal onClose={() => setShowPaste(false)} />}
    </header>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS — all tests including the new one

- [ ] **Step 5: Commit**

```bash
git add src/components/Toolbar.tsx src/__tests__/App.test.tsx
git commit -m "feat: replace Select button with Paste from JSON"
```

---

### Task 3: URL Hash Import in App.tsx

**Files:**
- Modify: `src/App.tsx:1` (add `useEffect`)
- Modify: `src/App.tsx:12-46` (add hash import logic)
- Create: `src/utils/hashImport.ts`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/hashImport.test.ts`:

```ts
import { parseHashData } from '../utils/hashImport';
import { DiagramState } from '../types';

describe('parseHashData', () => {
  const validProject = JSON.stringify({
    version: 1,
    elements: [],
    connectors: [],
    canvasHeight: 600,
  });

  it('parses valid base64-encoded project JSON', () => {
    const encoded = btoa(validProject);
    const result = parseHashData(`#data=${encoded}`);
    expect(result).not.toBeNull();
    expect((result as DiagramState).elements).toEqual([]);
    expect((result as DiagramState).canvasHeight).toBe(600);
  });

  it('returns null for empty hash', () => {
    expect(parseHashData('')).toBeNull();
  });

  it('returns null for hash without data param', () => {
    expect(parseHashData('#other=value')).toBeNull();
  });

  it('returns null for invalid base64', () => {
    expect(parseHashData('#data=!!!invalid!!!')).toBeNull();
  });

  it('returns null for valid base64 but invalid JSON', () => {
    const encoded = btoa('not a json object');
    expect(parseHashData(`#data=${encoded}`)).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/hashImport.test.ts`
Expected: FAIL — module `../utils/hashImport` not found

- [ ] **Step 3: Create hashImport.ts**

Create `src/utils/hashImport.ts`:

```ts
import { DiagramState } from '../types';
import { deserializeProject } from './projectFile';

export function parseHashData(hash: string): DiagramState | null {
  if (!hash.startsWith('#data=')) return null;
  const encoded = hash.slice(6);
  try {
    const json = atob(encoded);
    return deserializeProject(json);
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/hashImport.test.ts`
Expected: PASS — all 5 tests

- [ ] **Step 5: Wire hash import into App.tsx**

In `src/App.tsx`:

Add import:

```tsx
import { useEffect } from 'react';  // add to existing import from 'react'
import { parseHashData } from './utils/hashImport';
import { useDiagram } from './state/DiagramContext';
```

The hash import needs access to `dispatch` from `useDiagram()`, which must be inside `DiagramProvider`. Extract the inner content to a new component `AppContent` inside `App.tsx`:

```tsx
function AppContent() {
  const { dispatch } = useDiagram();
  const [showExport, setShowExport] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    const state = parseHashData(window.location.hash);
    if (state) {
      dispatch({ type: 'LOAD_STATE', state });
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [dispatch]);

  return (
    <>
      <div className="app">
        <header className="title-bar">
          <span className="title-bar-name">
            <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="Red Hat" className="title-bar-logo" />
            Red Hat Diagram Designer
          </span>
          <a
            className="title-bar-link"
            href="https://github.com/aireilly/rh-diagrams-designer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-label="GitHub"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
          </a>
        </header>
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
    </>
  );
}

function App() {
  return (
    <DiagramProvider>
      <AppContent />
    </DiagramProvider>
  );
}

export default App;
```

- [ ] **Step 6: Run all tests to verify nothing broke**

Run: `npx vitest run`
Expected: PASS — all tests

- [ ] **Step 7: Commit**

```bash
git add src/utils/hashImport.ts src/__tests__/hashImport.test.ts src/App.tsx
git commit -m "feat: add URL hash import for programmatic diagram loading"
```

---

### Task 4: ComponentPanel Info Box

**Files:**
- Modify: `src/components/ComponentPanel.tsx:273` (add info box before closing `</aside>`)
- Modify: `src/components/ComponentPanel.css` (add info box styles)

- [ ] **Step 1: Write the failing test**

Add to `src/__tests__/App.test.tsx`:

```tsx
it('renders Claude Code skill info box in component panel', () => {
  render(<App />);
  expect(screen.getByText(/Claude Code/)).toBeInTheDocument();
  expect(screen.getByText(/Download skill/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/App.test.tsx`
Expected: FAIL — "Claude Code" not found

- [ ] **Step 3: Add styles to ComponentPanel.css**

Append to `src/components/ComponentPanel.css`:

```css
.skill-info-box {
  margin-top: 16px;
  padding: 12px;
  background: #f5f5f5;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  font-size: 12px;
  color: #595959;
  line-height: 1.5;
}

.skill-info-box strong {
  color: #262626;
}

.skill-info-link {
  color: #0066cc;
  text-decoration: none;
  font-weight: 500;
}

.skill-info-link:hover {
  text-decoration: underline;
}

.skill-info-code {
  display: block;
  margin-top: 4px;
  font-family: monospace;
  font-size: 11px;
  color: #3c3c3c;
}
```

- [ ] **Step 4: Add info box to ComponentPanel.tsx**

In `src/components/ComponentPanel.tsx`, add the following just before the closing `</aside>` tag (line 273):

```tsx
      <div className="skill-info-box">
        <strong>Claude Code Skill</strong>
        <br />
        Build diagrams from the CLI using interactive prompts.
        <br />
        <a
          className="skill-info-link"
          href="https://raw.githubusercontent.com/aireilly/rh-diagrams-designer/main/.claude/skills/diagram-builder.md"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download skill file
        </a>
        <span className="skill-info-code">Copy to .claude/skills/</span>
      </div>
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS — all tests

- [ ] **Step 6: Commit**

```bash
git add src/components/ComponentPanel.tsx src/components/ComponentPanel.css src/__tests__/App.test.tsx
git commit -m "feat: add Claude Code skill info box to ComponentPanel"
```

---

### Task 5: Lint and Build Verification

**Files:**
- No file changes — verification only

- [ ] **Step 1: Run linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 2: Run type check and build**

Run: `npm run build`
Expected: Clean build, no type errors

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 4: Commit any lint/type fixes if needed**

Only if previous steps required changes:

```bash
git add -A
git commit -m "fix: lint and type fixes"
```

---

### Task 6: Create the Diagram Builder Skill File

**Files:**
- Create: `.claude/skills/diagram-builder.md`

- [ ] **Step 1: Create the skill file**

Create `.claude/skills/diagram-builder.md` with the full skill content. The file must be self-contained — it embeds all element references, JSON schema, layout algorithm, color constants, and delivery instructions so an LLM can generate valid diagram JSON without reading the codebase.

```markdown
---
name: diagram-builder
description: Build Red Hat Diagrams Designer JSON files through interactive multiple-choice prompts. Guides users through element selection, labeling, nesting, connections, callouts, and auto-layout, then opens the result in the browser.
---

# Diagram Builder

Build a Red Hat Diagrams Designer project file by asking the user structured questions, then generate the JSON and open it in the browser.

## Interaction Flow

Use `AskUserQuestion` with multiple-choice options for all questions. Three phases:

### Phase 1 — Structure

**Q1: Element types.** Ask: "What elements do you need in this diagram?" Offer these choices (multi-select):

Boxes:
- Filled Box (blue background, white text)
- Outlined Box (blue border, dark text)
- Gray Box (gray background, dark text)
- White Box (white background, dark text)

Physical Icons:
- Server
- Storage / Database
- Router / Switch / Load Balancer
- Document / File
- User
- Cloud / Public Access

Physical Stack Icons:
- Server Stack
- Storage Stack
- Gateway
- Documents Stack
- Users Group
- Client

Virtual Icons:
- Virtual Server
- Virtual Storage
- Virtual Router

Virtual Stack Icons:
- Virtual Server Stack
- Virtual Storage Stack
- Hypervisor

Other Icons:
- Health Monitor
- VPN

**Q2: Quantity.** For each chosen element type, ask: "How many [type] elements?" Choices: 1, 2, 3, 4, 5.

**Q3: Labels.** For each element instance, ask: "Label for [type] #N?" This is an open-ended question (not multiple choice).

### Phase 2 — Relationships

**Q4: Nesting** (only if boxes were chosen). Ask: "Which elements should be placed inside a box?" Generate choices as pairs: `[Element label] → inside [Box label]`. Include a "None / Skip" option. Multi-select.

**Q5: Connections.** Ask: "What connections exist between elements?"
- If 6 or fewer elements: offer all pairwise combinations as multi-select choices. Include "No connections".
- If more than 6 elements: ask per element: "What does [Element X] connect to?" with remaining elements as choices. Include "Done" option.

**Q6: Connector style.** For each connection (if 3 or fewer) or for all connections at once (if more than 3), ask: "What connector style?" Choices:
- Solid line, forward arrow
- Solid line, bidirectional arrows
- Solid line, no arrows
- Dashed line, forward arrow
- Dashed line, bidirectional arrows
- Dashed line, no arrows

### Phase 3 — Annotation

**Q7: Callouts.** Ask: "Add numbered callout annotations?" Choices: Yes, No.
If Yes, ask: "Which elements get a callout?" Multi-select from all elements. Numbers are assigned in selection order (1, 2, 3...).

**Q8: Layout direction.** Ask: "Layout direction?" Choices:
- Left to right (recommended for ≤4 elements)
- Top to bottom (recommended for >4 elements)
Include the recommendation in the choice text.

## JSON Generation

After all questions are answered, generate a valid project JSON file.

### Project File Format

```json
{
  "version": 1,
  "elements": [ ...DiagramElement objects... ],
  "connectors": [ ...Connector objects... ],
  "canvasHeight": 600
}
```

### DiagramElement Schema

```typescript
{
  id: string,           // unique, e.g. "rect-1", "icon-2", "circle-3"
  type: "rect" | "circle" | "icon" | "text",
  x: number,            // horizontal position in pixels
  y: number,            // vertical position in pixels
  width: number,        // element width in pixels
  height: number,       // element height in pixels
  rotation: 0,          // always 0
  fill: string,         // hex color or empty string
  stroke: string,       // hex color or empty string
  strokeWidth: number,  // 0 or 2
  text: string,         // the element label
  fontSize: number,     // 10-16
  fontWeight: "bold" | "medium",
  textColor: string,    // hex color
  iconId?: string,      // required for type "icon" — see Icon ID Reference
  groupId?: string | null,
  variant?: "filled" | "outlined" | "gray" | "white"  // for type "rect"
}
```

### Connector Schema

```typescript
{
  id: string,             // unique, e.g. "conn-1"
  fromId: string,         // source element ID
  toId: string,           // target element ID
  lineType: "solid" | "dashed",
  arrowDirection: "forward" | "backward" | "bidirectional" | "none",
  strokeWidth: 1,         // always 1
  stroke: "#151515",      // always dark gray
  points: [],             // always empty — app calculates path
  fromSide: "auto" | "top" | "bottom" | "left" | "right",
  toSide: "auto" | "top" | "bottom" | "left" | "right"
}
```

### Element Defaults by Type

**Filled Box:**
`{ type: "rect", width: 180, height: 120, fill: "#0066cc", stroke: "", strokeWidth: 0, fontSize: 16, fontWeight: "bold", textColor: "#ffffff", variant: "filled" }`

**Outlined Box:**
`{ type: "rect", width: 180, height: 120, fill: "", stroke: "#0066cc", strokeWidth: 2, fontSize: 16, fontWeight: "bold", textColor: "#3c3c3c", variant: "outlined" }`

**Gray Box:**
`{ type: "rect", width: 180, height: 120, fill: "#e5e5e5", stroke: "", strokeWidth: 0, fontSize: 16, fontWeight: "bold", textColor: "#3c3c3c", variant: "gray" }`

**White Box:**
`{ type: "rect", width: 180, height: 120, fill: "#ffffff", stroke: "", strokeWidth: 0, fontSize: 16, fontWeight: "bold", textColor: "#3c3c3c", variant: "white" }`

**Callout Circle:**
`{ type: "circle", width: 30, height: 30, fill: "#3c3c3c", stroke: "", strokeWidth: 0, fontSize: 16, fontWeight: "bold", textColor: "#ffffff" }`

**All Icons:**
`{ type: "icon", fill: "#4d4d4d", stroke: "", strokeWidth: 0, fontSize: 11, fontWeight: "medium", textColor: "#151515" }`

### Icon ID Reference

| User-facing name | iconId | width | height |
|---|---|---|---|
| Server | physical-server | 40 | 18 |
| Storage / Database | physical-storage | 40 | 32 |
| Router / Switch / Load Balancer | physical-router | 40 | 18 |
| Document / File | physical-document | 32 | 41 |
| User | physical-user | 41 | 40 |
| Cloud / Public Access | physical-cloud | 48 | 30 |
| Server Stack | physical-server-stack | 40 | 40 |
| Storage Stack | physical-storage-stack | 40 | 40 |
| Gateway | physical-gateway | 37 | 37 |
| Documents Stack | physical-documents-stack | 35 | 44 |
| Users Group | physical-users | 55 | 48 |
| Client | physical-client | 41 | 32 |
| Virtual Server | virtual-server | 48 | 25 |
| Virtual Storage | virtual-storage | 48 | 39 |
| Virtual Router | virtual-router | 48 | 25 |
| Virtual Server Stack | virtual-server-stack | 48 | 48 |
| Virtual Storage Stack | virtual-storage-stack | 48 | 48 |
| Hypervisor | virtual-hypervisor | 41 | 35 |
| Health Monitor | other-health-monitor | 47 | 32 |
| VPN | other-vpn | 33 | 38 |

For icon elements, calculate the total height by adding label space: `totalHeight = iconHeight + (labelLines * 13) + 8`, where labelLines depends on the label length. A simple heuristic: `labelLines = ceil(labelLength * 5.5 / totalWidth) + 1`. Use `totalWidth = max(iconWidth, longestWordLength * 6.5 + 12, 60)`.

### Brand Colors Reference

| Name | Hex |
|---|---|
| Gray 95 | #151515 |
| Gray 50 | #707070 |
| Gray 20 | #e0e0e0 |
| Dark Gray | #3c3c3c |
| Medium Gray | #595959 |
| Light Gray | #e5e5e5 |
| Icon Gray | #4d4d4d |
| White | #ffffff |
| Blue 50 / Primary | #0066cc |
| Blue 40 | #4394e5 |
| Blue 10 | #e0f0ff |
| Green 50 | #63993d |
| Green 20 | #d1f1bb |
| Green 10 | #e9f7df |
| Purple 50 | #5e40be |
| Red Orange 50 | #f0561d |
| Yellow 40 | #b98412 |

## Auto-Layout Algorithm

### Canvas Constraints
- Width: 760px (fixed)
- Max height: 900px
- Usable area: 30px margins on left/right → 700px usable width
- Top margin: 30px
- Grid snap: 5px (round all positions to nearest 5)

### Left-to-Right Layout
1. Sort elements by connection order: start with elements that have no incoming connections, then their targets, etc. Unconnected elements go last.
2. Place elements in rows. Start at x=30, y=30.
3. For each element, place at current x,y. Advance x by element.width + 20.
4. If x + next element width > 730, start a new row: x=30, y += tallest element in current row + 40.
5. Round all positions to nearest 5px.

### Top-to-Bottom Layout
1. Sort elements by connection order (same as LTR).
2. Place elements in columns. Start at x=30, y=30.
3. For each element, place at current x,y. Advance y by element.height + 40.
4. If y + next element height > 870, start a new column: y=30, x += widest element in current column + 20.
5. Round all positions to nearest 5px.

### Nesting
1. Identify nested groups (elements inside a box).
2. For each group, lay out the children inside the box using LTR rules starting at box.x + 15, box.y + 35 (extra 20px at top for the box label).
3. Resize the box: width = children bounding box width + 30, height = children bounding box height + 50.
4. The box then participates in the outer layout as a single element with its expanded size.

### Connector Anchor Sides
Determine anchor sides based on relative position of connected elements:
- If source is LEFT of target: fromSide = "right", toSide = "left"
- If source is RIGHT of target: fromSide = "left", toSide = "right"
- If source is ABOVE target: fromSide = "bottom", toSide = "top"
- If source is BELOW target: fromSide = "top", toSide = "bottom"
- "Left of" means source.x + source.width < target.x (with 10px tolerance)
- If ambiguous (diagonal), prefer horizontal anchors for LTR layout, vertical for TTB layout.

### Callout Placement
- Place callout circle at (target.x - 5, target.y - 5).
- Round to nearest 5px grid.

### Canvas Height Calculation
- Find the bottommost point: max(element.y + element.height) for all elements.
- Add 30px margin.
- Clamp between 300 and 900.
- Round up to nearest 10px.

## Delivery

After generating the JSON:

1. Write the JSON to `./diagram.json` in the current working directory.
2. Base64-encode the JSON (no line wrapping).
3. Open the diagram in the browser:

```bash
xdg-open "https://aireilly.github.io/rh-diagrams-designer/#data=$(base64 -w0 ./diagram.json)"
```

On macOS, use `open` instead of `xdg-open`. Detect the platform from the environment.

4. Tell the user: "Diagram saved to `./diagram.json` and opened in your browser. You can refine it in the visual editor."
```

- [ ] **Step 2: Verify the skill file is valid markdown**

Run: `cat .claude/skills/diagram-builder.md | head -5`
Expected: Shows the frontmatter starting with `---`

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/diagram-builder.md
git commit -m "feat: add diagram-builder Claude Code skill"
```

---

### Task 7: Manual End-to-End Verification

**Files:**
- No file changes — manual testing only

- [ ] **Step 1: Start the dev server**

Run: `npm run dev`

- [ ] **Step 2: Test the Paste button**

1. Open `http://localhost:5173` in a browser.
2. Click the "Paste" button in the toolbar.
3. Verify the modal opens with a textarea, Load, and Cancel buttons.
4. Paste invalid text → click Load → verify error message appears.
5. Paste valid JSON → click Load → verify diagram loads and modal closes.

Valid test JSON:

```json
{
  "version": 1,
  "elements": [
    {
      "id": "rect-1",
      "type": "rect",
      "x": 30,
      "y": 30,
      "width": 180,
      "height": 120,
      "rotation": 0,
      "fill": "#0066cc",
      "stroke": "",
      "strokeWidth": 0,
      "text": "Test Box",
      "fontSize": 16,
      "fontWeight": "bold",
      "textColor": "#ffffff",
      "variant": "filled",
      "groupId": null
    }
  ],
  "connectors": [],
  "canvasHeight": 600
}
```

- [ ] **Step 3: Test URL hash import**

Open in browser:
```
http://localhost:5173/#data=eyJ2ZXJzaW9uIjoxLCJlbGVtZW50cyI6W3siaWQiOiJyZWN0LTEiLCJ0eXBlIjoicmVjdCIsIngiOjMwLCJ5IjozMCwid2lkdGgiOjE4MCwiaGVpZ2h0IjoxMjAsInJvdGF0aW9uIjowLCJmaWxsIjoiIzAwNjZjYyIsInN0cm9rZSI6IiIsInN0cm9rZVdpZHRoIjowLCJ0ZXh0IjoiSGFzaCBJbXBvcnQiLCJmb250U2l6ZSI6MTYsImZvbnRXZWlnaHQiOiJib2xkIiwidGV4dENvbG9yIjoiI2ZmZmZmZiIsInZhcmlhbnQiOiJmaWxsZWQiLCJncm91cElkIjpudWxsfV0sImNvbm5lY3RvcnMiOltdLCJjYW52YXNIZWlnaHQiOjYwMH0=
```

Verify: diagram loads with a blue "Hash Import" box, and the URL hash is cleared.

- [ ] **Step 4: Test ComponentPanel info box**

Scroll to the bottom of the Components panel. Verify the Claude Code skill info box is visible with a "Download skill file" link.

- [ ] **Step 5: Verify Select tool still works via keyboard**

Press `V` on the keyboard. Verify the tool switches back to select mode (check status bar or try clicking elements).
