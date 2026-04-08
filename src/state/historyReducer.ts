import { DiagramState, DiagramAction, HistoryState } from '../types';
import { CANVAS } from '../constants';

function createInitialDiagramState(): DiagramState {
  return {
    elements: [],
    connectors: [],
    selectedIds: [],
    canvasHeight: CANVAS.DEFAULT_HEIGHT,
    zoom: 1,
    snapEnabled: true,
    tool: 'select',
  };
}

export function createInitialHistoryState(): HistoryState {
  return {
    past: [],
    present: createInitialDiagramState(),
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
