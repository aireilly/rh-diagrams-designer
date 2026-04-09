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
  const { state, setSelection, deleteSelected, undo, redo, addConnector, addElement, moveElement, dispatch } = useDiagram();
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalStageRef;
  const transformerRef = useRef<Konva.Transformer>(null);
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const [selRect, setSelRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const isDraggingSelection = useRef(false);
  const justFinishedDragSelect = useRef(false);
  const clipboard = useRef<typeof state.elements>([]);

  const isConnectorMode = state.tool === 'connector-solid' || state.tool === 'connector-dashed';
  const width = CANVAS.WIDTH;
  const height = state.canvasHeight;

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (justFinishedDragSelect.current) {
        justFinishedDragSelect.current = false;
        return;
      }

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

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (isConnectorMode) return;
      const clickedOnEmpty = e.target === e.target.getStage();
      if (!clickedOnEmpty) return;

      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const x = pointer.x / state.zoom;
      const y = pointer.y / state.zoom;
      isDraggingSelection.current = true;
      setSelRect({ x1: x, y1: y, x2: x, y2: y });
    },
    [isConnectorMode, state.zoom]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDraggingSelection.current || !selRect) return;

      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      setSelRect({ ...selRect, x2: pointer.x / state.zoom, y2: pointer.y / state.zoom });
    },
    [selRect, state.zoom]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDraggingSelection.current || !selRect) {
      isDraggingSelection.current = false;
      setSelRect(null);
      return;
    }

    isDraggingSelection.current = false;

    const x1 = Math.min(selRect.x1, selRect.x2);
    const y1 = Math.min(selRect.y1, selRect.y2);
    const x2 = Math.max(selRect.x1, selRect.x2);
    const y2 = Math.max(selRect.y1, selRect.y2);

    // Only select if dragged more than 3px (avoid accidental micro-drags)
    if (x2 - x1 > 3 || y2 - y1 > 3) {
      const ids = state.elements
        .filter((el) => {
          const ex = el.x;
          const ey = el.y;
          const ew = el.width;
          const eh = el.height;
          return ex < x2 && ex + ew > x1 && ey < y2 && ey + eh > y1;
        })
        .map((el) => el.id);
      setSelection(ids);
      justFinishedDragSelect.current = true;
    }

    setSelRect(null);
  }, [selRect, state.elements, setSelection]);

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
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const allIds = [
          ...state.elements.map((el) => el.id),
          ...state.connectors.map((c) => c.id),
        ];
        setSelection(allIds);
      }
      if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        clipboard.current = state.elements.filter((el) => state.selectedIds.includes(el.id));
      }
      if (e.key === 'x' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        clipboard.current = state.elements.filter((el) => state.selectedIds.includes(el.id));
        deleteSelected();
      }
      if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (clipboard.current.length === 0) return;
        const newIds: string[] = [];
        for (const el of clipboard.current) {
          const newId = `${el.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          newIds.push(newId);
          addElement({ ...el, id: newId, x: el.x + 20, y: el.y + 20 });
        }
        setSelection(newIds);
        // Shift clipboard offset so repeated pastes cascade
        clipboard.current = clipboard.current.map((el) => ({ ...el, x: el.x + 20, y: el.y + 20 }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, undo, redo, state.selectedIds, state.elements, state.connectors, moveElement, addElement, setSelection, dispatch]);

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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
          {state.elements.filter((el) => el.type !== 'circle').map(renderElement)}
          {state.elements.filter((el) => el.type === 'circle').map(renderElement)}
          <Transformer
            ref={transformerRef}
            borderStroke="#4a90d9"
            anchorStroke="#4a90d9"
            anchorSize={8}
            anchorCornerRadius={2}
            rotateEnabled={false}
          />
          {selRect && (
            <Rect
              x={Math.min(selRect.x1, selRect.x2)}
              y={Math.min(selRect.y1, selRect.y2)}
              width={Math.abs(selRect.x2 - selRect.x1)}
              height={Math.abs(selRect.y2 - selRect.y1)}
              fill="rgba(74, 144, 217, 0.1)"
              stroke="#4a90d9"
              strokeWidth={1}
              dash={[4, 4]}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
}
