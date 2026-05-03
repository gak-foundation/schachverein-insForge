"use server";

import { createServiceClient } from "@/lib/insforge";
import { getAuthUserById, updateAuthUser } from "@/lib/db/queries/auth";
import { getClubBySlug } from "@/lib/clubs/queries";

interface SignupTenantBindInput {
  userId: string;
  email: string;
  name?: string;
  invitationToken?: string;
  slug: string;
}

/**
 * Bind a newly signed-up user to a tenant (club) identified by subdomain slug.
 * This is called immediately after InsForge signUp on the client.
 */
export async function bindUserToTenant(input: SignupTenantBindInput) {
  const { userId, email, name, invitationToken, slug } = input;
  const client = createServiceClient();

  // Resolve club from subdomain slug
  const club = await getClubBySlug(slug);

  if (!club || !club.is_active) {
    throw new Error("Verein nicht gefunden oder inaktiv");
  }

  // Check if user already bound to another club (strict tenancy enforcement)
  const existingUser = await getAuthUserById(userId);
  if (existingUser?.club_id && existingUser.club_id !== club.id) {
    throw new Error("Dieser Account gehoert bereits einem anderen Verein");
  }

  // If invitation token provided, validate it and resolve role
  let resolvedRole: string = "mitglied";
  if (invitationToken) {
    const { getInvitationByToken } = await import("@/lib/auth/invitations");
    const invitation = await getInvitationByToken(invitationToken);
    if (!invitation || invitation.club_id !== club.id) {
      throw new Error("Ungueltige Einladung");
    }
    resolvedRole = invitation.role || "mitglied";
  }

  // Create member record if not exists
  if (!existingUser?.member_id) {
    const { data: newMember, error } = await client
      .from("members")
      .insert({
        first_name: name?.split(" ")[0] || "Vorname",
        last_name: name?.split(" ").slice(1).join(" ") || "Nachname",
        email,
        status: "active",
        role: resolvedRole,
        club_id: club.id,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Error creating member:", error);
      throw new Error("Fehler beim Erstellen des Mitglieds");
    }

    if (newMember) {
      await updateAuthUser(userId, {
        memberId: newMember.id,
        clubId: club.id,
        name: name || email,
      });
    }
  } else {
    // Update existing member with clubId
    const { error: updateError } = await client
      .from("members")
      .update({ club_id: club.id, updated_at: new Date().toISOString() })
      .eq("id", existingUser.member_id);

    if (updateError) {
      console.error("Error updating member:", updateError);
    }

    await updateAuthUser(userId, { clubId: club.id });
  }

  // If invitation, mark as used
  if (invitationToken) {
    const { markInvitationUsed } = await import("@/lib/clubs/queries");
    const { getInvitationByToken } = await import("@/lib/auth/invitations");
    const invitation = await getInvitationByToken(invitationToken);
    if (invitation) {
      await markInvitationUsed(invitation.id);
    }
  }

  return { success: true, clubId: club.id };
}
