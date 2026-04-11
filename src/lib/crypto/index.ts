import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY && process.env.NODE_ENV === "production") {
  throw new Error("ENCRYPTION_KEY is required in production");
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

function getKey(): Buffer {
  if (!ENCRYPTION_KEY) {
    // Development fallback - NOT for production
    return scryptSync("dev-key-do-not-use-in-production", "salt", 32);
  }
  return Buffer.from(ENCRYPTION_KEY, "hex");
}

export function encrypt(text: string): string {
  if (!text) return "";

  const iv = randomBytes(IV_LENGTH);
  const salt = randomBytes(SALT_LENGTH);
  const key = getKey();

  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Format: salt:iv:authTag:encrypted
  return `${salt.toString("hex")}:${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData) return "";

  try {
    const parts = encryptedData.split(":");
    if (parts.length !== 4) {
      // Not encrypted, return as-is (for migration)
      return encryptedData;
    }

    const [saltHex, ivHex, authTagHex, encryptedHex] = parts;

    const salt = Buffer.from(saltHex, "hex");
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");
    const key = getKey();

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    // If decryption fails, return original (for backward compatibility)
    return encryptedData;
  }
}

export function hashSensitiveData(data: string): string {
  if (!data) return "";

  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(data, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifySensitiveHash(data: string, hashedData: string): boolean {
  if (!data || !hashedData) return false;

  try {
    const [salt, hash] = hashedData.split(":");
    const computedHash = scryptSync(data, salt, 32).toString("hex");
    return hash === computedHash;
  } catch {
    return false;
  }
}

export function maskIban(iban: string): string {
  if (!iban || iban.length < 8) return iban;
  return iban.slice(0, 4) + " **** **** **** " + iban.slice(-4);
}
