---
name: diagram-builder
description: Build Red Hat Diagrams Designer JSON files through interactive multiple-choice prompts. Guides users through element selection, labeling, nesting, connections, callouts, and auto-layout, then opens the result in the browser.
---

# Diagram Builder

Build a Red Hat Diagrams Designer project file by asking the user structured questions, then generate the JSON and open it in the browser.

## Style Guidance

Follow Red Hat's technical diagram guidelines:

- **Use visual hierarchy** — emphasize critical components and flows so viewers can quickly understand priorities
- **Concise labels** — keep text brief and descriptive; avoid redundant or overly long labels
- **Icons judiciously** — only use the provided Red Hat icons. If a needed icon isn't available, use a labeled box instead of custom icons
- **On-brand always** — all diagrams must comply with Red Hat's color, typography, and spacing standards (enforced by the editor)
- **Systemic thinking** — if you're creating multiple diagrams for the same topic, ensure they follow a consistent visual language and complement each other

Common diagram types the editor supports:
- **Data flow** — architecture, general, sequence, workflow diagrams
- **Network topology** — illustrating connections between infrastructure components
- **Swimlane** — showing parallel processes or responsibilities across actors

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
- Left to right (recommended for 4 or fewer elements)
- Top to bottom (recommended for more than 4 elements)
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
  variant?: "filled" | "outlined" | "gray" | "white",  // for type "rect"
  strokeDashEnabled?: boolean,  // dashed stroke border (only when stroke is set)
  fontFamily?: string           // "Red Hat Text" (default) or "Red Hat Mono" for code
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
  toSide: "auto" | "top" | "bottom" | "left" | "right",
  fromOffset?: number,    // px shift along element edge to avoid overlap (default 0)
  toOffset?: number       // px shift along element edge to avoid overlap (default 0)
}
```

When multiple connectors share the same anchor point on an element, use `fromOffset` / `toOffset` to spread them apart (e.g., -15, 0, 15 for three connectors). This prevents arrowheads from overlapping. For top/bottom sides the offset shifts horizontally; for left/right sides it shifts vertically.

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
- Usable area: 30px margins on left/right giving 700px usable width
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

### Canvas Height
- Always use 600 (the default). Never change the canvas height.

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
