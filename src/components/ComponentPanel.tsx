import { useDiagram } from '../state/DiagramContext';
import { COLORS, BOX_VARIANTS, CALLOUT_CIRCLE } from '../constants';
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
  const { addElement, state, dispatch } = useDiagram();

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
