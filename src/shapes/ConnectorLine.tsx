import { Arrow, Circle, Line } from 'react-konva';
import type Konva from 'konva';
import { AnchorSide, Connector, DiagramElement } from '../types';
import { ARROWHEAD, COLORS, GRID } from '../constants';
import { useDiagram } from '../state/DiagramContext';
import { getElementBounds } from '../utils/elementBounds';
import { ICONS } from './iconPaths';
import { snapToGrid } from '../utils/snapGrid';

interface ConnectorLineProps {
  connector: Connector;
  isSelected: boolean;
}

function getAnchorPoint(
  el: DiagramElement,
  side: AnchorSide,
  otherEl: DiagramElement,
  offset = 0
): { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' } {
  const bounds = getElementBounds(el);
  const otherBounds = getElementBounds(otherEl);
  const cx = bounds.x + bounds.width / 2;
  let cy = bounds.y + bounds.height / 2;

  if (el.type === 'icon' && el.iconId) {
    const icon = ICONS.find((i) => i.id === el.iconId);
    if (icon) {
      const textTop = icon.height + 4;
      cy = bounds.y + textTop + (bounds.height - textTop) / 2;
    }
  }

  if (side === 'auto') {
    const ocx = otherBounds.x + otherBounds.width / 2;
    const ocy = otherBounds.y + otherBounds.height / 2;
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
      return { x: cx + offset, y: bounds.y, dir: 'up' };
    case 'bottom':
      return { x: cx + offset, y: bounds.y + bounds.height, dir: 'down' };
    case 'left':
      return { x: bounds.x, y: cy + offset, dir: 'left' };
    case 'right':
      return { x: bounds.x + bounds.width, y: cy + offset, dir: 'right' };
  }
}

const STUB_LENGTH = 20;
const HANDLE_RADIUS = 4;

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
  const { state, setSelection, dispatch } = useDiagram();

  const fromEl = state.elements.find((e) => e.id === connector.fromId);
  const toEl = state.elements.find((e) => e.id === connector.toId);

  if (!fromEl || !toEl) return null;

  const from = getAnchorPoint(fromEl, connector.fromSide || 'auto', toEl, connector.fromOffset || 0);
  const to = getAnchorPoint(toEl, connector.toSide || 'auto', fromEl, connector.toOffset || 0);

  const points = connector.points && connector.points.length >= 4
    ? [from.x, from.y, ...connector.points, to.x, to.y]
    : buildOrthogonalPath(from, to);

  const dashEnabled = connector.lineType === 'dashed';
  const dash = dashEnabled ? [4, 4] : undefined;
  const arrowSize = ARROWHEAD.SIZE_X * 5;

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    if (e.evt.shiftKey) {
      const alreadySelected = state.selectedIds.includes(connector.id);
      const ids = alreadySelected
        ? state.selectedIds.filter((id) => id !== connector.id)
        : [...state.selectedIds, connector.id];
      setSelection(ids);
    } else {
      setSelection([connector.id]);
    }
  };

  const color = isSelected ? '#4a90d9' : (connector.stroke || COLORS.DARK_GRAY);

  const commonProps = {
    points,
    stroke: color,
    strokeWidth: isSelected ? 2 : connector.strokeWidth,
    dash,
    dashEnabled,
    hitStrokeWidth: 12,
    onClick: handleClick,
    perfectDrawEnabled: false,
  };

  const arrowProps = {
    pointerLength: arrowSize,
    pointerWidth: arrowSize,
    fill: color,
    strokeScaleEnabled: false,
  };

  const reversedPoints: number[] = [];
  for (let i = points.length - 2; i >= 0; i -= 2) {
    reversedPoints.push(points[i], points[i + 1]);
  }

  let lineElement: React.ReactNode;
  if (connector.arrowDirection === 'none') {
    lineElement = <Line {...commonProps} strokeScaleEnabled={false} />;
  } else if (connector.arrowDirection === 'backward') {
    lineElement = <Arrow {...commonProps} {...arrowProps} points={reversedPoints} />;
  } else if (connector.arrowDirection === 'bidirectional') {
    lineElement = (
      <>
        <Arrow {...commonProps} {...arrowProps} />
        <Arrow {...commonProps} {...arrowProps} points={reversedPoints} />
      </>
    );
  } else {
    lineElement = <Arrow {...commonProps} {...arrowProps} />;
  }

  const handles: React.ReactNode[] = [];
  if (isSelected) {
    const numPairs = points.length / 2;
    for (let seg = 1; seg < numPairs - 2; seg++) {
      const x1 = points[seg * 2];
      const y1 = points[seg * 2 + 1];
      const x2 = points[(seg + 1) * 2];
      const y2 = points[(seg + 1) * 2 + 1];
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const isHorizontal = Math.abs(y1 - y2) < 1;
      const segIdx = seg;

      handles.push(
        <Circle
          key={`seg-${segIdx}`}
          x={midX}
          y={midY}
          radius={HANDLE_RADIUS}
          fill="#4a90d9"
          stroke="#ffffff"
          strokeWidth={1}
          draggable
          onClick={(e: Konva.KonvaEventObject<MouseEvent>) => {
            e.cancelBubble = true;
          }}
          onMouseEnter={(e: Konva.KonvaEventObject<MouseEvent>) => {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = isHorizontal ? 'ns-resize' : 'ew-resize';
          }}
          onMouseLeave={(e: Konva.KonvaEventObject<MouseEvent>) => {
            const stage = e.target.getStage();
            if (stage) stage.container().style.cursor = 'default';
          }}
          onDragMove={(e: Konva.KonvaEventObject<DragEvent>) => {
            if (isHorizontal) {
              e.target.x(midX);
            } else {
              e.target.y(midY);
            }
          }}
          onDragEnd={(e: Konva.KonvaEventObject<DragEvent>) => {
            const newPoints = [...points];
            const increment = state.snapEnabled ? GRID.MINOR : 1;
            if (isHorizontal) {
              const newY = snapToGrid(e.target.y(), increment);
              newPoints[segIdx * 2 + 1] = newY;
              newPoints[(segIdx + 1) * 2 + 1] = newY;
            } else {
              const newX = snapToGrid(e.target.x(), increment);
              newPoints[segIdx * 2] = newX;
              newPoints[(segIdx + 1) * 2] = newX;
            }
            dispatch({
              type: 'UPDATE_CONNECTOR',
              id: connector.id,
              changes: { points: newPoints.slice(2, -2) },
            });
          }}
        />
      );
    }
  }

  return (
    <>
      {lineElement}
      {handles}
    </>
  );
}
