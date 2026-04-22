# Red Hat Technical Diagram Guidelines

CCS guidelines for creating on-brand technical diagrams.

Last updated: 09/15/25

## When to use diagrams

Use a technical diagram when:

- Information is difficult to explain using words alone (e.g. network topology diagrams).
- The user needs to hold or understand 3 or more concepts to understand how something works (e.g. deployment configurations, workflows, high-level architecture overviews).

## Why we use diagrams

- Demonstrate an overall process or flow.
- Depict abstract concepts.
- Show how components connect and relate to other components.
- Show visual hierarchy, helping the viewer focus on what's critical.
- Allow complicated information to be understood at a glance.
- Provide visual confirmation that the user configured something correctly.
- Help the reader gain a better understanding of a topic.

We process visual content much faster and retain it longer. Easy-to-comprehend visual content also aids the user's cognitive ease, which leads to more informed decision-making.

## Do's and don'ts

| Do | Don't |
|---|---|
| Take a systemic view when creating two or more diagrams | Publish off-brand diagrams |
| Use visual hierarchy to highlight important components | Overuse icons — only use the provided icons |
| Use concise labels | Use icons that aren't in the template — use a labeled box instead |

## Building blocks

### Colors

Use only the approved Red Hat brand palette. See the `COLORS` constant in `src/constants.ts` for the full set of permitted hex values.

### Typography

Use Red Hat Text for all diagram labels. Font sizes should range from 10px to 16px, with bold or medium weight.

### Lines and arrows

- Solid lines for direct connections.
- Dashed lines for indirect, optional, or logical connections.
- Arrow directions: forward, backward, bidirectional, or none.

### Icons

Use only the icons provided in the template set. If the icon you need is not available, use a labeled box instead. Available icons are defined in `src/shapes/iconPaths.ts`.

### Padding and spacing

- Maintain consistent padding inside containers (15px sides, 35px top for labels).
- Use the 5px minor / 10px major snap grid for alignment.
- Keep 25-30px margins from canvas edges.

### Groupings and special components

- **Container boxes** — use outlined or gray boxes to group related elements.
- **Callout circles** — numbered annotations that reference a legend. Keep callout text outside the diagram to reduce clutter.
- **Stacked elements** — indicate multiple instances (e.g. replicas, pods).

## Diagram types

### Data flow

Subtypes: architecture, general, sequence, and workflow diagrams. Show how information moves through systems.

- **Architecture** — high-level component relationships and dependencies.
- **General** — generic data flow between components.
- **Sequence** — ordered steps in a process.
- **Workflow** — decision paths and branching processes.

### Network topology

Infrastructure diagrams showing connections between servers, networks, and services. Use network line elements for physical/logical network segments.

### Swimlane

Process diagrams showing parallel activities across different actors or roles. Use horizontal or vertical lanes with container boxes.

### Layout guidance

- Horizontal (left-to-right) layouts work well for 4 or fewer elements.
- Vertical (top-to-bottom) layouts work well for more than 4 elements.
- Choose the axis that matches the dominant flow direction.

## Resources

- **Technical diagram resources:** https://source.redhat.com/groups/public/diagrams
- **Diagram request form:** https://docs.google.com/forms/d/e/1FAIpQLSdF8V0n3E-aAfRen8vZchXCxwA0iDTd0QYyASnutznfGLATvA/viewform
- **Diagram repository (2022-present):** https://customer-platform.pages.redhat.com/documentation-svg-assets/index.html (VPN required)
- **Diagram archive (2015-2021):** https://drive.google.com/drive/u/0/folders/1BHR-WtQMehTrRA4TFlwQZsfizMXOz-jh
- **On-brand examples:** https://customer-platform.pages.redhat.com/documentation-svg-assets/index.html
