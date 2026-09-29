import { Storage } from '@google-cloud/storage';
import { ImageAnnotatorClient } from '@google-cloud/vision';

let storageClient: Storage | undefined;
let visionClient: ImageAnnotatorClient | undefined;

function getStorage() {
  if (!storageClient) storageClient = new Storage({ projectId: process.env.GOOGLE_CLOUD_PROJECT_ID });
  return storageClient;
}

function getVision() {
  if (!visionClient) visionClient = new ImageAnnotatorClient();
  return visionClient;
}

export async function uploadToGoogleCloudStorage(input: {
  objectPath: string;
  buffer: Buffer;
  mimeType: string;
}) {
  const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
  if (!bucketName) throw new Error('GOOGLE_CLOUD_STORAGE_BUCKET is required for Google Cloud Storage.');
  const file = getStorage().bucket(bucketName).file(input.objectPath);
  await file.save(input.buffer, { resumable: false, metadata: { contentType: input.mimeType } });
  return { provider: 'GOOGLE_CLOUD_STORAGE' as const, storagePath: input.objectPath };
}

export async function extractTextWithGoogleVision(input: { buffer: Buffer; mimeType: string }) {
  const client = getVision();
  const [result] = input.mimeType === 'application/pdf'
    ? await client.documentTextDetection({ image: { content: input.buffer } })
    : await client.textDetection({ image: { content: input.buffer } });
  const text = result.fullTextAnnotation?.text || result.textAnnotations?.[0]?.description || '';
  return { provider: 'GOOGLE_CLOUD_VISION' as const, text, confidence: 0.85 };
}
