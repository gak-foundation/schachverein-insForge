import { db } from "@/lib/db";
import { members, dwzHistory } from "@/lib/db/schema";
import { fetchDwzData } from "@/lib/dwz";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

// Einfache async Funktion - kein BullMQ mehr
// Wird von API Routes oder Cron-Jobs direkt aufgerufen

interface DwzSyncResult {
  success: boolean;
  message: string;
  updatedCount: number;
}

export async function syncDwzForMember(memberId: string, dwzId: string): Promise<DwzSyncResult> {
  try {
    const data = await fetchDwzData(dwzId);

    if (!data) {
      return { success: false, message: "No DWZ data found", updatedCount: 0 };
    }

    const [member] = await db
      .select({ dwz: members.dwz, elo: members.elo })
      .from(members)
      .where(eq(members.id, memberId));

    if (member && data.dwz !== member.dwz) {
      await db
        .update(members)
        .set({ dwz: data.dwz })
        .where(eq(members.id, memberId));

      await db.insert(dwzHistory).values({
        memberId,
        dwz: data.dwz,
        elo: member.elo,
        source: "api-sync",
        recordedAt: new Date().toISOString().split("T")[0],
      });

      return { success: true, message: "DWZ updated", updatedCount: 1 };
    }

    return { success: true, message: "No update needed", updatedCount: 0 };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`DWZ sync failed for member ${memberId}: ${message}`);
    return { success: false, message, updatedCount: 0 };
  }
}

export async function syncAllMembersDwz(): Promise<{ total: number; updated: number; errors: number }> {
  const allMembers = await db
    .select({ id: members.id, dwzId: members.dwzId })
    .from(members)
    .where(sql`${members.dwzId} IS NOT NULL`);

  let updated = 0;
  let errors = 0;

  for (const m of allMembers) {
    if (m.dwzId) {
      const result = await syncDwzForMember(m.id, m.dwzId);
      if (result.success && result.updatedCount > 0) updated++;
      if (!result.success) errors++;

      // Simple rate limiting
      if ((updated + errors) % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  logger.info(`DWZ sync completed: ${updated} updated, ${errors} errors out of ${allMembers.length} members`);
  return { total: allMembers.length, updated, errors };
}

// Für API Routes: Einzelne Synchronisation
export async function handleDwzSyncRequest(memberId?: string) {
  if (memberId) {
    const [member] = await db
      .select({ id: members.id, dwzId: members.dwzId })
      .from(members)
      .where(eq(members.id, memberId));

    if (member?.dwzId) {
      return await syncDwzForMember(member.id, member.dwzId);
    }
    return { success: false, message: "Member not found or no DWZ ID", updatedCount: 0 };
  }

  return await syncAllMembersDwz();
}
