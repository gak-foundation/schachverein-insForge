"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { syncAllMembersDwz } from "@/features/members/actions";
import { useToast } from "@/components/ui/use-toast";

export function DwzSyncButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncAllMembersDwz();
      addToast({
        title: "DWZ-Sync abgeschlossen",
        description: `${result.updatedCount} Mitglieder aktualisiert (${result.total} geprüft).`,
        variant: "success",
      });
    } catch (error) {
      addToast({
        title: "DWZ-Sync fehlgeschlagen",
        description: error instanceof Error ? error.message : "Ein unbekannter Fehler ist aufgetreten.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSync}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      Alle DWZ synchronisieren
    </Button>
  );
}
