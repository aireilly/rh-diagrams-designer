import { DiagramState, DiagramAction, HistoryState } from '../types';
import { CANVAS, COLORS } from '../constants';

const STORAGE_KEY = 'rh-diagram-designer-state';

function createInitialDiagramState(): DiagramState {
  return {
    elements: [],
    connectors: [],
    selectedIds: [],
    canvasHeight: CANVAS.DEFAULT_HEIGHT,
    zoom: 1,
    snapEnabled: true,
    tool: 'select',
    networkLineColor: COLORS.PURPLE_50,
  };
}

export function saveStateToStorage(state: DiagramState): void {
  try {
    const { selectedIds: _sel, tool: _tool, networkLineColor: _nlc, ...persistable } = state;
    void _sel; void _tool; void _nlc;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

function loadStateFromStorage(): DiagramState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    return {
      ...createInitialDiagramState(),
      ...saved,
      selectedIds: [],
      tool: 'select',
    };
  } catch {
    return null;
  }
}

export function createInitialHistoryState(): HistoryState {
  return {
    past: [],
    present: loadStateFromStorage() || createInitialDiagramState(),
    future: [],
  };
}

function diagramReducer(state: DiagramState, action: DiagramAction): DiagramState {
  switch (action.type) {
    case 'ADD_ELEMENT':
      return { ...state, elements: [...state.elements, action.element] };

    case 'UPDATE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, ...action.changes } : el
        ),
      };

    case 'DELETE_ELEMENTS':
      return {
        ...state,
        elements: state.elements.filter((el) => !action.ids.includes(el.id)),
        selectedIds: state.selectedIds.filter((id) => !action.ids.includes(id)),
      };

    case 'MOVE_ELEMENT':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.id === action.id ? { ...el, x: action.x, y: action.y } : el
        ),
      };

    case 'MOVE_ELEMENTS': {
      const moveMap = new Map(action.moves.map((m) => [m.id, m]));
      return {
        ...state,
        elements: state.elements.map((el) => {
          const move = moveMap.get(el.id);
          return move ? { ...el, x: move.x, y: move.y } : el;
        }),
      };
    }

    case 'ADD_CONNECTOR':
      return { ...state, connectors: [...state.connectors, action.connector] };

    case 'UPDATE_CONNECTOR':
      return {
        ...state,
        connectors: state.connectors.map((c) =>
          c.id === action.id ? { ...c, ...action.changes } : c
        ),
      };

    case 'DELETE_CONNECTORS':
      return {
        ...state,
        connectors: state.connectors.filter((c) => !action.ids.includes(c.id)),
      };

    case 'GROUP_ELEMENTS':
      return {
        ...state,
        elements: state.elements.map((el) =>
          action.ids.includes(el.id) ? { ...el, groupId: action.groupId } : el
        ),
      };

    case 'UNGROUP_ELEMENTS':
      return {
        ...state,
        elements: state.elements.map((el) =>
          el.groupId === action.groupId ? { ...el, groupId: null } : el
        ),
      };

    case 'SET_SELECTION':
      return { ...state, selectedIds: action.ids };

    case 'SET_CANVAS_HEIGHT':
      return { ...state, canvasHeight: action.height };

    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom };

    case 'SET_SNAP':
      return { ...state, snapEnabled: action.enabled };

    case 'SET_TOOL':
      return { ...state, tool: action.tool };

    case 'SET_NETWORK_LINE_COLOR':
      return { ...state, networkLineColor: action.color };

    case 'LOAD_STATE':
      return action.state;

    default:
      return state;
  }
}

const NON_HISTORY_ACTIONS: DiagramAction['type'][] = [
  'SET_SELECTION',
  'SET_ZOOM',
  'SET_SNAP',
  'SET_TOOL',
  'SET_NETWORK_LINE_COLOR',
];

export function historyReducer(state: HistoryState, action: DiagramAction): HistoryState {
  if (action.type === 'UNDO') {
    if (state.past.length === 0) return state;
    const previous = state.past[state.past.length - 1];
    return {
      past: state.past.slice(0, -1),
      present: previous,
      future: [state.present, ...state.future],
    };
  }

  if (action.type === 'REDO') {
    if (state.future.length === 0) return state;
    const next = state.future[0];
    return {
      past: [...state.past, state.present],
      present: next,
      future: state.future.slice(1),
    };
  }

  const newPresent = diagramReducer(state.present, action);

  if (NON_HISTORY_ACTIONS.includes(action.type)) {
    return { ...state, present: newPresent };
  }

  return {
    past: [...state.past, state.present],
    present: newPresent,
    future: [],
  };
}
