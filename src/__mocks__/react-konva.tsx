import React from 'react';

// Filter out non-DOM props that Konva uses
const KONVA_PROPS = new Set([
  'listening', 'scaleX', 'scaleY', 'strokeWidth', 'cornerRadius',
  'borderStroke', 'anchorStroke', 'anchorSize', 'anchorCornerRadius',
  'rotateEnabled', 'verticalAlign', 'fontStyle', 'fontFamily',
  'hitStrokeWidth', 'strokeScaleEnabled', 'pointerLength', 'pointerWidth',
  'dashEnabled', 'offsetX', 'offsetY', 'fill', 'stroke', 'dash',
  'fontSize', 'align', 'padding', 'draggable', 'onDragEnd',
  'onTransformEnd', 'onDblClick',
]);

const filterProps = (props: Record<string, unknown>) => {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (!KONVA_PROPS.has(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
};

const createMockComponent = (name: string) => {
  return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
    const { children, ...rest } = props;
    const domProps = filterProps(rest);

    // Provide mock methods for refs
    React.useImperativeHandle(ref, () => ({
      nodes: () => {},
      getLayer: () => ({ batchDraw: () => {} }),
      findOne: () => undefined,
      container: () => ({ getBoundingClientRect: () => ({ top: 0, left: 0, width: 760, height: 600 }) }),
      getStage: () => null,
    }));

    return React.createElement('div', { 'data-testid': name, ...domProps }, children as React.ReactNode);
  });
};

export const Stage = createMockComponent('Stage');
export const Layer = createMockComponent('Layer');
export const Rect = createMockComponent('Rect');
export const Line = createMockComponent('Line');
export const Text = createMockComponent('Text');
export const Group = createMockComponent('Group');
export const Circle = createMockComponent('Circle');
export const Path = createMockComponent('Path');
export const Arrow = createMockComponent('Arrow');
export const Transformer = createMockComponent('Transformer');
