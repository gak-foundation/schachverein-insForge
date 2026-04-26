import { NextResponse } from "next/server";
import { setClubPlan, setStripeSubscriptionId } from "@/lib/billing/queries";
import { getClubByStripeCustomerId } from "@/lib/clubs/queries";
import type { PlanId } from "@/lib/billing/addons";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" })
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

        if (!planId || !customerId) {
          console.warn("Checkout session missing planId or customerId", session.id);
          break;
        }

        const club = await getClubByStripeCustomerId(customerId);
        if (!club) {
          console.error("No club found for Stripe customer", customerId);
          break;
        }

        await setClubPlan(club.id, planId);
        if (subscriptionId) {
          await setStripeSubscriptionId(club.id, subscriptionId);
        }
        console.log(`Plan ${planId} activated for club ${club.id}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const planId = subscription.metadata?.planId as PlanId | undefined;
        if (!planId) {
          console.warn("Subscription missing planId metadata", subscription.id);
          break;
        }

        const club = await getClubByStripeCustomerId(subscription.customer as string);
        if (!club) break;

        const status = subscription.status;
        if (status === "active" || status === "trialing") {
          await setClubPlan(club.id, planId);
          await setStripeSubscriptionId(club.id, subscription.id);
        } else if (status === "canceled" || status === "unpaid" || status === "incomplete_expired") {
          await setClubPlan(club.id, "free");
          await setStripeSubscriptionId(club.id, null);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const club = await getClubByStripeCustomerId(subscription.customer as string);
        if (club) {
          await setClubPlan(club.id, "free");
          await setStripeSubscriptionId(club.id, null);
          console.log(`Plan canceled for club ${club.id}`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = (invoice as unknown as { subscription?: string }).subscription;
        if (subId) {
          const club = await getClubByStripeCustomerId(invoice.customer as string);
          if (club && club.plan !== "pro") {
            await setClubPlan(club.id, "pro");
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
