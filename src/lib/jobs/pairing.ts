import { db } from "@/lib/db";
import { tournaments, games } from "@/lib/db/schema";
import { generateSwissPairings, SwissPairingOptions } from "@/lib/pairings/swiss";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

// Einfache async Funktion - kein BullMQ mehr
// Wird direkt von API Routes aufgerufen

interface PairingJobData {
  tournamentId: string;
  trfContent: string;
  options: SwissPairingOptions;
}

interface PairingJobResult {
  success: boolean;
  pairingsCount?: number;
  error?: string;
}

export async function generateTournamentPairings({
  tournamentId,
  trfContent,
  options,
}: PairingJobData): Promise<PairingJobResult> {
  logger.info(`Processing pairing for tournament ${tournamentId}, round ${options.round}`);

  try {
    // Generate pairings using Swiss system
    const result = await generateSwissPairings(trfContent, options);

    if (!result.success || !result.pairings) {
      throw new Error(result.errors?.join(", ") || "Pairing failed");
    }

    // Update tournament with new TRF data
    if (result.trfOutput) {
      await db
        .update(tournaments)
        .set({ trfData: result.trfOutput, updatedAt: new Date() })
        .where(eq(tournaments.id, tournamentId));
    }

    // Get clubId
    const [tournament] = await db
      .select({ clubId: tournaments.clubId })
      .from(tournaments)
      .where(eq(tournaments.id, tournamentId));

    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Insert new games
    const newGames = result.pairings.map(p => ({
      tournamentId,
      clubId: tournament.clubId,
      round: options.round,
      boardNumber: p.board,
      whiteId: p.whiteId,
      blackId: p.blackId,
      result: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    if (newGames.length > 0) {
      await db.insert(games).values(newGames);
    }

    logger.info(`Pairings generated: ${result.pairings.length} games`);
    return {
      success: true,
      pairingsCount: result.pairings.length,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    logger.error(`Pairing failed for tournament ${tournamentId}: ${message}`);
    return {
      success: false,
      error: message,
    };
  }
}

// API Route Handler
export async function handlePairingRequest(data: PairingJobData) {
  return await generateTournamentPairings(data);
}
