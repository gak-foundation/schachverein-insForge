"use server";

import { getTeamById as originalGetTeamById, getTeamMembers as originalGetTeamMembers } from "@/features/teams/actions";

export async function getTeamById(id: string) {
  return originalGetTeamById(id);
}

export async function getTeamMembers(teamId: string) {
  return originalGetTeamMembers(teamId);
}
