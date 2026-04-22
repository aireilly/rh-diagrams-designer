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

export function exportPng(stage: Konva.Stage, elements: DiagramElement[] = [], filename?: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const scale = EXPORT_SETTINGS.PNG_WIDTH / CANVAS.WIDTH;
    const canvasWidth = stage.width() / stage.scaleX();
    const canvasHeight = stage.height() / stage.scaleY();
    const layers = stage.getLayers();

    const gridLayer = layers[0];
    const contentLayer = layers[1];
    const transformer = contentLayer?.findOne('Transformer');

    gridLayer?.hide();
    transformer?.hide();

    const hiddenNodes = hideOffCanvasNodes(stage, elements, canvasWidth, canvasHeight);

    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: canvasWidth,
      height: canvasHeight,
      fill: '#ffffff',
    });
    contentLayer?.add(bg);
    bg.moveToBottom();

    let watermark: Konva.Text | null = null;
    if (filename) {
      watermark = new Konva.Text({
        x: 0,
        y: canvasHeight - 9,
        width: canvasWidth - 4,
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
