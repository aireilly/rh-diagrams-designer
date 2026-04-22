import { DiagramState, DiagramElement, Connector, AnchorSide, TextPosition } from '../types';
import { CANVAS, FONT_FAMILY, CALLOUT_CIRCLE, COLORS, ARROWHEAD } from '../constants';
import { ICONS } from '../shapes/iconPaths';
import { isOnCanvas } from './elementBounds';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapTextLines(text: string, maxWidth: number, fontSize: number, isBold: boolean): string[] {
  const charWidth = fontSize * (isBold ? 0.6 : 0.55);
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * charWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

function renderRect(el: DiagramElement): string {
  const parts: string[] = [];

  if (el.stacked) {
    const r = el.x + el.width, b = el.y + el.height;
    parts.push(`  <polyline points="${r + 10},${el.y + 10} ${r + 10},${b + 10} ${el.x + 10},${b + 10}" fill="none" stroke="${COLORS.GRAY_95}" stroke-width="1" />`);
    parts.push(`  <polyline points="${r + 5},${el.y + 5} ${r + 5},${b + 5} ${el.x + 5},${b + 5}" fill="none" stroke="${COLORS.GRAY_95}" stroke-width="1" />`);
  }

  const rx = el.cornerRadius ? ` rx="${el.cornerRadius}" ry="${el.cornerRadius}"` : '';
  if (el.fill) {
    parts.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${rx} fill="${el.fill}" />`);
  }
  if (el.stroke) {
    const dashAttr = el.strokeDashEnabled ? ' stroke-dasharray="6,4"' : '';
    parts.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${rx} fill="none" stroke="${el.stroke}" stroke-width="${el.strokeWidth}"${dashAttr} />`);
  }
  if (!el.fill && !el.stroke) {
    parts.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}"${rx} fill="none" />`);
  }

  if (el.text) {
    const fontStyle = el.fontWeight === 'bold' ? 'font-weight:bold' : 'font-weight:500';
    const pos: TextPosition = el.textPosition || 'top-left';
    const fontFam = el.fontFamily || FONT_FAMILY;
    const isBold = el.fontWeight === 'bold';
    const availableWidth = el.width - 16;
    const lines = wrapTextLines(el.text, availableWidth, el.fontSize, isBold);
    const lineHeight = el.fontSize * 1.2;

    let tx: number, anchor: string, ty: number;

    if (pos === 'top-left' || pos === 'bottom-left') { tx = el.x + 8; anchor = 'start'; }
    else if (pos === 'top-right' || pos === 'bottom-right') { tx = el.x + el.width - 8; anchor = 'end'; }
    else { tx = el.x + el.width / 2; anchor = 'middle'; }

    if (pos === 'top-left' || pos === 'top-right') {
      ty = el.y + 8 + el.fontSize;
    } else if (pos === 'bottom-left' || pos === 'bottom-right') {
      ty = el.y + el.height - 8 - (lines.length - 1) * lineHeight;
    } else {
      ty = el.y + (el.height - lines.length * lineHeight) / 2 + el.fontSize;
    }

    if (lines.length === 1) {
      parts.push(`  <text x="${tx}" y="${ty}" text-anchor="${anchor}" font-family="${fontFam}" font-size="${el.fontSize}" fill="${el.textColor}" style="${fontStyle}">${escapeXml(lines[0])}</text>`);
    } else {
      const tspans = lines.map((line, i) =>
        `<tspan x="${tx}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
      ).join('');
      parts.push(`  <text x="${tx}" y="${ty}" text-anchor="${anchor}" font-family="${fontFam}" font-size="${el.fontSize}" fill="${el.textColor}" style="${fontStyle}">${tspans}</text>`);
    }
  }

  return parts.join('\n');
}

function renderCircle(el: DiagramElement): string {
  const parts: string[] = [];
  parts.push(`  <circle cx="${el.x}" cy="${el.y}" r="${CALLOUT_CIRCLE.RADIUS}" fill="${CALLOUT_CIRCLE.FILL}" />`);
  parts.push(`  <text x="${el.x}" y="${el.y}" text-anchor="middle" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="${CALLOUT_CIRCLE.FONT_SIZE}" font-weight="bold" fill="${CALLOUT_CIRCLE.TEXT_COLOR}">${escapeXml(el.text)}</text>`);
  return parts.join('\n');
}

function renderText(el: DiagramElement): string {
  const fontStyle = el.fontWeight === 'bold' ? 'font-weight:bold' : 'font-weight:500';
  const fontFam = el.fontFamily || FONT_FAMILY;
  const isBold = el.fontWeight === 'bold';
  const lines = wrapTextLines(el.text, el.width, el.fontSize, isBold);
  const lineHeight = el.fontSize * 1.2;

  if (lines.length === 1) {
    return `  <text x="${el.x}" y="${el.y + el.fontSize}" font-family="${fontFam}" font-size="${el.fontSize}" fill="${el.textColor}" style="${fontStyle}">${escapeXml(lines[0])}</text>`;
  }
  const tspans = lines.map((line, i) =>
    `<tspan x="${el.x}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`
  ).join('');
  return `  <text x="${el.x}" y="${el.y + el.fontSize}" font-family="${fontFam}" font-size="${el.fontSize}" fill="${el.textColor}" style="${fontStyle}">${tspans}</text>`;
}

function getAnchorPoint(el: DiagramElement, side: AnchorSide, otherEl: DiagramElement, offset = 0): { x: number; y: number; dir: string } {
  const cx = el.x + el.width / 2;
  let cy = el.y + el.height / 2;

  if (el.type === 'icon' && el.iconId) {
    const icon = ICONS.find((i) => i.id === el.iconId);
    if (icon) {
      const textTop = icon.height + 4;
      cy = el.y + textTop + (el.height - textTop) / 2;
    }
  }

  if (side === 'auto') {
    const ocx = otherEl.x + otherEl.width / 2;
    const ocy = otherEl.y + otherEl.height / 2;
    const dx = ocx - cx;
    const dy = ocy - cy;
    side = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top');
  }

  switch (side) {
    case 'top': return { x: cx + offset, y: el.y, dir: 'up' };
    case 'bottom': return { x: cx + offset, y: el.y + el.height, dir: 'down' };
    case 'left': return { x: el.x, y: cy + offset, dir: 'left' };
    case 'right': return { x: el.x + el.width, y: cy + offset, dir: 'right' };
  }
}

function buildSvgOrthogonalPath(from: { x: number; y: number; dir: string }, to: { x: number; y: number; dir: string }): string {
  const s = 20;
  let sx = from.x, sy = from.y, ex = to.x, ey = to.y;
  if (from.dir === 'right') sx += s; else if (from.dir === 'left') sx -= s;
  else if (from.dir === 'down') sy += s; else if (from.dir === 'up') sy -= s;
  if (to.dir === 'right') ex += s; else if (to.dir === 'left') ex -= s;
  else if (to.dir === 'down') ey += s; else if (to.dir === 'up') ey -= s;

  const isFromH = from.dir === 'left' || from.dir === 'right';
  const isToH = to.dir === 'left' || to.dir === 'right';

  let d = `M ${from.x} ${from.y}`;
  if (isFromH && isToH) {
    const midX = (sx + ex) / 2;
    d += ` L ${midX} ${from.y} L ${midX} ${to.y}`;
  } else if (!isFromH && !isToH) {
    const midY = (sy + ey) / 2;
    d += ` L ${from.x} ${midY} L ${to.x} ${midY}`;
  } else if (isFromH) {
    d += ` L ${sx} ${from.y} L ${sx} ${ey} L ${to.x} ${ey}`;
  } else {
    d += ` L ${from.x} ${sy} L ${ex} ${sy} L ${ex} ${to.y}`;
  }
  d += ` L ${to.x} ${to.y}`;
  return d;
}

function renderConnector(connector: Connector, elements: DiagramElement[]): string {
  const fromEl = elements.find((e) => e.id === connector.fromId);
  const toEl = elements.find((e) => e.id === connector.toId);
  if (!fromEl || !toEl) return '';

  const from = getAnchorPoint(fromEl, connector.fromSide || 'auto', toEl, connector.fromOffset || 0);
  const to = getAnchorPoint(toEl, connector.toSide || 'auto', fromEl, connector.toOffset || 0);

  let pathD: string;
  if (connector.points && connector.points.length >= 4) {
    const wp = [...connector.points];
    if (from.dir === 'left' || from.dir === 'right') {
      wp[1] = from.y;
    } else {
      wp[0] = from.x;
    }
    if (to.dir === 'left' || to.dir === 'right') {
      wp[wp.length - 1] = to.y;
    } else {
      wp[wp.length - 2] = to.x;
    }
    const allPts = [from.x, from.y, ...wp, to.x, to.y];
    pathD = `M ${allPts[0]} ${allPts[1]}`;
    for (let i = 2; i < allPts.length; i += 2) {
      pathD += ` L ${allPts[i]} ${allPts[i + 1]}`;
    }
  } else {
    pathD = buildSvgOrthogonalPath(from, to);
  }

  const markerId = `arrow-${connector.id}`;
  const dashAttr = connector.lineType === 'dashed' ? ' stroke-dasharray="4,4"' : '';
  const color = connector.stroke || COLORS.DARK_GRAY;

  const parts: string[] = [];

  if (connector.arrowDirection !== 'none') {
    parts.push(`  <defs><marker id="${markerId}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="${ARROWHEAD.SIZE_X * 5}" markerHeight="${ARROWHEAD.SIZE_Y * 5}" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${color}" /></marker></defs>`);
  }

  let markerAttr = '';
  if (connector.arrowDirection === 'forward') {
    markerAttr = ` marker-end="url(#${markerId})"`;
  } else if (connector.arrowDirection === 'backward') {
    markerAttr = ` marker-start="url(#${markerId})"`;
  } else if (connector.arrowDirection === 'bidirectional') {
    markerAttr = ` marker-start="url(#${markerId})" marker-end="url(#${markerId})"`;
  }

  parts.push(`  <path d="${pathD}" fill="none" stroke="${color}" stroke-width="${connector.strokeWidth}"${markerAttr}${dashAttr} />`);

  return parts.join('\n');
}

function renderIcon(el: DiagramElement): string {
  const icon = ICONS.find((i) => i.id === el.iconId);
  if (!icon) return renderText(el);

  const iconWidth = icon.width;
  const iconHeight = icon.height;
  const label = el.text || icon.name;
  const longestWord = label.split(/[\s,]+/).reduce((a, b) => a.length > b.length ? a : b, '');
  const minWordWidth = longestWord.length * 6.5 + 12;
  const totalWidth = Math.max(iconWidth, minWordWidth, 60);
  const iconX = el.x + (totalWidth - iconWidth) / 2;

  const parts: string[] = [];
  parts.push(`  <svg x="${iconX}" y="${el.y}" width="${iconWidth}" height="${iconHeight}" viewBox="${icon.viewBox}">${icon.svgContent}</svg>`);
  parts.push(`  <text x="${el.x + totalWidth / 2}" y="${el.y + iconHeight + 4 + 11}" text-anchor="middle" font-family="${FONT_FAMILY}" font-size="11" fill="${COLORS.GRAY_95}" style="font-weight:500">${escapeXml(label)}</text>`);
  return parts.join('\n');
}

function renderNetworkLine(el: DiagramElement): string {
  const isH = el.height === 0;
  const x2 = isH ? el.x + el.width : el.x;
  const y2 = isH ? el.y : el.y + el.height;
  return `  <line x1="${el.x}" y1="${el.y}" x2="${x2}" y2="${y2}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" />`;
}

function renderElement(el: DiagramElement): string {
  switch (el.type) {
    case 'rect':
      return renderRect(el);
    case 'circle':
      return renderCircle(el);
    case 'text':
      return renderText(el);
    case 'icon':
      return renderIcon(el);
    case 'network-line':
      return renderNetworkLine(el);
    default:
      return '';
  }
}

export function generateSvg(state: DiagramState, filename?: string): string {
  const width = CANVAS.WIDTH;
  const height = state.canvasHeight;

  const svgParts: string[] = [];
  svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  svgParts.push(`  <rect width="${width}" height="${height}" fill="#ffffff" />`);

  const visibleElements = state.elements.filter((el) => isOnCanvas(el, width, height));
  const visibleIds = new Set(visibleElements.map((el) => el.id));

  for (const el of visibleElements) {
    svgParts.push(renderElement(el));
  }

  for (const conn of state.connectors) {
    if (visibleIds.has(conn.fromId) && visibleIds.has(conn.toId)) {
      svgParts.push(renderConnector(conn, visibleElements));
    }
  }

  if (filename) {
    svgParts.push(`  <text x="${width - 4}" y="${height - 4}" text-anchor="end" font-family="${FONT_FAMILY}" font-size="5" fill="#e8e8e8">${escapeXml(filename)}</text>`);
  }

  svgParts.push(`</svg>`);
  return svgParts.join('\n');
}
