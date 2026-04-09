import { DiagramState, DiagramElement, Connector, AnchorSide, TextPosition } from '../types';
import { CANVAS, FONT_FAMILY, CALLOUT_CIRCLE, COLORS, ARROWHEAD } from '../constants';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderRect(el: DiagramElement): string {
  const parts: string[] = [];

  if (el.fill) {
    parts.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" />`);
  }
  if (el.stroke) {
    parts.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="none" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" />`);
  }
  if (!el.fill && !el.stroke) {
    parts.push(`  <rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="none" />`);
  }

  if (el.text) {
    const fontStyle = el.fontWeight === 'bold' ? 'font-weight:bold' : 'font-weight:500';
    const pos: TextPosition = el.textPosition || 'top-left';
    let tx: number, ty: number, anchor: string;

    if (pos === 'top-left') { tx = el.x + 8; ty = el.y + 8 + el.fontSize; anchor = 'start'; }
    else if (pos === 'top-right') { tx = el.x + el.width - 8; ty = el.y + 8 + el.fontSize; anchor = 'end'; }
    else if (pos === 'bottom-left') { tx = el.x + 8; ty = el.y + el.height - 8; anchor = 'start'; }
    else if (pos === 'bottom-right') { tx = el.x + el.width - 8; ty = el.y + el.height - 8; anchor = 'end'; }
    else { tx = el.x + el.width / 2; ty = el.y + el.height / 2 + el.fontSize / 3; anchor = 'middle'; }

    parts.push(`  <text x="${tx}" y="${ty}" text-anchor="${anchor}" font-family="${FONT_FAMILY}" font-size="${el.fontSize}" fill="${el.textColor}" style="${fontStyle}">${escapeXml(el.text)}</text>`);
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
  return `  <text x="${el.x}" y="${el.y + el.fontSize}" font-family="${FONT_FAMILY}" font-size="${el.fontSize}" fill="${el.textColor}" style="${fontStyle}">${escapeXml(el.text)}</text>`;
}

function getAnchorPoint(el: DiagramElement, side: AnchorSide, otherEl: DiagramElement): { x: number; y: number; dir: string } {
  const cx = el.x + el.width / 2;
  const cy = el.y + el.height / 2;

  if (side === 'auto') {
    const ocx = otherEl.x + otherEl.width / 2;
    const ocy = otherEl.y + otherEl.height / 2;
    const dx = ocx - cx;
    const dy = ocy - cy;
    side = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top');
  }

  switch (side) {
    case 'top': return { x: cx, y: el.y, dir: 'up' };
    case 'bottom': return { x: cx, y: el.y + el.height, dir: 'down' };
    case 'left': return { x: el.x, y: cy, dir: 'left' };
    case 'right': return { x: el.x + el.width, y: cy, dir: 'right' };
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

  const from = getAnchorPoint(fromEl, connector.fromSide || 'auto', toEl);
  const to = getAnchorPoint(toEl, connector.toSide || 'auto', fromEl);
  const pathD = buildSvgOrthogonalPath(from, to);

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

function renderElement(el: DiagramElement): string {
  switch (el.type) {
    case 'rect':
      return renderRect(el);
    case 'circle':
      return renderCircle(el);
    case 'text':
      return renderText(el);
    case 'icon':
      return renderText(el); // Icons export as labeled text for simplicity in v1
    default:
      return '';
  }
}

export function generateSvg(state: DiagramState): string {
  const width = CANVAS.WIDTH;
  const height = state.canvasHeight;

  const svgParts: string[] = [];
  svgParts.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
  svgParts.push(`  <rect width="${width}" height="${height}" fill="#ffffff" />`);

  for (const el of state.elements) {
    svgParts.push(renderElement(el));
  }

  for (const conn of state.connectors) {
    svgParts.push(renderConnector(conn, state.elements));
  }

  svgParts.push(`</svg>`);
  return svgParts.join('\n');
}
