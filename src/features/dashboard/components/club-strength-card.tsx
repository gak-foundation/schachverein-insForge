import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp } from "lucide-react";

type ClubStrengthCardProps = {
  avgDwz: number | null;
  memberCount: number;
};

export function ClubStrengthCard({ avgDwz, memberCount }: ClubStrengthCardProps) {
  return (
    <Card className="bg-card shadow-xl shadow-black/5 border-border/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
        <Target className="h-32 w-32" />
      </div>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Vereinsstärke (DWZ)</CardTitle>
            <CardDescription>Durchschnittliche DWZ aller aktiven Spieler</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-6xl font-bold tracking-tighter text-foreground mb-2">{avgDwz ?? "N/A"}</div>
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          Basierend auf {memberCount} Mitgliedern
        </p>
      </CardContent>
    </Card>
  );
}
