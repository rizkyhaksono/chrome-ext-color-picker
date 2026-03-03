import { DEFAULT_COLOR, DEFAULT_FORMAT, type ColorFormat } from '../core/constants';
import { normalizeHex, toDisplayString } from '../core/color';
import { getPreferences, setPreferences } from '../services/storage';
import { copyText } from '../services/clipboard';
import { isSupported as isEyedropperSupported, openEyeDropper } from '../services/eyedropper';

let currentColor: string = DEFAULT_COLOR;
let currentFormat: ColorFormat = DEFAULT_FORMAT;

function $(id: string): HTMLElement {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Element #${id} not found`);
  }
  return el;
}

async function init() {
  const colorInput = $('color-input') as HTMLInputElement;
  const eyedropperBtn = $('eyedropper-btn') as HTMLButtonElement;
  const eyedropperSupport = $('eyedropper-support') as HTMLParagraphElement;
  const formatSelect = $('format-select') as HTMLSelectElement;
  const colorValue = $('color-value') as HTMLInputElement;
  const preview = $('color-preview') as HTMLDivElement;
  const copyBtn = $('copy-btn') as HTMLButtonElement;
  const copyStatus = $('copy-status') as HTMLSpanElement;

  const prefs = await getPreferences();
  currentColor = normalizeHex(prefs.color || DEFAULT_COLOR);
  currentFormat = prefs.format || DEFAULT_FORMAT;

  formatSelect.value = currentFormat;
  colorInput.value = currentColor;
  updatePreview(preview, currentColor);
  updateValue(colorValue, currentColor, currentFormat);

  const supported = isEyedropperSupported();
  if (!supported) {
    eyedropperBtn.disabled = true;
    eyedropperSupport.textContent = 'Eyedropper tidak didukung di browser ini.';
  } else {
    eyedropperSupport.textContent = 'Gunakan eyedropper untuk pilih warna dari layar.';
  }

  colorInput.addEventListener('input', async () => {
    currentColor = normalizeHex(colorInput.value);
    updatePreview(preview, currentColor);
    updateValue(colorValue, currentColor, currentFormat);
    await setPreferences({ color: currentColor });
  });

  formatSelect.addEventListener('change', async () => {
    const value = formatSelect.value as ColorFormat;
    currentFormat = value;
    updateValue(colorValue, currentColor, currentFormat);
    await setPreferences({ format: currentFormat });
  });

  eyedropperBtn.addEventListener('click', async () => {
    if (!isEyedropperSupported()) return;
    eyedropperBtn.disabled = true;
    eyedropperSupport.textContent = 'Klik pada layar untuk memilih warna...';

    const picked = await openEyeDropper();
    eyedropperBtn.disabled = false;
    eyedropperSupport.textContent = picked
      ? 'Warna berhasil diambil dari layar.'
      : 'Eyedropper dibatalkan atau gagal.';

    if (!picked) return;

    currentColor = normalizeHex(picked);
    colorInput.value = currentColor;
    updatePreview(preview, currentColor);
    updateValue(colorValue, currentColor, currentFormat);
    await setPreferences({ color: currentColor });
  });

  copyBtn.addEventListener('click', async () => {
    const value = toDisplayString(currentColor, currentFormat);
    await copyText(value);
    showCopyStatus(copyStatus, 'Copied to clipboard', true);
  });
}

function updatePreview(preview: HTMLDivElement, color: string) {
  preview.style.background = color;
}

function updateValue(input: HTMLInputElement, color: string, format: ColorFormat) {
  input.value = toDisplayString(color, format);
}

function showCopyStatus(el: HTMLSpanElement, message: string, success: boolean) {
  el.textContent = message;
  el.classList.remove('copy-status--success', 'copy-status--error');
  el.classList.add(success ? 'copy-status--success' : 'copy-status--error');

  window.setTimeout(() => {
    el.textContent = '';
    el.classList.remove('copy-status--success', 'copy-status--error');
  }, 1500);
}

document.addEventListener('DOMContentLoaded', () => {
  void init();
});

