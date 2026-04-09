import { useEffect, useState } from 'react';
import { Group, Image, Text, Rect, Line } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { COLORS, FONT_FAMILY, GRID } from '../constants';
import { ICONS } from './iconPaths';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram } from '../state/DiagramContext';

const ICON_SCALE = 2;

// Cache loaded images by key to avoid re-creating on every render
const imageCache = new Map<string, HTMLImageElement>();

function useIconImage(iconId: string, viewBox: string, path: string, width: number, height: number, fill: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(() => imageCache.get(iconId) ?? null);

  useEffect(() => {
    if (imageCache.has(iconId)) {
      setImage(imageCache.get(iconId)!);
      return;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}"><path d="${path}" fill="${fill}" fill-rule="evenodd"/></svg>`;
    const img = new window.Image();
    img.onload = () => {
      imageCache.set(iconId, img);
      setImage(img);
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, [iconId, viewBox, path, width, height, fill]);

  return image;
}

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
  const longestWord = label.split(/[\s,]+/).reduce((a, b) => a.length > b.length ? a : b, '');
  const minWordWidth = longestWord.length * 8 + 16;
  const totalWidth = Math.max(scaledWidth, minWordWidth, 80);
  const labelLines = Math.ceil(label.length * 7 / totalWidth) + 1;
  const labelHeight = labelLines * 14 + 4;
  const totalHeight = scaledHeight + labelHeight + 6;

  const iconImage = useIconImage(icon.id, icon.viewBox, icon.path, scaledWidth, scaledHeight, COLORS.ICON_GRAY);

  return (
    <Group id={element.id} x={element.x} y={element.y} draggable onClick={handleClick} onDragEnd={handleDragEnd}>
      {element.stacked && (
        <>
          <Line points={[totalWidth + 10, 10, totalWidth + 10, totalHeight + 10, 10, totalHeight + 10]} stroke={COLORS.GRAY_95} strokeWidth={1} listening={false} />
          <Line points={[totalWidth + 5, 5, totalWidth + 5, totalHeight + 5, 5, totalHeight + 5]} stroke={COLORS.GRAY_95} strokeWidth={1} listening={false} />
        </>
      )}
      <Rect
        width={totalWidth}
        height={totalHeight}
        fill="transparent"
      />
      {iconImage && (
        <Image
          image={iconImage}
          x={(totalWidth - scaledWidth) / 2}
          y={0}
          width={scaledWidth}
          height={scaledHeight}
          listening={false}
        />
      )}
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
