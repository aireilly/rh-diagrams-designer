import { useRef, useCallback } from 'react';
import { Stage, Layer, Line, Rect } from 'react-konva';
import type Konva from 'konva';
import { useDiagram } from '../state/DiagramContext';
import { CANVAS, GRID, COLORS } from '../constants';
import './Canvas.css';

function GridLines({ width, height }: { width: number; height: number }) {
  const lines = [];

  for (let x = 0; x <= width; x += GRID.MINOR) {
    const isMajor = x % GRID.MAJOR === 0;
    lines.push(
      <Line
        key={`v-${x}`}
        points={[x, 0, x, height]}
        stroke={isMajor ? '#c0c0c0' : '#e0e0e0'}
        strokeWidth={isMajor ? 0.5 : 0.25}
        listening={false}
      />
    );
  }

  for (let y = 0; y <= height; y += GRID.MINOR) {
    const isMajor = y % GRID.MAJOR === 0;
    lines.push(
      <Line
        key={`h-${y}`}
        points={[0, y, width, y]}
        stroke={isMajor ? '#c0c0c0' : '#e0e0e0'}
        strokeWidth={isMajor ? 0.5 : 0.25}
        listening={false}
      />
    );
  }

  return <>{lines}</>;
}

export default function Canvas() {
  const { state, setSelection } = useDiagram();
  const stageRef = useRef<Konva.Stage>(null);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (e.target === e.target.getStage()) {
        setSelection([]);
      }
    },
    [setSelection]
  );

  const width = CANVAS.WIDTH;
  const height = state.canvasHeight;

  return (
    <div className="canvas-container">
      <Stage
        ref={stageRef}
        width={width * state.zoom}
        height={height * state.zoom}
        scaleX={state.zoom}
        scaleY={state.zoom}
        onClick={handleStageClick}
        className="diagram-stage"
      >
        <Layer>
          <Rect x={0} y={0} width={width} height={height} fill={COLORS.WHITE} listening={false} />
          {state.snapEnabled && <GridLines width={width} height={height} />}
        </Layer>
        <Layer>
          {/* Shape and connector layers will be added in later tasks */}
        </Layer>
      </Stage>
    </div>
  );
}
