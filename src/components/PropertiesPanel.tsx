import { useDiagram } from '../state/DiagramContext';
import { COLOR_SWATCHES, FONT_SIZES, FONT_WEIGHTS } from '../constants';
import { AnchorSide, ArrowDirection, ConnectorType, FontWeight } from '../types';
import './PropertiesPanel.css';

export default function PropertiesPanel() {
  const { state, updateElement, dispatch } = useDiagram();

  const selectedId = state.selectedIds[0];
  const element = state.elements.find((e) => e.id === selectedId);
  const connector = state.connectors.find((c) => c.id === selectedId);

  if (!element && !connector) {
    return (
      <aside className="properties-panel">
        <h3 className="panel-title">Properties</h3>
        <p className="empty-message">Select an element to edit its properties.</p>
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
    const directions: ArrowDirection[] = ['forward', 'bidirectional', 'none'];
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
                {d === 'forward' ? 'Forward' : d === 'bidirectional' ? 'Both' : 'None'}
              </button>
            ))}
          </div>
        </div>

        <div className="prop-group">
          <label className="prop-label">Stroke</label>
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
          <label className="prop-label">
            From{fromEl ? ` (${fromEl.text || fromEl.type})` : ''}
          </label>
          <div className="prop-button-row">
            {sides.map((s) => (
              <button
                key={s}
                className={`prop-btn ${(connector.fromSide || 'auto') === s ? 'active' : ''}`}
                onClick={() => updateConnector({ fromSide: s })}
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
                onClick={() => updateConnector({ toSide: s })}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  if (!element) return null;

  return (
    <aside className="properties-panel">
      <h3 className="panel-title">Properties</h3>

      {/* Text */}
      <div className="prop-group">
        <label className="prop-label">Text</label>
        <input
          className="prop-input"
          type="text"
          value={element.text}
          onChange={(e) => updateElement(element.id, { text: e.target.value })}
        />
      </div>

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
                  const isDark = c.hex === '#0066cc' || c.hex === '#262626' || c.hex === '#595959';
                  updateElement(element.id, {
                    fill: c.hex,
                    textColor: isDark ? '#ffffff' : '#262626',
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
    </aside>
  );
}
