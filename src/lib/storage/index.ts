import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  file: File | Buffer | Uint8Array,
  contentType?: string
): void {
  const bucketLower = bucket.toLowerCase();

  // 1. Dateigröße prüfen
  const maxSize = MAX_FILE_SIZES[bucketLower];
  if (maxSize) {
    const size = file instanceof File ? file.size : ('length' in file ? file.length : (file as any).byteLength);
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

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION || "eu-central-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY || "",
    secretAccessKey: process.env.S3_SECRET_KEY || "",
  },
  forcePathStyle: true,
});

const defaultBucket = process.env.S3_BUCKET || "schachverein";

function getS3Key(bucket: string, path: string) {
  // Für kompatibles Verhalten packen wir den Ordner (z.B. "avatars") und den Pfad zusammen.
  return `${bucket}/${path}`;
}

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Buffer | Uint8Array,
  options?: { upsert?: boolean; contentType?: string }
) {
  validateUpload(bucket, path, file, options?.contentType);

  let body: Buffer | Uint8Array;
  if (file instanceof File) {
    body = new Uint8Array(await file.arrayBuffer());
  } else {
    body = file;
  }

  const command = new PutObjectCommand({
    Bucket: defaultBucket,
    Key: getS3Key(bucket, path),
    Body: body,
    ContentType: options?.contentType || (file instanceof File ? file.type : undefined),
  });

  await s3Client.send(command);
  return { path };
}

export async function downloadFile(bucket: string, path: string) {
  const command = new GetObjectCommand({
    Bucket: defaultBucket,
    Key: getS3Key(bucket, path),
  });

  const response = await s3Client.send(command);
  if (!response.Body) {
    throw new Error("File not found");
  }
  const byteArray = await response.Body.transformToByteArray();
  return Buffer.from(byteArray);
}

export function getPublicUrl(bucket: string, path: string) {
  const baseUrl = process.env.S3_ENDPOINT;
  return `${baseUrl}/${defaultBucket}/${getS3Key(bucket, path)}`;
}

export async function createSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600
) {
  const command = new GetObjectCommand({
    Bucket: defaultBucket,
    Key: getS3Key(bucket, path),
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function deleteFile(bucket: string, path: string) {
  const command = new DeleteObjectCommand({
    Bucket: defaultBucket,
    Key: getS3Key(bucket, path),
  });

  await s3Client.send(command);
}

export async function listFiles(
  bucket: string,
  prefix?: string,
  options?: { limit?: number }
) {
  const folderPrefix = prefix ? `${bucket}/${prefix}` : `${bucket}/`;
  
  const command = new ListObjectsV2Command({
    Bucket: defaultBucket,
    Prefix: folderPrefix,
    MaxKeys: options?.limit,
  });

  const response = await s3Client.send(command);
  
  return response.Contents?.map(item => ({
    name: item.Key?.replace(`${bucket}/`, ''),
    id: item.ETag,
    updated_at: item.LastModified?.toISOString(),
    created_at: item.LastModified?.toISOString(),
    last_accessed_at: item.LastModified?.toISOString(),
    metadata: {
      size: item.Size,
    }
  })) || [];
}