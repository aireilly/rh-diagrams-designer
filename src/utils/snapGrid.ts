export function snapToGrid(value: number, increment: number): number {
  return Math.round(value / increment) * increment;
}

export function snapPosition(x: number, y: number, increment: number): { x: number; y: number } {
  return {
    x: snapToGrid(x, increment),
    y: snapToGrid(y, increment),
  };
}
