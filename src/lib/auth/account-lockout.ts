import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export async function handleFailedLogin(userId: string): Promise<{ locked: boolean }> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return { locked: false };

  const newAttempts = (user.failedLoginAttempts ?? 0) + 1;

  if (newAttempts >= MAX_FAILED_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MINUTES * 60 * 1000);
    await db
      .update(users)
      .set({
        failedLoginAttempts: newAttempts,
        lockedUntil,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    return { locked: true };
  }

  await db
    .update(users)
    .set({
      failedLoginAttempts: newAttempts,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { locked: false };
}

export async function handleSuccessfulLogin(userId: string): Promise<void> {
  await db
    .update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
}

export async function isAccountLocked(userId: string): Promise<{ locked: boolean; unlockAt: Date | null }> {
  const [user] = await db
    .select({
      lockedUntil: users.lockedUntil,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user?.lockedUntil) return { locked: false, unlockAt: null };

  if (new Date() < user.lockedUntil) {
    return { locked: true, unlockAt: user.lockedUntil };
  }

  await db
    .update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));

  return { locked: false, unlockAt: null };
}

export async function isAccountLockedByEmail(email: string): Promise<{ locked: boolean; unlockAt: Date | null; userId: string | null }> {
  const [user] = await db
    .select({
      id: users.id,
      lockedUntil: users.lockedUntil,
    })
    .from(users)
    .where(eq(users.email, email));

  if (!user) return { locked: false, unlockAt: null, userId: null };
  if (!user.lockedUntil) return { locked: false, unlockAt: null, userId: user.id };

  if (new Date() < user.lockedUntil) {
    return { locked: true, unlockAt: user.lockedUntil, userId: user.id };
  }

  await db
    .update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { locked: false, unlockAt: null, userId: user.id };
}