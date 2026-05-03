import { createServiceClient } from "@/lib/insforge";
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

  const client = createServiceClient();
  const { data: invitation, error } = await client
    .from("club_invitations")
    .insert({
      club_id: clubId,
      email,
      role: role || "mitglied",
      token,
      invited_by: invitedBy,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating invitation:", error);
    throw new Error("Failed to create invitation");
  }

  return invitation;
}

// Get invitation by token
export async function getInvitationByToken(token: string) {
  const client = createServiceClient();
  const { data: invitation, error } = await client
    .from("club_invitations")
    .select("*")
    .eq("token", token)
    .single();

  if (error) {
    console.error("Error fetching invitation:", error);
    return null;
  }

  return invitation;
}

// Mark invitation as accepted
export async function acceptInvitation(token: string) {
  const client = createServiceClient();
  const { data: invitation, error } = await client
    .from("club_invitations")
    .update({ used_at: new Date().toISOString() })
    .eq("token", token)
    .select()
    .single();

  if (error) {
    console.error("Error accepting invitation:", error);
    throw new Error("Failed to accept invitation");
  }

  return invitation;
}

// Check if invitation is valid
export function isInvitationValid(invitation: {
  expires_at: string;
  used_at: string | null;
}): boolean {
  if (invitation.used_at) return false;
  if (new Date() > new Date(invitation.expires_at)) return false;
  return true;
}

// Generate invitation URL
export function getInvitationUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${baseUrl}/auth/invitation?token=${token}`;
}
