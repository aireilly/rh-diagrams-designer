import { Group, Line, Rect } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { GRID } from '../constants';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram, useShapeClick, useGroupDrag } from '../state/DiagramContext';

const HIT_PADDING = 6;

interface NetworkLineShapeProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function NetworkLineShape({ element, isSelected }: NetworkLineShapeProps) {
  const { state } = useDiagram();
  const handleClick = useShapeClick(element.id);
  const { handleDragStart, handleDragMove, commitGroupMove } = useGroupDrag(element.id);

  const isHorizontal = element.height === 0;
  const lineLength = isHorizontal ? element.width : element.height;

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    let newX = snapToGrid(e.target.x(), increment);
    let newY = snapToGrid(e.target.y(), increment);

    const otherNetworkLines = state.elements.filter(
      (el) => el.type === 'network-line' && el.id !== element.id
    );

    if (isHorizontal) {
      for (const nl of otherNetworkLines) {
        if (nl.height === 0 && Math.abs(newY - nl.y) <= GRID.MINOR) {
          newY = nl.y;
          break;
        }
      }
    } else {
      for (const nl of otherNetworkLines) {
        if (nl.width === 0 && Math.abs(newX - nl.x) <= GRID.MINOR) {
          newX = nl.x;
          break;
        }
      }
    }

    commitGroupMove(newX, newY);
  };

  const points = isHorizontal
    ? [0, 0, lineLength, 0]
    : [0, 0, 0, lineLength];

  return (
    <Group
      id={element.id}
      x={element.x}
      y={element.y}
      draggable
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <Rect
        x={isHorizontal ? 0 : -HIT_PADDING}
        y={isHorizontal ? -HIT_PADDING : 0}
        width={isHorizontal ? lineLength : HIT_PADDING * 2}
        height={isHorizontal ? HIT_PADDING * 2 : lineLength}
        fill="transparent"
      />
      <Line
        points={points}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        listening={false}
      />
      {isSelected && (
        <Rect
          x={isHorizontal ? -2 : -HIT_PADDING}
          y={isHorizontal ? -HIT_PADDING : -2}
          width={isHorizontal ? lineLength + 4 : HIT_PADDING * 2}
          height={isHorizontal ? HIT_PADDING * 2 : lineLength + 4}
          stroke="#4a90d9"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}
