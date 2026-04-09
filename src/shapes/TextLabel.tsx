import { useRef } from 'react';
import { Group, Text, Rect } from 'react-konva';
import type Konva from 'konva';
import { DiagramElement } from '../types';
import { FONT_FAMILY, GRID } from '../constants';
import { snapToGrid } from '../utils/snapGrid';
import { useDiagram } from '../state/DiagramContext';

interface TextLabelProps {
  element: DiagramElement;
  isSelected: boolean;
}

export default function TextLabel({ element, isSelected }: TextLabelProps) {
  const { moveElement, setSelection, updateElement, state } = useDiagram();
  const textRef = useRef<Konva.Text>(null);

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
    textarea.style.fontSize = `${element.fontSize * state.zoom}px`;
    textarea.style.fontFamily = FONT_FAMILY;
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
    <Group id={element.id} x={element.x} y={element.y} draggable onClick={handleClick} onDragEnd={handleDragEnd} onDblClick={handleDblClick}>
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
      <Text
        ref={textRef}
        text={element.text}
        width={element.width}
        fontSize={element.fontSize}
        fontFamily={FONT_FAMILY}
        fontStyle={element.fontWeight === 'bold' ? 'bold' : '500'}
        fill={element.textColor}
      />
    </Group>
  );
}
