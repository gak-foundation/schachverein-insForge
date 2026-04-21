import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { clubInvitations } from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { addDays } from "date-fns";

type MemberRole = "user" | "admin" | "vorstand" | "sportwart" | "jugendwart" | "kassenwart" | "trainer" | "mitglied" | "eltern";

// Create a new invitation
export async function createInvitation({
  clubId,
  email,
  role,
  invitedBy,
}: {
  clubId: string;
  email: string;
  role?: MemberRole;
  invitedBy: string;
}) {
  const token = randomUUID();
  const expiresAt = addDays(new Date(), 7); // 7 days expiry

  const [invitation] = await db
    .insert(clubInvitations)
    .values({
      clubId,
      email,
      role: role || "mitglied",
      token,
      invitedBy,
      expiresAt,
    })
    .returning();

  return invitation;
}

// Get invitation by token
export async function getInvitationByToken(token: string) {
  const [invitation] = await db
    .select()
    .from(clubInvitations)
    .where(eq(clubInvitations.token, token))
    .limit(1);

  return invitation;
}

// Mark invitation as accepted
export async function acceptInvitation(token: string) {
  const [invitation] = await db
    .update(clubInvitations)
    .set({
      usedAt: new Date(),
    })
    .where(eq(clubInvitations.token, token))
    .returning();

  return invitation;
}

// Check if invitation is valid
export function isInvitationValid(invitation: {
  expiresAt: Date;
  usedAt: Date | null;
}): boolean {
  if (invitation.usedAt) return false;
  if (new Date() > invitation.expiresAt) return false;
  return true;
}

// Generate invitation URL
export function getInvitationUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/auth/invitation?token=${token}`;
}
