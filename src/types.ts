export type ShapeType = 'rect' | 'circle' | 'icon' | 'text';
export type ConnectorType = 'solid' | 'dashed';
export type ArrowDirection = 'forward' | 'bidirectional' | 'none';
export type FontWeight = 'bold' | 'medium';
export type BoxVariant = 'filled' | 'outlined' | 'gray' | 'white';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface DiagramElement {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  text: string;
  fontSize: number;
  fontWeight: FontWeight;
  textColor: string;
  variant?: BoxVariant;
  iconId?: string;
  groupId?: string | null;
}

export interface Connector {
  id: string;
  fromId: string;
  toId: string;
  lineType: ConnectorType;
  arrowDirection: ArrowDirection;
  strokeWidth: number;
  stroke: string;
  points: number[];
  isElbow: boolean;
}

export interface DiagramState {
  elements: DiagramElement[];
  connectors: Connector[];
  selectedIds: string[];
  canvasHeight: number;
  zoom: number;
  snapEnabled: boolean;
  tool: ToolType;
}

export type ToolType = 'select' | 'connector-solid' | 'connector-dashed' | 'text';

export type DiagramAction =
  | { type: 'ADD_ELEMENT'; element: DiagramElement }
  | { type: 'UPDATE_ELEMENT'; id: string; changes: Partial<DiagramElement> }
  | { type: 'DELETE_ELEMENTS'; ids: string[] }
  | { type: 'MOVE_ELEMENT'; id: string; x: number; y: number }
  | { type: 'ADD_CONNECTOR'; connector: Connector }
  | { type: 'UPDATE_CONNECTOR'; id: string; changes: Partial<Connector> }
  | { type: 'DELETE_CONNECTORS'; ids: string[] }
  | { type: 'SET_SELECTION'; ids: string[] }
  | { type: 'SET_CANVAS_HEIGHT'; height: number }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_SNAP'; enabled: boolean }
  | { type: 'SET_TOOL'; tool: ToolType }
  | { type: 'LOAD_STATE'; state: DiagramState }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export interface HistoryState {
  past: DiagramState[];
  present: DiagramState;
  future: DiagramState[];
}

export interface ExportOptions {
  issueNumber: string;
  productFamily: string;
  description: string;
  date: string;
  format: 'svg' | 'png' | 'both';
}
