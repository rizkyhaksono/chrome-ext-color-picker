export interface EyeDropperResult {
  sRGBHex: string;
}

declare class EyeDropper {
  open(): Promise<EyeDropperResult>;
}

export function isSupported(): boolean {
  return typeof window !== 'undefined' && 'EyeDropper' in window;
}

export async function openEyeDropper(): Promise<string | null> {
  if (!isSupported()) return null;

  try {
    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();
    return result.sRGBHex;
  } catch {
    return null;
  }
}

