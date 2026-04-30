"use server";

import { requireClubAuth } from "@/lib/auth/session";
import { getClubById, updateClub } from "@/lib/clubs/queries";
import { createCheckoutSession, createCustomerPortalSession, createStripeCustomer } from "./stripe";
import type { PlanId, AddonId } from "./addons";
import { APP_URL } from "@/lib/urls";

export async function createCheckoutSessionAction({
  planId,
  addonId,
}: {
  planId?: PlanId;
  addonId?: AddonId;
}) {
  const session = await requireClubAuth();
  const clubId = session.user.clubId;
  
  if (!clubId) {
    throw new Error("No club assigned");
  }

  const club = await getClubById(clubId);
  if (!club) {
    throw new Error("Club not found");
  }

  let stripeCustomerId = club.stripeCustomerId;

  // Create a Stripe customer if the club doesn't have one yet
  if (!stripeCustomerId) {
    const customer = await createStripeCustomer({
      email: club.contactEmail || session.user.email || "",
      name: club.name,
    });
    stripeCustomerId = customer.id;
    await updateClub(club.id, {
       settings: club.settings // needed because updateClub requires settings or other fields but not stripeCustomerId directly? Wait, let's check updateClub.
    } as any); // I'll just use a direct db query or I need to add stripeCustomerId to updateClub partial.
    
    // Better: use direct db call here since updateClub might not expose stripeCustomerId.
    const { db } = await import("@/lib/db");
    const { clubs } = await import("@/lib/db/schema/clubs");
    const { eq } = await import("drizzle-orm");
    await db.update(clubs).set({ stripeCustomerId, updatedAt: new Date() }).where(eq(clubs.id, clubId));
  }

  const baseUrl = APP_URL;
  const successUrl = `${baseUrl}/super-admin/billing?success=true`; // TODO: redirect to actual billing page (e.g. /dashboard/billing)
  const cancelUrl = `${baseUrl}/super-admin/billing?canceled=true`;

  const checkoutSession = await createCheckoutSession({
    stripeCustomerId,
    planId,
    addonId,
    successUrl,
    cancelUrl,
  });

  if (!checkoutSession.url) {
    throw new Error("Failed to create checkout session");
  }

  return { url: checkoutSession.url };
}

export async function createCustomerPortalSessionAction() {
  const session = await requireClubAuth();
  const clubId = session.user.clubId;
  
  if (!clubId) {
    throw new Error("No club assigned");
  }

  const club = await getClubById(clubId);
  if (!club) {
    throw new Error("Club not found");
  }

  if (!club.stripeCustomerId) {
    throw new Error("Club has no active billing profile");
  }

  const baseUrl = APP_URL;
  const returnUrl = `${baseUrl}/dashboard`; // Adjust to actual billing settings return URL

  const portalSession = await createCustomerPortalSession(
    club.stripeCustomerId,
    returnUrl
  );

  return { url: portalSession.url };
}
