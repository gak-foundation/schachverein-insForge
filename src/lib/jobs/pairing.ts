import { createServiceClient } from "@/lib/insforge";
import { generateSwissPairings, SwissPairingOptions } from "@/lib/pairings/swiss";
import { logger } from "@/lib/logger";

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

  const client = createServiceClient();

  try {
    const result = await generateSwissPairings(trfContent, options);

    if (!result.success || !result.pairings) {
      throw new Error(result.errors?.join(", ") || "Pairing failed");
    }

    if (result.trfOutput) {
      const { error } = await client
        .from("tournaments")
        .update({ trf_data: result.trfOutput, updated_at: new Date().toISOString() })
        .eq("id", tournamentId);

      if (error) {
        logger.error(`Failed to update tournament TRF data: ${error.message}`);
      }
    }

    const { data: tournament, error: tournamentError } = await client
      .from("tournaments")
      .select("club_id")
      .eq("id", tournamentId)
      .single();

    if (tournamentError || !tournament) {
      throw new Error("Tournament not found");
    }

    const newGames = result.pairings.map((p) => ({
      tournament_id: tournamentId,
      club_id: tournament.club_id,
      round: options.round,
      board_number: p.board,
      white_id: p.whiteId,
      black_id: p.blackId,
      result: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    if (newGames.length > 0) {
      const { error } = await client.from("games").insert(newGames);

      if (error) {
        logger.error(`Failed to insert games: ${error.message}`);
        throw new Error(`Failed to insert games: ${error.message}`);
      }
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

export async function handlePairingRequest(data: PairingJobData) {
  return await generateTournamentPairings(data);
}
