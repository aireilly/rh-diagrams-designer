import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import { DiagramAction, DiagramState, DiagramElement, Connector } from '../types';
import { historyReducer, createInitialHistoryState } from './historyReducer';

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

  const addElement = useCallback((element: DiagramElement) => {
    dispatch({ type: 'ADD_ELEMENT', element });
  }, []);

  const updateElement = useCallback((id: string, changes: Partial<DiagramElement>) => {
    dispatch({ type: 'UPDATE_ELEMENT', id, changes });
  }, []);

  const deleteSelected = useCallback(() => {
    const ids = history.present.selectedIds;
    if (ids.length === 0) return;
    const connectorIds = history.present.connectors
      .filter((c) => ids.includes(c.fromId) || ids.includes(c.toId))
      .map((c) => c.id);
    if (connectorIds.length > 0) {
      dispatch({ type: 'DELETE_CONNECTORS', ids: connectorIds });
    }
    dispatch({ type: 'DELETE_ELEMENTS', ids });
  }, [history.present.selectedIds, history.present.connectors]);

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
