import * as pdfjsLib from 'pdfjs-dist';

// In Next.js / Webpack / Turbopack environments, configure the worker using CDN matching pdfjs-dist version
if (typeof window !== 'undefined') {
  try {
    const version = (pdfjsLib as any).version || '4.10.38';
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
  } catch (_) {
    // Fallback if needed
  }
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
  if (typeof window === 'undefined') {
    return new Uint8Array(Buffer.from(cleanBase64, 'base64'));
  }
  const binaryString = window.atob(cleanBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function base64ToBlob(base64: string, mimeType: string = 'application/pdf'): Blob {
  const bytes = base64ToUint8Array(base64);
  return new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
}

export { pdfjsLib };
