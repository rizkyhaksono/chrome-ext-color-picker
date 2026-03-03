export type ColorFormat = 'hex' | 'rgb' | 'hsl';

export const FORMAT_HEX: ColorFormat = 'hex';
export const FORMAT_RGB: ColorFormat = 'rgb';
export const FORMAT_HSL: ColorFormat = 'hsl';

export const STORAGE_KEYS = {
  color: 'natee_color_picker_color',
  format: 'natee_color_picker_format',
} as const;

export const DEFAULT_COLOR = '#ff4757'; // default swatch color
export const DEFAULT_FORMAT: ColorFormat = FORMAT_HEX;

