import { insforge } from '@/lib/insforge';

// Bucket-Namen
export const BUCKETS = {
  AVATARS: "avatars",
  DOCUMENTS: "documents",
  PROTOCOLS: "protocols",
  ATTACHMENTS: "attachments",
} as const;

// Maximale Dateigröße pro Bucket (in Bytes)
const MAX_FILE_SIZES: Record<string, number> = {
  avatars: 5 * 1024 * 1024,      // 5 MB
  documents: 10 * 1024 * 1024,   // 10 MB
  protocols: 10 * 1024 * 1024,   // 10 MB
  attachments: 5 * 1024 * 1024,  // 5 MB
};

// Erlaubte MIME-Types pro Bucket
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  avatars: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ],
  protocols: [
    "application/pdf",
    "text/plain",
    "text/markdown",
  ],
  attachments: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/plain",
  ],
};

// Erweiterungen prüfen
const ALLOWED_EXTENSIONS: Record<string, string[]> = {
  avatars: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  documents: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"],
  protocols: [".pdf", ".txt", ".md"],
  attachments: [".jpg", ".jpeg", ".png", ".webp", ".pdf", ".txt"],
};

export class StorageValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = "StorageValidationError";
  }
}

function validateUpload(
  bucket: string,
  path: string,
  file: File | Blob | Buffer | Uint8Array,
  contentType?: string
): void {
  const bucketLower = bucket.toLowerCase();

  // 1. Dateigröße prüfen
  const maxSize = MAX_FILE_SIZES[bucketLower];
  if (maxSize) {
    const size = file instanceof File || file instanceof Blob ? file.size : 
                 ('length' in file ? file.length : (file as any).byteLength);
    if (size > maxSize) {
      throw new StorageValidationError(
        `Datei zu groß. Maximal ${maxSize / (1024 * 1024)} MB erlaubt.`,
        "FILE_TOO_LARGE"
      );
    }
  }

  // 2. MIME-Type prüfen
  const mime = contentType || (file instanceof File || file instanceof Blob ? file.type : undefined);
  const allowedMimes = ALLOWED_MIME_TYPES[bucketLower];
  if (allowedMimes && mime && !allowedMimes.includes(mime)) {
    throw new StorageValidationError(
      `Dateityp "${mime}" nicht erlaubt. Erlaubte Typen: ${allowedMimes.join(", ")}`,
      "INVALID_MIME_TYPE"
    );
  }

  // 3. Dateiendung prüfen
  const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
  const allowedExts = ALLOWED_EXTENSIONS[bucketLower];
  if (allowedExts && !allowedExts.includes(ext)) {
    throw new StorageValidationError(
      `Dateiendung "${ext}" nicht erlaubt. Erlaubte Endungen: ${allowedExts.join(", ")}`,
      "INVALID_EXTENSION"
    );
  }

  // 4. Pfad auf Path-Traversal prüfen
  if (path.includes("..") || path.startsWith("/")) {
    throw new StorageValidationError(
      "Ungültiger Dateipfad",
      "INVALID_PATH"
    );
  }
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob | Buffer | Uint8Array,
  options?: { upsert?: boolean; contentType?: string }
) {
  validateUpload(bucket, path, file, options?.contentType);

  const uploadFile: Blob = file instanceof Blob
    ? file
    : new Blob([file as any], { type: options?.contentType });

  const { data, error } = await insforge.storage
    .from(bucket)
    .upload(path, uploadFile);

  if (error) throw error;
  return { path: data!.key, url: data!.url, key: data!.key };
}

export async function downloadFile(bucket: string, path: string) {
  const { data, error } = await insforge.storage
    .from(bucket)
    .download(path);

  if (error) throw error;
  if (!data) throw new Error("File not found");

  const buffer = await data.arrayBuffer();
  return Buffer.from(buffer);
}

export function getPublicUrl(bucket: string, path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL ?? 'https://4d3rbpyx.eu-central.insforge.app';
  return `${baseUrl}/api/storage/buckets/${bucket}/objects/${encodeURIComponent(path)}`;
}

export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
) {
  // InsForge Storage URLs are directly accessible for public buckets.
  // For private buckets, return the direct URL (access controlled by auth).
  return getPublicUrl(bucket, path);
}

export async function deleteFile(bucket: string, path: string) {
  const { error } = await insforge.storage
    .from(bucket)
    .remove(path);

  if (error) throw error;
}

export async function listFiles(
  bucket: string,
  prefix?: string,
  options?: { limit?: number }
) {
  // Fetch file listing via InsForge REST API
  try {
    const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL ?? 'https://4d3rbpyx.eu-central.insforge.app';
    const url = new URL(`${baseUrl}/api/storage/buckets/${bucket}/objects`);
    if (prefix) url.searchParams.set('prefix', prefix);
    if (options?.limit) url.searchParams.set('limit', String(options.limit));

    const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
    const headers: Record<string, string> = {};
    if (anonKey) headers['Authorization'] = `Bearer ${anonKey}`;

    const response = await fetch(url.toString(), { headers });
    if (!response.ok) return [];

    const data = await response.json();
    return (data.objects || data || []).map((item: any) => ({
      name: item.key || item.name,
      id: item.id || item.key,
      updated_at: item.updatedAt || item.updated_at,
      created_at: item.createdAt || item.created_at,
      metadata: { size: item.size },
    }));
  } catch {
    return [];
  }
}
