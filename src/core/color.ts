import type { ColorFormat } from './constants';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number;
  s: number;
  l: number;
}

export function hexToRgb(hex: string): RgbColor | null {
  const normalized = normalizeHex(hex);
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  if (!match) return null;

  const r = Number.parseInt(match[1] ?? '00', 16);
  const g = Number.parseInt(match[2] ?? '00', 16);
  const b = Number.parseInt(match[3] ?? '00', 16);

  return { r, g, b };
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (value: number): string =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHsl(hex: string): HslColor | null {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;

  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToHex(hsl: HslColor): string {
  const h = hsl.h;
  const s = hsl.s;
  const l = hsl.l;

  const normalizedL = l / 100;
  const a = (s * Math.min(normalizedL, 1 - normalizedL)) / 100;

  const f = (n: number): string => {
    const k = (n + h / 30) % 12;
    const color = normalizedL - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

export function normalizeHex(hex: string): string {
  if (!hex) return hex;
  const trimmed = hex.trim();
  if (trimmed.length === 4 && trimmed.startsWith('#')) {
    const r = trimmed[1];
    const g = trimmed[2];
    const b = trimmed[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (trimmed.length === 3) {
    const r = trimmed[0];
    const g = trimmed[1];
    const b = trimmed[2];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  if (!trimmed.startsWith('#')) {
    return `#${trimmed}`;
  }
  return trimmed;
}

export function toDisplayString(hex: string, format: ColorFormat): string {
  const normalized = normalizeHex(hex);

  if (format === 'hex') {
    return normalized.toLowerCase();
  }

  const rgb = hexToRgb(normalized);
  if (!rgb) return normalized.toLowerCase();

  if (format === 'rgb') {
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }

  const hsl = hexToHsl(normalized);
  if (!hsl) return normalized.toLowerCase();

  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}

