/**
 * Swiss System Pairing Service using bbpPairings
 * bbpPairings: https://github.com/BieremaBoyzProgramming/bbpPairings
 * 
 * Supports:
 * - Dutch (FIDE) system
 * - Dubov system
 * - Lim system
 * 
 * Usage workflow:
 * 1. Export TRF from current tournament state
 * 2. Run bbpPairings to generate next round pairings
 * 3. Import the resulting TRF with new pairings
 * 4. Create game records for the new round
 */

import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, readFile, mkdir, rm } from "fs/promises";
import { join } from "path";
import { parseTRF } from "@/lib/trf/parser";

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

const BBP_PAIRINGS_CONTAINER = process.env.BBP_PAIRINGS_CONTAINER ?? "schachverein-pairings";
const TEMP_DIR = process.env.BBP_TEMP_DIR ?? "/tmp/bbp-pairings";

/**
 * Generate Swiss pairings for the next round using bbpPairings
 */
export async function generateSwissPairings(
  trfContent: string,
  options: SwissPairingOptions
): Promise<{
  success: boolean;
  pairings?: SwissPairing[];
  errors?: string[];
}> {
  try {
    // Ensure temp directory exists
    await mkdir(TEMP_DIR, { recursive: true });

    const timestamp = Date.now();
    const inputFile = join(TEMP_DIR, `input-${timestamp}.trf`);
    const outputFile = join(TEMP_DIR, `output-${timestamp}.trf`);

    // Write TRF input
    await writeFile(inputFile, trfContent, "utf-8");

    // Build bbpPairings arguments
    const args: string[] = [
      "--" + options.system,
      "/data/input.trf",
      "-o",
      "/data/output.trf",
    ];

    if (options.allowUnrated) {
      args.push("-u");
    }

    if (options.accelerate) {
      args.push("-a");
    }

    // Run bbpPairings via Docker
    const cmd = `docker compose -f docker/docker-compose.yml --profile pairings run --rm bbpPairings bbpPairings ${args.join(" ")}`;

    const { stdout, stderr } = await execAsync(cmd, {
      cwd: process.cwd(),
      timeout: 30000, // 30 second timeout
    });

    if (stderr && stderr.includes("error")) {
      return {
        success: false,
        errors: [stderr],
      };
    }

    // Read output TRF
    let outputContent: string;
    try {
      outputContent = await readFile(outputFile, "utf-8");
    } catch {
      // Try reading from mounted volume path
      outputContent = await readFile(
        join(process.cwd(), "docker/trf-data", `output-${timestamp}.trf`),
        "utf-8"
      );
    }

    // Parse the output to extract new round pairings
    const parsed = parseTRF(outputContent);
    const pairings = extractNewRoundPairings(parsed, options.round);

    // Cleanup temp files
    await cleanupFiles(inputFile, outputFile);

    return {
      success: true,
      pairings,
    };
  } catch (error) {
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Check if bbpPairings container is available
 */
export async function isBbpPairingsAvailable(): Promise<boolean> {
  try {
    const { stdout } = await execAsync(
      `docker ps --filter "name=${BBP_PAIRINGS_CONTAINER}" --format "{{.Names}}"`,
      { timeout: 5000 }
    );
    return stdout.trim().includes(BBP_PAIRINGS_CONTAINER);
  } catch {
    return false;
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
  const playerMap = new Map<string, string>(); // TRF ID -> external ID

  // Build player map
  for (const player of parsed.players) {
    playerMap.set(player.id, player.id);
  }

  // Find games for this round
  for (const game of parsed.games) {
    if (game.round === round) {
      pairings.push({
        whiteId: game.whiteId,
        blackId: game.blackId,
        board: 0, // Will be assigned based on sorting
      });
    }
  }

  // Sort by player strength (optional) and assign board numbers
  pairings.sort((a, b) => {
    // Could sort by average rating here if available
    return 0;
  });

  // Assign board numbers
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

/**
 * Alternative: Run bbpPairings directly if installed locally
 */
export async function generateSwissPairingsLocal(
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

    const cmd = `bbpPairings ${args.join(" ")}`;

    await execAsync(cmd, { timeout: 30000 });

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
