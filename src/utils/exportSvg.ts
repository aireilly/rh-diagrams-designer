import { DiagramState, DiagramElement, Connector } from '../types';
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
    const tx = el.x + el.width / 2;
    const ty = el.y + el.height / 2;
    parts.push(`  <text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="central" font-family="${FONT_FAMILY}" font-size="${el.fontSize}" fill="${el.textColor}" style="${fontStyle}">${escapeXml(el.text)}</text>`);
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

function renderConnector(connector: Connector, elements: DiagramElement[]): string {
  const fromEl = elements.find((e) => e.id === connector.fromId);
  const toEl = elements.find((e) => e.id === connector.toId);
  if (!fromEl || !toEl) return '';

  const fromCx = fromEl.x + fromEl.width / 2;
  const fromCy = fromEl.y + fromEl.height / 2;
  const toCx = toEl.x + toEl.width / 2;
  const toCy = toEl.y + toEl.height / 2;

  const markerId = `arrow-${connector.id}`;
  const dashAttr = connector.lineType === 'dashed' ? ' stroke-dasharray="2,2"' : '';

  const parts: string[] = [];
  parts.push(`  <defs><marker id="${markerId}" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="${ARROWHEAD.SIZE_X * 5}" markerHeight="${ARROWHEAD.SIZE_Y * 5}" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="${connector.stroke || COLORS.DARK_GRAY}" /></marker></defs>`);
  parts.push(`  <line x1="${fromCx}" y1="${fromCy}" x2="${toCx}" y2="${toCy}" stroke="${connector.stroke || COLORS.DARK_GRAY}" stroke-width="${connector.strokeWidth}" marker-end="url(#${markerId})"${dashAttr} />`);

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
