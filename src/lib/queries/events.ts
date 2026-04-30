import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getEvents,
  getSeasons,
  createEvent,
  createSeason,
} from "@/features/calendar/actions";

// Query Keys
export const eventKeys = {
  all: ["events"] as const,
  lists: (limit?: number) => [...eventKeys.all, "list", { limit }] as const,
  seasons: () => [...eventKeys.all, "seasons"] as const,
};

/**
 * Hook für Events-Liste
 */
export function useEvents(limit?: number) {
  return useQuery({
    queryKey: eventKeys.lists(limit),
    queryFn: () => getEvents(limit),
    staleTime: 5 * 60 * 1000, // 5 Minuten
  });
}

/**
 * Hook für Saisons
 */
export function useSeasons() {
  return useQuery({
    queryKey: eventKeys.seasons(),
    queryFn: getSeasons,
    staleTime: 10 * 60 * 1000, // 10 Minuten (seltene Änderungen)
  });
}

/**
 * Mutation zum Erstellen eines Events
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createEvent(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

/**
 * Mutation zum Erstellen einer Saison
 */
export function useCreateSeason() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createSeason(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.seasons() });
    },
  });
}
