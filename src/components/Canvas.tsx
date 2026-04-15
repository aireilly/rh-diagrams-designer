import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import { Stage, Layer, Line, Rect, Transformer } from 'react-konva';
import type Konva from 'konva';
import { useDiagram } from '../state/DiagramContext';
import { CANVAS, GRID, COLORS, ZOOM } from '../constants';
import { snapToGrid } from '../utils/snapGrid';
import { getElementBounds } from '../utils/elementBounds';
import RectShape from '../shapes/RectShape';
import CircleCallout from '../shapes/CircleCallout';
import TextLabel from '../shapes/TextLabel';
import IconShape from '../shapes/IconShape';
import NetworkLineShape from '../shapes/NetworkLineShape';
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
  const { state, setSelection, deleteSelected, undo, redo, addConnector, addElement, moveElements, dispatch } = useDiagram();
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalStageRef;
  const transformerRef = useRef<Konva.Transformer>(null);
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);
  const [selRect, setSelRect] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const isDraggingSelection = useRef(false);
  const justFinishedDragSelect = useRef(false);
  const clipboard = useRef<typeof state.elements>([]);
  const [networkLineDraw, setNetworkLineDraw] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const isDrawingNetworkLine = useRef(false);
  const networkLineOrigin = useRef<{ x: number; y: number } | null>(null);
  const justFinishedNetworkLine = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isConnectorMode = state.tool === 'connector-solid' || state.tool === 'connector-dashed';
  const isNetworkLineMode = state.tool === 'network-line';
  const width = CANVAS.WIDTH;
  const height = state.canvasHeight;

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (justFinishedDragSelect.current) {
        justFinishedDragSelect.current = false;
        return;
      }
      if (justFinishedNetworkLine.current) {
        justFinishedNetworkLine.current = false;
        return;
      }

      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        setSelection([]);
        setPendingFrom(null);
        return;
      }

      // Connector mode: walk up from click target to find the element
      if (state.tool === 'connector-solid' || state.tool === 'connector-dashed') {
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
          setSelection([el.id]);
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

      if (isNetworkLineMode) {
        const snappedX = state.snapEnabled ? snapToGrid(x, GRID.MINOR) : x;
        const snappedY = state.snapEnabled ? snapToGrid(y, GRID.MINOR) : y;
        networkLineOrigin.current = { x: snappedX, y: snappedY };
        isDrawingNetworkLine.current = true;
        setNetworkLineDraw({ x1: snappedX, y1: snappedY, x2: snappedX, y2: snappedY });
        return;
      }

      isDraggingSelection.current = true;
      setSelRect({ x1: x, y1: y, x2: x, y2: y });
    },
    [isConnectorMode, isNetworkLineMode, state.zoom, state.snapEnabled]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Network line drawing
      if (isDrawingNetworkLine.current && networkLineOrigin.current) {
        const stage = e.target.getStage();
        if (!stage) return;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const origin = networkLineOrigin.current;
        const rawX = pointer.x / state.zoom;
        const rawY = pointer.y / state.zoom;
        const dx = Math.abs(rawX - origin.x);
        const dy = Math.abs(rawY - origin.y);

        if (dx >= dy) {
          // Horizontal
          const endX = state.snapEnabled ? snapToGrid(rawX, GRID.MINOR) : rawX;
          let lineY = origin.y;
          for (const el of state.elements) {
            if (el.type === 'network-line' && el.height === 0 && Math.abs(lineY - el.y) <= GRID.MINOR) {
              lineY = el.y;
              break;
            }
          }
          setNetworkLineDraw({ x1: origin.x, y1: lineY, x2: endX, y2: lineY });
        } else {
          // Vertical
          let lineX = origin.x;
          const endY = state.snapEnabled ? snapToGrid(rawY, GRID.MINOR) : rawY;
          for (const el of state.elements) {
            if (el.type === 'network-line' && el.width === 0 && Math.abs(lineX - el.x) <= GRID.MINOR) {
              lineX = el.x;
              break;
            }
          }
          setNetworkLineDraw({ x1: lineX, y1: origin.y, x2: lineX, y2: endY });
        }
        return;
      }

      // Selection rectangle
      if (!isDraggingSelection.current || !selRect) return;

      const stage = e.target.getStage();
      if (!stage) return;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      setSelRect({ ...selRect, x2: pointer.x / state.zoom, y2: pointer.y / state.zoom });
    },
    [selRect, state.zoom, state.snapEnabled, state.elements]
  );

  const handleMouseUp = useCallback(() => {
    // Network line creation
    if (isDrawingNetworkLine.current) {
      isDrawingNetworkLine.current = false;
      networkLineOrigin.current = null;

      if (networkLineDraw) {
        const { x1, y1, x2, y2 } = networkLineDraw;
        const lineLength = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));

        if (lineLength >= GRID.MAJOR) {
          const isHorizontal = y1 === y2;
          addElement({
            id: `network-line-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            type: 'network-line',
            x: isHorizontal ? Math.min(x1, x2) : x1,
            y: isHorizontal ? y1 : Math.min(y1, y2),
            width: isHorizontal ? Math.abs(x2 - x1) : 0,
            height: isHorizontal ? 0 : Math.abs(y2 - y1),
            rotation: 0,
            fill: '',
            stroke: state.networkLineColor,
            strokeWidth: 2,
            text: '',
            fontSize: 11,
            fontWeight: 'medium',
            textColor: COLORS.GRAY_95,
            groupId: null,
          });
          justFinishedNetworkLine.current = true;
        }
        dispatch({ type: 'SET_TOOL', tool: 'select' });
      }

      setNetworkLineDraw(null);
      return;
    }

    // Selection rectangle
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
  }, [networkLineDraw, selRect, state.elements, setSelection, state.networkLineColor, addElement, dispatch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        setPendingFrom(null);
        isDrawingNetworkLine.current = false;
        networkLineOrigin.current = null;
        setNetworkLineDraw(null);
        dispatch({ type: 'SET_TOOL', tool: 'select' });
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (state.selectedIds.length > 0) {
          e.preventDefault();
          const step = e.shiftKey ? 1 : GRID.MINOR;
          const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0;
          const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0;
          const moves = state.selectedIds
            .map((id) => {
              const el = state.elements.find((el) => el.id === id);
              return el ? { id, x: el.x + dx, y: el.y + dy } : null;
            })
            .filter((m): m is { id: string; x: number; y: number } => m !== null);
          if (moves.length > 0) {
            moveElements(moves);
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
      if (e.key === 'g' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const selectedElementIds = state.selectedIds.filter((id) =>
          state.elements.some((el) => el.id === id)
        );
        if (selectedElementIds.length < 2) return;

        const selectedElements = state.elements.filter((el) => selectedElementIds.includes(el.id));
        const groupIds = new Set(selectedElements.map((el) => el.groupId).filter(Boolean));

        if (groupIds.size === 1) {
          // All selected share one group — ungroup
          dispatch({ type: 'UNGROUP_ELEMENTS', groupId: [...groupIds][0] as string });
        } else {
          // Group selected elements
          const groupId = `group-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
          dispatch({ type: 'GROUP_ELEMENTS', ids: selectedElementIds, groupId });
        }
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
  }, [deleteSelected, undo, redo, state.selectedIds, state.elements, state.connectors, moveElements, addElement, setSelection, dispatch]);

  // Scroll-wheel: plain = vertical scroll, Ctrl = horizontal scroll, Shift = zoom
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.shiftKey) {
        // Shift+scroll → zoom
        e.preventDefault();
        const direction = e.deltaY < 0 ? 1 : -1;
        const next = Math.round(Math.min(ZOOM.MAX, Math.max(ZOOM.MIN, state.zoom + direction * ZOOM.STEP)) * 100) / 100;
        dispatch({ type: 'SET_ZOOM', zoom: next });
      } else if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd+scroll → horizontal scroll
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
      // Plain scroll → default vertical scroll (no preventDefault)
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [state.zoom, dispatch]);

  // Update transformer selection
  useEffect(() => {
    const transformer = transformerRef.current;
    const stage = stageRef.current;
    if (!transformer || !stage) return;

    // Exclude icon, network-line, and callout elements from transformer — fixed-size
    const fixedIds = new Set(state.elements.filter((el) => el.type === 'icon' || el.type === 'network-line' || el.type === 'circle').map((el) => el.id));
    const selectedNodes = state.selectedIds
      .filter((id) => !fixedIds.has(id))
      .map((id) => stage.findOne(`#${id}`))
      .filter((node): node is Konva.Node => node !== undefined);

    transformer.nodes(selectedNodes);
    transformer.getLayer()?.batchDraw();
  }, [state.selectedIds, state.elements, stageRef]);

  // Bounding box around multi-selected elements
  const groupBounds = useMemo(() => {
    const selectedElements = state.elements.filter((el) => state.selectedIds.includes(el.id));
    if (selectedElements.length < 2) return null;

    const padding = 6;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of selectedElements) {
      const b = getElementBounds(el);
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
      maxX = Math.max(maxX, b.x + b.width);
      maxY = Math.max(maxY, b.y + b.height);
    }
    return {
      x: minX - padding,
      y: minY - padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    };
  }, [state.elements, state.selectedIds]);

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
      case 'network-line':
        return <NetworkLineShape {...props} />;
      default:
        return null;
    }
  };

  return (
    <div ref={containerRef} className={`canvas-container${isConnectorMode ? ' connector-mode' : ''}${isNetworkLineMode ? ' network-line-mode' : ''}`}>
      <div className="canvas-stage-wrapper">
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
          {state.elements.filter((el) => el.type === 'network-line').map(renderElement)}
          {state.connectors.map((c) => (
            <ConnectorLine
              key={c.id}
              connector={c}
              isSelected={state.selectedIds.includes(c.id)}
            />
          ))}
          {state.elements.filter((el) => el.type !== 'circle' && el.type !== 'network-line').map(renderElement)}
          {state.elements.filter((el) => el.type === 'circle').map(renderElement)}
          <Transformer
            ref={transformerRef}
            borderStroke="#4a90d9"
            anchorStroke="#4a90d9"
            anchorSize={8}
            anchorCornerRadius={2}
            rotateEnabled={false}
          />
          {groupBounds && (
            <Rect
              x={groupBounds.x}
              y={groupBounds.y}
              width={groupBounds.width}
              height={groupBounds.height}
              stroke="#4a90d9"
              strokeWidth={1}
              dash={[3, 3]}
              listening={false}
            />
          )}
          {networkLineDraw && (
            <Line
              points={[networkLineDraw.x1, networkLineDraw.y1, networkLineDraw.x2, networkLineDraw.y2]}
              stroke={state.networkLineColor}
              strokeWidth={2}
              dash={[4, 4]}
              listening={false}
            />
          )}
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
    </div>
  );
}
