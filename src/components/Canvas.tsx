import { useRef, useCallback, useEffect, useState } from 'react';
import { Stage, Layer, Line, Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import { useDiagram } from '../state/DiagramContext';
import { CANVAS, GRID, COLORS } from '../constants';
import RectShape from '../shapes/RectShape';
import CircleCallout from '../shapes/CircleCallout';
import TextLabel from '../shapes/TextLabel';
import IconShape from '../shapes/IconShape';
import ConnectorLine from '../shapes/ConnectorLine';
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

interface CanvasProps {
  stageRef?: React.RefObject<Konva.Stage | null>;
}

export default function Canvas({ stageRef: externalStageRef }: CanvasProps) {
  const { state, setSelection, deleteSelected, undo, redo, addConnector, moveElement, dispatch } = useDiagram();
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalStageRef;
  const transformerRef = useRef<Konva.Transformer>(null);
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);

  const isConnectorMode = state.tool === 'connector-solid' || state.tool === 'connector-dashed';
  const width = CANVAS.WIDTH;
  const height = state.canvasHeight;

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelection([]);
        setPendingFrom(null);
        return;
      }

      // Check if a connector tool is active and a shape was clicked
      if (state.tool === 'connector-solid' || state.tool === 'connector-dashed') {
        // Walk up the node tree to find the Group with a matching element ID
        let node: Konva.Node | null = e.target;
        let el = null;
        while (node && node !== e.target.getStage()) {
          const id = node.id();
          if (id) {
            el = state.elements.find((e) => e.id === id);
            if (el) break;
          }
          node = node.parent;
        }
        if (!el) return;

        if (!pendingFrom) {
          setPendingFrom(el.id);
          setSelection([el.id]); // Highlight the source shape
        } else if (pendingFrom !== el.id) {
          const lineType = state.tool === 'connector-solid' ? 'solid' : 'dashed';
          addConnector({
            id: `conn-${Date.now()}`,
            fromId: pendingFrom,
            toId: el.id,
            lineType,
            arrowDirection: 'forward',
            strokeWidth: 1,
            stroke: COLORS.DARK_GRAY,
            points: [],
            fromSide: 'auto' as const,
            toSide: 'auto' as const,
          });
          setPendingFrom(null);
          dispatch({ type: 'SET_TOOL', tool: 'select' });
        }
      }
    },
    [setSelection, state.tool, state.elements, pendingFrom, addConnector, dispatch]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        setPendingFrom(null);
        dispatch({ type: 'SET_TOOL', tool: 'select' });
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (state.selectedIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 1 : GRID.MINOR;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          for (const id of state.selectedIds) {
            const el = state.elements.find((el) => el.id === id);
            if (el) {
              moveElement(id, el.x + dx, el.y + dy);
            }
          }
        }
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, undo, redo, state.selectedIds, state.elements, moveElement, dispatch]);

  // Update transformer selection
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    const selectedNodes = state.selectedIds
      .map((id) => stage.findOne(`#${id}`))
      .filter((node): node is Konva.Node => node !== undefined);

    transformer.nodes(selectedNodes);
    transformer.getLayer()?.batchDraw();
  }, [state.selectedIds, stageRef]);

  const renderElement = (el: typeof state.elements[0]) => {
    const isSelected = state.selectedIds.includes(el.id);
    const props = { key: el.id, element: el, isSelected };

    switch (el.type) {
      case 'rect':
        return <RectShape {...props} />;
      case 'circle':
        return <CircleCallout {...props} />;
      case 'text':
        return <TextLabel {...props} />;
      case 'icon':
        return <IconShape {...props} />;
      default:
        return null;
    }
  };

  return (
    <div className={`canvas-container${isConnectorMode ? ' connector-mode' : ''}`}>
      <Stage
        ref={stageRef as React.RefObject<Konva.Stage>}
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
          {state.connectors.map((c) => (
            <ConnectorLine
              key={c.id}
              connector={c}
              isSelected={state.selectedIds.includes(c.id)}
            />
          ))}
          {state.elements.map(renderElement)}
          <Transformer
            ref={transformerRef}
            borderStroke="#4a90d9"
            anchorStroke="#4a90d9"
            anchorSize={8}
            anchorCornerRadius={2}
            rotateEnabled={false}
          />
        </Layer>
      </Stage>
    </div>
  );
}
