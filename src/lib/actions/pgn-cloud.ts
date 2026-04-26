"use server";

import { getClubGames as originalGetClubGames } from "@/features/training/pgn-actions";

export async function getClubGames() {
  return originalGetClubGames();
}
