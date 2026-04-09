import { Group, Circle, Text } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { CALLOUT_CIRCLE, FONT_FAMILY, GRID } from '../constants';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram } from '../state/DiagramContext';

interface CircleCalloutProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function CircleCallout({ element, isSelected }: CircleCalloutProps) {
  const { moveElement, setSelection, state } = useDiagram();

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    moveElement(element.id, snapToGrid(e.target.x(), increment), snapToGrid(e.target.y(), increment));
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (state.tool === 'connector-solid' || state.tool === 'connector-dashed') {
      return; // Let click bubble to stage for connector wiring
    }
    e.cancelBubble = true;
    if (e.evt.shiftKey) {
      const ids = state.selectedIds.includes(element.id)
        ? state.selectedIds.filter((id) => id !== element.id)
        : [...state.selectedIds, element.id];
      setSelection(ids);
    } else {
      setSelection([element.id]);
    }
  };

  return (
    <Group id={element.id} x={element.x} y={element.y} draggable onClick={handleClick} onDragEnd={handleDragEnd}>
      <Circle
        radius={CALLOUT_CIRCLE.RADIUS}
        fill={CALLOUT_CIRCLE.FILL}
      />
      <Text
        text={element.text}
        fontSize={CALLOUT_CIRCLE.FONT_SIZE}
        fontFamily={FONT_FAMILY}
        fontStyle="bold"
        fill={CALLOUT_CIRCLE.TEXT_COLOR}
        align="center"
        verticalAlign="middle"
        width={CALLOUT_CIRCLE.RADIUS * 2}
        height={CALLOUT_CIRCLE.RADIUS * 2}
        offsetX={CALLOUT_CIRCLE.RADIUS}
        offsetY={CALLOUT_CIRCLE.RADIUS}
        listening={false}
      />
      {isSelected && (
        <Circle
          radius={CALLOUT_CIRCLE.RADIUS + 2}
          stroke="#4a90d9"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}
