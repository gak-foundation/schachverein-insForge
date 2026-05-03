import { createServiceClient } from "@/lib/insforge";
import type { PlanId, AddonId } from "./addons";

export async function getClubPlan(clubId: string): Promise<PlanId> {
  const client = createServiceClient();
  const { data, error } = await client
    .from("clubs")
    .select("plan")
    .eq("id", clubId)
    .single();

  if (error || !data) {
    console.error("Error in getClubPlan:", error);
    return "free";
  }
  return (data.plan as PlanId) ?? "free";
}

export async function getClubAddons(clubId: string): Promise<AddonId[]> {
  const client = createServiceClient();
  const { data, error } = await client
    .from("club_addons")
    .select("addon_id")
    .eq("club_id", clubId)
    .eq("status", "active");

  if (error || !data) {
    console.error("Error in getClubAddons:", error);
    return [];
  }
  return data.map((r: any) => r.addon_id as AddonId);
}

export async function setClubPlan(clubId: string, plan: PlanId) {
  const client = createServiceClient();
  const { error } = await client
    .from("clubs")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("id", clubId);

  if (error) {
    console.error("Error in setClubPlan:", error);
    throw error;
  }
}

export async function setAddonStatus(
  clubId: string,
  addonId: AddonId,
  status: "active" | "canceled" | "past_due",
  stripeSubscriptionId?: string,
  stripePriceId?: string
) {
  const client = createServiceClient();

  // Try to update existing
  const { data: updated, error: updateError } = await client
    .from("club_addons")
    .update({
      status,
      stripe_subscription_id: stripeSubscriptionId,
      stripe_price_id: stripePriceId,
      updated_at: new Date().toISOString(),
      canceled_at: status === "canceled" ? new Date().toISOString() : null,
    })
    .eq("club_id", clubId)
    .eq("addon_id", addonId)
    .select();

  // If no row updated, insert new one (only if active)
  if ((!updated || updated.length === 0) && status === "active") {
    const { error: insertError } = await client.from("club_addons").insert([
      {
        club_id: clubId,
        addon_id: addonId,
        status,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_price_id: stripePriceId,
        started_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Error in setAddonStatus insert:", insertError);
      throw insertError;
    }
  } else if (updateError) {
    console.error("Error in setAddonStatus update:", updateError);
    throw updateError;
  }
}

export async function setStripeSubscriptionId(
  clubId: string,
  stripeSubscriptionId: string | null
) {
  const client = createServiceClient();
  const { error } = await client
    .from("clubs")
    .update({
      stripe_subscription_id: stripeSubscriptionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", clubId);

  if (error) {
    console.error("Error in setStripeSubscriptionId:", error);
    throw error;
  }
}
