"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { triggerDunningRun } from "@/features/finance/actions";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle, Send } from "lucide-react";

interface DunningStat {
  level: number;
  count: number;
  amount: string;
}

interface DunningOverviewProps {
  stats: DunningStat[];
  canWrite: boolean;
}

export function DunningOverview({ stats, canWrite }: DunningOverviewProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleTriggerRun = async () => {
    setLoading(true);
    try {
      const result = await triggerDunningRun();
      if (result.success) {
        toast({
          title: "Mahnlauf abgeschlossen",
          description: `${result.processed} Zahlungen wurden verarbeitet.`,
        });
      }
    } catch {
      toast({
        title: "Fehler",
        description: "Der Mahnlauf konnte nicht gestartet werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalOverdue = stats.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalCount = stats.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ueberfaellige Zahlungen</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
            <p className="text-xs text-muted-foreground">Insgesamt ueberschrittene Zahlungsziele</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtbetrag Offen</CardTitle>
            <span className="text-destructive font-bold">€</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOverdue.toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground">Summe aller ueberfaelligen Betraege</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-center p-6">
          <Button 
            onClick={handleTriggerRun} 
            disabled={loading || !canWrite}
            className="w-full"
            variant="destructive"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Mahnlauf starten
          </Button>
          <p className="mt-2 text-[10px] text-center text-muted-foreground">
            Prueft alle fälligen Zahlungen und erhoeht die Mahnstufe.
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mahnstufen-Statistik</CardTitle>
          <CardDescription>Uebersicht der Zahlungen nach aktueller Mahnstufe</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mahnstufe</TableHead>
                <TableHead>Anzahl</TableHead>
                <TableHead className="text-right">Gesamtbetrag</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-muted-foreground">
                    Keine ueberfaelligen Zahlungen vorhanden.
                  </TableCell>
                </TableRow>
              ) : (
                stats.map((stat) => (
                  <TableRow key={stat.level}>
                    <TableCell className="font-medium">
                      {stat.level === 0 ? "Erinnerung ausstehend" : `Mahnstufe ${stat.level}`}
                    </TableCell>
                    <TableCell>{stat.count}</TableCell>
                    <TableCell className="text-right">{Number(stat.amount).toFixed(2)} €</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
