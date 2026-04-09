import Konva from 'konva';
import { EXPORT_SETTINGS, CANVAS } from '../constants';

export function exportPng(stage: Konva.Stage): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const scale = EXPORT_SETTINGS.PNG_WIDTH / CANVAS.WIDTH;
    const layers = stage.getLayers();

    // Hide grid layer (first layer) and transformer nodes during export
    const gridLayer = layers[0];
    const contentLayer = layers[1];
    const transformer = contentLayer?.findOne('Transformer');

    gridLayer?.hide();
    transformer?.hide();

    // Add temporary white background to content layer
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: stage.width() / stage.scaleX(),
      height: stage.height() / stage.scaleY(),
      fill: '#ffffff',
    });
    contentLayer?.add(bg);
    bg.moveToBottom();
    contentLayer?.batchDraw();

    stage.toBlob({
      pixelRatio: scale,
      mimeType: 'image/png',
      callback: (blob) => {
        // Restore everything
        bg.destroy();
        gridLayer?.show();
        transformer?.show();
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
