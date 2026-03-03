export async function copyText(text: string): Promise<void> {
  if (!text || !text.trim()) {
    throw new Error('No text to copy');
  }
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
    throw new Error('Clipboard not available');
  }
  await navigator.clipboard.writeText(text);
}

