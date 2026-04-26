import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getTeamMembers,
} from "@/features/teams/actions";

// Query Keys
export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  details: (id: string) => [...teamKeys.all, "detail", id] as const,
  members: (id: string) => [...teamKeys.all, "members", id] as const,
};

/**
 * Hook für Mannschafts-Liste
 */
export function useTeams() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: getTeams,
    staleTime: 5 * 60 * 1000, // 5 Minuten
  });
}

/**
 * Hook für einzelne Mannschaft
 */
export function useTeam(id: string) {
  return useQuery({
    queryKey: teamKeys.details(id),
    queryFn: () => getTeamById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 Minuten
  });
}

/**
 * Hook für Mannschafts-Mitglieder
 */
export function useTeamMembers(teamId: string) {
  return useQuery({
    queryKey: teamKeys.members(teamId),
    queryFn: () => getTeamMembers(teamId),
    enabled: !!teamId,
    staleTime: 2 * 60 * 1000, // 2 Minuten
  });
}

/**
 * Mutation zum Erstellen einer Mannschaft
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

/**
 * Mutation zum Aktualisieren einer Mannschaft
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTeam,
    onSuccess: (_, variables) => {
      const formData = variables as FormData;
      const id = formData.get("id") as string;
      
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      if (id) {
        queryClient.invalidateQueries({ queryKey: teamKeys.details(id) });
      }
    },
  });
}

/**
 * Mutation zum Löschen einer Mannschaft
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeam,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
      queryClient.removeQueries({ queryKey: teamKeys.details(id) });
      queryClient.removeQueries({ queryKey: teamKeys.members(id) });
    },
  });
}
