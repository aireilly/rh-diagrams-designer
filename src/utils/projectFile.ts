import { DiagramState } from '../types';

interface ProjectFile {
  version: 1;
  elements: DiagramState['elements'];
  connectors: DiagramState['connectors'];
  canvasHeight: number;
}

export function serializeProject(state: DiagramState): string {
  const project: ProjectFile = {
    version: 1,
    elements: state.elements,
    connectors: state.connectors,
    canvasHeight: state.canvasHeight,
  };
  return JSON.stringify(project, null, 2);
}

export function deserializeProject(json: string): DiagramState {
  const project: ProjectFile = JSON.parse(json);
  return {
    elements: project.elements,
    connectors: project.connectors,
    selectedIds: [],
    canvasHeight: project.canvasHeight,
    zoom: 1,
    snapEnabled: true,
    tool: 'select',
  };
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function loadFile(): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return reject(new Error('No file selected'));
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    };
    input.click();
  });
}
