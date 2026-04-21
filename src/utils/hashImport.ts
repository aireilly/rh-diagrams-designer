import { DiagramState } from '../types';
import { deserializeProject } from './projectFile';

export function parseHashData(hash: string): DiagramState | null {
  if (!hash.startsWith('#data=')) return null;
  const encoded = hash.slice(6);
  try {
    const json = atob(encoded);
    return deserializeProject(json);
  } catch {
    return null;
  }
}
