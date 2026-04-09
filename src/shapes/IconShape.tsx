import { Group, Path, Text, Rect } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { COLORS, FONT_FAMILY, GRID } from '../constants';
import { ICONS } from './iconPaths';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram } from '../state/DiagramContext';

const ICON_SCALE = 2;

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

  if (!icon) return null;

  const scaledWidth = icon.width * ICON_SCALE;
  const scaledHeight = icon.height * ICON_SCALE;
  const labelHeight = 20;
  const totalHeight = scaledHeight + labelHeight + 4;
  const totalWidth = Math.max(scaledWidth, 60);

  const vbW = parseFloat(icon.viewBox.split(' ')[2]);
  const vbH = parseFloat(icon.viewBox.split(' ')[3]);

  return (
    <Group id={element.id} x={element.x} y={element.y} draggable onClick={handleClick} onDragEnd={handleDragEnd}>
      {/* Invisible hit area covering the entire icon + label */}
      <Rect
        width={totalWidth}
        height={totalHeight}
        fill="transparent"
      />
      <Path
        data={icon.path}
        fill={COLORS.ICON_GRAY}
        x={(totalWidth - scaledWidth) / 2}
        y={0}
        scaleX={(scaledWidth) / vbW}
        scaleY={(scaledHeight) / vbH}
        listening={false}
      />
      <Text
        text={element.text || icon.name}
        y={scaledHeight + 4}
        width={totalWidth}
        fontSize={14}
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
