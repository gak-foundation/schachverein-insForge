import { createServiceClient } from "@/lib/insforge";

export async function getRevenueForecast(clubId: string): Promise<{
  yearlyTotal: number;
  monthlyAmount: number;
  memberCount: number;
}> {
  const client = createServiceClient();

  const { data: rates } = await client
    .from("contribution_rates")
    .select("id, name, amount, frequency")
    .eq("club_id", clubId);

  if (!rates || rates.length === 0) {
    return { yearlyTotal: 0, monthlyAmount: 0, memberCount: 0 };
  }

  const { data: memberships } = await client
    .from("club_memberships")
    .select("member_id")
    .eq("club_id", clubId)
    .eq("status", "active");

  const memberIds = (memberships || []).map((m: any) => m.member_id);

  if (memberIds.length === 0) {
    return { yearlyTotal: 0, monthlyAmount: 0, memberCount: 0 };
  }

  const { data: members } = await client
    .from("members")
    .select("id, contribution_rate_id")
    .in("id", memberIds);

  const memberCount = members?.length ?? 0;

  let yearlyTotal = 0;
  (members || []).forEach((m: any) => {
    const rate = rates.find((r: any) => r.id === m.contribution_rate_id);
    if (!rate) return;
    const amount = Number(rate.amount) || 0;
    if (rate.frequency === "yearly") yearlyTotal += amount;
    else if (rate.frequency === "quarterly") yearlyTotal += amount * 4;
    else yearlyTotal += amount * 12;
  });

  return {
    yearlyTotal: Math.round(yearlyTotal * 100) / 100,
    monthlyAmount: Math.round((yearlyTotal / 12) * 100) / 100,
    memberCount,
  };
}
