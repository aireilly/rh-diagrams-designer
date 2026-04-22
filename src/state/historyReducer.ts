import { DiagramState, DiagramAction, HistoryState } from '../types';
import { CANVAS, COLORS } from '../constants';

const STORAGE_KEY = 'rh-diagram-designer-state';

function createInitialDiagramState(): DiagramState {
  return {
    elements: [
      {
        id: 'default-kubernetes',
        type: 'rect',
        x: 10, y: 70, width: 740, height: 510, rotation: 0,
        fill: '', stroke: COLORS.BLUE_50, strokeWidth: 2,
        text: 'Kubernetes', fontSize: 16, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, variant: 'filled', groupId: null,
      },
      {
        id: 'default-gateway',
        type: 'rect',
        x: 205, y: 135, width: 180, height: 80, rotation: 0,
        fill: COLORS.GRAY_20, stroke: COLORS.GRAY_20, strokeWidth: 2,
        text: 'Inference Gateway (Envoy)', fontSize: 12, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'top-left', variant: 'filled', groupId: null,
      },
      {
        id: 'default-body-routing',
        type: 'rect',
        x: 620, y: 80, width: 120, height: 110, rotation: 0,
        fill: COLORS.BLUE_10, stroke: COLORS.BLUE_10, strokeWidth: 2,
        text: 'Body-based routing', fontSize: 12, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'top-left', variant: 'filled', groupId: null,
      },
      {
        id: 'default-scheduler',
        type: 'rect',
        x: 620, y: 220, width: 120, height: 110, rotation: 0,
        fill: COLORS.BLUE_10, stroke: COLORS.BLUE_10, strokeWidth: 2,
        text: 'Inference scheduler', fontSize: 12, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'top-left', variant: 'filled', groupId: null,
      },
      {
        id: 'default-pool',
        type: 'rect',
        x: 30, y: 240, width: 530, height: 270, rotation: 0,
        fill: COLORS.GRAY_20, stroke: COLORS.GRAY_20, strokeWidth: 2,
        text: 'Inference Pool', fontSize: 14, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'top-left', variant: 'gray', groupId: null,
      },
      {
        id: 'default-variant-a',
        type: 'rect',
        x: 45, y: 270, width: 180, height: 110, rotation: 0,
        fill: COLORS.WHITE, stroke: COLORS.WHITE, strokeWidth: 2,
        text: 'Variant A (Prefill)', fontSize: 12, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'top-left', variant: 'outlined', groupId: null,
      },
      {
        id: 'default-vllm-a',
        type: 'rect',
        x: 60, y: 305, width: 90, height: 60, rotation: 0,
        fill: COLORS.BLUE_10, stroke: '', strokeWidth: 0,
        text: 'vLLM', fontSize: 14, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'center', groupId: null, stacked: true,
      },
      {
        id: 'default-autoscaler',
        type: 'rect',
        x: 620, y: 395, width: 120, height: 110, rotation: 0,
        fill: COLORS.BLUE_10, stroke: COLORS.BLUE_10, strokeWidth: 2,
        text: 'Workload variant autoscaler (WVA)', fontSize: 12, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'top-left', variant: 'filled', groupId: null,
      },
      {
        id: 'default-variant-b',
        type: 'rect',
        x: 365, y: 270, width: 180, height: 110, rotation: 0,
        fill: COLORS.WHITE, stroke: COLORS.WHITE, strokeWidth: 2,
        text: 'Variant B (Decode)', fontSize: 12, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'top-left', variant: 'outlined', groupId: null,
      },
      {
        id: 'default-vllm-b',
        type: 'rect',
        x: 380, y: 305, width: 90, height: 60, rotation: 0,
        fill: COLORS.BLUE_10, stroke: COLORS.BLUE_10, strokeWidth: 2,
        text: 'vLLM', fontSize: 14, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'center', groupId: null, stacked: true,
      },
      {
        id: 'default-client',
        type: 'icon',
        x: 265, y: 15, width: 60, height: 66, rotation: 0,
        fill: COLORS.ICON_GRAY, stroke: '', strokeWidth: 0,
        text: 'Client', fontSize: 11, fontWeight: 'medium',
        textColor: COLORS.GRAY_95, iconId: 'physical-client', groupId: null,
      },
      {
        id: 'default-caching',
        type: 'rect',
        x: 40, y: 460, width: 510, height: 40, rotation: 0,
        fill: COLORS.BLUE_10, stroke: COLORS.BLUE_10, strokeWidth: 2,
        text: 'LLM memory stack', fontSize: 12, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'top-left', variant: 'white', groupId: null,
      },
      {
        id: 'default-nodes',
        type: 'rect',
        x: 30, y: 520, width: 530, height: 40, rotation: 0,
        fill: COLORS.GRAY_20, stroke: COLORS.GRAY_20, strokeWidth: 2,
        text: 'Nodes', fontSize: 12, fontWeight: 'bold',
        textColor: COLORS.DARK_GRAY, textPosition: 'top-left', variant: 'white', groupId: null,
      },
      {
        id: 'default-get-text',
        type: 'text',
        x: 305, y: 100, width: 160, height: 24, rotation: 0,
        fill: '', stroke: '', strokeWidth: 0,
        text: 'GET /completions', fontSize: 10, fontWeight: 'medium',
        textColor: COLORS.DARK_GRAY, groupId: null, fontFamily: 'Red Hat Mono',
      },
      {
        id: 'default-callout-1',
        type: 'circle',
        x: 615, y: 215, width: 30, height: 30, rotation: 0,
        fill: COLORS.DARK_GRAY, stroke: '', strokeWidth: 0,
        text: '3', fontSize: 16, fontWeight: 'bold',
        textColor: COLORS.WHITE, groupId: null,
      },
      {
        id: 'default-callout-2',
        type: 'circle',
        x: 615, y: 390, width: 30, height: 30, rotation: 0,
        fill: COLORS.DARK_GRAY, stroke: '', strokeWidth: 0,
        text: '4', fontSize: 16, fontWeight: 'bold',
        textColor: COLORS.WHITE, groupId: null,
      },
      {
        id: 'default-nodes-text',
        type: 'text',
        x: 215, y: 535, width: 160, height: 24, rotation: 0,
        fill: '', stroke: '', strokeWidth: 0,
        text: 'NVIDIA, Google, AMD, intel', fontSize: 12, fontWeight: 'medium',
        textColor: COLORS.DARK_GRAY, groupId: null,
      },
      {
        id: 'default-shared-text',
        type: 'text',
        x: 235, y: 290, width: 160, height: 24, rotation: 0,
        fill: '', stroke: '', strokeWidth: 0,
        text: 'Shared prefix caching', fontSize: 12, fontWeight: 'medium',
        textColor: COLORS.DARK_GRAY, groupId: null,
      },
      {
        id: 'default-nixl-icon',
        type: 'icon',
        x: 265, y: 310, width: 60, height: 71, rotation: 0,
        fill: COLORS.ICON_GRAY, stroke: '', strokeWidth: 0,
        text: 'NIXL, DCN', fontSize: 11, fontWeight: 'medium',
        textColor: COLORS.GRAY_95, iconId: 'physical-gateway', groupId: null,
      },
      {
        id: 'default-callout-3',
        type: 'circle',
        x: 540, y: 130, width: 30, height: 30, rotation: 0,
        fill: COLORS.DARK_GRAY, stroke: '', strokeWidth: 0,
        text: '1', fontSize: 16, fontWeight: 'bold',
        textColor: COLORS.WHITE, groupId: null,
      },
      {
        id: 'default-callout-4',
        type: 'circle',
        x: 540, y: 180, width: 30, height: 30, rotation: 0,
        fill: COLORS.DARK_GRAY, stroke: '', strokeWidth: 0,
        text: '2', fontSize: 16, fontWeight: 'bold',
        textColor: COLORS.WHITE, groupId: null,
      },
      {
        id: 'default-memory-text',
        type: 'text',
        x: 190, y: 475, width: 250, height: 20, rotation: 0,
        fill: '', stroke: '', strokeWidth: 0,
        text: 'LMCache, Dynamo KVBM, or host memory', fontSize: 12, fontWeight: 'medium',
        textColor: COLORS.DARK_GRAY, groupId: null,
      },
    ],
    connectors: [
      {
        id: 'default-conn-1',
        fromId: 'default-gateway', toId: 'default-body-routing',
        lineType: 'solid', arrowDirection: 'forward', strokeWidth: 1, stroke: COLORS.GRAY_95,
        points: [502.5, 150, 502.5, 150],
        fromSide: 'right', toSide: 'left', fromOffset: -25, toOffset: 15,
      },
      {
        id: 'default-conn-2',
        fromId: 'default-gateway', toId: 'default-pool',
        lineType: 'solid', arrowDirection: 'forward', strokeWidth: 1, stroke: COLORS.GRAY_95,
        points: [], fromSide: 'bottom', toSide: 'top',
      },
      {
        id: 'default-conn-3',
        fromId: 'default-pool', toId: 'default-scheduler',
        lineType: 'dashed', arrowDirection: 'forward', strokeWidth: 1, stroke: COLORS.GRAY_95,
        points: [], fromSide: 'right', toSide: 'bottom', fromOffset: -7.5,
      },
      {
        id: 'default-conn-4',
        fromId: 'default-autoscaler', toId: 'default-pool',
        lineType: 'dashed', arrowDirection: 'forward', strokeWidth: 1, stroke: COLORS.GRAY_95,
        points: [], fromSide: 'left', toSide: 'right', toOffset: 7.5,
      },
      {
        id: 'default-conn-5',
        fromId: 'default-client', toId: 'default-gateway',
        lineType: 'solid', arrowDirection: 'forward', strokeWidth: 1, stroke: COLORS.DARK_GRAY,
        points: [], fromSide: 'auto', toSide: 'auto',
      },
      {
        id: 'default-conn-6',
        fromId: 'default-gateway', toId: 'default-scheduler',
        lineType: 'solid', arrowDirection: 'forward', strokeWidth: 1, stroke: COLORS.DARK_GRAY,
        points: [575, 195, 575, 270],
        fromSide: 'auto', toSide: 'auto', fromOffset: 25,
      },
      {
        id: 'default-conn-7',
        fromId: 'default-variant-a', toId: 'default-caching',
        lineType: 'solid', arrowDirection: 'forward', strokeWidth: 1, stroke: COLORS.DARK_GRAY,
        points: [], fromSide: 'bottom', toSide: 'top',
      },
      {
        id: 'default-conn-8',
        fromId: 'default-variant-b', toId: 'default-caching',
        lineType: 'solid', arrowDirection: 'forward', strokeWidth: 1, stroke: COLORS.DARK_GRAY,
        points: [], fromSide: 'bottom', toSide: 'top',
      },
      {
        id: 'default-conn-9',
        fromId: 'default-nixl-icon', toId: 'default-variant-a',
        lineType: 'solid', arrowDirection: 'backward', strokeWidth: 1, stroke: COLORS.DARK_GRAY,
        points: [245, 330, 245, 320],
        fromSide: 'auto', toSide: 'auto', fromOffset: -31,
      },
      {
        id: 'default-conn-10',
        fromId: 'default-variant-b', toId: 'default-nixl-icon',
        lineType: 'solid', arrowDirection: 'backward', strokeWidth: 1, stroke: COLORS.DARK_GRAY,
        points: [345, 320, 345, 330],
        fromSide: 'auto', toSide: 'auto', toOffset: -31,
      },
    ],
    selectedIds: [],
    canvasHeight: CANVAS.DEFAULT_HEIGHT,
    zoom: 1,
    snapEnabled: true,
    tool: 'select',
    networkLineColor: COLORS.PURPLE_50,
    lastCanvasClickPos: null,
  };
}

export function saveStateToStorage(state: DiagramState): void {
  try {
    const { selectedIds: _sel, tool: _tool, networkLineColor: _nlc, lastCanvasClickPos: _lcp, ...persistable } = state;
    void _sel; void _tool; void _nlc; void _lcp;
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

    case 'UPDATE_CONNECTORS': {
      const updateMap = new Map(action.updates.map((u) => [u.id, u.changes]));
      return {
        ...state,
        connectors: state.connectors.map((c) => {
          const changes = updateMap.get(c.id);
          return changes ? { ...c, ...changes } : c;
        }),
      };
    }

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

    case 'SET_LAST_CLICK_POS':
      return { ...state, lastCanvasClickPos: action.pos };

    case 'SEND_TO_FRONT': {
      const ids = new Set(action.ids);
      const rest = state.elements.filter((el) => !ids.has(el.id));
      const moved = state.elements.filter((el) => ids.has(el.id));
      return { ...state, elements: [...rest, ...moved] };
    }

    case 'SEND_TO_BACK': {
      const ids = new Set(action.ids);
      const rest = state.elements.filter((el) => !ids.has(el.id));
      const moved = state.elements.filter((el) => ids.has(el.id));
      return { ...state, elements: [...moved, ...rest] };
    }

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
  'SET_LAST_CLICK_POS',
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
