import { useDiagram } from '../state/DiagramContext';
import { ZOOM, COLORS } from '../constants';
import { DiagramElement } from '../types';
import { serializeProject, deserializeProject, downloadFile, loadFile } from '../utils/projectFile';
import './Toolbar.css';

const CLUSTER_GAP = 5;
const BUNDLE_PADDING = 10;

let nextBundleId = 1;

interface ToolbarProps {
  onExport: () => void;
}

export default function Toolbar({ onExport }: ToolbarProps) {
  const { state, dispatch, undo, redo, canUndo, canRedo, updateElement, addElement } = useDiagram();

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

  const handleCluster = () => {
    const selected = state.elements.filter((el) => state.selectedIds.includes(el.id));
    if (selected.length < 2) return;

    // Sort by current x position (left to right)
    const sorted = [...selected].sort((a, b) => a.x - b.x);

    // Align to the topmost y position
    const topY = Math.min(...sorted.map((el) => el.y));

    // Arrange horizontally with 5px gaps
    let currentX = sorted[0].x;
    for (const el of sorted) {
      updateElement(el.id, { x: currentX, y: topY });
      currentX += el.width + CLUSTER_GAP;
    }
  };

  const handleBundle = () => {
    const selected = state.elements.filter((el) => state.selectedIds.includes(el.id));
    if (selected.length < 2) return;

    // Cluster first: sort by x, arrange with 5px gaps, align tops
    const sorted = [...selected].sort((a, b) => a.x - b.x);
    const topY = Math.min(...sorted.map((el) => el.y));

    let currentX = sorted[0].x;
    for (const el of sorted) {
      updateElement(el.id, { x: currentX, y: topY });
      currentX += el.width + CLUSTER_GAP;
    }

    // Calculate bounding box of the clustered shapes
    const totalWidth = currentX - CLUSTER_GAP - sorted[0].x;
    const maxHeight = Math.max(...sorted.map((el) => el.height));

    // Create a dashed container rect around the cluster with 10px padding
    const container: DiagramElement = {
      id: `bundle-${nextBundleId++}`,
      type: 'rect',
      x: sorted[0].x - BUNDLE_PADDING,
      y: topY - BUNDLE_PADDING,
      width: totalWidth + BUNDLE_PADDING * 2,
      height: maxHeight + BUNDLE_PADDING * 2,
      rotation: 0,
      fill: '',
      stroke: COLORS.GRAY_50,
      strokeWidth: 1,
      text: '',
      fontSize: 14,
      fontWeight: 'bold',
      textColor: COLORS.DARK_GRAY,
      groupId: null,
    };
    addElement(container);
  };

  const handleStack = () => {
    const selected = state.elements.filter((el) => state.selectedIds.includes(el.id));
    if (selected.length === 0) return;

    for (const el of selected) {
      // Add two offset rects behind the shape, stepping 5px down-right
      for (let i = 2; i >= 1; i--) {
        const stackRect: DiagramElement = {
          id: `stack-${nextBundleId++}`,
          type: 'rect',
          x: el.x + i * 5,
          y: el.y + i * 5,
          width: el.width,
          height: el.height,
          rotation: 0,
          fill: el.fill || '',
          stroke: el.stroke || COLORS.GRAY_50,
          strokeWidth: 1,
          text: '',
          fontSize: 14,
          fontWeight: 'bold',
          textColor: COLORS.DARK_GRAY,
          groupId: null,
        };
        addElement(stackRect);
      }
    }
  };

  const canCluster = state.selectedIds.filter((id) => state.elements.some((el) => el.id === id)).length >= 2;
  const canStack = state.selectedIds.some((id) => state.elements.some((el) => el.id === id));

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
        <button className="toolbar-btn" onClick={handleCluster} disabled={!canCluster} title="Arrange selected shapes in a row with 5px gaps">
          Cluster
        </button>
        <button className="toolbar-btn" onClick={handleBundle} disabled={!canCluster} title="Cluster and wrap in a dashed container">
          Bundle
        </button>
        <button className="toolbar-btn" onClick={handleStack} disabled={!canStack} title="Add stack lines behind selected shape">
          Stack
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
