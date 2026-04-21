// Shim for pairing-worker compatibility
// Exports getPairingQueue which calls the pairing functions directly

import { generateTournamentPairings } from "./pairing";

// Simple queue shim - executes directly without BullMQ
export function getPairingQueue() {
  return {
    add: async (jobName: string, data: unknown) => {
      // Support both "generate-pairings" and "pairing-{tournamentId}-{round}" formats
      if (jobName === "generate-pairings" || jobName.startsWith("pairing-")) {
        const result = await generateTournamentPairings(data as Parameters<typeof generateTournamentPairings>[0]);
        return {
          id: "direct-" + Date.now(),
          finished: () => Promise.resolve(result),
        };
      }
      throw new Error(`Unknown job: ${jobName}`);
    },
  };
}
