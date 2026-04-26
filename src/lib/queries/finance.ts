import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPayments,
  getPaymentStats,
  getContributionRates,
  createPayment,
  updatePaymentStatus,
  upsertContributionRate,
  deleteContributionRate,
} from "@/features/finance/actions";

// Query Keys
export const financeKeys = {
  all: ["finance"] as const,
  payments: () => [...financeKeys.all, "payments"] as const,
  stats: () => [...financeKeys.all, "stats"] as const,
  rates: () => [...financeKeys.all, "rates"] as const,
};

/**
 * Hook für Zahlungen
 */
export function usePayments() {
  return useQuery({
    queryKey: financeKeys.payments(),
    queryFn: getPayments,
    staleTime: 2 * 60 * 1000, // 2 Minuten
  });
}

/**
 * Hook für Zahlungsstatistiken
 */
export function usePaymentStats() {
  return useQuery({
    queryKey: financeKeys.stats(),
    queryFn: getPaymentStats,
    staleTime: 1 * 60 * 1000, // 1 Minute
  });
}

/**
 * Hook für Beitragssätze
 */
export function useContributionRates() {
  return useQuery({
    queryKey: financeKeys.rates(),
    queryFn: getContributionRates,
    staleTime: 10 * 60 * 1000, // 10 Minuten
  });
}

/**
 * Mutation zum Erstellen einer Zahlung
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payments() });
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() });
    },
  });
}

/**
 * Mutation zum Aktualisieren des Zahlungsstatus
 */
export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentId, status }: { paymentId: string; status: string }) =>
      updatePaymentStatus(paymentId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.payments() });
      queryClient.invalidateQueries({ queryKey: financeKeys.stats() });
    },
  });
}

/**
 * Mutation zum Erstellen/Aktualisieren eines Beitragssatzes
 */
export function useUpsertContributionRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertContributionRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.rates() });
    },
  });
}

/**
 * Mutation zum Löschen eines Beitragssatzes
 */
export function useDeleteContributionRate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteContributionRate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.rates() });
    },
  });
}
