import { NextResponse } from "next/server";

// PAYMENT DISABLED: This project is running as a free hobby project.
// Stripe webhooks have been disabled.
export async function POST() {
  return NextResponse.json(
    { error: "Webhook processing is currently disabled" },
    { status: 503 }
  );
}
