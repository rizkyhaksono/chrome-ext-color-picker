export async function copyText(text: string): Promise<void> {
  if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // swallow clipboard errors; UI can still proceed
  }
}

