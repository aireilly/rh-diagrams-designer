import { Group, Path, Text, Rect } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { COLORS, FONT_FAMILY, GRID } from '../constants';
import { ICONS } from './iconPaths';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram } from '../state/DiagramContext';

interface IconShapeProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function IconShape({ element, isSelected }: IconShapeProps) {
  const { moveElement, setSelection, state } = useDiagram();
  const icon = ICONS.find((i) => i.id === element.iconId);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    moveElement(element.id, snapToGrid(e.target.x(), increment), snapToGrid(e.target.y(), increment));
  };

  const handleClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
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

  if (!icon) return null;

  const labelHeight = 16;
  const totalHeight = icon.height + labelHeight + 4;
  const totalWidth = Math.max(icon.width, 60);

  return (
    <Group id={element.id} x={element.x} y={element.y} draggable onClick={handleClick} onDragEnd={handleDragEnd}>
      <Path
        data={icon.path}
        fill={COLORS.ICON_GRAY}
        x={(totalWidth - icon.width) / 2}
        y={0}
        scaleX={icon.width / parseFloat(icon.viewBox.split(' ')[2])}
        scaleY={icon.height / parseFloat(icon.viewBox.split(' ')[3])}
      />
      <Text
        text={element.text || icon.name}
        y={icon.height + 4}
        width={totalWidth}
        fontSize={12}
        fontFamily={FONT_FAMILY}
        fontStyle="500"
        fill={COLORS.DARK_GRAY}
        align="center"
        listening={false}
      />
      {isSelected && (
        <Rect
          x={-2}
          y={-2}
          width={totalWidth + 4}
          height={totalHeight + 4}
          stroke="#4a90d9"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}
