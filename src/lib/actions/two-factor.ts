"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  generateSecret,
  generateTotpUri,
  verifyTotp,
  generateBackupCodes,
  hashBackupCode,
  verifyBackupCode,
} from "@/lib/auth/two-factor";
import { toDataURL } from "qrcode";
import { logAudit } from "@/lib/audit";

const MFA_REQUIRED_ROLES = ["admin", "kassenwart"];

export function isMfaRequiredForRole(role: string): boolean {
  return MFA_REQUIRED_ROLES.includes(role);
}

export async function setupTwoFactor(userId: string, email: string): Promise<{
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}> {
  const secret = generateSecret();
  const totpUri = generateTotpUri(secret, email);
  const qrCodeUrl = await toDataURL(totpUri);
  const backupCodes = generateBackupCodes();

  const hashedBackupCodes = backupCodes.map(hashBackupCode);

  await db
    .update(users)
    .set({
      twoFactorSecret: secret,
      twoFactorBackupCodes: hashedBackupCodes,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await logAudit({
    action: "2fa_setup_initiated",
    entity: "user",
    entityId: userId,
  });

  return { secret, qrCodeUrl, backupCodes };
}

export async function verifyAndEnableTwoFactor(
  userId: string,
  token: string,
): Promise<{ success: boolean; error?: string }> {
  const [user] = await db
    .select({ twoFactorSecret: users.twoFactorSecret })
    .from(users)
    .where(eq(users.id, userId));

  if (!user?.twoFactorSecret) {
    return { success: false, error: "2FA nicht initialisiert" };
  }

  const isValid = verifyTotp(user.twoFactorSecret, token);

  if (!isValid) {
    await logAudit({
      action: "2fa_verification_failed",
      entity: "user",
      entityId: userId,
    });
    return { success: false, error: "Ungültiger Code" };
  }

  await db
    .update(users)
    .set({
      twoFactorEnabled: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await logAudit({
    action: "2fa_enabled",
    entity: "user",
    entityId: userId,
  });

  return { success: true };
}

export async function verifyTwoFactor(
  userId: string,
  token: string,
): Promise<{ success: boolean; backupCodeUsed?: boolean }> {
  const [user] = await db
    .select({
      twoFactorSecret: users.twoFactorSecret,
      twoFactorBackupCodes: users.twoFactorBackupCodes,
      twoFactorEnabled: users.twoFactorEnabled,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user?.twoFactorEnabled) {
    return { success: true };
  }

  // Try TOTP first
  if (user.twoFactorSecret && verifyTotp(user.twoFactorSecret, token)) {
    await logAudit({
      action: "2fa_verified",
      entity: "user",
      entityId: userId,
    });
    return { success: true };
  }

  // Try backup codes
  const backupCodes = user.twoFactorBackupCodes || [];
  if (verifyBackupCode(token, backupCodes)) {
    // Remove used backup code
    const normalizedToken = token.replace(/-/g, "").toUpperCase();
    const newBackupCodes = backupCodes.filter(
      (code) => code !== hashBackupCode(normalizedToken),
    );

    await db
      .update(users)
      .set({
        twoFactorBackupCodes: newBackupCodes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    await logAudit({
      action: "2fa_backup_code_used",
      entity: "user",
      entityId: userId,
    });

    return { success: true, backupCodeUsed: true };
  }

  await logAudit({
    action: "2fa_verification_failed",
    entity: "user",
    entityId: userId,
  });

  return { success: false };
}

export async function disableTwoFactor(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: [],
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await logAudit({
    action: "2fa_disabled",
    entity: "user",
    entityId: userId,
  });
}

export async function regenerateBackupCodes(
  userId: string,
): Promise<{ codes: string[]; success: boolean }> {
  const codes = generateBackupCodes();
  const hashedCodes = codes.map(hashBackupCode);

  await db
    .update(users)
    .set({
      twoFactorBackupCodes: hashedCodes,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  await logAudit({
    action: "2fa_backup_codes_regenerated",
    entity: "user",
    entityId: userId,
  });

  return { codes, success: true };
}

export async function getTwoFactorStatus(userId: string): Promise<{
  enabled: boolean;
  required: boolean;
}> {
  const [user] = await db
    .select({
      twoFactorEnabled: users.twoFactorEnabled,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) return { enabled: false, required: false };

  return {
    enabled: user.twoFactorEnabled ?? false,
    required: isMfaRequiredForRole(user.role),
  };
}
