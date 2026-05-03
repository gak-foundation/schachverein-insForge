import { createServiceClient } from "@/lib/insforge";
import { fetchDwzData } from "@/lib/dwz";
import { logger } from "@/lib/logger";

interface DwzSyncResult {
  success: boolean;
  message: string;
  updatedCount: number;
}

export async function syncDwzForMember(
  memberId: string,
  dwzId: string
): Promise<DwzSyncResult> {
  const client = createServiceClient();

  try {
    const data = await fetchDwzData(dwzId);

    if (!data) {
      return { success: false, message: "No DWZ data found", updatedCount: 0 };
    }

    const { data: member, error } = await client
      .from("members")
      .select("dwz, elo")
      .eq("id", memberId)
      .single();

    if (error || !member) {
      return { success: false, message: "Member not found", updatedCount: 0 };
    }

    if (data.dwz !== member.dwz) {
      const { error: updateError } = await client
        .from("members")
        .update({ dwz: data.dwz })
        .eq("id", memberId);

      if (updateError) {
        logger.error(`Failed to update member DWZ: ${updateError.message}`);
        return { success: false, message: updateError.message, updatedCount: 0 };
      }

      const { error: insertError } = await client.from("dwz_history").insert([
        {
          member_id: memberId,
          dwz: data.dwz,
          elo: member.elo,
          source: "api-sync",
          recorded_at: new Date().toISOString().split("T")[0],
        },
      ]);

      if (insertError) {
        logger.error(`Failed to insert DWZ history: ${insertError.message}`);
      }

      return { success: true, message: "DWZ updated", updatedCount: 1 };
    }

    return { success: true, message: "No update needed", updatedCount: 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`DWZ sync failed for member ${memberId}: ${message}`);
    return { success: false, message, updatedCount: 0 };
  }
}

export async function syncAllMembersDwz(): Promise<{
  total: number;
  updated: number;
  errors: number;
}> {
  const client = createServiceClient();

  const { data: allMembers, error } = await client
    .from("members")
    .select("id, dwz_id")
    .not("dwz_id", "is", null);

  if (error) {
    logger.error(`Failed to fetch members for DWZ sync: ${error.message}`);
    return { total: 0, updated: 0, errors: 1 };
  }

  let updated = 0;
  let errors = 0;

  for (const m of allMembers || []) {
    if (m.dwz_id) {
      const result = await syncDwzForMember(m.id, m.dwz_id);
      if (result.success && result.updatedCount > 0) updated++;
      if (!result.success) errors++;

      if ((updated + errors) % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  logger.info(
    `DWZ sync completed: ${updated} updated, ${errors} errors out of ${
      allMembers?.length || 0
    } members`
  );
  return { total: allMembers?.length || 0, updated, errors };
}

export async function handleDwzSyncRequest(memberId?: string) {
  const client = createServiceClient();

  if (memberId) {
    const { data: member, error } = await client
      .from("members")
      .select("id, dwz_id")
      .eq("id", memberId)
      .maybeSingle();

    if (error || !member?.dwz_id) {
      return {
        success: false,
        message: "Member not found or no DWZ ID",
        updatedCount: 0,
      };
    }

    return await syncDwzForMember(member.id, member.dwz_id);
  }

  return await syncAllMembersDwz();
}
