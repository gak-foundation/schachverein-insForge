import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Stripe webhook handling - install stripe package and implement
    // For now, return success to prevent errors
    console.log("Stripe webhook received - implement with: npm install stripe");
    
    return NextResponse.json({ received: true, message: "Stripe not configured" });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "Webhook error" },
      { status: 400 }
    );
  }
}
