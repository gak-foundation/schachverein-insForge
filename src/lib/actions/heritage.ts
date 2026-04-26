"use server";

import { getHeritageGame as originalGetHeritageGame } from "@/features/members/heritage-actions";

export async function getHeritageGame(memberId: string) {
  return originalGetHeritageGame(memberId);
}
