import { DEFAULT_COLOR, DEFAULT_FORMAT, type ColorFormat } from '../core/constants';
import { normalizeHex, toDisplayString } from '../core/color';
import { getPreferences, setPreferences } from '../services/storage';
import { copyText } from '../services/clipboard';
import { isSupported as isEyedropperSupported, openEyeDropper } from '../services/eyedropper';

declare const chrome: {
  tabs: { query: (q: object, cb: (tabs: { id?: number; url?: string }[]) => void) => void };
  scripting: {
    executeScript: (
      opts: { target: { tabId: number }; files: string[] },
      cb: (results?: { result?: { name: string; category: string }[] }[]) => void
    ) => void;
  };
  runtime: { lastError?: { message?: string } };
};

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
  const savedColor = normalizeHex(prefs.color || DEFAULT_COLOR);
  currentColor = savedColor && savedColor.trim() ? savedColor : DEFAULT_COLOR;
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

  async function doCopy() {
    const value = toDisplayString(currentColor, currentFormat);
    if (!value || !value.trim()) {
      showCopyStatus(copyStatus, 'Pilih warna dulu.', false);
      return;
    }
    try {
      await copyText(value);
      showCopyStatus(copyStatus, 'Copied!', true);
    } catch {
      showCopyStatus(copyStatus, 'Copy gagal.', false);
    }
  }

  copyBtn.addEventListener('click', () => void doCopy());

  colorValue.addEventListener('click', () => {
    const value = toDisplayString(currentColor, currentFormat);
    if (value && value.trim()) {
      colorValue.select();
      void doCopy();
    } else {
      showCopyStatus(copyStatus, 'Pilih warna dulu.', false);
    }
  });

  runPageTechnologyAnalyzer();
}

function runPageTechnologyAnalyzer() {
  const techStatus = document.getElementById('tech-status') as HTMLParagraphElement;
  const techList = document.getElementById('tech-list') as HTMLUListElement;
  if (!techStatus || !techList) return;

  techStatus.textContent = 'Analyzing…';
  techStatus.hidden = false;
  techList.hidden = true;
  techList.innerHTML = '';

  const setDone = (message: string) => {
    techStatus.textContent = message;
    techStatus.hidden = false;
    techList.hidden = true;
  };

  const timeoutId = window.setTimeout(() => {
    if (techStatus.textContent === 'Analyzing…') {
      setDone('Could not analyze. Open a website and try again.');
    }
  }, 3500);

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) {
      window.clearTimeout(timeoutId);
      setDone('Open a webpage first.');
      return;
    }
    const url = tab.url || '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      window.clearTimeout(timeoutId);
      setDone('Cannot analyze this page (open a website).');
      return;
    }

    chrome.scripting.executeScript(
      {
        target: { tabId: tab.id },
        files: ['src/content/detectTechnologies.js'],
      },
      (results) => {
        window.clearTimeout(timeoutId);
        if (chrome.runtime.lastError) {
          setDone('Cannot analyze this page.');
          return;
        }
        const list = results?.[0]?.result as { name: string; category: string }[] | undefined;
        if (!Array.isArray(list) || list.length === 0) {
          setDone('No technologies detected.');
          return;
        }
        techStatus.hidden = true;
        techList.hidden = false;
        for (const item of list) {
          const li = document.createElement('li');
          li.className = 'tech-item';
          li.setAttribute('role', 'listitem');
          li.innerHTML = `<span>${escapeHtml(item.name)}</span><span class="tech-item__category">${escapeHtml(item.category)}</span>`;
          techList.appendChild(li);
        }
      }
    );
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
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

