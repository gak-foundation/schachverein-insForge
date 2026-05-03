import { createServiceClient } from "@/lib/insforge";
import { fetchLichessGames } from "@/lib/lichess";
import { logger } from "@/lib/logger";

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
  const client = createServiceClient();

  try {
    const lichessGames = await fetchLichessGames(lichessUsername, maxGames);
    let gamesImported = 0;

    for (const lg of lichessGames) {
      const { data: existing } = await client
        .from("games")
        .select("id")
        .eq("lichess_url", `https://lichess.org/${lg.id}`)
        .maybeSingle();

      if (existing) continue;

      const opponentLichessUsername =
        lg.players.white.user?.id === lichessUsername
          ? lg.players.black.user?.id
          : lg.players.white.user?.id;

      let opponentId: string | null = null;
      if (opponentLichessUsername) {
        const { data: opponent } = await client
          .from("members")
          .select("id")
          .eq("lichess_username", opponentLichessUsername)
          .maybeSingle();
        if (opponent) opponentId = opponent.id;
      }

      const isWhite = lg.players.white.user?.id === lichessUsername;
      const whiteId = isWhite ? memberId : opponentId;
      const blackId = isWhite ? opponentId : memberId;

      if (whiteId || blackId) {
        const { error } = await client.from("games").insert([
          {
            club_id: clubId,
            white_id: whiteId,
            black_id: blackId,
            result:
              lg.winner === "white"
                ? "1-0"
                : lg.winner === "black"
                ? "0-1"
                : "1/2-1/2",
            lichess_url: `https://lichess.org/${lg.id}`,
            played_at: new Date(lg.createdAt).toISOString(),
            eco_code: lg.opening?.eco || null,
          },
        ]);

        if (error) {
          logger.error(`Failed to insert game: ${error.message}`);
          continue;
        }
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

export async function syncAllLichessProfiles(): Promise<{
  total: number;
  imported: number;
  errors: number;
}> {
  const client = createServiceClient();

  const { data: allMembers, error } = await client
    .from("members")
    .select("id, lichess_username, club_id")
    .not("lichess_username", "is", null)
    .not("club_id", "is", null);

  if (error) {
    logger.error(`Failed to fetch members for lichess sync: ${error.message}`);
    return { total: 0, imported: 0, errors: 1 };
  }

  let imported = 0;
  let errors = 0;

  for (const m of allMembers || []) {
    if (m.lichess_username && m.club_id) {
      const result = await syncLichessForMember(
        m.id,
        m.lichess_username,
        m.club_id
      );
      if (result.success) imported += result.gamesImported;
      if (!result.success) errors++;

      if ((imported + errors) % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  logger.info(
    `Lichess sync completed: ${imported} games imported, ${errors} errors from ${
      allMembers?.length || 0
    } members`
  );
  return { total: allMembers?.length || 0, imported, errors };
}

export async function handleLichessSyncRequest(memberId?: string) {
  const client = createServiceClient();

  if (memberId) {
    const { data: member, error } = await client
      .from("members")
      .select("id, lichess_username, club_id")
      .eq("id", memberId)
      .not("club_id", "is", null)
      .maybeSingle();

    if (error || !member?.lichess_username || !member.club_id) {
      return {
        success: false,
        message: "Member not found or no Lichess username",
        gamesImported: 0,
      };
    }

    return await syncLichessForMember(
      memberId,
      member.lichess_username,
      member.club_id
    );
  }

  return await syncAllLichessProfiles();
}
