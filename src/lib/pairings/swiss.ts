/**
 * Swiss System Pairing Service using bbpPairings
 * bbpPairings: https://github.com/BieremaBoyzProgramming/bbpPairings
 */

import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { parseTRF } from "@/lib/trf/parser";
import { env } from "@/env";

const execAsync = promisify(exec);

export interface SwissPairingOptions {
  system: "dutch" | "dubov" | "lim";
  round: number;
  allowUnrated?: boolean;
  accelerate?: boolean;
}

export interface SwissPairing {
  whiteId: string;
  blackId: string;
  board: number;
  whiteDueColor?: boolean;
}

const TEMP_DIR = env.BBP_TEMP_DIR || "./tmp/pairings";

/**
 * Generate Swiss pairings for the next round using bbpPairings.
 * This function is intended to be called from a background worker.
 */
export async function generateSwissPairings(
  trfContent: string,
  options: SwissPairingOptions
): Promise<{
  success: boolean;
  pairings?: SwissPairing[];
  trfOutput?: string;
  errors?: string[];
}> {
  try {
    await mkdir(TEMP_DIR, { recursive: true });

    const timestamp = Date.now();
    const inputFile = join(TEMP_DIR, `input-${timestamp}.trf`);
    const outputFile = join(TEMP_DIR, `output-${timestamp}.trf`);

    await writeFile(inputFile, trfContent, "utf-8");

    const args: string[] = [
      "--" + options.system,
      inputFile,
      "-o",
      outputFile,
    ];

    if (options.allowUnrated) args.push("-u");
    if (options.accelerate) args.push("-a");

    // Strategy: Try local binary first, then fall back to docker if configured
    let cmd = `bbpPairings ${args.join(" ")}`;
    
    // If we are in a docker-aware environment, we might prefer docker
    if (process.env.USE_DOCKER_PAIRINGS === "true") {
      cmd = `docker compose -f docker/docker-compose.yml --profile pairings run --rm bbpPairings bbpPairings --${options.system} /data/input.trf -o /data/output.trf`;
      // Note: This requires proper volume mounting in docker-compose.yml
    }

    try {
      await execAsync(cmd, { timeout: 30000 });
    } catch (execError: any) {
      console.error("[Pairing] Execution error:", execError.message);
      await cleanupFiles(inputFile, outputFile);
      return {
        success: false,
        errors: [`Pairing engine failed: ${execError.message}`],
      };
    }

    const outputContent = await readFile(outputFile, "utf-8");
    const parsed = parseTRF(outputContent);
    const pairings = extractNewRoundPairings(parsed, options.round);

    await cleanupFiles(inputFile, outputFile);

    return {
      success: true,
      pairings,
      trfOutput: outputContent,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Extract pairings for a specific round from parsed TRF
 */
function extractNewRoundPairings(
  parsed: ReturnType<typeof parseTRF>,
  round: number
): SwissPairing[] {
  const pairings: SwissPairing[] = [];

  // Find games for this round in the TRF
  for (const game of parsed.games) {
    if (game.round === round) {
      pairings.push({
        whiteId: game.whiteId,
        blackId: game.blackId,
        board: 0, // Assigned below
      });
    }
  }

  // Assign board numbers based on order in TRF
  pairings.forEach((p, idx) => {
    p.board = idx + 1;
  });

  return pairings;
}

async function cleanupFiles(...files: string[]) {
  for (const file of files) {
    try {
      await rm(file, { force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}
