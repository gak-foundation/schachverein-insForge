"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { requestAccountDeletion, exportMemberData } from "@/lib/actions/gdpr";
import { Loader2, Download, Trash2, ShieldCheck } from "lucide-react";

interface GDPRPortalProps {
  memberId: string;
}

export function GDPRPortal({ memberId }: GDPRPortalProps) {
  const [loadingExport, setLoadingExport] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setLoadingExport(true);
    try {
      const data = await exportMemberData(memberId);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `checkmate-manager-export-${memberId.slice(0, 8)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Daten-Export erfolgreich",
        description: "Ihre personenbezogenen Daten wurden heruntergeladen.",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Export",
        description: "Ihre Daten konnten nicht exportiert werden.",
        variant: "destructive",
      });
    } finally {
      setLoadingExport(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!confirm("Sind Sie sicher? Ihr Account wird deaktiviert und die Loeschung Ihrer Daten wird angefordert.")) {
      return;
    }

    setLoadingDelete(true);
    try {
      const result = await requestAccountDeletion();
      if (result.success) {
        toast({
          title: "Loeschung angefordert",
          description: "Ihr Account wurde deaktiviert. Die finale Loeschung erfolgt nach Ablauf der gesetzlichen Aufbewahrungsfristen.",
        });
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Die Loeschung konnte nicht angefordert werden.",
        variant: "destructive",
      });
    } finally {
      setLoadingDelete(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Datenschutz-Portal (DSGVO)</CardTitle>
          </div>
          <CardDescription>
            Verwalten Sie Ihre personenbezogenen Daten und Ihr Recht auf Auskunft.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
            <div>
              <p className="font-medium">Daten-Portabilitaet (Art. 20 DSGVO)</p>
              <p className="text-sm text-muted-foreground">Laden Sie alle Ihre gespeicherten Daten als JSON-Datei herunter.</p>
            </div>
            <Button variant="outline" onClick={handleExport} disabled={loadingExport}>
              {loadingExport ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Daten exportieren
            </Button>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-destructive">Recht auf Loeschung (Art. 17 DSGVO)</p>
              <p className="text-sm text-muted-foreground">Fordern Sie die Loeschung Ihres Kontos und Ihrer Daten an.</p>
            </div>
            <Button variant="destructive" onClick={handleDeleteRequest} disabled={loadingDelete}>
              {loadingDelete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Konto loeschen
            </Button>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 text-[10px] text-muted-foreground rounded-b-lg">
          Hinweis: Bestimmte Daten (z.B. Beitraege, Turnierergebnisse) unterliegen gesetzlichen Aufbewahrungsfristen und werden ggf. erst nach Ablauf dieser anonymisiert statt geloescht.
        </CardFooter>
      </Card>
    </div>
  );
}
