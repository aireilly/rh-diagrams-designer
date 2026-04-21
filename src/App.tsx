import { useState, useRef, useEffect } from 'react';
import type Konva from 'konva';
import './App.css';
import { DiagramProvider, useDiagram } from './state/DiagramContext';
import { parseHashData } from './utils/hashImport';
import Canvas from './components/Canvas';
import ComponentPanel from './components/ComponentPanel';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import ExportModal from './components/ExportModal';

function AppContent() {
  const { dispatch } = useDiagram();
  const [showExport, setShowExport] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);

  useEffect(() => {
    const state = parseHashData(window.location.hash);
    if (state) {
      dispatch({ type: 'LOAD_STATE', state });
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [dispatch]);

  return (
    <>
      <div className="app">
        <header className="title-bar">
          <span className="title-bar-name">
            <img src={`${import.meta.env.BASE_URL}favicon.png`} alt="Red Hat" className="title-bar-logo" />
            Red Hat Diagram Designer
          </span>
          <a
            className="title-bar-link"
            href="https://github.com/aireilly/rh-diagrams-designer"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-label="GitHub"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
          </a>
        </header>
        <Toolbar onExport={() => setShowExport(true)} />
        <ComponentPanel />
        <main className="canvas-area">
          <Canvas stageRef={stageRef} />
        </main>
        <PropertiesPanel />
        <StatusBar />
      </div>
      {showExport && (
        <ExportModal onClose={() => setShowExport(false)} stageRef={stageRef} />
      )}
    </>
  );
}

function App() {
  return (
    <DiagramProvider>
      <AppContent />
    </DiagramProvider>
  );
}

export default App;
