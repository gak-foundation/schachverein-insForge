import { NextResponse } from "next/server";
import { cancelSubscription } from "@/lib/billing/stripe";
import { getClubById } from "@/lib/clubs/queries";
import { setClubPlan, setStripeSubscriptionId, setAddonStatus } from "@/lib/billing/queries";
import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/insforge";
import { z } from "zod";

const cancelSchema = z.object({
  clubId: z.string().uuid(),
  addonId: z.enum(["finance", "tournament_pro", "professional", "communication", "storage_plus"]).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clubId, addonId } = cancelSchema.parse(body);

    const user = session.user;
    const isAuthorized =
      user.isSuperAdmin ||
      (user.clubId === clubId && (user.role === "admin" || user.role === "vorstand"));
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const club = await getClubById(clubId);
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    if (addonId) {
      // Find the specific addon subscription
      const client = createServiceClient();
      const { data: addon, error } = await client
        .from("club_addons")
        .select("*")
        .eq("club_id", clubId)
        .eq("addon_id", addonId)
        .eq("status", "active")
        .single();

      if (error) {
        console.error("Error finding addon:", error);
        return NextResponse.json({ error: "Addon not found" }, { status: 404 });
      }

      if (addon?.stripe_subscription_id) {
        await cancelSubscription(addon.stripe_subscription_id);
      }

      await setAddonStatus(clubId, addonId, "canceled");
      return NextResponse.json({ success: true, message: `Addon "${addonId}" gekündigt` });
    } else {
      // Legacy Pro plan cancellation
      if (club.stripeSubscriptionId) {
        await cancelSubscription(club.stripeSubscriptionId);
      }

      await setStripeSubscriptionId(clubId, null);
      await setClubPlan(clubId, "free");
      return NextResponse.json({ success: true, message: "Pro-Plan gekündigt" });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Cancel error:", error);
    return NextResponse.json({ error: "Cancel failed" }, { status: 500 });
  }
}
