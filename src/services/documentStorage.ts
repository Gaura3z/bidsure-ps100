import fs from 'node:fs/promises';
import path from 'node:path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { uploadToGoogleCloudStorage } from './googleCloud.ts';

const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'bid-documents';
let supabaseAdmin: SupabaseClient | undefined;

function getSupabaseAdmin() {
  if (supabaseAdmin) return supabaseAdmin;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return undefined;
  supabaseAdmin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return supabaseAdmin;
}

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 120) || 'evidence';
}

export async function storeDocument(input: {
  submissionId: string;
  documentId: string;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}) {
  const objectPath = `submissions/${input.submissionId}/${input.documentId}-${safeName(input.fileName)}`;
  const provider = process.env.DOCUMENT_STORAGE || 'local';

  if (provider === 'supabase') {
    const client = getSupabaseAdmin();
    if (!client) throw new Error('DOCUMENT_STORAGE=supabase requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    const { error } = await client.storage.from(bucket).upload(objectPath, input.buffer, {
      contentType: input.mimeType,
      upsert: false,
    });
    if (error) throw new Error(`Supabase Storage upload failed: ${error.message}`);
    return { provider: 'SUPABASE', storagePath: objectPath } as const;
  }

  if (provider === 'google-cloud-storage') {
    return uploadToGoogleCloudStorage({ objectPath, buffer: input.buffer, mimeType: input.mimeType });
  }

  const localPath = path.resolve('data', 'uploads', objectPath);
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, input.buffer);
  return { provider: 'LOCAL', storagePath: objectPath } as const;
}
