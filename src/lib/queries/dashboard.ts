import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardStats,
  getAuditLogs,
  getDocuments,
} from "@/lib/actions/audit";

// Query Keys
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  logs: (limit?: number) => [...dashboardKeys.all, "logs", { limit }] as const,
  documents: () => [...dashboardKeys.all, "documents"] as const,
};

/**
 * Hook für Dashboard Statistiken
 * Kurze staleTime da sich Statistiken häufig ändern können
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: getDashboardStats,
    staleTime: 1 * 60 * 1000, // 1 Minute
    refetchInterval: 5 * 60 * 1000, // Automatisch alle 5 Minuten aktualisieren
  });
}

/**
 * Hook für Audit Logs
 */
export function useAuditLogs(limit = 100) {
  return useQuery({
    queryKey: dashboardKeys.logs(limit),
    queryFn: () => getAuditLogs(limit),
    staleTime: 2 * 60 * 1000, // 2 Minuten
  });
}

/**
 * Hook für Dokumente
 */
export function useDocuments() {
  return useQuery({
    queryKey: dashboardKeys.documents(),
    queryFn: getDocuments,
    staleTime: 5 * 60 * 1000, // 5 Minuten
  });
}

/**
 * Mutation zum Invalidieren der Dashboard-Stats
 * Kann nach relevanten Änderungen aufgerufen werden
 */
export function useRefreshDashboard() {
  const queryClient = useQueryClient();

  return {
    refresh: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.stats() });
    },
  };
}
