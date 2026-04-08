export const COLORS = {
  BLUE_PRIMARY: '#0066cc',
  BLUE_TINT_LIGHT: '#99c2eb',
  BLUE_TINT_LIGHTER: '#d9e8f7',
  DARK_GRAY: '#262626',
  MEDIUM_GRAY: '#595959',
  LIGHT_GRAY: '#e5e5e5',
  ICON_GRAY: '#7f7f7f',
  WHITE: '#ffffff',
  WATERMARK_GRAY: '#ececec',
} as const;

export const COLOR_SWATCHES = [
  { name: 'Red Hat Blue', hex: COLORS.BLUE_PRIMARY },
  { name: 'Blue Tint Light', hex: COLORS.BLUE_TINT_LIGHT },
  { name: 'Blue Tint Lighter', hex: COLORS.BLUE_TINT_LIGHTER },
  { name: 'Dark Gray', hex: COLORS.DARK_GRAY },
  { name: 'Medium Gray', hex: COLORS.MEDIUM_GRAY },
  { name: 'Light Gray', hex: COLORS.LIGHT_GRAY },
  { name: 'Icon Gray', hex: COLORS.ICON_GRAY },
  { name: 'White', hex: COLORS.WHITE },
  { name: 'Watermark Gray', hex: COLORS.WATERMARK_GRAY },
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
