"use server";

import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { authUsers, members, clubs } from "@/lib/db/schema";
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
 * This is called immediately after Supabase signUp on the client.
 */
export async function bindUserToTenant(input: SignupTenantBindInput) {
  const { userId, email, name, invitationToken, slug } = input;

  // Resolve club from subdomain slug
  const club = await getClubBySlug(slug);

  if (!club || !club.isActive) {
    throw new Error("Verein nicht gefunden oder inaktiv");
  }

  // Check if user already bound to another club (strict tenancy enforcement)
  const existingUser = await getAuthUserById(userId);
  if (existingUser?.clubId && existingUser.clubId !== club.id) {
    throw new Error("Dieser Account gehoert bereits einem anderen Verein");
  }

  // If invitation token provided, validate it and resolve role
  let resolvedRole: typeof members.$inferInsert.role = "mitglied";
  if (invitationToken) {
    const { getInvitationByToken } = await import("@/lib/auth/invitations");
    const invitation = await getInvitationByToken(invitationToken);
    if (!invitation || invitation.clubId !== club.id) {
      throw new Error("Ungueltige Einladung");
    }
    resolvedRole = (invitation.role as typeof members.$inferInsert.role) || "mitglied";
  }

  // Create member record if not exists
  if (!existingUser?.memberId) {
    const [newMember] = await db
      .insert(members)
      .values({
        firstName: name?.split(" ")[0] || "Vorname",
        lastName: name?.split(" ").slice(1).join(" ") || "Nachname",
        email,
        status: "active",
        role: resolvedRole,
        clubId: club.id,
      })
      .returning({ id: members.id });

    if (newMember) {
      await updateAuthUser(userId, {
        memberId: newMember.id,
        clubId: club.id,
        name: name || email,
      });
    }
  } else {
    // Update existing member with clubId
    await db
      .update(members)
      .set({ clubId: club.id, updatedAt: new Date() })
      .where(eq(members.id, existingUser.memberId));

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
