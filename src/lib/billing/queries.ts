import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { clubs } from "@/lib/db/schema/clubs";
import { clubAddons } from "@/lib/db/schema/club_addons";
import type { PlanId, AddonId } from "./addons";

export async function getClubPlan(clubId: string): Promise<PlanId> {
  const rows = await db
    .select({ plan: clubs.plan })
    .from(clubs)
    .where(eq(clubs.id, clubId))
    .limit(1);
  return (rows[0]?.plan as PlanId) ?? "free";
}

export async function getClubAddons(clubId: string): Promise<AddonId[]> {
  const rows = await db
    .select({ addonId: clubAddons.addonId })
    .from(clubAddons)
    .where(
      and(
        eq(clubAddons.clubId, clubId),
        eq(clubAddons.status, "active")
      )
    );
  return rows.map((r) => r.addonId as AddonId);
}

export async function setClubPlan(clubId: string, plan: PlanId) {
  await db
    .update(clubs)
    .set({ plan, updatedAt: new Date() })
    .where(eq(clubs.id, clubId));
}

export async function setAddonStatus(
  clubId: string,
  addonId: AddonId,
  status: "active" | "canceled" | "past_due",
  stripeSubscriptionId?: string,
  stripePriceId?: string
) {
  // Try to update existing
  const result = await db
    .update(clubAddons)
    .set({
      status,
      stripeSubscriptionId,
      stripePriceId,
      updatedAt: new Date(),
      canceledAt: status === "canceled" ? new Date() : undefined,
    })
    .where(
      and(
        eq(clubAddons.clubId, clubId),
        eq(clubAddons.addonId, addonId)
      )
    )
    .returning();

  // If no row updated, insert new one (only if active)
  if (result.length === 0 && status === "active") {
    await db.insert(clubAddons).values({
      clubId,
      addonId,
      status,
      stripeSubscriptionId,
      stripePriceId,
      startedAt: new Date(),
    });
  }
}

export async function setStripeSubscriptionId(
  clubId: string,
  stripeSubscriptionId: string | null
) {
  await db
    .update(clubs)
    .set({ stripeSubscriptionId, updatedAt: new Date() })
    .where(eq(clubs.id, clubId));
}
