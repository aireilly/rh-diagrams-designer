import { COLORS, FONT_SIZES, FONT_WEIGHTS, GRID, CANVAS, EXPORT_SETTINGS, LINE_WEIGHTS, ARROWHEAD } from '../constants';

describe('constants', () => {
  describe('COLORS', () => {
    it('has all required palette colors', () => {
      expect(COLORS.BLUE_PRIMARY).toBe('#0066cc');
      expect(COLORS.BLUE_TINT_LIGHT).toBe('#99c2eb');
      expect(COLORS.BLUE_TINT_LIGHTER).toBe('#d9e8f7');
      expect(COLORS.DARK_GRAY).toBe('#262626');
      expect(COLORS.MEDIUM_GRAY).toBe('#595959');
      expect(COLORS.LIGHT_GRAY).toBe('#e5e5e5');
      expect(COLORS.ICON_GRAY).toBe('#7f7f7f');
      expect(COLORS.WHITE).toBe('#ffffff');
      expect(COLORS.WATERMARK_GRAY).toBe('#ececec');
    });
  });

  describe('FONT_SIZES', () => {
    it('has all discrete font size steps', () => {
      expect(FONT_SIZES).toEqual([16, 14, 12, 11, 10]);
    });
  });

  describe('FONT_WEIGHTS', () => {
    it('has bold and medium', () => {
      expect(FONT_WEIGHTS).toEqual(['bold', 'medium']);
    });
  });

  describe('GRID', () => {
    it('has 5px minor and 10px major', () => {
      expect(GRID.MINOR).toBe(5);
      expect(GRID.MAJOR).toBe(10);
    });
  });

  describe('CANVAS', () => {
    it('has correct dimensions', () => {
      expect(CANVAS.WIDTH).toBe(760);
      expect(CANVAS.MAX_HEIGHT).toBe(900);
      expect(CANVAS.DEFAULT_HEIGHT).toBe(600);
    });
  });

  describe('EXPORT_SETTINGS', () => {
    it('has correct PNG export values', () => {
      expect(EXPORT_SETTINGS.PNG_WIDTH).toBe(1520);
      expect(EXPORT_SETTINGS.DPI).toBe(192);
      expect(EXPORT_SETTINGS.PHYS_DPI).toBe(96);
      expect(EXPORT_SETTINGS.BACKGROUND).toBe('#ffffffff');
    });
  });

  describe('LINE_WEIGHTS', () => {
    it('has default and network weights', () => {
      expect(LINE_WEIGHTS.DEFAULT).toBe(1);
      expect(LINE_WEIGHTS.NETWORK).toBe(2);
    });
  });

  describe('ARROWHEAD', () => {
    it('has correct arrowhead dimensions', () => {
      expect(ARROWHEAD.SIZE_X).toBe(1.6);
      expect(ARROWHEAD.SIZE_Y).toBe(1.6);
      expect(ARROWHEAD.PADDING).toBe(2.5);
    });
  });
});
