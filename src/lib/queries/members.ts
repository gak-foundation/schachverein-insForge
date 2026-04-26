import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  type MemberSortField,
  type SortOrder,
} from "@/features/members/actions";

// Query Keys
export const memberKeys = {
  all: ["members"] as const,
  lists: (search?: string, role?: string, status?: string) =>
    [...memberKeys.all, "list", { search, role, status }] as const,
  details: (id: string) => [...memberKeys.all, "detail", id] as const,
};

/**
 * Hook für Mitglieder-Liste mit Filterung und Pagination
 */
export function useMembers(
  search?: string,
  role?: string,
  status?: string,
  sortBy: MemberSortField = "name",
  sortOrder: SortOrder = "asc",
  page: number = 1,
  pageSize: number = 25
) {
  return useQuery({
    queryKey: memberKeys.lists(search, role, status),
    queryFn: () => getMembers(search, role, status, sortBy, sortOrder, page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 Minuten
  });
}

/**
 * Hook für einzelnes Mitglied
 */
export function useMember(id: string) {
  return useQuery({
    queryKey: memberKeys.details(id),
    queryFn: () => getMemberById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 Minuten
  });
}

/**
 * Mutation zum Erstellen eines Mitglieds
 */
export function useCreateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,
    onSuccess: () => {
      // Liste invalidieren
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
    },
  });
}

/**
 * Mutation zum Aktualisieren eines Mitglieds
 */
export function useUpdateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMember,
    onSuccess: (_, variables) => {
      const formData = variables as FormData;
      const id = formData.get("id") as string;
      
      // Liste und Detail invalidieren
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
      if (id) {
        queryClient.invalidateQueries({ queryKey: memberKeys.details(id) });
      }
    },
  });
}

/**
 * Mutation zum Löschen eines Mitglieds
 */
export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMember,
    onSuccess: (_, id) => {
      // Liste invalidieren, Detail entfernen
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
      queryClient.removeQueries({ queryKey: memberKeys.details(id) });
    },
  });
}
