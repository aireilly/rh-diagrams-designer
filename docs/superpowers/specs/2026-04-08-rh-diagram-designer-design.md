# Red Hat Diagram Designer — Design Spec

## Overview

A browser-based WYSIWYG block chart diagram creator for Red Hat technical documentation. Users create diagrams from scratch using a library of predefined Red Hat shapes, constrained colors, and fonts, then export production-ready SVG and PNG files.

**Target users:** Non-designers (CCS writers, engineers, product managers) who need on-brand technical diagrams without design expertise.

**Key constraint:** The tool enforces Red Hat brand standards automatically — users cannot deviate from the approved design system.

## Tech Stack

- **React 18** with TypeScript
- **Konva.js** + **react-konva** for the interactive canvas
- **Vite** for build tooling
- **No backend** — entirely client-side

## Application Layout

```
┌─────────────────────────────────────────────────────────┐
│ Toolbar                                                 │
│ [File ops] [Undo/Redo] [Zoom] [Align/Distribute] [Export]│
├────────────┬──────────────────────────┬─────────────────┤
│ Component  │                          │  Properties     │
│ Panel      │       Canvas             │  Panel          │
│            │    (760px wide,          │                 │
│ - Boxes    │     5px grid,            │  - Fill color   │
│ - Circles  │     snap-to-grid)        │  - Stroke color │
│ - Icons    │                          │  - Text props   │
│ - Lines    │                          │  - Size         │
│ - Text     │                          │  - Line style   │
│            │                          │                 │
├────────────┴──────────────────────────┴─────────────────┤
│ StatusBar — dimensions, zoom %, snap toggle             │
└─────────────────────────────────────────────────────────┘
```

## Canvas

- Fixed width: **760px** (output dimension; zoom only affects editing view)
- Max height: **900px** (adjustable)
- Grid: **5px minor**, **10px major** lines
- Snap-to-grid on by default (toggleable via StatusBar)
- Smart alignment guides when dragging objects
- White background (#ffffff)

## Shape Library

### 1. Rectangles/Boxes

The primary building block. Four pre-styled variants:

| Variant | Fill | Stroke | Text Color |
|---------|------|--------|------------|
| Filled (primary) | #0066cc | none | #ffffff |
| Outlined | none | #0066cc, 2px | #262626 |
| Gray | #e5e5e5 | none | #262626 |
| White | #ffffff | none | #262626 |

- Resizable in **10px increments** (5px when Shift held)
- Width increment: 10px; use 5px only when needed
- Text auto-centered horizontally and vertically

### 2. Grouped/Nested Boxes

Container boxes that hold child elements. Used for clusters, nodes, environments. Implemented via Konva groups.

### 3. Circles (Numbered Callouts)

- Fill: #262626
- Diameter: 30px (fixed)
- White bold 16px number text, centered
- Not resizable

### 4. Icons with Labels

Pre-built from the Red Hat SVG template. Each icon is a fixed-size symbol with a 12px medium-weight label below.

**Initial icon set:**

| Icon | Symbol ID |
|------|-----------|
| Server | Icon_RH_Hardware_Server-A-Single_RGB_Flat |
| Person/User | Icon_RH_People_Adult-Plain_RGB_Flat |
| Software/Provisioning | Icon_RH_Software_Provisioning_RGB_Flat |
| Command/Terminal | Icon_RH_software_command_RGB_Flat |
| Scale/Growing | Icon_RH_Diagram_Scale-Growing_RGB_Flat |
| Cost/Arrow | Icon_RH_Arrows_LowerCost-$_RGB_Flat |

- Icons render at their native size — **not resizable**
- Icon fill: #7f7f7f
- Label: Red Hat Text, Medium, 12px, #262626, centered below icon

### 5. Connectors/Lines

| Type | Style | Weight |
|------|-------|--------|
| Solid, one-directional | Solid stroke, triangle arrowhead at end | 1px |
| Solid, bidirectional | Solid stroke, arrowheads both ends | 1px |
| Dashed, one-directional | 2px dash, 2px gap, arrowhead at end | 1px |
| Dashed, bidirectional | 2px dash, 2px gap, arrowheads both ends | 1px |
| Network solid | Solid stroke, arrowhead | 2px |
| Network dashed | Dashed stroke, arrowhead | 2px |
| Right-angle (elbow) | Auto-routed, same arrow/dash options | 1px or 2px |

**Arrowhead spec:**
- Triangle shape, size 1.6 x 1.6
- Fill and stroke match connector color
- 2.5px padding between arrowhead tip and target component edge
- Start of line touches source component edge

**Connector behavior:**
- Click connector tool, click source shape, click target shape
- Connectors attach to shape edges
- Connectors re-route when shapes are moved
- Right-angle connectors auto-path

### 6. Text Labels

Standalone text blocks (not attached to a shape).

- Font: **Red Hat Text** only
- Weights: Bold, Medium
- Sizes: 16px, 14px, 12px, 11px, 10px (discrete steps, not arbitrary)
- Colors: #262626 (default) or #ffffff
- Multi-line alignment: left-aligned when snapped left, centered when placed center

## Color System

Users select from a constrained palette of swatches — no arbitrary color picker.

| Color | Hex | Primary Usage |
|-------|-----|---------------|
| Red Hat Blue | #0066cc | Primary component fill, outlined strokes |
| Blue tint light | #99c2eb | Secondary/accent fill |
| Blue tint lighter | #d9e8f7 | Tertiary/background fill |
| Dark gray | #262626 | Text, lines, arrows, callout circles |
| Medium gray | #595959 | Secondary text, connector lines |
| Light gray | #e5e5e5 | Background/container fills |
| Icon gray | #7f7f7f | Icon fills |
| White | #ffffff | Text on dark fills, box fills |
| Watermark gray | #ececec | ID tag/watermark text |

**UI behavior:**
- Properties Panel shows a row of color swatches for Fill and Stroke
- Text color auto-switches: #ffffff on dark fills, #262626 on light/no fills
- No color wheel or hex input

## Interactions

### Selection & Manipulation

- Click to select, Shift+click for multi-select
- Drag to move (snaps to 5px grid)
- Resize via corner/edge handles (10px increments; Shift for 5px)
- Double-click text to edit inline
- Delete/Backspace to remove selected objects

### Alignment & Layout

- Snap-to-grid (5px) on by default, togglable
- Smart alignment guides (edge-to-edge, center-to-center)
- Toolbar buttons: align left, center, right, top, middle, bottom
- Distribute horizontally, distribute vertically

### Undo/Redo

- Full undo/redo stack via Ctrl+Z / Ctrl+Shift+Z
- Tracks: move, resize, add, delete, property changes

### Zoom & Pan

- Mouse wheel zoom: 25%–400%
- Canvas always represents 760px actual width
- Middle-click drag or Space+drag to pan
- Zoom-to-fit button in toolbar

### Grouping

- Ctrl+G to group selected objects
- Groups can be nested (container pattern)
- Double-click group to enter and edit children
- Click outside group to exit

## Export

### SVG Export

- Clean, standards-compliant SVG output
- Canvas width: exactly 760px
- Embeds Red Hat Text font references
- Preserves all shapes, colors, text, connectors as native SVG elements
- Includes ID tag/watermark if user has set one

### PNG Export

- Resolution: **2x (1520px wide)** per Red Hat spec
- DPI: 192 (print quality)
- pHYs DPI: 96
- Background: opaque white (RGBA: ffffffff)
- Bit depth: RGBA 8
- Antialiasing: level 3
- No interlacing

### Export Workflow

1. Click "Export" in toolbar — opens modal
2. User enters: issue number, product family, description
3. Date auto-filled to current month/year
4. Filename auto-generated: `<issue>_<product-family>_<description>_<mmyy>`
5. Toggle between SVG/PNG or export both
6. Downloads to user's machine

### Project Save/Load

- Save canvas state as JSON file (shapes, positions, properties, connectors)
- Load previously saved JSON to resume editing
- This is the working file — distinct from final SVG/PNG export

## Font Hierarchy Rules

These are enforced as presets in the Properties Panel:

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Outer/Primary | 16px | Bold | Top-level labels (e.g., "Cluster") |
| Secondary | 14px | Bold | Node-level labels |
| Tertiary | 12px | Medium | Resource/component labels |
| Icon label | 11px | Medium | Labels below icons |
| Minimum | 10px | Medium | Fine detail, watermark |

## Non-Goals (v1)

- Cloud storage or collaboration
- Custom icon uploads
- Animation or interactive diagrams
- Full Red Hat icon library (starting with 6 essential icons)
- Undo history persistence across sessions
- Mobile/tablet support
