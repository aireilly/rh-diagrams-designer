import { useState, useRef } from 'react';
import type Konva from 'konva';
import './App.css';
import { DiagramProvider } from './state/DiagramContext';
import Canvas from './components/Canvas';
import ComponentPanel from './components/ComponentPanel';
import PropertiesPanel from './components/PropertiesPanel';
import Toolbar from './components/Toolbar';
import StatusBar from './components/StatusBar';
import ExportModal from './components/ExportModal';

function App() {
  const [showExport, setShowExport] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);

  return (
    <DiagramProvider>
      <div className="app">
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
    </DiagramProvider>
  );
}

export default App;
