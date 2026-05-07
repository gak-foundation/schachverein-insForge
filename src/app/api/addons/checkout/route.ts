import { NextResponse } from "next/server";

// PAYMENT DISABLED: This project is running as a free hobby project.
// Payment processing has been disabled for security and simplicity.
// To re-enable, remove this guard and configure Stripe properly.
export async function POST() {
  return NextResponse.json(
    { error: "Payment processing is currently disabled" },
    { status: 503 }
  );
}
