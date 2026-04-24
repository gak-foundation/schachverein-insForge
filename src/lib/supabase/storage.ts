import { createServiceClient } from "./server";

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
  file: File | Buffer,
  contentType?: string
): void {
  const bucketLower = bucket.toLowerCase();

  // 1. Dateigröße prüfen
  const maxSize = MAX_FILE_SIZES[bucketLower];
  if (maxSize) {
    const size = file instanceof File ? file.size : file.length;
    if (size > maxSize) {
      throw new StorageValidationError(
        `Datei zu groß. Maximal ${maxSize / (1024 * 1024)} MB erlaubt.`,
        "FILE_TOO_LARGE"
      );
    }
  }

  // 2. MIME-Type prüfen
  const mime = contentType || (file instanceof File ? file.type : undefined);
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

// Helper für Upload
export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer,
  options?: { upsert?: boolean; contentType?: string }
) {
  validateUpload(bucket, path, file, options?.contentType);

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
