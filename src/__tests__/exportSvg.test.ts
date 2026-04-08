import { generateSvg } from '../utils/exportSvg';
import { DiagramState } from '../types';

describe('generateSvg', () => {
  const state: DiagramState = {
    elements: [
      {
        id: 'el-1',
        type: 'rect',
        x: 50,
        y: 50,
        width: 180,
        height: 60,
        rotation: 0,
        fill: '#0066cc',
        stroke: '',
        strokeWidth: 0,
        text: 'Test Box',
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

  it('generates valid SVG with correct dimensions', () => {
    const svg = generateSvg(state);
    expect(svg).toContain('width="760"');
    expect(svg).toContain('height="600"');
    expect(svg).toContain('<svg');
    expect(svg).toContain('</svg>');
  });

  it('includes rect element', () => {
    const svg = generateSvg(state);
    expect(svg).toContain('<rect');
    expect(svg).toContain('fill="#0066cc"');
    expect(svg).toContain('width="180"');
  });

  it('includes text element', () => {
    const svg = generateSvg(state);
    expect(svg).toContain('Test Box');
    expect(svg).toContain('Red Hat Text');
  });

  it('includes font-face reference', () => {
    const svg = generateSvg(state);
    expect(svg).toContain('Red Hat Text');
  });
});
