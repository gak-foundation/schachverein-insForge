import { NextResponse } from "next/server";
import { createCheckoutSession, createStripeCustomer } from "@/lib/billing/stripe";
import { getClubById } from "@/lib/clubs/queries";
import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/insforge";
import { z } from "zod";

const checkoutSchema = z.object({
  clubId: z.string().uuid(),
  planId: z.enum(["pro"]).optional(),
  addonId: z.enum(["finance", "tournament_pro", "professional", "communication", "storage_plus"]).optional(),
  returnUrl: z.string().url(),
}).refine(data => data.planId || data.addonId, {
  message: "Either planId or addonId must be provided"
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { clubId, planId, addonId, returnUrl } = checkoutSchema.parse(body);

    const club = await getClubById(clubId);
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const user = session.user;
    const isAuthorized =
      user.isSuperAdmin ||
      (user.clubId === clubId && (user.role === "admin" || user.role === "vorstand"));
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let stripeCustomerId = club.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await createStripeCustomer({
        email: club.contactEmail ?? user.email!,
        name: club.name,
      });
      stripeCustomerId = customer.id;
      const client = createServiceClient();
      const { error } = await client
        .from("clubs")
        .update({
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", clubId);

      if (error) {
        console.error("Error updating club stripe customer id:", error);
        throw new Error("Failed to update club");
      }
    }

    const checkoutSession = await createCheckoutSession({
      stripeCustomerId,
      planId,
      addonId,
      successUrl: `${returnUrl}?success=1`,
      cancelUrl: `${returnUrl}?canceled=1`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
