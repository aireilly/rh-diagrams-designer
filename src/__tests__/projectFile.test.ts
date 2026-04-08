import { serializeProject, deserializeProject } from '../utils/projectFile';
import { DiagramState } from '../types';

describe('projectFile', () => {
  const sampleState: DiagramState = {
    elements: [
      {
        id: 'el-1',
        type: 'rect',
        x: 100,
        y: 200,
        width: 180,
        height: 60,
        rotation: 0,
        fill: '#0066cc',
        stroke: '',
        strokeWidth: 0,
        text: 'Test',
        fontSize: 16,
        fontWeight: 'bold',
        textColor: '#ffffff',
        groupId: null,
      },
    ],
    connectors: [],
    selectedIds: [],
    canvasHeight: 600,
    zoom: 1,
    snapEnabled: true,
    tool: 'select',
  };

  it('round-trips state through serialize/deserialize', () => {
    const json = serializeProject(sampleState);
    const parsed = deserializeProject(json);
    expect(parsed.elements).toEqual(sampleState.elements);
    expect(parsed.connectors).toEqual(sampleState.connectors);
    expect(parsed.canvasHeight).toBe(sampleState.canvasHeight);
  });

  it('strips selectedIds and resets tool on deserialize', () => {
    const stateWithSelection = { ...sampleState, selectedIds: ['el-1'], tool: 'connector-solid' as const };
    const json = serializeProject(stateWithSelection);
    const parsed = deserializeProject(json);
    expect(parsed.selectedIds).toEqual([]);
    expect(parsed.tool).toBe('select');
  });

  it('serializes to valid JSON', () => {
    const json = serializeProject(sampleState);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});
