export const COLORS = {
  // Grays
  GRAY_95: '#151515',
  GRAY_50: '#707070',
  GRAY_20: '#e0e0e0',
  DARK_GRAY: '#262626',
  MEDIUM_GRAY: '#595959',
  LIGHT_GRAY: '#e5e5e5',
  ICON_GRAY: '#7f7f7f',
  WHITE: '#ffffff',
  WATERMARK_GRAY: '#ececec',
  // Blues
  BLUE_50: '#0066cc',
  BLUE_40: '#4394e5',
  BLUE_10: '#e0f0ff',
  BLUE_PRIMARY: '#0066cc',
  BLUE_TINT_LIGHT: '#99c2eb',
  BLUE_TINT_LIGHTER: '#d9e8f7',
  // Greens
  GREEN_50: '#63993d',
  GREEN_20: '#d1f1bb',
  GREEN_10: '#e9f7df',
  // Others
  PURPLE_50: '#5e40be',
  RED_ORANGE_50: '#f0561d',
  YELLOW_40: '#b98412',
} as const;

export const COLOR_SWATCHES = [
  // Grays
  { name: 'Gray 95', hex: COLORS.GRAY_95 },
  { name: 'Gray 50', hex: COLORS.GRAY_50 },
  { name: 'Gray 20', hex: COLORS.GRAY_20 },
  { name: 'White', hex: COLORS.WHITE },
  // Blues
  { name: 'Blue 50', hex: COLORS.BLUE_50 },
  { name: 'Blue 40', hex: COLORS.BLUE_40 },
  { name: 'Blue 10', hex: COLORS.BLUE_10 },
  // Greens
  { name: 'Green 50', hex: COLORS.GREEN_50 },
  { name: 'Green 20', hex: COLORS.GREEN_20 },
  { name: 'Green 10', hex: COLORS.GREEN_10 },
  // Others
  { name: 'Purple 50', hex: COLORS.PURPLE_50 },
  { name: 'Red Orange 50', hex: COLORS.RED_ORANGE_50 },
  { name: 'Yellow 40', hex: COLORS.YELLOW_40 },
] as const;

export const FONT_SIZES = [16, 14, 12, 11, 10] as const;

export const FONT_WEIGHTS = ['bold', 'medium'] as const;

export const FONT_FAMILY = 'Red Hat Text';

export const GRID = {
  MINOR: 5,
  MAJOR: 10,
} as const;

export const CANVAS = {
  WIDTH: 760,
  MAX_HEIGHT: 900,
  DEFAULT_HEIGHT: 600,
} as const;

export const EXPORT_SETTINGS = {
  PNG_WIDTH: 1520,
  DPI: 192,
  PHYS_DPI: 96,
  BACKGROUND: '#ffffffff',
} as const;

export const LINE_WEIGHTS = {
  DEFAULT: 1,
  NETWORK: 2,
} as const;

export const ARROWHEAD = {
  SIZE_X: 1.6,
  SIZE_Y: 1.6,
  PADDING: 2.5,
} as const;

export const CALLOUT_CIRCLE = {
  RADIUS: 15,
  FILL: COLORS.DARK_GRAY,
  TEXT_COLOR: COLORS.WHITE,
  FONT_SIZE: 16,
} as const;

export const BOX_VARIANTS = {
  filled: { fill: COLORS.BLUE_PRIMARY, stroke: '', strokeWidth: 0, textColor: COLORS.WHITE },
  outlined: { fill: '', stroke: COLORS.BLUE_PRIMARY, strokeWidth: 2, textColor: COLORS.DARK_GRAY },
  gray: { fill: COLORS.LIGHT_GRAY, stroke: '', strokeWidth: 0, textColor: COLORS.DARK_GRAY },
  white: { fill: COLORS.WHITE, stroke: '', strokeWidth: 0, textColor: COLORS.DARK_GRAY },
} as const;

export const ZOOM = {
  MIN: 0.25,
  MAX: 4,
  STEP: 0.1,
} as const;
