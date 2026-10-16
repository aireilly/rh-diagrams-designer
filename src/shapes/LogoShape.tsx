import { useEffect, useRef, useState } from 'react';
import { Group, Image, Rect } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { GRID } from '../constants';
import { getLogo, loadLogoImage } from './logoDefs';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram, useShapeClick, useGroupDrag } from '../state/DiagramContext';

interface LogoShapeProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function LogoShape({ element, isSelected }: LogoShapeProps) {
  const { updateElement, state } = useDiagram();
  const handleClick = useShapeClick(element.id);
  const { handleDragStart, handleDragMove, commitGroupMove } = useGroupDrag(element.id);
  const groupRef = useRef<Konva.Group>(null);
  const logo = getLogo(element.logoId);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!logo) return;
    let cancelled = false;
    loadLogoImage(logo).then((img) => { if (!cancelled) setImage(img); }).catch(() => {});
    return () => { cancelled = true; };
  }, [logo]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    commitGroupMove(snapToGrid(e.target.x(), increment), snapToGrid(e.target.y(), increment));
  };

  // Logos always keep their aspect ratio; width drives height
  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node || !logo) return;
    const scaleX = node.scaleX();
    node.scaleX(1);
    node.scaleY(1);
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    const width = Math.max(20, Math.round(element.width * scaleX));
    updateElement(element.id, {
      x: snapToGrid(node.x(), increment),
      y: snapToGrid(node.y(), increment),
      width,
      height: Math.round((width * logo.naturalHeight) / logo.naturalWidth),
    });
  };

  if (!logo) return null;

  return (
    <Group
      ref={groupRef}
      id={element.id}
      x={element.x}
      y={element.y}
      draggable
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      <Rect width={element.width} height={element.height} fill="transparent" />
      {image && (
        <Image image={image} width={element.width} height={element.height} listening={false} />
      )}
      {isSelected && (
        <Rect
          x={-2}
          y={-2}
          width={element.width + 4}
          height={element.height + 4}
          stroke="#4a90d9"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}
