import { Arrow, Line } from 'react-konva';
import type Konva from 'konva';
import { AnchorSide, Connector, DiagramElement } from '../types';
import { ARROWHEAD, COLORS } from '../constants';
import { useDiagram } from '../state/DiagramContext';

interface ConnectorLineProps {
  connector: Connector;
  isSelected: boolean;
}

function getAnchorPoint(
  el: DiagramElement,
  side: AnchorSide,
  otherEl: DiagramElement
): { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' } {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;

  if (side === 'auto') {
    const ocx = otherEl.x + otherEl.width / 2;
    const ocy = otherEl.y + otherEl.height / 2;
    const dx = ocx - cx;
    const dy = ocy - cy;

    if (Math.abs(dx) > Math.abs(dy)) {
      side = dx > 0 ? 'right' : 'left';
    } else {
      side = dy > 0 ? 'bottom' : 'top';
    }
  }

  switch (side) {
    case 'top':
      return { x: cx, y: el.y, dir: 'up' };
    case 'bottom':
      return { x: cx, y: el.y + el.height, dir: 'down' };
    case 'left':
      return { x: el.x, y: cy, dir: 'left' };
    case 'right':
      return { x: el.x + el.width, y: cy, dir: 'right' };
  }
}

const STUB_LENGTH = 20;

function buildOrthogonalPath(
  from: { x: number; y: number; dir: string },
  to: { x: number; y: number; dir: string }
): number[] {
  // Extend stub segments out from each anchor
  const s = STUB_LENGTH;
  let sx = from.x, sy = from.y;
  let ex = to.x, ey = to.y;

  if (from.dir === 'right') sx += s;
  else if (from.dir === 'left') sx -= s;
  else if (from.dir === 'down') sy += s;
  else if (from.dir === 'up') sy -= s;

  if (to.dir === 'right') ex += s;
  else if (to.dir === 'left') ex -= s;
  else if (to.dir === 'down') ey += s;
  else if (to.dir === 'up') ey -= s;

  const isFromHorizontal = from.dir === 'left' || from.dir === 'right';
  const isToHorizontal = to.dir === 'left' || to.dir === 'right';

  const points = [from.x, from.y];

  if (isFromHorizontal && isToHorizontal) {
    // Both exit horizontally: route via midpoint X, or if stubs don't cross, use midpoint Y
    const midX = (sx + ex) / 2;
    points.push(midX, from.y);
    points.push(midX, to.y);
  } else if (!isFromHorizontal && !isToHorizontal) {
    // Both exit vertically: route via midpoint Y
    const midY = (sy + ey) / 2;
    points.push(from.x, midY);
    points.push(to.x, midY);
  } else if (isFromHorizontal && !isToHorizontal) {
    // From exits horizontally, To exits vertically
    points.push(sx, from.y);
    points.push(sx, ey);
    points.push(to.x, ey);
  } else {
    // From exits vertically, To exits horizontally
    points.push(from.x, sy);
    points.push(ex, sy);
    points.push(ex, to.y);
  }

  points.push(to.x, to.y);

  return points;
}

export default function ConnectorLine({ connector, isSelected }: ConnectorLineProps) {
  const { state, setSelection } = useDiagram();

  const fromEl = state.elements.find((e) => e.id === connector.fromId);
  const toEl = state.elements.find((e) => e.id === connector.toId);

  if (!fromEl || !toEl) return null;

  const from = getAnchorPoint(fromEl, connector.fromSide || 'auto', toEl);
  const to = getAnchorPoint(toEl, connector.toSide || 'auto', fromEl);

  const points = buildOrthogonalPath(from, to);

  const dashEnabled = connector.lineType === 'dashed';
  const dash = dashEnabled ? [4, 4] : undefined;
  const arrowSize = ARROWHEAD.SIZE_X * 5;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    setSelection([connector.id]);
  };

  const commonProps = {
    points,
    stroke: isSelected ? '#4a90d9' : (connector.stroke || COLORS.DARK_GRAY),
    strokeWidth: isSelected ? 2 : connector.strokeWidth,
    dash,
    dashEnabled,
    hitStrokeWidth: 12,
    onClick: handleClick,
  };

  const color = isSelected ? '#4a90d9' : (connector.stroke || COLORS.DARK_GRAY);
  const arrowProps = {
    pointerLength: arrowSize,
    pointerWidth: arrowSize,
    fill: color,
    strokeScaleEnabled: false,
  };

  if (connector.arrowDirection === 'none') {
    return <Line {...commonProps} strokeScaleEnabled={false} />;
  }

  if (connector.arrowDirection === 'backward') {
    return <Arrow {...commonProps} {...arrowProps} points={[...points].reverse()} />;
  }

  if (connector.arrowDirection === 'bidirectional') {
    return (
      <>
        <Arrow {...commonProps} {...arrowProps} />
        <Arrow {...commonProps} {...arrowProps} points={[...points].reverse()} />
      </>
    );
  }

  // forward
  return <Arrow {...commonProps} {...arrowProps} />;
}
