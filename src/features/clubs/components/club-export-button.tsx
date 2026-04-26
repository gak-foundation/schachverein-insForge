"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Database } from "lucide-react";
import { exportClubDataBundle } from "@/lib/actions/export";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

export function ClubExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const data = await exportClubDataBundle();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      const date = new Date().toISOString().split("T")[0];
      const filename = `checkmate-export-${data.metadata.slug}-${date}.json`;
      
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Export fehlgeschlagen. Bitte versuchen Sie es später erneut.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="border-blue-100 dark:border-blue-900/30 shadow-sm bg-blue-50/20 dark:bg-blue-900/5">
      <CardHeader>
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Database className="h-5 w-5" />
          <CardTitle className="text-lg">Datenportabilität & Backup</CardTitle>
        </div>
        <CardDescription>
          Exportieren Sie alle Vereinsdaten (Mitglieder, Finanzen, Turniere) in einer einzigen Datei. 
          Dies dient der DSGVO-Konformität und verhindert einen Vendor-Lock-in.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            variant="outline"
            className="w-full sm:w-auto font-bold border-blue-200 dark:border-blue-800 hover:bg-blue-600 hover:text-white transition-all"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportiere...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Komplett-Export (JSON)
              </>
            )}
          </Button>
          <p className="text-xs text-slate-500 italic">
            Beinhaltet Mitglieder-CSV, Finanzhistorie und Sportdaten.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
