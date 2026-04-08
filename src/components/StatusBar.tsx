import { useDiagram } from '../state/DiagramContext';
import { CANVAS } from '../constants';
import './StatusBar.css';

export default function StatusBar() {
  const { state, dispatch } = useDiagram();

  const toggleSnap = () => {
    dispatch({ type: 'SET_SNAP', enabled: !state.snapEnabled });
  };

  return (
    <footer className="status-bar">
      <span className="status-item">
        Canvas: {CANVAS.WIDTH} x {state.canvasHeight} px
      </span>
      <span className="status-item">
        Zoom: {Math.round(state.zoom * 100)}%
      </span>
      <button className={`status-snap-btn ${state.snapEnabled ? 'active' : ''}`} onClick={toggleSnap}>
        Snap: {state.snapEnabled ? 'ON' : 'OFF'}
      </button>
      <span className="status-item">
        Elements: {state.elements.length}
      </span>
    </footer>
  );
}
