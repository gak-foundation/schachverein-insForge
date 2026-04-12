"use server";

import { db } from "@/lib/db";
import { authUsers, members, auditLog } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";
import { getSession } from "@/lib/auth/session";

const INVITATION_EXPIRY_DAYS = 7;

interface InvitationToken {
  token: string;
  email: string;
  memberId: string;
  invitedBy: string;
  expiresAt: Date;
}

const invitationStore = new Map<string, InvitationToken>();

function generateSecureToken(): string {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createInvitation(memberId: string): Promise<{ success: boolean; inviteUrl?: string; error?: string }> {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId));

  if (!member) {
    return { success: false, error: "Mitglied nicht gefunden" };
  }

  const [existingUser] = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.email, member.email));

  if (existingUser) {
    return { success: false, error: "Ein Account mit dieser E-Mail existiert bereits" };
  }

  const token = generateSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  invitationStore.set(tokenHash, {
    token: tokenHash,
    email: member.email,
    memberId: member.id,
    invitedBy: session.user.id,
    expiresAt,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const inviteUrl = `${baseUrl}/auth/invite?token=${token}`;

  await db.insert(auditLog).values({
    userId: session.user.id,
    action: "INVITATION_CREATED",
    entity: "member",
    entityId: memberId,
    changes: { email: member.email },
  });

  return { success: true, inviteUrl };
}

export async function validateInvitation(token: string): Promise<{ valid: boolean; email?: string; memberId?: string; error?: string }> {
  const tokenHash = hashToken(token);
  const invitation = invitationStore.get(tokenHash);

  if (!invitation) {
    return { valid: false, error: "Ungültiger Einladungstoken" };
  }

  if (new Date() > invitation.expiresAt) {
    invitationStore.delete(tokenHash);
    return { valid: false, error: "Einladung ist abgelaufen" };
  }

  const [existingUser] = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.email, invitation.email));

  if (existingUser) {
    invitationStore.delete(tokenHash);
    return { valid: false, error: "Ein Account mit dieser E-Mail existiert bereits" };
  }

  return { valid: true, email: invitation.email, memberId: invitation.memberId };
}

export async function consumeInvitation(token: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const tokenHash = hashToken(token);
  const invitation = invitationStore.get(tokenHash);

  if (!invitation) {
    return { success: false, error: "Ungültiger Einladungstoken" };
  }

  if (new Date() > invitation.expiresAt) {
    invitationStore.delete(tokenHash);
    return { success: false, error: "Einladung ist abgelaufen" };
  }

  await db
    .update(authUsers)
    .set({ memberId: invitation.memberId })
    .where(eq(authUsers.id, userId));

  invitationStore.delete(tokenHash);

  await db.insert(auditLog).values({
    userId,
    action: "INVITATION_ACCEPTED",
    entity: "member",
    entityId: invitation.memberId,
    changes: { invitedBy: invitation.invitedBy },
  });

  return { success: true };
}

export async function revokeInvitation(memberId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  let deleted = false;
  for (const [key, invitation] of invitationStore.entries()) {
    if (invitation.memberId === memberId) {
      invitationStore.delete(key);
      deleted = true;

      await db.insert(auditLog).values({
        userId: session.user.id,
        action: "INVITATION_REVOKED",
        entity: "member",
        entityId: memberId,
      });
    }
  }

  return { success: deleted };
}

export async function getPendingInvitations(): Promise<Array<{ memberId: string; email: string; invitedBy: string; expiresAt: Date }>> {
  const session = await getSession();
  if (!session?.user) {
    return [];
  }

  const now = new Date();
  const pending: Array<{ memberId: string; email: string; invitedBy: string; expiresAt: Date }> = [];

  for (const invitation of invitationStore.values()) {
    if (invitation.expiresAt > now) {
      pending.push({
        memberId: invitation.memberId,
        email: invitation.email,
        invitedBy: invitation.invitedBy,
        expiresAt: invitation.expiresAt,
      });
    }
  }

  return pending;
}

export async function linkMemberToUser(memberId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "Nicht authentifiziert" };
  }

  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.id, memberId));

  if (!member) {
    return { success: false, error: "Mitglied nicht gefunden" };
  }

  const [user] = await db
    .select()
    .from(authUsers)
    .where(eq(authUsers.id, userId));

  if (!user) {
    return { success: false, error: "Benutzer nicht gefunden" };
  }

  if (user.memberId && user.memberId !== memberId) {
    return { success: false, error: "Benutzer ist bereits mit einem anderen Mitglied verknüpft" };
  }

  await db
    .update(authUsers)
    .set({
      memberId,
      role: member.role,
      updatedAt: new Date(),
    })
    .where(eq(authUsers.id, userId));

  await db.insert(auditLog).values({
    userId: session.user.id,
    action: "MEMBER_LINKED",
    entity: "member",
    entityId: memberId,
    changes: { userId, email: user.email },
  });

  return { success: true };
}
