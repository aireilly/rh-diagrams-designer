import { useRef } from 'react';
import { Group, Rect, Text, Line } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement, TextPosition } from '../types';
import { COLORS, FONT_FAMILY, GRID } from '../constants';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram, useShapeClick, useGroupDrag } from '../state/DiagramContext';

function textAlign(pos?: TextPosition): string {
  if (!pos || pos === 'top-left' || pos === 'bottom-left') return 'left';
  if (pos === 'top-right' || pos === 'bottom-right') return 'right';
  return 'center';
}

function textVAlign(pos?: TextPosition): string {
  if (!pos || pos === 'top-left' || pos === 'top-right') return 'top';
  if (pos === 'bottom-left' || pos === 'bottom-right') return 'bottom';
  return 'middle';
}

interface RectShapeProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function RectShape({ element, isSelected }: RectShapeProps) {
  const { updateElement, state } = useDiagram();
  const handleClick = useShapeClick(element.id);
  const { handleDragStart, handleDragMove, commitGroupMove } = useGroupDrag(element.id);
  const groupRef = useRef<Konva.Group>(null);
  const textRef = useRef<Konva.Text>(null);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const increment = state.snapEnabled ? GRID.MINOR : 1;
    const x = snapToGrid(e.target.x(), increment);
    const y = snapToGrid(e.target.y(), increment);
    commitGroupMove(x, y);
  };

  const handleTransformEnd = () => {
    const node = groupRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const increment = state.snapEnabled ? GRID.MAJOR : 1;
    updateElement(element.id, {
      x: snapToGrid(node.x(), state.snapEnabled ? GRID.MINOR : 1),
      y: snapToGrid(node.y(), state.snapEnabled ? GRID.MINOR : 1),
      width: snapToGrid(Math.max(40, element.width * scaleX), increment),
      height: snapToGrid(Math.max(20, element.height * scaleY), increment),
    });
  };

  const handleDblClick = () => {
    const textNode = textRef.current;
    if (!textNode) return;
    const stage = textNode.getStage();
    if (!stage) return;

    const textPosition = textNode.getAbsolutePosition();
    const stageBox = stage.container().getBoundingClientRect();

    const textarea = document.createElement('textarea');
    document.body.appendChild(textarea);

    textarea.value = element.text;
    textarea.style.position = 'absolute';
    textarea.style.top = `${stageBox.top + textPosition.y * state.zoom}px`;
    textarea.style.left = `${stageBox.left + textPosition.x * state.zoom}px`;
    textarea.style.width = `${element.width * state.zoom}px`;
    textarea.style.height = `${element.height * state.zoom}px`;
    textarea.style.fontSize = `${element.fontSize * state.zoom}px`;
    textarea.style.fontFamily = FONT_FAMILY;
    textarea.style.textAlign = textAlign(element.textPosition);
    textarea.style.border = '2px solid #4a90d9';
    textarea.style.padding = '4px';
    textarea.style.margin = '0';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'white';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.zIndex = '1000';

    textarea.focus();

    const finishEditing = () => {
      updateElement(element.id, { text: textarea.value });
      document.body.removeChild(textarea);
    };

    textarea.addEventListener('blur', finishEditing);
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || (e.key === 'Enter' && !e.shiftKey)) {
        textarea.blur();
      }
    });
  };

  return (
    <Group
      ref={groupRef}
      id={element.id}
      x={element.x}
      y={element.y}
      draggable
      onClick={handleClick}
      onDblClick={handleDblClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
    >
      {element.stacked && (
        <>
          <Line points={[element.width + 10, 10, element.width + 10, element.height + 10, 10, element.height + 10]} stroke={COLORS.GRAY_95} strokeWidth={1} listening={false} />
          <Line points={[element.width + 5, 5, element.width + 5, element.height + 5, 5, element.height + 5]} stroke={COLORS.GRAY_95} strokeWidth={1} listening={false} />
        </>
      )}
      <Rect
        width={element.width}
        height={element.height}
        fill={element.fill || undefined}
        stroke={element.stroke || undefined}
        strokeWidth={element.strokeWidth}
        cornerRadius={element.cornerRadius || 0}
      />
      <Text
        ref={textRef}
        text={element.text}
        width={element.width}
        height={element.height}
        align={textAlign(element.textPosition)}
        verticalAlign={textVAlign(element.textPosition)}
        fontSize={element.fontSize}
        fontFamily={FONT_FAMILY}
        fontStyle={element.fontWeight === 'bold' ? 'bold' : '500'}
        fill={element.textColor}
        listening={false}
        padding={8}
      />
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
          stroke="#4a90d9"
          strokeWidth={1}
          dash={[4, 4]}
          listening={false}
        />
      )}
    </Group>
  );
}
