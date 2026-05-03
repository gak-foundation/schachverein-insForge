"use server";

import { getTeamById as originalGetTeamById, getTeamMembers as originalGetTeamMembers, getBoardOrders as originalGetBoardOrders } from "@/features/teams/actions";

export async function getTeamById(id: string) {
  return originalGetTeamById(id);
}

export async function getTeamMembers(teamId: string) {
  return originalGetTeamMembers(teamId);
}

export async function getBoardOrders(teamId: string, seasonId: string) {
  return originalGetBoardOrders(teamId, seasonId);
}
