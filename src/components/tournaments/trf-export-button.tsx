"use client";

import { useState } from "react";
import { generateTRF } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface TRFExportButtonProps {
  tournamentId: string;
}

export function TRFExportButton({ tournamentId }: TRFExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      const trfContent = await generateTRF(tournamentId);
      const blob = new Blob([trfContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tournament-${tournamentId}.trf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export fehlgeschlagen. Bitte versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1"
      onClick={handleExport}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      TRF Export
    </Button>
  );
}
