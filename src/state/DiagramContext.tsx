import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import { DiagramAction, DiagramState, DiagramElement, Connector } from '../types';
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
          const x = pointer.x / state.zoom;
          const y = pointer.y / state.zoom;
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
