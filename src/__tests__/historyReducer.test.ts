import { historyReducer, createInitialHistoryState } from '../state/historyReducer';
import { DiagramElement } from '../types';

function makeElement(overrides: Partial<DiagramElement> = {}): DiagramElement {
  return {
    id: 'el-1',
    type: 'rect',
    x: 0,
    y: 0,
    width: 180,
    height: 100,
    rotation: 0,
    fill: '#0066cc',
    stroke: '',
    strokeWidth: 0,
    text: 'Test',
    fontSize: 16,
    fontWeight: 'bold',
    textColor: '#ffffff',
    groupId: null,
    ...overrides,
  };
}

describe('historyReducer', () => {
  const initial = createInitialHistoryState();

  it('starts with empty elements and connectors', () => {
    expect(initial.present.elements).toEqual([]);
    expect(initial.present.connectors).toEqual([]);
    expect(initial.past).toEqual([]);
    expect(initial.future).toEqual([]);
  });

  it('ADD_ELEMENT adds to elements and pushes to past', () => {
    const el = makeElement();
    const next = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    expect(next.present.elements).toHaveLength(1);
    expect(next.present.elements[0].id).toBe('el-1');
    expect(next.past).toHaveLength(1);
    expect(next.future).toEqual([]);
  });

  it('UNDO restores previous state', () => {
    const el = makeElement();
    const afterAdd = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    const afterUndo = historyReducer(afterAdd, { type: 'UNDO' });
    expect(afterUndo.present.elements).toEqual([]);
    expect(afterUndo.past).toEqual([]);
    expect(afterUndo.future).toHaveLength(1);
  });

  it('REDO restores undone state', () => {
    const el = makeElement();
    const afterAdd = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    const afterUndo = historyReducer(afterAdd, { type: 'UNDO' });
    const afterRedo = historyReducer(afterUndo, { type: 'REDO' });
    expect(afterRedo.present.elements).toHaveLength(1);
    expect(afterRedo.future).toEqual([]);
  });

  it('UNDO does nothing when past is empty', () => {
    const afterUndo = historyReducer(initial, { type: 'UNDO' });
    expect(afterUndo).toBe(initial);
  });

  it('REDO does nothing when future is empty', () => {
    const afterRedo = historyReducer(initial, { type: 'REDO' });
    expect(afterRedo).toBe(initial);
  });

  it('new action clears future', () => {
    const el1 = makeElement({ id: 'el-1' });
    const el2 = makeElement({ id: 'el-2' });
    const s1 = historyReducer(initial, { type: 'ADD_ELEMENT', element: el1 });
    const s2 = historyReducer(s1, { type: 'UNDO' });
    expect(s2.future).toHaveLength(1);
    const s3 = historyReducer(s2, { type: 'ADD_ELEMENT', element: el2 });
    expect(s3.future).toEqual([]);
  });

  it('UPDATE_ELEMENT updates element properties', () => {
    const el = makeElement();
    const s1 = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    const s2 = historyReducer(s1, { type: 'UPDATE_ELEMENT', id: 'el-1', changes: { text: 'Updated' } });
    expect(s2.present.elements[0].text).toBe('Updated');
  });

  it('DELETE_ELEMENTS removes elements by id', () => {
    const el = makeElement();
    const s1 = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    const s2 = historyReducer(s1, { type: 'DELETE_ELEMENTS', ids: ['el-1'] });
    expect(s2.present.elements).toHaveLength(0);
  });

  it('MOVE_ELEMENT updates x and y', () => {
    const el = makeElement();
    const s1 = historyReducer(initial, { type: 'ADD_ELEMENT', element: el });
    const s2 = historyReducer(s1, { type: 'MOVE_ELEMENT', id: 'el-1', x: 100, y: 200 });
    expect(s2.present.elements[0].x).toBe(100);
    expect(s2.present.elements[0].y).toBe(200);
  });

  it('SET_SELECTION does not push to history', () => {
    const s1 = historyReducer(initial, { type: 'SET_SELECTION', ids: ['el-1'] });
    expect(s1.present.selectedIds).toEqual(['el-1']);
    expect(s1.past).toEqual([]);
  });

  it('SET_ZOOM does not push to history', () => {
    const s1 = historyReducer(initial, { type: 'SET_ZOOM', zoom: 2 });
    expect(s1.present.zoom).toBe(2);
    expect(s1.past).toEqual([]);
  });

  it('SET_SNAP does not push to history', () => {
    const s1 = historyReducer(initial, { type: 'SET_SNAP', enabled: false });
    expect(s1.present.snapEnabled).toBe(false);
    expect(s1.past).toEqual([]);
  });
});
