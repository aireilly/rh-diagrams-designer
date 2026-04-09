import { useState } from 'react';
import { useDiagram } from '../state/DiagramContext';
import { COLORS, BOX_VARIANTS, CALLOUT_CIRCLE } from '../constants';
import { DiagramElement } from '../types';
import { ICONS } from '../shapes/iconPaths';
import './ComponentPanel.css';

const ICON_CATEGORIES: { label: string; prefix: string }[] = [
  { label: 'Hardware', prefix: 'hardware-' },
  { label: 'Software', prefix: 'software-' },
  { label: 'People', prefix: 'people-' },
  { label: 'Objects', prefix: 'object-' },
  { label: 'Diagrams', prefix: 'diagram-' },
  { label: 'Cloud', prefix: 'cloud-' },
  { label: 'Documents', prefix: 'document-' },
  { label: 'Arrows', prefix: 'arrows-' },
  { label: 'Misc', prefix: '' },
];

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
  return {
    id: generateId('icon'),
    type: 'icon',
    x: 50,
    y: 50,
    width: Math.max((icon?.width ?? 24) * 2, (icon?.name ?? 'Icon').length * 7 + 10, 80),
    height: (icon?.height ?? 24) * 2 + 24,
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

function createNicComponents(startX: number, startY: number): DiagramElement[] {
  const rowH = 30;
  const gap = 5;
  const bridgeW = 120;
  const nicW = 80;
  const bondW = 30;
  const containerPad = 10;
  const innerW = bridgeW + nicW + gap + bondW;
  const totalRows = 3;
  const innerH = totalRows * rowH + (totalRows - 1) * gap;
  const standaloneNicW = nicW + gap + bondW;

  const elements: DiagramElement[] = [];

  // Outer container
  elements.push({
    id: generateId('nic-container'),
    type: 'rect',
    x: startX,
    y: startY,
    width: innerW + containerPad * 2,
    height: innerH + rowH + gap + containerPad * 2,
    rotation: 0,
    fill: COLORS.GRAY_20,
    stroke: COLORS.GRAY_50,
    strokeWidth: 1,
    text: 'NIC',
    fontSize: 14,
    fontWeight: 'bold',
    textColor: COLORS.DARK_GRAY,
    groupId: null,
  });

  const innerX = startX + containerPad;
  const innerY = startY + containerPad;

  // 3 rows of Bridge + NIC
  for (let i = 0; i < totalRows; i++) {
    const rowY = innerY + i * (rowH + gap);

    // Bridge
    elements.push({
      id: generateId('nic-bridge'),
      type: 'rect',
      x: innerX,
      y: rowY,
      width: bridgeW,
      height: rowH,
      rotation: 0,
      fill: COLORS.BLUE_50,
      stroke: '',
      strokeWidth: 0,
      text: 'Bridge',
      fontSize: 12,
      fontWeight: 'bold',
      textColor: COLORS.WHITE,
      textPosition: 'center',
      groupId: null,
    });

    // NIC (purple)
    elements.push({
      id: generateId('nic-nic'),
      type: 'rect',
      x: innerX + bridgeW + gap,
      y: rowY,
      width: nicW,
      height: rowH,
      rotation: 0,
      fill: COLORS.PURPLE_50,
      stroke: '',
      strokeWidth: 0,
      text: 'NIC',
      fontSize: 12,
      fontWeight: 'bold',
      textColor: COLORS.WHITE,
      textPosition: 'center',
      groupId: null,
    });
  }

  // Bond vertical bar
  elements.push({
    id: generateId('nic-bond'),
    type: 'rect',
    x: innerX + bridgeW + nicW + gap * 2,
    y: innerY,
    width: bondW,
    height: innerH,
    rotation: 0,
    fill: COLORS.GRAY_50,
    stroke: '',
    strokeWidth: 0,
    text: 'Bond',
    fontSize: 11,
    fontWeight: 'bold',
    textColor: COLORS.WHITE,
    textPosition: 'center',
    groupId: null,
  });

  // Standalone NIC at bottom
  elements.push({
    id: generateId('nic-standalone'),
    type: 'rect',
    x: innerX + bridgeW + gap,
    y: innerY + innerH + gap,
    width: standaloneNicW,
    height: rowH,
    rotation: 0,
    fill: COLORS.GRAY_50,
    stroke: '',
    strokeWidth: 0,
    text: 'NIC',
    fontSize: 12,
    fontWeight: 'bold',
    textColor: COLORS.WHITE,
    textPosition: 'center',
    groupId: null,
  });

  return elements;
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

    // If a shape is selected, position so the callout center sits on the shape's top-left corner
    const selectedEl = state.elements.find((el) => el.id === state.selectedIds[0]);
    const x = selectedEl ? selectedEl.x : 50;
    const y = selectedEl ? selectedEl.y : 50;

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

  const handleAddNic = () => {
    const elements = createNicComponents(50, 50);
    for (const el of elements) {
      addElement(el);
    }
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

      <IconCategorySections onAddIcon={handleAddIcon} />

      <section className="panel-section">
        <h4 className="section-title">Text</h4>
        <button className="component-btn" onClick={handleAddText}>
          <span>Text Label</span>
        </button>
      </section>

      <section className="panel-section">
        <h4 className="section-title">Network</h4>
        <button className="component-btn" onClick={handleAddNic}>
          <span>NIC / Bridge / Bond</span>
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
