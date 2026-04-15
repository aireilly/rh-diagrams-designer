import { useEffect, useState } from 'react';
import { Group, Image, Text, Rect } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { COLORS, FONT_FAMILY, GRID } from '../constants';
import { ICONS } from './iconPaths';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram, useShapeClick, useGroupDrag } from '../state/DiagramContext';

// Cache loaded images by key to avoid re-creating on every render
const imageCache = new Map<string, HTMLImageElement>();

function useIconImage(iconId: string, viewBox: string, svgContent: string, width: number, height: number) {
  const [image, setImage] = useState<HTMLImageElement | null>(() => imageCache.get(iconId) ?? null);

  useEffect(() => {
    if (imageCache.has(iconId)) {
      setImage(imageCache.get(iconId)!);
      return;
    }
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">${svgContent}</svg>`;
    const img = new window.Image();
    img.onload = () => {
      imageCache.set(iconId, img);
      setImage(img);
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  }, [iconId, viewBox, svgContent, width, height]);

  return image;
}

interface IconShapeProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function IconShape({ element, isSelected }: IconShapeProps) {
  const { state } = useDiagram();
  const handleClick = useShapeClick(element.id);
  const { handleDragStart, handleDragMove, commitGroupMove } = useGroupDrag(element.id);
  const icon = ICONS.find((i) => i.id === element.iconId);

  const iconWidth = icon?.width ?? 40;
  const iconHeight = icon?.height ?? 32;
  const iconImage = useIconImage(
    icon?.id ?? '',
    icon?.viewBox ?? '0 0 40 32',
    icon?.svgContent ?? '',
    iconWidth,
    iconHeight,
  );

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    commitGroupMove(snapToGrid(e.target.x(), increment), snapToGrid(e.target.y(), increment));
  };

  if (!icon) return null;

  const label = element.text || icon.name;
  const longestWord = label.split(/[\s,]+/).reduce((a, b) => a.length > b.length ? a : b, '');
  const minWordWidth = longestWord.length * 6.5 + 12;
  const totalWidth = Math.max(iconWidth, minWordWidth, 60);
  const labelLines = Math.ceil(label.length * 5.5 / totalWidth) + 1;
  const labelHeight = labelLines * 13 + 4;
  const totalHeight = iconHeight + labelHeight + 4;

  return (
    <Group id={element.id} x={element.x} y={element.y} draggable onClick={handleClick} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
      <Rect
        width={totalWidth}
        height={totalHeight}
        fill="transparent"
      />
      {iconImage && (
        <Image
          image={iconImage}
          x={(totalWidth - iconWidth) / 2}
          y={0}
          width={iconWidth}
          height={iconHeight}
          listening={false}
        />
      )}
      <Text
        text={label}
        y={iconHeight + 4}
        width={totalWidth}
        fontSize={11}
        fontFamily={FONT_FAMILY}
        fontStyle="500"
        fill={COLORS.GRAY_95}
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
