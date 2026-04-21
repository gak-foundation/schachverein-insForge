import { createServiceClient } from "./server";

// Bucket-Namen
export const BUCKETS = {
  AVATARS: "avatars",
  DOCUMENTS: "documents",
  PROTOCOLS: "protocols",
  ATTACHMENTS: "attachments",
} as const;

// Helper für Upload
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  options?: { upsert?: boolean; contentType?: string }
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      upsert: options?.upsert ?? false,
      contentType: options?.contentType,
    });

  if (error) throw error;
  return data;
}

// Helper für Download
export async function downloadFile(bucket: string, path: string) {
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .download(path);

  if (error) throw error;
  return data;
}

// Helper für Public URL
export function getPublicUrl(bucket: string, path: string) {
  const supabase = createServiceClient();

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return data.publicUrl;
}

// Helper für Signed URL (private files)
export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) throw error;
  return data.signedUrl;
}

// Helper für Löschen
export async function deleteFile(bucket: string, path: string) {
  const supabase = createServiceClient();

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) throw error;
}

// Helper für Listen
export async function listFiles(
  bucket: string,
  prefix?: string,
  options?: { limit?: number; offset?: number }
) {
  const supabase = createServiceClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(prefix, options);

  if (error) throw error;
  return data;
}
