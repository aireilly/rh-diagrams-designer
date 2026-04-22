import Konva from 'konva';
import { EXPORT_SETTINGS, CANVAS, FONT_FAMILY } from '../constants';
import { DiagramElement } from '../types';
import { isOnCanvas } from './elementBounds';

function hideOffCanvasNodes(stage: Konva.Stage, elements: DiagramElement[], canvasWidth: number, canvasHeight: number): Konva.Node[] {
  const hidden: Konva.Node[] = [];
  for (const el of elements) {
    if (!isOnCanvas(el, canvasWidth, canvasHeight)) {
      const node = stage.findOne(`#${el.id}`);
      if (node && node.visible()) {
        node.hide();
        hidden.push(node);
      }
    }
  }
  return hidden;
}

export function exportPng(stage: Konva.Stage, elements: DiagramElement[] = [], filename?: string, canvasHeight?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const scale = EXPORT_SETTINGS.PNG_WIDTH / CANVAS.WIDTH;
    const cw = CANVAS.WIDTH;
    const ch = canvasHeight || CANVAS.DEFAULT_HEIGHT;
    const pad = CANVAS.STAGE_PADDING;
    const layers = stage.getLayers();

    const gridLayer = layers[0];
    const contentLayer = layers[1];
    const transformer = contentLayer?.findOne('Transformer');

    gridLayer?.hide();
    transformer?.hide();

    const hiddenNodes = hideOffCanvasNodes(stage, elements, cw, ch);

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: cw,
      height: ch,
      fill: '#ffffff',
    });
    contentLayer?.add(bg);
    bg.moveToBottom();

    let watermark: Konva.Text | null = null;
    if (filename) {
      watermark = new Konva.Text({
        x: 0,
        y: ch - 9,
        width: cw - 4,
        text: filename,
        fontSize: 5,
        fontFamily: FONT_FAMILY,
        fill: '#e8e8e8',
        align: 'right',
      });
      contentLayer?.add(watermark);
    }

    contentLayer?.batchDraw();

    stage.toBlob({
      x: pad,
      y: pad,
      width: cw,
      height: ch,
      pixelRatio: scale,
      mimeType: 'image/png',
      callback: (blob) => {
        bg.destroy();
        watermark?.destroy();
        gridLayer?.show();
        transformer?.show();
        for (const node of hiddenNodes) node.show();
        contentLayer?.batchDraw();
        gridLayer?.batchDraw();

        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate PNG'));
        }
      },
    });
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
