"use server";

import { requireClubAuth } from "@/lib/auth/session";
import { getClubById } from "@/lib/clubs/queries";
import { createCheckoutSession, createCustomerPortalSession, createStripeCustomer } from "./stripe";
import type { PlanId, AddonId } from "./addons";
import { APP_URL } from "@/lib/urls";
import { createServiceClient } from "@/lib/insforge";

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

  if (!stripeCustomerId) {
    const customer = await createStripeCustomer({
      email: club.contactEmail || session.user.email || "",
      name: club.name,
    });
    stripeCustomerId = customer.id;

    const client = createServiceClient();
    const { error } = await client
      .from("clubs")
      .update({ stripe_customer_id: stripeCustomerId, updated_at: new Date().toISOString() })
      .eq("id", clubId);

    if (error) {
      console.error("Failed to update club stripe customer id:", error.message);
      throw new Error("Failed to update club billing information");
    }
  }

  const baseUrl = APP_URL;
  const successUrl = `${baseUrl}/super-admin/billing?success=true`;
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
  const returnUrl = `${baseUrl}/dashboard`;

  const portalSession = await createCustomerPortalSession(
    club.stripeCustomerId,
    returnUrl
  );

  return { url: portalSession.url };
}
