import { useDiagram } from '../state/DiagramContext';
import { ZOOM } from '../constants';
import { serializeProject, deserializeProject, downloadFile, loadFile } from '../utils/projectFile';
import './Toolbar.css';

interface ToolbarProps {
  onExport: () => void;
}

export default function Toolbar({ onExport }: ToolbarProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useDiagram();

  const handleZoomIn = () => {
    const next = Math.min(state.zoom + ZOOM.STEP, ZOOM.MAX);
    dispatch({ type: 'SET_ZOOM', zoom: Math.round(next * 100) / 100 });
  };

  const handleZoomOut = () => {
    const next = Math.max(state.zoom - ZOOM.STEP, ZOOM.MIN);
    dispatch({ type: 'SET_ZOOM', zoom: Math.round(next * 100) / 100 });
  };

  const handleZoomFit = () => {
    dispatch({ type: 'SET_ZOOM', zoom: 1 });
  };

  const handleSelectTool = () => {
    dispatch({ type: 'SET_TOOL', tool: 'select' });
  };

  const handleSave = () => {
    const json = serializeProject(state);
    downloadFile(json, 'diagram.json', 'application/json');
  };

  const handleLoad = async () => {
    try {
      const json = await loadFile();
      const loaded = deserializeProject(json);
      dispatch({ type: 'LOAD_STATE', state: loaded });
    } catch {
      // User cancelled file picker
    }
  };

  return (
    <header className="toolbar">
      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={handleSave} title="Save Project">
          Save
        </button>
        <button className="toolbar-btn" onClick={handleLoad} title="Load Project">
          Load
        </button>
        <button
          className={`toolbar-btn ${state.tool === 'select' ? 'active' : ''}`}
          onClick={handleSelectTool}
          title="Select (V)"
        >
          Select
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          Undo
        </button>
        <button className="toolbar-btn" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          Redo
        </button>
      </div>

      <div className="toolbar-separator" />

      <div className="toolbar-group">
        <button className="toolbar-btn" onClick={handleZoomOut} title="Zoom Out">
          -
        </button>
        <span className="toolbar-zoom-label">{Math.round(state.zoom * 100)}%</span>
        <button className="toolbar-btn" onClick={handleZoomIn} title="Zoom In">
          +
        </button>
        <button className="toolbar-btn" onClick={handleZoomFit} title="Zoom to Fit">
          Fit
        </button>
      </div>

      <div className="toolbar-spacer" />

      <div className="toolbar-group">
        <button className="toolbar-btn toolbar-btn-primary" onClick={onExport}>
          Export
        </button>
      </div>
    </header>
  );
}
