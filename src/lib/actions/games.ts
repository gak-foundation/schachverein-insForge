"use server";

import { getGameById as originalGetGameById } from "@/features/tournaments/games-actions";

export async function getGameById(id: string) {
  return originalGetGameById(id);
}
