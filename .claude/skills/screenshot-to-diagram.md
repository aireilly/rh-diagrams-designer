---
name: screenshot-to-diagram
description: Analyze a screenshot or image of a diagram and convert it into a Red Hat Diagrams Designer JSON file. Classifies visual elements into RH brand types, maps layout to the 760x600 canvas, converts non-name text to numbered callouts, and opens the result in the browser.
---

# Screenshot to Diagram

Convert a screenshot or image of a diagram into a Red Hat Diagrams Designer project file using a structured 6-phase pipeline.

## Style Guidance

When converting existing diagrams to Red Hat brand style, apply these principles:

- **Visual hierarchy** — ensure critical components and flows are visually prominent (use filled/darker boxes for emphasis, outlined/lighter for secondary elements)
- **Concise labels** — simplify verbose source labels into brief, clear names; move long descriptions into numbered callout circles instead
- **Icons over custom graphics** — replace non-standard icons or graphics with Red Hat icons where possible. If no matching icon exists, use a labeled box
- **Consistent styling** — all boxes, lines, colors, and spacing must follow Red Hat brand standards (the editor enforces this automatically)
- **Remove clutter** — filter out unnecessary decorative elements from the source; keep only information essential to understanding the diagram
- **Systemic view** — if converting multiple related diagrams, ensure they use the same visual language and layout patterns for coherence

Target diagram types:
- **Data flow** — architecture, general, sequence, or workflow diagrams showing how information moves through systems
- **Network topology** — infrastructure diagrams showing connections between servers, networks, or services
- **Swimlane** — process diagrams showing parallel activities across different actors or roles

## Pipeline

Run these phases in order. Do not skip phases.

### Phase 1 — Inventory

Scan the image and list every visual element:

- **Boxes/regions:** rectangles, bordered areas, background regions, containers
- **Icons/symbols:** people, servers, databases, clouds, devices, logos
- **Text:** element names, flow labels, descriptions, annotations
- **Connections:** lines, arrows (solid, dashed), their direction and endpoints
- **Nesting:** which elements are visually inside other elements

Categorize each text item as:
- **Name** — identifies what an element IS (e.g., "Inference Gateway", "Client", "Kubernetes"). These become element `text` labels.
- **Non-name** — describes a flow, action, relationship, or provides context (e.g., "GET /completions", "Route to selected pods", "Extensible library of scrapers..."). These become numbered callout circles.

### Phase 2 — Classify

Map each structural element to the closest Red Hat element type:

| Visual appearance in source image | RH element type |
|---|---|
| Dark/colored filled box | `rect` variant `filled` (blue bg, white text) |
| Box with visible border, no fill | `rect` variant `outlined` (blue border, dark text) |
| Light/gray background region | `rect` variant `gray` (gray bg, dark text) |
| White or very light box | `rect` variant `white` (white bg, dark text) |
| Large boundary/container | `rect` variant `outlined` (for primary) or `gray` (for secondary) |
| Person/user figure | `icon` with `physical-user` or `physical-users` |
| Computer/client device | `icon` with `physical-client` |
| Server/machine | `icon` with `physical-server` or `physical-server-stack` |
| Database/storage | `icon` with `physical-storage` or `physical-storage-stack` |
| Router/switch/load balancer | `icon` with `physical-router` |
| Document/file | `icon` with `physical-document` or `physical-documents-stack` |
| Cloud shape | `icon` with `physical-cloud` |
| Gateway symbol | `icon` with `physical-gateway` |
| Small internal boxes (replicas, pods) | Small `rect` with `fill: "#d9e8f7"` (Blue Tint Lighter) |
| Vendor logos, badges | `text` element with bold label |

### Phase 3 — Layout

Position elements on the 760×600 canvas:

1. **Outer boundaries first.** Place the largest container boxes. Leave 25–30px margin from canvas edges.
2. **Key structural elements.** Place main boxes and icons within or outside boundaries as they appear in the source.
3. **Nested elements.** Place children inside parent boxes with 15px side margins and 35px top offset (for the parent's label).
4. **Small detail elements.** Place replica boxes, small internal components.
5. **Round all positions to the nearest 5px.**

Sizing guidelines:
- Large containers: width up to 710px, height as needed
- Standard boxes: 170–200px wide, 45–55px tall
- Small replica/pod boxes: 50–60px wide, 25px tall
- Icons: use the widths/heights from the Icon ID Reference table

If the source diagram is wider than it is tall, favor a left-to-right flow. If taller, favor top-to-bottom.

### Phase 4 — Annotate

Convert all non-name text to numbered callout circles:

1. Number callouts sequentially (1, 2, 3...) in a logical reading order — typically top-to-bottom, left-to-right, following the data flow.
2. Place each callout circle near where the text appeared in the source image, offset slightly so it doesn't overlap elements.
3. Build a legend mapping each number to the original text.

Callout circle defaults:
```
{ type: "circle", width: 30, height: 30, fill: "#3c3c3c", stroke: "", strokeWidth: 0, fontSize: 16, fontWeight: "bold", textColor: "#ffffff" }
```

Callout placement: `(nearestElement.x - 5, nearestElement.y - 5)`, rounded to 5px grid. Adjust to avoid overlapping other elements.

### Phase 5 — Confirm

Present a summary to the user and wait for approval before generating:

```
## Diagram Summary

**Elements:** (list each element with its RH type and label)
**Callout Legend:**
1. [text]
2. [text]
...
**Connections:** (list each connection: from → to, style)

Does this look right? I'll generate the diagram and open it in your browser.
```

If the user requests changes, revise and re-confirm. Proceed to Phase 6 only after approval.

### Phase 6 — Generate & Deliver

1. Build the project JSON following the schemas below.
2. Write to `./diagram.json`.
3. Base64-encode and open in browser:

```bash
xdg-open "https://aireilly.github.io/rh-diagrams-designer/#data=$(base64 -w0 ./diagram.json)"
```

On macOS, use `open` instead of `xdg-open`.

4. Output the callout legend in your response:

```
Diagram saved to `./diagram.json` and opened in your browser.

**Callout Legend:**
1. [text]
2. [text]
...

You can refine the layout in the visual editor.
```

## Schemas

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
  textPosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center",
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
`{ type: "rect", width: 180, height: 55, fill: "#0066cc", stroke: "", strokeWidth: 0, fontSize: 12, fontWeight: "bold", textColor: "#ffffff", variant: "filled" }`

**Outlined Box:**
`{ type: "rect", width: 180, height: 120, fill: "", stroke: "#0066cc", strokeWidth: 2, fontSize: 14, fontWeight: "bold", textColor: "#3c3c3c", variant: "outlined" }`

**Gray Box:**
`{ type: "rect", width: 180, height: 120, fill: "#e5e5e5", stroke: "", strokeWidth: 0, fontSize: 14, fontWeight: "bold", textColor: "#3c3c3c", variant: "gray" }`

**White Box:**
`{ type: "rect", width: 180, height: 120, fill: "#ffffff", stroke: "", strokeWidth: 0, fontSize: 16, fontWeight: "bold", textColor: "#3c3c3c", variant: "white" }`

**Small Replica/Pod Box:**
`{ type: "rect", width: 55, height: 25, fill: "#d9e8f7", stroke: "", strokeWidth: 0, fontSize: 10, fontWeight: "medium", textColor: "#3c3c3c" }`

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
| Blue Tint Light | #99c2eb |
| Blue Tint Lighter | #d9e8f7 |
| Green 50 | #63993d |
| Green 20 | #d1f1bb |
| Green 10 | #e9f7df |
| Purple 50 | #5e40be |
| Red Orange 50 | #f0561d |
| Yellow 40 | #b98412 |

### Connector Anchor Sides

Determine anchor sides based on relative position of connected elements:
- If source is LEFT of target: fromSide = "right", toSide = "left"
- If source is RIGHT of target: fromSide = "left", toSide = "right"
- If source is ABOVE target: fromSide = "bottom", toSide = "top"
- If source is BELOW target: fromSide = "top", toSide = "bottom"
- If ambiguous (diagonal), prefer the axis that matches the dominant flow direction.

### Canvas Height

Always use 600 (the default). Never change the canvas height.
