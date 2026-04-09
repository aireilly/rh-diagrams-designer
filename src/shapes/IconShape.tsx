import { Group, Shape, Text, Rect } from 'react-konva';
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
      return;
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
  const label = element.text || icon.name;
  // Find the longest word to set minimum width — prevents mid-word breaks
  const longestWord = label.split(/[\s,]+/).reduce((a, b) => a.length > b.length ? a : b, '');
  const minWordWidth = longestWord.length * 8 + 16;
  const totalWidth = Math.max(scaledWidth, minWordWidth, 80);
  const labelLines = Math.ceil(label.length * 7 / totalWidth) + 1;
  const labelHeight = labelLines * 14 + 4;
  const totalHeight = scaledHeight + labelHeight + 6;

  const vbW = parseFloat(icon.viewBox.split(' ')[2]);
  const vbH = parseFloat(icon.viewBox.split(' ')[3]);

  return (
    <Group id={element.id} x={element.x} y={element.y} draggable onClick={handleClick} onDragEnd={handleDragEnd}>
      {element.stacked && (
        <>
          <Rect x={10} y={10} width={totalWidth} height={totalHeight} fill="none" stroke={COLORS.GRAY_95} strokeWidth={1} listening={false} />
          <Rect x={5} y={5} width={totalWidth} height={totalHeight} fill="none" stroke={COLORS.GRAY_95} strokeWidth={1} listening={false} />
        </>
      )}
      <Rect
        width={totalWidth}
        height={totalHeight}
        fill="transparent"
      />
      <Shape
        x={(totalWidth - scaledWidth) / 2}
        y={0}
        width={scaledWidth}
        height={scaledHeight}
        sceneFunc={(ctx) => {
          const nativeCtx = (ctx as unknown as { _context: CanvasRenderingContext2D })._context;
          nativeCtx.save();
          nativeCtx.scale(scaledWidth / vbW, scaledHeight / vbH);
          const p = new Path2D(icon.path);
          nativeCtx.fillStyle = COLORS.ICON_GRAY;
          nativeCtx.fill(p, 'evenodd');
          nativeCtx.restore();
        }}
        listening={false}
      />
      <Text
        text={label}
        y={scaledHeight + 6}
        width={totalWidth}
        fontSize={12}
        fontFamily={FONT_FAMILY}
        fontStyle="500"
        fill={COLORS.DARK_GRAY}
        align="center"
        wrap="word"
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
