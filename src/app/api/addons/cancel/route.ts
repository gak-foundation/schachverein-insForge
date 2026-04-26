import { NextResponse } from "next/server";
import { cancelSubscription } from "@/lib/billing/stripe";
import { getClubById } from "@/lib/clubs/queries";
import { setClubPlan, setStripeSubscriptionId, setAddonStatus } from "@/lib/billing/queries";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { clubAddons } from "@/lib/db/schema/club_addons";
import { eq, and } from "drizzle-orm";
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
      const [addon] = await db
        .select()
        .from(clubAddons)
        .where(
          and(
            eq(clubAddons.clubId, clubId),
            eq(clubAddons.addonId, addonId),
            eq(clubAddons.status, "active")
          )
        )
        .limit(1);

      if (addon?.stripeSubscriptionId) {
        await cancelSubscription(addon.stripeSubscriptionId);
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
