import { snapToGrid, snapPosition } from '../utils/snapGrid';

describe('snapToGrid', () => {
  it('snaps a value to the nearest 5px grid point', () => {
    expect(snapToGrid(12, 5)).toBe(10);
    expect(snapToGrid(13, 5)).toBe(15);
    expect(snapToGrid(15, 5)).toBe(15);
    expect(snapToGrid(0, 5)).toBe(0);
    expect(snapToGrid(3, 5)).toBe(5);
  });

  it('snaps to 10px increments for resizing', () => {
    expect(snapToGrid(124, 10)).toBe(120);
    expect(snapToGrid(126, 10)).toBe(130);
  });
});

describe('snapPosition', () => {
  it('snaps both x and y to 5px grid', () => {
    expect(snapPosition(12, 17, 5)).toEqual({ x: 10, y: 15 });
  });

  it('returns exact values when increment is 1', () => {
    expect(snapPosition(12.7, 17.3, 1)).toEqual({ x: 13, y: 17 });
  });
});
