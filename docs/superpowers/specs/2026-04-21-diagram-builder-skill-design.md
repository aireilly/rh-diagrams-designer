# Diagram Builder Skill — Design Spec

## Overview

A Claude Code skill that builds Red Hat Diagrams Designer JSON project files through interactive multiple-choice prompts. The skill guides users through element selection, labeling, nesting, connections, and callouts, then auto-layouts the diagram and delivers it to the browser app.

Two deliverables: (1) app changes to support JSON paste and URL hash import, (2) a self-contained skill file.

## Skill Interaction Flow

Three-phase questionnaire using `AskUserQuestion` with multiple-choice options.

### Phase 1 — Structure

- **Q1: Element types** — Multi-select from all available types: Filled Box, Outlined Box, Gray Box, White Box, Server, Storage, Router, Document, User, Cloud, Server Stack, Storage Stack, Gateway, Documents Stack, Users Group, Client, Virtual Server, Virtual Storage, Virtual Router, Virtual Server Stack, Virtual Storage Stack, Hypervisor, Health Monitor, VPN.
- **Q2: Quantity** — For each chosen type, ask how many (1-5).
- **Q3: Labels** — For each element instance, ask for a label (open-ended, one per element).

### Phase 2 — Relationships

- **Q4: Nesting** — Only asked if boxes were chosen. Multi-select of auto-generated pairs like `Server 1 → inside Outlined Box "Cluster"`. Option to skip.
- **Q5: Connections** — Multi-select of element pairs. If ≤6 elements, offer all pairwise permutations. If >6 elements, ask per-element: "What does [Element X] connect to?" with the remaining elements as choices. Always include a "no connections" / "done" option.
- **Q6: Connector style** — Per connection (if ≤3) or for all at once: Solid + forward arrow, Solid + bidirectional, Solid + no arrow, Dashed + forward arrow, Dashed + bidirectional, Dashed + no arrow.

### Phase 3 — Annotation

- **Q7: Callouts** — "Add numbered callouts?" If yes, multi-select which elements. Numbers assigned in selection order.
- **Q8: Layout direction** — Left to right or Top to bottom. Auto-suggested based on element count (>4 suggests TTB).

## Auto-Layout Algorithm

Positions elements on the 760x900px canvas automatically.

### Left-to-right layout

- Elements arranged in rows, each row up to ~700px wide (30px margins).
- 20px horizontal gaps between elements.
- 40px vertical gaps between rows.
- Connected elements placed adjacent when possible.

### Top-to-bottom layout

- Primary flow is vertical. Connected elements stacked with 40px gaps.
- Parallel/unconnected elements placed side by side with 20px gaps.

### Nesting

- Nested elements arranged inside the container box using horizontal layout.
- Container auto-sizes to fit children with 15px padding on all sides.
- The container participates in the outer layout as a single unit.

### Connector routing

- Anchor sides auto-determined from relative positions: element A left of B uses right/left anchors; A above B uses bottom/top anchors.
- Points array left empty — the app's ConnectorLine component calculates the path.

### Callout placement

- Positioned 5px above and 5px left of the target element's top-left corner (one grid unit offset).

### Canvas height

- Auto-calculated from bottommost element + 30px margin, clamped 300-900px.

## App Changes

### Toolbar: Paste from JSON button

- Remove the Select tool button from Toolbar.tsx (the V keyboard shortcut still works).
- Replace with a "Paste" button that opens a paste modal.

### PasteModal component

- New component: `src/components/PasteModal.tsx` with matching CSS.
- Contains a `<textarea>` for pasting JSON.
- "Load" button parses via `deserializeProject()` and dispatches `LOAD_STATE`.
- "Cancel" button closes the modal.
- Invalid JSON displays an inline error message.

### URL hash import

- On app mount, a `useEffect` in App.tsx checks `window.location.hash` for `#data=<base64>`.
- If present: base64-decode, parse JSON, dispatch `LOAD_STATE`, clear hash.
- Enables CLI delivery: `xdg-open "https://aireilly.github.io/rh-diagrams-designer/#data=$(base64 -w0 diagram.json)"`

### ComponentPanel info box

- Small styled box at the bottom of ComponentPanel.tsx.
- Text explaining the Claude Code skill with a link to the raw skill file in the repo.
- Instructs users to copy to their `.claude/skills/` folder.

## Skill File

Located at `.claude/skills/diagram-builder.md` in the repo.

### Contents

1. **Frontmatter** — name, description.
2. **Instructions** — Phased questionnaire flow.
3. **Element reference** — All element types with IDs, default dimensions, icon mappings.
4. **JSON schema reference** — ProjectFile format, DiagramElement and Connector interfaces, valid property values.
5. **Layout algorithm** — LTR/TTB positioning, spacing, nesting, connector anchoring, callout placement.
6. **Delivery** — Save to `./diagram.json`, base64-encode, construct URL, open browser via `xdg-open` with `#data=` hash.
7. **Color/constant reference** — All brand colors (name + hex), font sizes, canvas dimensions.

The skill is self-contained — embeds everything needed to generate valid JSON without reading the codebase. Works from any project directory.

## Out of Scope

- Network lines (manual only in the visual editor)
- Free-floating text labels (element labels are sufficient)
- REST API or backend
- Drag-and-drop reordering in the skill
- Multi-page diagrams

## Testing

- Existing Vitest tests must still pass.
- Manual verification: Paste button opens modal, valid JSON loads, invalid JSON shows error, URL hash import works, ComponentPanel info box renders with correct link.
- Generate a sample diagram with the skill and load it in the app end-to-end.
