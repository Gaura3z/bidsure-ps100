import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import { extractTextWithGoogleVision } from './googleCloud.ts';

const execFileAsync = promisify(execFile);
export type ProcessingStatus = 'CLEAN' | 'INFECTED' | 'PENDING' | 'NOT_CONFIGURED' | 'FAILED';

export async function scanForMalware(buffer: Buffer): Promise<{ status: ProcessingStatus; engine: string }> {
  const tempPath = path.resolve('data', 'uploads', `.scan-${Date.now()}-${Math.random().toString(16).slice(2)}`);
  try {
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, buffer);
    try {
      await execFileAsync('clamscan', ['--no-summary', tempPath], { timeout: 15000 });
      return { status: 'CLEAN', engine: 'CLAMAV' };
    } catch (error: any) {
      if (error?.code === 'ENOENT') return { status: 'NOT_CONFIGURED', engine: 'CLAMAV_NOT_INSTALLED' };
      if (error?.code === 1) return { status: 'INFECTED', engine: 'CLAMAV' };
      return { status: 'FAILED', engine: 'CLAMAV' };
    }
  } finally {
    await fs.rm(tempPath, { force: true }).catch(() => undefined);
  }
}

export async function extractTextWithLocalOcr(input: { buffer: Buffer; mimeType: string; documentId: string }) {
  if (!input.mimeType.startsWith('image/')) return { status: 'PENDING' as const, engine: 'TESSERACT_REQUIRES_RENDERED_PDF' };
  const tempPath = path.resolve('data', 'uploads', `.ocr-${input.documentId}`);
  const outputBase = `${tempPath}-out`;
  try {
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, input.buffer);
    try {
      await execFileAsync('tesseract', [tempPath, outputBase, '-l', 'eng'], { timeout: 30000 });
      const text = await fs.readFile(`${outputBase}.txt`, 'utf8');
      return { status: 'CLEAN' as const, engine: 'TESSERACT', text };
    } catch (error: any) {
      if (error?.code === 'ENOENT') return { status: 'NOT_CONFIGURED' as const, engine: 'TESSERACT_NOT_INSTALLED' };
      return { status: 'FAILED' as const, engine: 'TESSERACT' };
    }
  } finally {
    await Promise.all([fs.rm(tempPath, { force: true }), fs.rm(`${outputBase}.txt`, { force: true })]);
  }
}

export async function extractTextWithConfiguredOcr(input: { buffer: Buffer; mimeType: string; documentId: string }) {
  if (process.env.OCR_PROVIDER === 'google-vision') {
    try {
      const result = await extractTextWithGoogleVision(input);
      return { status: 'CLEAN' as const, engine: result.provider, text: result.text };
    } catch (error: any) {
      console.warn('[BIDSure OCR] Google Vision unavailable:', error?.message || error);
      return { status: 'FAILED' as const, engine: 'GOOGLE_CLOUD_VISION' };
    }
  }
  return extractTextWithLocalOcr(input);
}
