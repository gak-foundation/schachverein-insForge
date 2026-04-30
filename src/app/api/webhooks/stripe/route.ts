import { NextResponse } from "next/server";
import { setClubPlan, setStripeSubscriptionId, setAddonStatus } from "@/lib/billing/queries";
import { getClubByStripeCustomerId } from "@/lib/clubs/queries";
import type { PlanId, AddonId } from "@/lib/billing/addons";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" as any })
  : null;

export async function POST(request: Request) {
  if (!stripe) {
    console.error("Stripe webhook received but STRIPE_SECRET_KEY is not configured");
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("Stripe webhook received without signature or secret");
    return NextResponse.json({ error: "Webhook configuration error" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Stripe webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook verification failed: ${message}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const planId = session.metadata?.planId as PlanId | undefined;
        const addonId = session.metadata?.addonId as AddonId | undefined;

        if ((!planId && !addonId) || !customerId) {
          console.warn("Checkout session missing planId/addonId or customerId", session.id);
          break;
        }

        const club = await getClubByStripeCustomerId(customerId);
        if (!club) {
          console.error("No club found for Stripe customer", customerId);
          break;
        }

        if (planId) {
          await setClubPlan(club.id, planId);
          if (subscriptionId) {
            await setStripeSubscriptionId(club.id, subscriptionId);
          }
          console.log(`Plan ${planId} activated for club ${club.id}`);
        } else if (addonId) {
          if (subscriptionId) {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            const priceId = lineItems.data[0]?.price?.id;
            await setAddonStatus(club.id, addonId, "active", subscriptionId, priceId);
          }
          console.log(`Addon ${addonId} activated for club ${club.id}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const planId = subscription.metadata?.planId as PlanId | undefined;
        const addonId = subscription.metadata?.addonId as AddonId | undefined;
        
        if (!planId && !addonId) {
          console.warn("Subscription missing planId/addonId metadata", subscription.id);
          break;
        }

        const club = await getClubByStripeCustomerId(subscription.customer as string);
        if (!club) break;

        const status = subscription.status;
        const isActive = status === "active" || status === "trialing";
        
        if (planId) {
          if (isActive) {
            await setClubPlan(club.id, planId);
            await setStripeSubscriptionId(club.id, subscription.id);
          } else if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
            await setClubPlan(club.id, "free");
            await setStripeSubscriptionId(club.id, null);
          }
        } else if (addonId) {
          let addonDbStatus: "active" | "canceled" | "past_due" = "active";
          if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
            addonDbStatus = "canceled";
          } else if (status === "past_due") {
            addonDbStatus = "past_due";
          }
          const priceId = subscription.items.data[0]?.price?.id;
          await setAddonStatus(club.id, addonId, addonDbStatus, subscription.id, priceId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const planId = subscription.metadata?.planId as PlanId | undefined;
        const addonId = subscription.metadata?.addonId as AddonId | undefined;
        
        const club = await getClubByStripeCustomerId(subscription.customer as string);
        if (club) {
          if (planId) {
            await setClubPlan(club.id, "free");
            await setStripeSubscriptionId(club.id, null);
            console.log(`Plan canceled for club ${club.id}`);
          } else if (addonId) {
            const priceId = subscription.items.data[0]?.price?.id;
            await setAddonStatus(club.id, addonId, "canceled", subscription.id, priceId);
            console.log(`Addon ${addonId} canceled for club ${club.id}`);
          }
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as unknown as { subscription?: string }).subscription;
        if (subId) {
          const club = await getClubByStripeCustomerId(invoice.customer as string);
          // Wait, an invoice doesn't easily tell us plan vs addon without checking the subscription.
          // In customer.subscription.updated we already handle the active status. 
          // So we don't necessarily need to set the plan to PRO here unless legacy.
          // For legacy PRO compatibility, we can leave this as is, but maybe we shouldn't force PRO if it's an addon payment.
          const subscription = await stripe.subscriptions.retrieve(subId);
          const planId = subscription.metadata?.planId as PlanId | undefined;
          
          if (club && planId && club.plan !== planId) {
            await setClubPlan(club.id, planId);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as unknown as { subscription?: string }).subscription;
        if (subId) {
          const club = await getClubByStripeCustomerId(invoice.customer as string);
          if (club) {
            console.warn(`Payment failed for club ${club.id}, subscription ${subId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing error" }, { status: 500 });
  }
}
