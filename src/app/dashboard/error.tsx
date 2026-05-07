"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Dashboard Error Boundary caught an error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-6">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-6">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          {error.message === "ADMIN_NO_CLUB_CONTEXT" 
            ? "Kein Verein ausgewÃ¤hlt" 
            : "Ein Fehler ist aufgetreten"}
        </h2>
        <p className="text-sm text-muted-foreground mb-8">
          {error.message === "ADMIN_NO_CLUB_CONTEXT"
            ? "Als Admin mÃ¼ssen Sie zuerst einen Verein auswÃ¤hlen, um diese Seite (Statistiken/Finanzen) anzeigen zu kÃ¶nnen."
            : error.message || "Es gab ein Problem beim Laden dieser Seite."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {error.message === "ADMIN_NO_CLUB_CONTEXT" ? (
            <Link href="/admin">
              <Button className="w-full sm:w-auto gap-2">
                <Home className="h-4 w-4" />
                Zur Vereinsauswahl
              </Button>
            </Link>
          ) : (
            <Button onClick={() => reset()} className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Erneut versuchen
            </Button>
          )}
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-background text-sm font-medium h-8 px-2.5 gap-2 hover:bg-muted transition-colors"
          >
            <Home className="h-4 w-4" />
            Zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
