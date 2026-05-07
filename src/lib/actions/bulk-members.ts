"use server";

import { createServiceClient } from "@/lib/insforge";
import { requireClubAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function updateMemberStatusBulkAction(
  memberIds: string[],
  newStatus: string
) {
  const session = await requireClubAuth();
  const client = createServiceClient();

  const validStatuses = ["active", "inactive", "resigned", "honorary"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Ungueltiger Status: ${newStatus}`);
  }

  let updated = 0;
  for (const memberId of memberIds) {
    const { error } = await client
      .from("club_memberships")
      .update({ status: newStatus })
      .eq("member_id", memberId)
      .eq("club_id", session.user.clubId);

    if (error) {
      console.error(`Failed to update member ${memberId}:`, error);
      continue;
    }
    updated++;
  }

  revalidatePath("/dashboard/members");
  return { updated, total: memberIds.length };
}

export async function assignContributionRateBulkAction(
  memberIds: string[],
  rateId: string
) {
  const session = await requireClubAuth();
  const client = createServiceClient();

  let updated = 0;
  for (const memberId of memberIds) {
    const { error } = await client
      .from("members")
      .update({ contribution_rate_id: rateId })
      .eq("id", memberId);

    if (error) {
      console.error(`Failed to update member ${memberId}:`, error);
      continue;
    }
    updated++;
  }

  revalidatePath("/dashboard/members");
  return { updated, total: memberIds.length };
}

export async function deleteMembersBulkAction(memberIds: string[]) {
  const session = await requireClubAuth();
  const client = createServiceClient();

  let deleted = 0;
  for (const memberId of memberIds) {
    const { error: memError } = await client
      .from("members")
      .update({ status: "inactive" })
      .eq("id", memberId);

    if (memError) {
      console.error("Failed to delete member " + memberId + ":", memError);
      continue;
    }

    const { error: membershipError } = await client
      .from("club_memberships")
      .update({ status: "inactive" })
      .eq("member_id", memberId)
      .eq("club_id", session.user.clubId);

    if (membershipError) {
      console.error("Failed to delete membership for " + memberId + ":", membershipError);
      continue;
    }

    deleted++;
  }

  revalidatePath("/dashboard/members");
  return { deleted, total: memberIds.length };
}