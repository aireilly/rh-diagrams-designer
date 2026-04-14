import { DiagramElement } from '../types';
import { ICONS } from '../shapes/iconPaths';
import { CALLOUT_CIRCLE } from '../constants';

const ICON_SCALE = 2;

/**
 * Compute the actual rendered bounding box for an element.
 * Icons recalculate dimensions from icon data; circles use center-based positioning.
 */
export function getElementBounds(el: DiagramElement): { x: number; y: number; width: number; height: number } {
  if (el.type === 'icon' && el.iconId) {
    const icon = ICONS.find((i) => i.id === el.iconId);
    if (icon) {
      const scaledWidth = icon.width * ICON_SCALE;
      const scaledHeight = icon.height * ICON_SCALE;
      const label = el.text || icon.name;
      const longestWord = label.split(/[\s,]+/).reduce((a, b) => a.length > b.length ? a : b, '');
      const minWordWidth = longestWord.length * 8 + 16;
      const totalWidth = Math.max(scaledWidth, minWordWidth, 80);
      const labelLines = Math.ceil(label.length * 7 / totalWidth) + 1;
      const labelHeight = labelLines * 14 + 4;
      const totalHeight = scaledHeight + labelHeight + 6;
      return { x: el.x, y: el.y, width: totalWidth, height: totalHeight };
    }
  }

  if (el.type === 'circle') {
    const r = CALLOUT_CIRCLE.RADIUS;
    return { x: el.x - r, y: el.y - r, width: r * 2, height: r * 2 };
  }

  return { x: el.x, y: el.y, width: el.width, height: el.height };
}
