import { db } from "@/lib/db";
import { refreshTokens } from "@/lib/db/schema";
import { eq, and, isNull, lt } from "drizzle-orm";
import crypto from "crypto";

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString("hex");
}

export async function storeRefreshToken(
  userId: string,
  token: string,
): Promise<void> {
  const tokenHash = hashToken(token);
  const expires = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    userId,
    tokenHash,
    expires,
  });
}

export async function rotateRefreshToken(
  oldToken: string,
  newToken: string,
): Promise<{ valid: boolean; compromised: boolean; userId: string | null }> {
  const oldTokenHash = hashToken(oldToken);

  const [storedToken] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, oldTokenHash));

  if (!storedToken) {
    return { valid: false, compromised: false, userId: null };
  }

  if (storedToken.revokedAt) {
    await revokeAllUserTokens(storedToken.userId);
    return { valid: false, compromised: true, userId: storedToken.userId };
  }

  if (storedToken.expires < new Date()) {
    return { valid: false, compromised: false, userId: storedToken.userId };
  }

  const newTokenHash = hashToken(newToken);
  const expires = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
      replacedByToken: newTokenHash,
    })
    .where(eq(refreshTokens.id, storedToken.id));

  await db.insert(refreshTokens).values({
    userId: storedToken.userId,
    tokenHash: newTokenHash,
    expires,
  });

  return { valid: true, compromised: false, userId: storedToken.userId };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);

  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
      ),
    );
}

export async function revokeAllUserTokens(userId: string): Promise<void> {
  await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(
      and(
        eq(refreshTokens.userId, userId),
        isNull(refreshTokens.revokedAt),
      ),
    );
}

export async function isRefreshTokenValid(token: string): Promise<boolean> {
  const tokenHash = hashToken(token);

  const [storedToken] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash));

  if (!storedToken) return false;
  if (storedToken.revokedAt) return false;
  if (storedToken.expires < new Date()) return false;

  return true;
}

export async function cleanupExpiredTokens(): Promise<void> {
  await db
    .delete(refreshTokens)
    .where(lt(refreshTokens.expires, new Date()));
}