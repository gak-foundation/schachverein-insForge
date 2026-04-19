"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * QueryClient Provider für TanStack Query
 * Konfiguriert mit sinnvollen Defaults für das Dashboard
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 5 Minuten Stale Time für Listen (werden nicht so oft aktualisiert)
            staleTime: 5 * 60 * 1000,
            // 10 Minuten Cache Time
            gcTime: 10 * 60 * 1000,
            // Retry bei Fehlern
            retry: 2,
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch bei Window Focus deaktiviert (mobil freundlicher)
            refetchOnWindowFocus: false,
            // Refetch bei Network Reconnect aktiviert
            refetchOnReconnect: true,
          },
          mutations: {
            // Mutationen werden standardmäßig nicht retryed
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
