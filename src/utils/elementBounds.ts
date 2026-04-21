import { DiagramElement } from '../types';
import { ICONS } from '../shapes/iconPaths';
import { CALLOUT_CIRCLE } from '../constants';

/**
 * Compute the actual rendered bounding box for an element.
 * Icons recalculate dimensions from icon data; circles use center-based positioning.
 */
export function getElementBounds(el: DiagramElement): { x: number; y: number; width: number; height: number } {
  if (el.type === 'icon' && el.iconId) {
    const icon = ICONS.find((i) => i.id === el.iconId);
    if (icon) {
      const iconWidth = icon.width;
      const iconHeight = icon.height;
      const label = el.text || icon.name;
      const longestWord = label.split(/[\s,]+/).reduce((a, b) => a.length > b.length ? a : b, '');
      const minWordWidth = longestWord.length * 6.5 + 12;
      const totalWidth = Math.max(iconWidth, minWordWidth, 60);
      const labelLines = Math.ceil(label.length * 5.5 / totalWidth) + 1;
      const labelHeight = labelLines * 13 + 4;
      const totalHeight = iconHeight + labelHeight + 4;
      return { x: el.x, y: el.y, width: totalWidth, height: totalHeight };
    }
  }

  if (el.type === 'circle') {
    const r = CALLOUT_CIRCLE.RADIUS;
    return { x: el.x - r, y: el.y - r, width: r * 2, height: r * 2 };
  }

  if (el.type === 'network-line') {
    const isH = el.height === 0;
    return {
      x: isH ? el.x : el.x - 5,
      y: isH ? el.y - 5 : el.y,
      width: isH ? el.width : 10,
      height: isH ? 10 : el.height,
    };
  }

  return { x: el.x, y: el.y, width: el.width, height: el.height };
}

/**
 * Returns true if any part of the element's bounding box overlaps the canvas area.
 */
export function isOnCanvas(el: DiagramElement, canvasWidth: number, canvasHeight: number): boolean {
  const b = getElementBounds(el);
  return b.x + b.width > 0 && b.x < canvasWidth && b.y + b.height > 0 && b.y < canvasHeight;
}
