import Stripe from "stripe";
import { PLAN_CONFIG, ADDON_CONFIG, type PlanId, type AddonId } from "./addons";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" as any })
  : null;

function ensureStripe() {
  if (!stripe) {
    throw new Error("Stripe is not initialized. Set STRIPE_SECRET_KEY env var.");
  }
  return stripe;
}

export async function createCheckoutSession({
  stripeCustomerId,
  planId,
  addonId,
  successUrl,
  cancelUrl,
}: {
  stripeCustomerId: string;
  planId?: PlanId;
  addonId?: AddonId;
  successUrl: string;
  cancelUrl: string;
}) {
  const s = ensureStripe();
  
  let priceId: string | undefined;
  let metadata: Record<string, string> = {};

  if (addonId) {
    const config = ADDON_CONFIG[addonId];
    priceId = config.stripePriceId || process.env[`STRIPE_PRICE_${addonId.toUpperCase()}`];
    metadata = { addonId };
  } else if (planId) {
    const config = PLAN_CONFIG[planId];
    priceId = config.stripePriceId || process.env.STRIPE_PRICE_PRO;
    metadata = { planId };
  }

  if (!priceId) {
    throw new Error(`No Stripe price ID configured for ${addonId ? `addon "${addonId}"` : `plan "${planId}"`}`);
  }

  const session = await s.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: { metadata },
  });

  return session;
}

export async function createCustomerPortalSession(
  stripeCustomerId: string,
  returnUrl: string
) {
  const s = ensureStripe();
  return s.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: returnUrl,
  });
}

export async function cancelSubscription(stripeSubscriptionId: string) {
  const s = ensureStripe();
  return s.subscriptions.cancel(stripeSubscriptionId, {
    cancellation_details: { comment: "Canceled via dashboard" },
  });
}

export async function getSubscription(stripeSubscriptionId: string) {
  const s = ensureStripe();
  return s.subscriptions.retrieve(stripeSubscriptionId);
}

export async function createStripeCustomer({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const s = ensureStripe();
  return s.customers.create({ email, name });
}
