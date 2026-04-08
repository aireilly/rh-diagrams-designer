import './App.css';
import { DiagramProvider } from './state/DiagramContext';
import Canvas from './components/Canvas';

function App() {
  return (
    <DiagramProvider>
      <div className="app">
        <header className="toolbar">Toolbar</header>
        <aside className="component-panel">Components</aside>
        <main className="canvas-area">
          <Canvas />
        </main>
        <aside className="properties-panel">Properties</aside>
        <footer className="status-bar">Status</footer>
      </div>
    </DiagramProvider>
  );
}

export default App;
