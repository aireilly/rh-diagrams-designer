import { parseHashData } from '../utils/hashImport';
import { DiagramState } from '../types';

describe('parseHashData', () => {
  const validProject = JSON.stringify({
    version: 1,
    elements: [],
    connectors: [],
    canvasHeight: 600,
  });

  it('parses valid base64-encoded project JSON', () => {
    const encoded = btoa(validProject);
    const result = parseHashData(`#data=${encoded}`);
    expect(result).not.toBeNull();
    expect((result as DiagramState).elements).toEqual([]);
    expect((result as DiagramState).canvasHeight).toBe(600);
  });

  it('returns null for empty hash', () => {
    expect(parseHashData('')).toBeNull();
  });

  it('returns null for hash without data param', () => {
    expect(parseHashData('#other=value')).toBeNull();
  });

  it('returns null for invalid base64', () => {
    expect(parseHashData('#data=!!!invalid!!!')).toBeNull();
  });

  it('returns null for valid base64 but invalid JSON', () => {
    const encoded = btoa('not a json object');
    expect(parseHashData(`#data=${encoded}`)).toBeNull();
  });
});
