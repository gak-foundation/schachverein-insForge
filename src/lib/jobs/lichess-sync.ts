import { db } from "@/lib/db";
import { members, games, clubMemberships } from "@/lib/db/schema";
import { fetchLichessGames } from "@/lib/lichess";
import { eq, sql, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

// Einfache async Funktion - kein BullMQ mehr
// Wird von API Routes oder Cron-Jobs direkt aufgerufen

interface LichessSyncResult {
  success: boolean;
  message: string;
  gamesImported: number;
}

export async function syncLichessForMember(
  memberId: string,
  lichessUsername: string,
  clubId: string,
  maxGames: number = 10
): Promise<LichessSyncResult> {
  try {
    const lichessGames = await fetchLichessGames(lichessUsername, maxGames);
    let gamesImported = 0;

    for (const lg of lichessGames) {
      // Check if game already exists
      const [existing] = await db
        .select({ id: games.id })
        .from(games)
        .where(eq(games.lichessUrl, `https://lichess.org/${lg.id}`));

      if (existing) continue;

      // Try to find the opponent
      const opponentLichessUsername = lg.players.white.user?.id === lichessUsername
        ? lg.players.black.user?.id
        : lg.players.white.user?.id;

      let opponentId: string | null = null;
      if (opponentLichessUsername) {
        const [opponent] = await db
          .select({ id: members.id })
          .from(members)
          .where(eq(members.lichessUsername, opponentLichessUsername));
        if (opponent) opponentId = opponent.id;
      }

      const isWhite = lg.players.white.user?.id === lichessUsername;
      const whiteId = isWhite ? memberId : opponentId;
      const blackId = isWhite ? opponentId : memberId;

      if (whiteId || blackId) {
        await db.insert(games).values({
          clubId,
          whiteId,
          blackId,
          result: lg.winner === "white" ? "1-0" : lg.winner === "black" ? "0-1" : "1/2-1/2",
          lichessUrl: `https://lichess.org/${lg.id}`,
          playedAt: new Date(lg.createdAt),
          ecoCode: lg.opening?.eco || null,
        });
        gamesImported++;
      }
    }



    return { success: true, message: "Sync completed", gamesImported };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error(`Lichess sync failed for member ${memberId}: ${message}`);
    return { success: false, message, gamesImported: 0 };
  }
}

export async function syncAllLichessProfiles(): Promise<{ total: number; imported: number; errors: number }> {
  const allMembers = await db
    .select({
      id: members.id,
      lichessUsername: members.lichessUsername,
      clubId: clubMemberships.clubId
    })
    .from(members)
    .innerJoin(clubMemberships, eq(members.id, clubMemberships.memberId))
    .where(and(
      sql`${members.lichessUsername} IS NOT NULL`,
      eq(clubMemberships.isPrimary, true)
    ));

  let imported = 0;
  let errors = 0;

  for (const m of allMembers) {
    if (m.lichessUsername && m.clubId) {
      const result = await syncLichessForMember(m.id, m.lichessUsername, m.clubId);
      if (result.success) imported += result.gamesImported;
      if (!result.success) errors++;

      // Simple rate limiting
      if ((imported + errors) % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  logger.info(`Lichess sync completed: ${imported} games imported, ${errors} errors from ${allMembers.length} members`);
  return { total: allMembers.length, imported, errors };
}

// Für API Routes
export async function handleLichessSyncRequest(memberId?: string) {
  if (memberId) {
    const [member] = await db
      .select({
        id: members.id,
        lichessUsername: members.lichessUsername,
      })
      .from(members)
      .innerJoin(clubMemberships, eq(members.id, clubMemberships.memberId))
      .where(and(
        eq(members.id, memberId),
        eq(clubMemberships.isPrimary, true)
      ));

    if (member?.lichessUsername && member.id) {
      // Need to get clubId
      const [membership] = await db
        .select({ clubId: clubMemberships.clubId })
        .from(clubMemberships)
        .where(eq(clubMemberships.memberId, memberId));

      if (membership) {
        return await syncLichessForMember(memberId, member.lichessUsername, membership.clubId);
      }
    }
    return { success: false, message: "Member not found or no Lichess username", gamesImported: 0 };
  }

  return await syncAllLichessProfiles();
}
