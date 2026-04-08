import Konva from 'konva';
import { EXPORT_SETTINGS, CANVAS } from '../constants';

export function exportPng(stage: Konva.Stage): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const scale = EXPORT_SETTINGS.PNG_WIDTH / CANVAS.WIDTH;

    stage.toBlob({
      pixelRatio: scale,
      mimeType: 'image/png',
      callback: (blob) => {
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
