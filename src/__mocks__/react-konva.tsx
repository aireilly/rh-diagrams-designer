import React from 'react';

const createMockComponent = (name: string) => {
  return React.forwardRef((props: Record<string, unknown>, ref: React.Ref<unknown>) => {
    const { children, ...rest } = props;
    return React.createElement('div', { 'data-testid': name, ref, ...rest }, children as React.ReactNode);
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
