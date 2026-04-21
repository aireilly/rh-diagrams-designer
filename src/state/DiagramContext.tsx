import { createContext, useContext, useReducer, useCallback, useEffect, useRef, type ReactNode } from 'react';
import type Konva from 'konva';
import { DiagramAction, DiagramState, DiagramElement, Connector } from '../types';
import { CANVAS } from '../constants';
import { historyReducer, createInitialHistoryState, saveStateToStorage } from './historyReducer';

interface DiagramContextValue {
  state: DiagramState;
  canUndo: boolean;
  canRedo: boolean;
  dispatch: (action: DiagramAction) => void;
  addElement: (element: DiagramElement) => void;
  updateElement: (id: string, changes: Partial<DiagramElement>) => void;
  deleteSelected: () => void;
  moveElement: (id: string, x: number, y: number) => void;
  moveElements: (moves: { id: string; x: number; y: number }[]) => void;
  addConnector: (connector: Connector) => void;
  setSelection: (ids: string[]) => void;
  undo: () => void;
  redo: () => void;
}

const DiagramContext = createContext<DiagramContextValue | null>(null);

export function DiagramProvider({ children }: { children: ReactNode }) {
  const [history, dispatch] = useReducer(historyReducer, undefined, createInitialHistoryState);

  // Persist state to localStorage on every change
  useEffect(() => {
    saveStateToStorage(history.present);
  }, [history.present]);

  const addElement = useCallback((element: DiagramElement) => {
    dispatch({ type: 'ADD_ELEMENT', element });
  }, []);

  const updateElement = useCallback((id: string, changes: Partial<DiagramElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, changes });
  }, []);

  const deleteSelected = useCallback(() => {
    const ids = history.present.selectedIds;
    if (ids.length === 0) return;

    // Find directly selected connectors
    const selectedConnectorIds = ids.filter((id) =>
      history.present.connectors.some((c) => c.id === id)
    );
    // Find connectors attached to selected elements
    const attachedConnectorIds = history.present.connectors
      .filter((c) => ids.includes(c.fromId) || ids.includes(c.toId))
      .map((c) => c.id);
    const allConnectorIds = [...new Set([...selectedConnectorIds, ...attachedConnectorIds])];

    if (allConnectorIds.length > 0) {
      dispatch({ type: 'DELETE_CONNECTORS', ids: allConnectorIds });
    }

    const elementIds = ids.filter((id) =>
      history.present.elements.some((el) => el.id === id)
    );
    if (elementIds.length > 0) {
      dispatch({ type: 'DELETE_ELEMENTS', ids: elementIds });
    }
  }, [history.present.selectedIds, history.present.connectors, history.present.elements]);

  const moveElement = useCallback((id: string, x: number, y: number) => {
    dispatch({ type: 'MOVE_ELEMENT', id, x, y });
  }, []);

  const moveElements = useCallback((moves: { id: string; x: number; y: number }[]) => {
    dispatch({ type: 'MOVE_ELEMENTS', moves });
  }, []);

  const addConnector = useCallback((connector: Connector) => {
    dispatch({ type: 'ADD_CONNECTOR', connector });
  }, []);

  const setSelection = useCallback((ids: string[]) => {
    dispatch({ type: 'SET_SELECTION', ids });
  }, []);

  const undo = useCallback(() => dispatch({ type: 'UNDO' }), []);
  const redo = useCallback(() => dispatch({ type: 'REDO' }), []);

  const value: DiagramContextValue = {
    state: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    dispatch,
    addElement,
    updateElement,
    deleteSelected,
    moveElement,
    moveElements,
    addConnector,
    setSelection,
    undo,
    redo,
  };

  return <DiagramContext.Provider value={value}>{children}</DiagramContext.Provider>;
}

export function useDiagram(): DiagramContextValue {
  const ctx = useContext(DiagramContext);
  if (!ctx) throw new Error('useDiagram must be used within DiagramProvider');
  return ctx;
}

/**
 * Shared drag handler for group movement.
 * When multiple shapes are selected, dragging one moves them all together.
 * Returns onDragStart, onDragMove handlers and a commitGroupMove function
 * that each shape calls from its own onDragEnd with its snapped final position.
 */
export function useGroupDrag(elementId: string) {
  const { state, moveElements } = useDiagram();
  const dragStartPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  const dragStartNodes = useRef<Map<string, Konva.Node>>(new Map());

  const handleDragStart = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const positions = new Map<string, { x: number; y: number }>();
      const nodes = new Map<string, Konva.Node>();
      const stage = e.target.getStage();

      for (const id of state.selectedIds) {
        const el = state.elements.find((el) => el.id === id);
        if (el) {
          positions.set(id, { x: el.x, y: el.y });
          if (id !== elementId && stage) {
            const node = stage.findOne(`#${id}`);
            if (node) nodes.set(id, node);
          }
        }
      }

      dragStartPositions.current = positions;
      dragStartNodes.current = nodes;
    },
    [elementId, state.selectedIds, state.elements]
  );

  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (!state.selectedIds.includes(elementId) || state.selectedIds.length <= 1) return;

      const startPos = dragStartPositions.current.get(elementId);
      if (!startPos) return;

      const dx = e.target.x() - startPos.x;
      const dy = e.target.y() - startPos.y;

      for (const [id, node] of dragStartNodes.current) {
        const start = dragStartPositions.current.get(id);
        if (start) {
          node.position({ x: start.x + dx, y: start.y + dy });
        }
      }

      e.target.getLayer()?.batchDraw();
    },
    [elementId, state.selectedIds]
  );

  const commitGroupMove = useCallback(
    (snappedX: number, snappedY: number) => {
      if (!state.selectedIds.includes(elementId) || state.selectedIds.length <= 1) {
        moveElements([{ id: elementId, x: snappedX, y: snappedY }]);
        return;
      }

      const startPos = dragStartPositions.current.get(elementId);
      if (!startPos) {
        moveElements([{ id: elementId, x: snappedX, y: snappedY }]);
        return;
      }

      const dx = snappedX - startPos.x;
      const dy = snappedY - startPos.y;

      const moves: { id: string; x: number; y: number }[] = [];
      for (const id of state.selectedIds) {
        const start = dragStartPositions.current.get(id);
        if (start) {
          moves.push({ id, x: start.x + dx, y: start.y + dy });
        }
      }

      moveElements(moves);
    },
    [elementId, state.selectedIds, moveElements]
  );

  return { handleDragStart, handleDragMove, commitGroupMove };
}

/**
 * Shared click handler for all canvas shapes.
 * - Connector mode: returns early so click bubbles to Stage for wiring.
 * - Normal mode: handles selection with shift-toggle and overlap cycling.
 */
export function useShapeClick(elementId: string) {
  const { setSelection, state } = useDiagram();

  return useCallback(
    (e: import('konva/lib/Node').KonvaEventObject<MouseEvent>) => {
      if (state.tool === 'connector-solid' || state.tool === 'connector-dashed') {
        return; // Let click bubble to Stage for connector wiring
      }
      e.cancelBubble = true;

      // Expand clicked element to its group members
      const clickedEl = state.elements.find((el) => el.id === elementId);
      const groupId = clickedEl?.groupId;
      const groupIds = groupId
        ? state.elements.filter((el) => el.groupId === groupId).map((el) => el.id)
        : [elementId];

      if (e.evt.shiftKey) {
        const allAlreadySelected = groupIds.every((id) => state.selectedIds.includes(id));
        const ids = allAlreadySelected
          ? state.selectedIds.filter((id) => !groupIds.includes(id))
          : [...new Set([...state.selectedIds, ...groupIds])];
        setSelection(ids);
      } else if (state.selectedIds.length === 1 && state.selectedIds[0] === elementId && !groupId) {
        // Already sole selection (ungrouped) — cycle to next overlapping element
        const stage = e.target.getStage();
        const pointer = stage?.getPointerPosition();
        if (pointer) {
          const x = pointer.x / state.zoom - CANVAS.STAGE_PADDING;
          const y = pointer.y / state.zoom - CANVAS.STAGE_PADDING;
          const overlapping = state.elements.filter((el) =>
            x >= el.x && x <= el.x + el.width &&
            y >= el.y && y <= el.y + el.height
          );
          if (overlapping.length > 1) {
            const currentIndex = overlapping.findIndex((el) => el.id === elementId);
            const nextIndex = (currentIndex + 1) % overlapping.length;
            setSelection([overlapping[nextIndex].id]);
          }
        }
      } else {
        setSelection(groupIds);
      }
    },
    [elementId, setSelection, state.tool, state.selectedIds, state.elements, state.zoom]
  );
}
