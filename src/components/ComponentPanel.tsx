import { useState } from 'react';
import { useDiagram } from '../state/DiagramContext';
import { COLORS, BOX_VARIANTS, CALLOUT_CIRCLE, GRID, NETWORK_COLORS } from '../constants';
import { DiagramElement } from '../types';
import { ICONS } from '../shapes/iconPaths';
import './ComponentPanel.css';

const ICON_CATEGORIES: { label: string; prefix: string }[] = [
  { label: 'Physical', prefix: 'physical-' },
  { label: 'Virtual', prefix: 'virtual-' },
  { label: 'Other', prefix: 'other-' },
];

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function createBoxElement(variant: keyof typeof BOX_VARIANTS): DiagramElement {
  const v = BOX_VARIANTS[variant];
  return {
    id: generateId('rect'),
    type: 'rect',
    x: 50,
    y: 50,
    width: 180,
    height: 120,
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

function createCircleElement(number: number, x: number, y: number): DiagramElement {
  return {
    id: generateId('circle'),
    type: 'circle',
    x,
    y,
    width: CALLOUT_CIRCLE.RADIUS * 2,
    height: CALLOUT_CIRCLE.RADIUS * 2,
    rotation: 0,
    fill: CALLOUT_CIRCLE.FILL,
    stroke: '',
    strokeWidth: 0,
    text: String(number),
    fontSize: CALLOUT_CIRCLE.FONT_SIZE,
    fontWeight: 'bold',
    textColor: CALLOUT_CIRCLE.TEXT_COLOR,
    groupId: null,
  };
}

function createIconElement(iconId: string): DiagramElement {
  const icon = ICONS.find((i) => i.id === iconId);
  const iconWidth = icon?.width ?? 40;
  const iconHeight = icon?.height ?? 32;
  const label = icon?.name ?? 'Icon';
  const longestWord = label.split(/[\s,]+/).reduce((a, b) => a.length > b.length ? a : b, '');
  const minWordWidth = longestWord.length * 6.5 + 12;
  const totalWidth = Math.max(iconWidth, minWordWidth, 60);
  const labelLines = Math.ceil(label.length * 5.5 / totalWidth) + 1;
  const labelHeight = labelLines * 13 + 4;
  const totalHeight = iconHeight + labelHeight + 4;
  return {
    id: generateId('icon'),
    type: 'icon',
    x: 50,
    y: 50,
    width: totalWidth,
    height: totalHeight,
    rotation: 0,
    fill: COLORS.ICON_GRAY,
    stroke: '',
    strokeWidth: 0,
    text: icon?.name ?? 'Icon',
    fontSize: 11,
    fontWeight: 'medium',
    textColor: COLORS.GRAY_95,
    iconId,
    groupId: null,
  };
}

function createTextElement(x: number, y: number): DiagramElement {
  return {
    id: generateId('text'),
    type: 'text',
    x,
    y,
    width: 160,
    height: 24,
    rotation: 0,
    fill: '',
    stroke: '',
    strokeWidth: 0,
    text: 'Label',
    fontSize: 14,
    fontWeight: 'bold',
    textColor: COLORS.DARK_GRAY,
    groupId: null,
  };
}


function IconCategorySections({ onAddIcon }: { onAddIcon: (id: string) => void }) {
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});

  const toggle = (label: string) => {
    setOpenCats((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const assigned = new Set<string>();

  return (
    <>
      {ICON_CATEGORIES.map((cat) => {
        const icons = cat.prefix
          ? ICONS.filter((i) => i.id.startsWith(cat.prefix))
          : ICONS.filter((i) => !assigned.has(i.id));
        if (cat.prefix) icons.forEach((i) => assigned.add(i.id));
        if (icons.length === 0) return null;
        const isOpen = !!openCats[cat.label];

        return (
          <section key={cat.label} className="panel-section">
            <h4
              className="section-title section-title-toggle"
              onClick={() => toggle(cat.label)}
            >
              {isOpen ? '▾' : '▸'} {cat.label} ({icons.length})
            </h4>
            {isOpen && (
              <div className="component-grid">
                {icons.map((icon) => (
                  <button key={icon.id} className="component-btn" onClick={() => onAddIcon(icon.id)}>
                    <span className="icon-label">{icon.name}</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}

export default function ComponentPanel() {
  const { addElement, state, dispatch } = useDiagram();

  const handleAddBox = (variant: keyof typeof BOX_VARIANTS) => {
    addElement(createBoxElement(variant));
  };

  const handleAddCircle = () => {
    // Next number = highest existing callout number + 1
    const existingNumbers = state.elements
      .filter((el) => el.type === 'circle')
      .map((el) => parseInt(el.text, 10))
      .filter((n) => !isNaN(n));
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

    // If a shape is selected, position callout one grid step above and left of the shape's top-left corner
    const selectedEl = state.elements.find((el) => el.id === state.selectedIds[0]);
    const x = selectedEl ? selectedEl.x - GRID.MINOR : 50;
    const y = selectedEl ? selectedEl.y - GRID.MINOR : 50;

    addElement(createCircleElement(nextNumber, x, y));
  };

  const handleAddIcon = (iconId: string) => {
    addElement(createIconElement(iconId));
  };

  const handleAddText = () => {
    // If a shape is selected, position label at its top-left inside corner
    const selectedEl = state.elements.find((el) => el.id === state.selectedIds[0]);
    const x = selectedEl ? selectedEl.x + 8 : 50;
    const y = selectedEl ? selectedEl.y + 8 : 50;
    addElement(createTextElement(x, y));
  };


  const handleSelectConnectorTool = (tool: string) => {
    dispatch({ type: 'SET_TOOL', tool: tool as 'connector-solid' | 'connector-dashed' });
  };

  const handleSelectNetworkTool = (color: string) => {
    dispatch({ type: 'SET_NETWORK_LINE_COLOR', color });
    dispatch({ type: 'SET_TOOL', tool: 'network-line' });
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

      <IconCategorySections onAddIcon={handleAddIcon} />

      <section className="panel-section">
        <h4 className="section-title">Text</h4>
        <button className="component-btn" onClick={handleAddText}>
          <span>Text Label</span>
        </button>
      </section>


      <section className="panel-section">
        <h4 className="section-title">Network Connections</h4>
        <div className="component-grid">
          {NETWORK_COLORS.map((c) => (
            <button
              key={c.id}
              className={`component-btn ${state.tool === 'network-line' && state.networkLineColor === c.hex ? 'active' : ''}`}
              onClick={() => handleSelectNetworkTool(c.hex)}
            >
              <div className="preview-network-line" style={{ backgroundColor: c.hex }} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
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
    </aside>
  );
}
