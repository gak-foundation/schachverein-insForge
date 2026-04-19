"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { syncLichessRating } from "@/lib/actions/members";
import { useToast } from "@/hooks/use-toast";

interface LichessSyncButtonProps {
  memberId: string;
}

export function LichessSyncButton({ memberId }: LichessSyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncLichessRating(memberId);
      if (result.success) {
        addToast({
          title: "Synchronisierung erfolgreich",
          description: `Das neue Rating von Lichess (${result.newElo}) wurde uebernommen.`,
          variant: "success",
        });
      }
    } catch (error) {
      addToast({
        title: "Synchronisierung fehlgeschlagen",
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
      Lichess Sync
    </Button>
  );
}
