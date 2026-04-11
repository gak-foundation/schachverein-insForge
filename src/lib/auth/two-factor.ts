import { TOTP } from "otpauth";
import crypto from "crypto";

export function generateSecret(): string {
  return crypto.randomBytes(20).toString("hex");
}

export function generateTotpUri(secret: string, email: string, issuer = "Schachverein"): string {
  const totp = new TOTP({
    issuer,
    label: email,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  return totp.toString();
}

export function verifyTotp(secret: string, token: string): boolean {
  if (!secret || !token) return false;

  const totp = new TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret,
  });

  // Allow 1 window before/after current time for clock drift
  const delta = totp.validate({ token, window: 1 });
  return delta !== null;
}

export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString("hex").toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
}

export function hashBackupCode(code: string): string {
  return crypto.createHash("sha256").update(code.replace(/-/g, "")).digest("hex");
}

export function verifyBackupCode(code: string, hashedCodes: string[]): boolean {
  const normalizedCode = code.replace(/-/g, "").toUpperCase();
  const hash = hashBackupCode(normalizedCode);
  return hashedCodes.includes(hash);
}
