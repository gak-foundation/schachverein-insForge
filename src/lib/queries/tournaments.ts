import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTournaments,
  getTournamentById,
  createTournament,
  updateTournament,
  deleteTournament,
  getTournamentParticipants,
  getTournamentGames,
} from "@/lib/actions/tournaments";

// Query Keys
export const tournamentKeys = {
  all: ["tournaments"] as const,
  lists: () => [...tournamentKeys.all, "list"] as const,
  details: (id: string) => [...tournamentKeys.all, "detail", id] as const,
  participants: (id: string) => [...tournamentKeys.all, "participants", id] as const,
  games: (id: string, round?: number) =>
    [...tournamentKeys.all, "games", id, { round }] as const,
};

/**
 * Hook für Turnier-Liste
 */
export function useTournaments() {
  return useQuery({
    queryKey: tournamentKeys.lists(),
    queryFn: getTournaments,
    staleTime: 5 * 60 * 1000, // 5 Minuten
  });
}

/**
 * Hook für einzelnes Turnier
 */
export function useTournament(id: string) {
  return useQuery({
    queryKey: tournamentKeys.details(id),
    queryFn: () => getTournamentById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 Minuten
  });
}

/**
 * Hook für Turnier-Teilnehmer
 */
export function useTournamentParticipants(tournamentId: string) {
  return useQuery({
    queryKey: tournamentKeys.participants(tournamentId),
    queryFn: () => getTournamentParticipants(tournamentId),
    enabled: !!tournamentId,
    staleTime: 1 * 60 * 1000, // 1 Minute (kürzer da sich Ergebnisse ändern)
  });
}

/**
 * Hook für Turnier-Spiele
 */
export function useTournamentGames(tournamentId: string, round?: number) {
  return useQuery({
    queryKey: tournamentKeys.games(tournamentId, round),
    queryFn: () => getTournamentGames(tournamentId, round),
    enabled: !!tournamentId,
    staleTime: 1 * 60 * 1000, // 1 Minute
  });
}

/**
 * Mutation zum Erstellen eines Turniers
 */
export function useCreateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTournament,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
    },
  });
}

/**
 * Mutation zum Aktualisieren eines Turniers
 */
export function useUpdateTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTournament,
    onSuccess: (_, variables) => {
      const formData = variables as FormData;
      const id = formData.get("id") as string;
      
      queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
      if (id) {
        queryClient.invalidateQueries({ queryKey: tournamentKeys.details(id) });
      }
    },
  });
}

/**
 * Mutation zum Löschen eines Turniers
 */
export function useDeleteTournament() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTournament,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.all });
      queryClient.removeQueries({ queryKey: tournamentKeys.details(id) });
      queryClient.removeQueries({ queryKey: tournamentKeys.participants(id) });
      queryClient.removeQueries({ queryKey: tournamentKeys.games(id) });
    },
  });
}
