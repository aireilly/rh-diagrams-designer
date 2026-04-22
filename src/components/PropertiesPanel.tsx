import { useDiagram } from '../state/DiagramContext';
import { COLOR_SWATCHES, COLORS, FONT_SIZES, FONT_WEIGHTS, FONT_FAMILY, FONT_FAMILY_MONO, NETWORK_COLORS } from '../constants';
import { AnchorSide, ArrowDirection, Connector, ConnectorType, DiagramElement, FontWeight, TextPosition } from '../types';
import './PropertiesPanel.css';

const OFFSET_SPACING = 15;

function resolveAutoSide(
  fromEl: DiagramElement,
  toEl: DiagramElement,
  side: AnchorSide
): Exclude<AnchorSide, 'auto'> {
  if (side !== 'auto') return side;
  const dx = (toEl.x + toEl.width / 2) - (fromEl.x + fromEl.width / 2);
  const dy = (toEl.y + toEl.height / 2) - (fromEl.y + fromEl.height / 2);
  return Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'bottom' : 'top');
}

const CONNECTOR_COLORS = [
  { name: 'Gray 50', hex: COLORS.GRAY_50 },
  { name: 'Gray 95', hex: COLORS.GRAY_95 },
  { name: 'Purple 50 (Provisioning)', hex: COLORS.PURPLE_50 },
  { name: 'Green 50 (Internal)', hex: COLORS.GREEN_50 },
  { name: 'Red Orange 50 (Storage 1)', hex: COLORS.RED_ORANGE_50 },
  { name: 'Yellow 40 (Storage 2)', hex: COLORS.YELLOW_40 },
  { name: 'Blue 50 (Provider)', hex: COLORS.BLUE_50 },
  { name: 'Blue 40 (External)', hex: COLORS.BLUE_40 },
];

export default function PropertiesPanel() {
  const { state, updateElement, dispatch } = useDiagram();

  const selectedId = state.selectedIds[0];
  const element = state.elements.find((e) => e.id === selectedId);
  const connector = state.connectors.find((c) => c.id === selectedId);
  const selectedConnectors = state.connectors.filter((c) => state.selectedIds.includes(c.id));

  if (!element && !connector) {
    return (
      <aside className="properties-panel">
        <h3 className="panel-title">Properties</h3>
        <p className="empty-message">Select an element to edit its properties.</p>
        <div className="skill-info-box">
          <div className="skill-info-header">
            <svg className="skill-info-icon" width="16" height="16" viewBox="0 0 16 16" fill="#0066cc">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 2.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM6.5 7h2v4.5h1V13h-4v-1.5h1V8.5h-1V7h1Z"/>
            </svg>
            <strong>Claude Code Skills</strong>
          </div>
          <a
            className="skill-info-link"
            href="https://raw.githubusercontent.com/aireilly/rh-diagrams-designer/main/.claude/skills/diagram-builder.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Diagram Builder
          </a>
          {' — '}build diagrams from the CLI using interactive prompts.
          <br />
          <a
            className="skill-info-link"
            href="https://raw.githubusercontent.com/aireilly/rh-diagrams-designer/main/.claude/skills/screenshot-to-diagram.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Screenshot to Diagram
          </a>
          {' — '}convert a screenshot into a Red Hat diagram.
          <br />
          Copy skills to .claude/skills/
        </div>
      </aside>
    );
  }

  if (selectedConnectors.length > 1) {
    const handleOffset = () => {
      type AnchorInfo = { connectorId: string; end: 'from' | 'to' };
      const groups = new Map<string, AnchorInfo[]>();

      for (const c of selectedConnectors) {
        const fromEl = state.elements.find((e) => e.id === c.fromId);
        const toEl = state.elements.find((e) => e.id === c.toId);
        if (!fromEl || !toEl) continue;

        const fromSide = resolveAutoSide(fromEl, toEl, c.fromSide || 'auto');
        const fromKey = `${c.fromId}:${fromSide}`;
        if (!groups.has(fromKey)) groups.set(fromKey, []);
        groups.get(fromKey)!.push({ connectorId: c.id, end: 'from' });

        const toSide = resolveAutoSide(toEl, fromEl, c.toSide || 'auto');
        const toKey = `${c.toId}:${toSide}`;
        if (!groups.has(toKey)) groups.set(toKey, []);
        groups.get(toKey)!.push({ connectorId: c.id, end: 'to' });
      }

      const changesMap = new Map<string, Partial<Connector>>();
      for (const group of groups.values()) {
        if (group.length <= 1) continue;
        for (let i = 0; i < group.length; i++) {
          const { connectorId, end } = group[i];
          const offset = (i - (group.length - 1) / 2) * OFFSET_SPACING;
          const offsetKey = end === 'from' ? 'fromOffset' : 'toOffset';
          if (!changesMap.has(connectorId)) changesMap.set(connectorId, { points: [] as number[] });
          changesMap.get(connectorId)![offsetKey] = offset;
        }
      }

      const updates = Array.from(changesMap.entries()).map(([id, changes]) => ({ id, changes }));
      if (updates.length > 0) {
        dispatch({ type: 'UPDATE_CONNECTORS', updates });
      }
    };

    const handleResetOffsets = () => {
      const updates = selectedConnectors.map((c) => ({
        id: c.id,
        changes: { fromOffset: 0, toOffset: 0, points: [] as number[] },
      }));
      dispatch({ type: 'UPDATE_CONNECTORS', updates });
    };

    return (
      <aside className="properties-panel">
        <h3 className="panel-title">Connectors ({selectedConnectors.length})</h3>
        <p className="empty-message">Shift+click to multi-select connectors.</p>

        <div className="prop-group">
          <div className="prop-button-row">
            <button className="prop-btn" onClick={handleOffset}>
              Offset Overlaps
            </button>
            <button className="prop-btn" onClick={handleResetOffsets}>
              Reset
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (connector) {
    const updateConnector = (changes: Record<string, unknown>) => {
      dispatch({ type: 'UPDATE_CONNECTOR', id: connector.id, changes });
    };

    const fromEl = state.elements.find((e) => e.id === connector.fromId);
    const toEl = state.elements.find((e) => e.id === connector.toId);

    const sides: AnchorSide[] = ['auto', 'top', 'bottom', 'left', 'right'];
    const directions: ArrowDirection[] = ['forward', 'backward', 'bidirectional', 'none'];
    const lineTypes: ConnectorType[] = ['solid', 'dashed'];

    return (
      <aside className="properties-panel">
        <h3 className="panel-title">Connector</h3>

        <div className="prop-group">
          <label className="prop-label">Line Style</label>
          <div className="prop-button-row">
            {lineTypes.map((t) => (
              <button
                key={t}
                className={`prop-btn ${connector.lineType === t ? 'active' : ''}`}
                onClick={() => updateConnector({ lineType: t })}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="prop-group">
          <label className="prop-label">Arrows</label>
          <div className="prop-button-row">
            {directions.map((d) => (
              <button
                key={d}
                className={`prop-btn ${connector.arrowDirection === d ? 'active' : ''}`}
                onClick={() => updateConnector({ arrowDirection: d })}
              >
                {d === 'forward' ? 'Forward' : d === 'backward' ? 'Backward' : d === 'bidirectional' ? 'Both' : 'None'}
              </button>
            ))}
          </div>
        </div>

        <div className="prop-group">
          <label className="prop-label">Stroke Width</label>
          <div className="prop-button-row">
            {[1, 2].map((w) => (
              <button
                key={w}
                className={`prop-btn ${connector.strokeWidth === w ? 'active' : ''}`}
                onClick={() => updateConnector({ strokeWidth: w })}
              >
                {w}px
              </button>
            ))}
          </div>
        </div>

        <div className="prop-group">
          <label className="prop-label">Color</label>
          <div className="swatch-row">
            {CONNECTOR_COLORS.map((c) => (
              <button
                key={c.hex}
                className={`swatch ${(connector.stroke || COLORS.DARK_GRAY) === c.hex ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => updateConnector({ stroke: c.hex })}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="prop-group">
          <label className="prop-label">
            From{fromEl ? ` (${fromEl.text || fromEl.type})` : ''}
          </label>
          <div className="prop-button-row">
            {sides.map((s) => (
              <button
                key={s}
                className={`prop-btn ${(connector.fromSide || 'auto') === s ? 'active' : ''}`}
                onClick={() => updateConnector({ fromSide: s, points: [] })}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="prop-group">
          <label className="prop-label">
            To{toEl ? ` (${toEl.text || toEl.type})` : ''}
          </label>
          <div className="prop-button-row">
            {sides.map((s) => (
              <button
                key={s}
                className={`prop-btn ${(connector.toSide || 'auto') === s ? 'active' : ''}`}
                onClick={() => updateConnector({ toSide: s, points: [] })}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {connector.points && connector.points.length >= 4 && (
          <div className="prop-group">
            <button
              className="prop-btn"
              onClick={() => updateConnector({ points: [] })}
            >
              Reset Routing
            </button>
          </div>
        )}
      </aside>
    );
  }

  if (!element) return null;

  return (
    <aside className="properties-panel">
      <h3 className="panel-title">Properties</h3>

      {/* Network line color */}
      {element.type === 'network-line' && (
        <div className="prop-group">
          <label className="prop-label">Network Type</label>
          <div className="swatch-row">
            {NETWORK_COLORS.map((c) => (
              <button
                key={c.hex}
                className={`swatch ${element.stroke === c.hex ? 'active' : ''}`}
                style={{ backgroundColor: c.hex }}
                onClick={() => updateElement(element.id, { stroke: c.hex })}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Text */}
      {element.type !== 'network-line' && (
      <div className="prop-group">
        <label className="prop-label">Text</label>
        <input
          className="prop-input"
          type="text"
          value={element.text}
          onChange={(e) => updateElement(element.id, { text: e.target.value })}
        />
      </div>
      )}

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

      {/* Text Position */}
      {element.type === 'rect' && (
        <div className="prop-group">
          <label className="prop-label">Label Position</label>
          <div className="prop-button-row">
            {(['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'] as TextPosition[]).map((pos) => (
              <button
                key={pos}
                className={`prop-btn ${(element.textPosition || 'top-left') === pos ? 'active' : ''}`}
                onClick={() => updateElement(element.id, { textPosition: pos })}
              >
                {pos === 'top-left' ? 'TL' : pos === 'top-right' ? 'TR' : pos === 'center' ? 'Mid' : pos === 'bottom-left' ? 'BL' : 'BR'}
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
                  const darkColors = ['#151515', '#4d4d4d', '#707070', '#0066cc', '#4394e5', '#63993d', '#5e40be', '#f0561d', '#b98412'];
                  const isDark = darkColors.includes(c.hex);
                  updateElement(element.id, {
                    fill: c.hex,
                    textColor: isDark ? '#ffffff' : '#3c3c3c',
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

      {/* Stroke Style */}
      {element.type === 'rect' && element.stroke && (
        <div className="prop-group">
          <label className="prop-label">Stroke Style</label>
          <div className="prop-button-row">
            <button
              className={`prop-btn ${!element.strokeDashEnabled ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { strokeDashEnabled: false })}
            >
              Solid
            </button>
            <button
              className={`prop-btn ${element.strokeDashEnabled ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { strokeDashEnabled: true })}
            >
              Dashed
            </button>
          </div>
        </div>
      )}

      {/* Font Family */}
      {(element.type === 'rect' || element.type === 'text') && (
        <div className="prop-group">
          <label className="prop-label">Font</label>
          <div className="prop-button-row">
            <button
              className={`prop-btn ${(!element.fontFamily || element.fontFamily === FONT_FAMILY) ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { fontFamily: FONT_FAMILY })}
            >
              Text
            </button>
            <button
              className={`prop-btn ${element.fontFamily === FONT_FAMILY_MONO ? 'active' : ''}`}
              onClick={() => updateElement(element.id, { fontFamily: FONT_FAMILY_MONO })}
            >
              Mono
            </button>
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
      {/* Layer Order */}
      <div className="prop-group">
        <label className="prop-label">Order</label>
        <div className="prop-button-row">
          <button
            className="prop-btn"
            onClick={() => dispatch({ type: 'SEND_TO_BACK', ids: [element.id] })}
          >
            To Back
          </button>
          <button
            className="prop-btn"
            onClick={() => dispatch({ type: 'SEND_TO_FRONT', ids: [element.id] })}
          >
            To Front
          </button>
        </div>
      </div>
    </aside>
  );
}
