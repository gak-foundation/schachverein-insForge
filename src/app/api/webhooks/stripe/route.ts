import { NextResponse } from "next/server";
import Stripe from "stripe";

// Stripe-Client initialisieren (nur serverseitig)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" })
  : null;

export async function POST(request: Request) {
  if (!stripe) {
    console.error("Stripe webhook received but STRIPE_SECRET_KEY is not configured");
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 503 }
    );
  }

  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    console.error("Stripe webhook received without signature or secret");
    return NextResponse.json(
      { error: "Webhook configuration error" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`Stripe webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  // Event verarbeiten
  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        // TODO: Zahlung als erfolgreich markieren
        console.log("Invoice payment succeeded:", event.data.object.id);
        break;
      }
      case "invoice.payment_failed": {
        // TODO: Zahlung als fehlgeschlagen markieren
        console.log("Invoice payment failed:", event.data.object.id);
        break;
      }
      case "customer.subscription.deleted": {
        // TODO: Abonnement als gekündigt markieren
        console.log("Subscription deleted:", event.data.object.id);
        break;
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true, type: event.type });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing error" },
      { status: 500 }
    );
  }
}
