import { DEFAULT_COLOR, DEFAULT_FORMAT, STORAGE_KEYS, type ColorFormat } from '../core/constants';

declare const chrome: any;

export interface ColorPreferences {
  color: string;
  format: ColorFormat;
}

export async function getPreferences(): Promise<ColorPreferences> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
    return {
      color: DEFAULT_COLOR,
      format: DEFAULT_FORMAT,
    };
  }

  return new Promise<ColorPreferences>((resolve) => {
    chrome.storage.sync.get(
      [STORAGE_KEYS.color, STORAGE_KEYS.format],
      (items: Record<string, unknown>) => {
        const color = typeof items[STORAGE_KEYS.color] === 'string' ? (items[STORAGE_KEYS.color] as string) : DEFAULT_COLOR;
        const format =
          items[STORAGE_KEYS.format] === 'hex' ||
          items[STORAGE_KEYS.format] === 'rgb' ||
          items[STORAGE_KEYS.format] === 'hsl'
            ? (items[STORAGE_KEYS.format] as ColorFormat)
            : DEFAULT_FORMAT;

        resolve({ color, format });
      },
    );
  });
}

export async function setPreferences(partial: Partial<ColorPreferences>): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.sync) {
    return;
  }

  const payload: Record<string, unknown> = {};

  if (typeof partial.color === 'string') {
    payload[STORAGE_KEYS.color] = partial.color;
  }

  if (partial.format) {
    payload[STORAGE_KEYS.format] = partial.format;
  }

  if (Object.keys(payload).length === 0) return;

  return new Promise<void>((resolve) => {
    chrome.storage.sync.set(payload, () => resolve());
  });
}

