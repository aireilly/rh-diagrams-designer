import { Arrow, Line } from 'react-konva';
import type Konva from 'konva';
import { Connector, DiagramElement } from '../types';
import { ARROWHEAD, COLORS } from '../constants';
import { useDiagram } from '../state/DiagramContext';

interface ConnectorLineProps {
  connector: Connector;
  isSelected: boolean;
}

function getEdgePoint(
  el: DiagramElement,
  targetX: number,
  targetY: number
): { x: number; y: number } {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;

  if (Math.abs(dx) === 0 && Math.abs(dy) === 0) {
    return { x: cx, y: cy };
  }

  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);
  const hw = el.width / 2;
  const hh = el.height / 2;

  let ix: number, iy: number;

  if (absDx / hw > absDy / hh) {
    ix = cx + (dx > 0 ? hw : -hw);
    iy = cy + (dy * hw) / absDx;
  } else {
    iy = cy + (dy > 0 ? hh : -hh);
    ix = cx + (dx * hh) / absDy;
  }

  return { x: ix, y: iy };
}

export default function ConnectorLine({ connector, isSelected }: ConnectorLineProps) {
  const { state, setSelection } = useDiagram();

  const fromEl = state.elements.find((e) => e.id === connector.fromId);
  const toEl = state.elements.find((e) => e.id === connector.toId);

  if (!fromEl || !toEl) return null;

  const fromCenter = { x: fromEl.x + fromEl.width / 2, y: fromEl.y + fromEl.height / 2 };
  const toCenter = { x: toEl.x + toEl.width / 2, y: toEl.y + toEl.height / 2 };

  const fromEdge = getEdgePoint(fromEl, toCenter.x, toCenter.y);
  const toEdge = getEdgePoint(toEl, fromCenter.x, fromCenter.y);

  // Apply arrowhead padding
  const angle = Math.atan2(toEdge.y - fromEdge.y, toEdge.x - fromEdge.x);
  const padX = Math.cos(angle) * ARROWHEAD.PADDING;
  const padY = Math.sin(angle) * ARROWHEAD.PADDING;

  const endX = toEdge.x - padX;
  const endY = toEdge.y - padY;

  let startX = fromEdge.x;
  let startY = fromEdge.y;

  if (connector.arrowDirection === 'bidirectional') {
    startX = fromEdge.x + padX;
    startY = fromEdge.y + padY;
  }

  const points = connector.isElbow
    ? [startX, startY, startX, endY, endX, endY]
    : [startX, startY, endX, endY];

  const dashEnabled = connector.lineType === 'dashed';
  const dash = dashEnabled ? [2, 2] : undefined;
  const arrowSize = ARROWHEAD.SIZE_X * 5;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setSelection([connector.id]);
  };

  const commonProps = {
    points,
    stroke: connector.stroke || COLORS.DARK_GRAY,
    strokeWidth: connector.strokeWidth,
    dash,
    dashEnabled,
    hitStrokeWidth: 10,
    onClick: handleClick,
  };

  if (connector.arrowDirection === 'none') {
    return (
      <Line
        {...commonProps}
        strokeScaleEnabled={false}
      />
    );
  }

  return (
    <Arrow
      {...commonProps}
      pointerLength={arrowSize}
      pointerWidth={arrowSize}
      fill={connector.stroke || COLORS.DARK_GRAY}
      strokeScaleEnabled={false}
    />
  );
}
