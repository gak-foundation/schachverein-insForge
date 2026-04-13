// Stripe integration - install stripe package to enable
// npm install stripe

// import Stripe from "stripe";
// 
// export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
//   apiVersion: "2025-02-24.acacia",
//   typescript: true,
// });

// Placeholder types for when stripe is installed
export type Stripe = unknown;
export type StripeWebhookEvent = unknown;

// Product/Price IDs from environment variables
export const STRIPE_PRODUCTS = {
  pro: {
    monthly: process.env.STRIPE_PRO_PRICE_MONTHLY,
    yearly: process.env.STRIPE_PRO_PRICE_YEARLY,
  },
  enterprise: {
    monthly: process.env.STRIPE_ENTERPRISE_PRICE_MONTHLY,
  },
};

// Placeholder functions that throw if called without stripe
function throwNotInitialized() {
  throw new Error("Stripe is not initialized. Install stripe package first: npm install stripe");
}

export async function createStripeCustomer(_clubId: string, _name: string, _email?: string) {
  throwNotInitialized();
}

export async function createCheckoutSession(
  _stripeCustomerId: string,
  _priceId: string,
  _clubId: string,
  _successUrl: string,
  _cancelUrl: string
) {
  throwNotInitialized();
}

export async function createPortalSession(_stripeCustomerId: string, _returnUrl: string) {
  throwNotInitialized();
}

export async function cancelSubscription(_stripeSubscriptionId: string) {
  throwNotInitialized();
}

export async function resumeSubscription(_stripeSubscriptionId: string) {
  throwNotInitialized();
}

export async function updateSubscription(
  _stripeSubscriptionId: string,
  _newPriceId: string
) {
  throwNotInitialized();
}

export function constructWebhookEvent(
  _payload: string | Buffer,
  _signature: string,
  _secret: string
): unknown {
  throwNotInitialized();
  return undefined as unknown;
}

// Webhook event handlers
export async function handleCheckoutCompleted(_session: unknown) {
  throwNotInitialized();
}

export async function handleSubscriptionUpdated(_subscription: unknown) {
  throwNotInitialized();
}

export async function handleSubscriptionDeleted(_subscription: unknown) {
  throwNotInitialized();
}

export async function handleInvoicePaid(_invoice: unknown) {
  throwNotInitialized();
}

export async function handleInvoicePaymentFailed(_invoice: unknown) {
  throwNotInitialized();
}

// Helper function to determine plan from price ID
function getPlanFromPriceId(priceId: string): "pro" | "enterprise" | null {
  if (priceId === STRIPE_PRODUCTS.pro.monthly || priceId === STRIPE_PRODUCTS.pro.yearly) {
    return "pro";
  }
  if (priceId === STRIPE_PRODUCTS.enterprise.monthly) {
    return "enterprise";
  }
  return null;
}

// Get or create customer
export async function getOrCreateCustomer(
  _clubId: string,
  _clubName: string,
  _contactEmail?: string,
  _existingCustomerId?: string | null
): Promise<string> {
  throwNotInitialized();
  return "";
}
