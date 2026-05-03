import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, ArrowUpRight } from "lucide-react";

type ActivityCardProps = {
  gamesThisMonth: number;
};

export function ActivityCard({ gamesThisMonth }: ActivityCardProps) {
  return (
    <Card className="bg-card shadow-xl shadow-black/5 border-border/50 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500">
        <TrendingUp className="h-32 w-32" />
      </div>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Aktivität</CardTitle>
            <CardDescription>Gespielte Partien diesen Monat</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="text-6xl font-bold tracking-tighter text-foreground mb-2">{gamesThisMonth}</div>
        <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
          <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          Steigerung zum Vormonat
        </p>
      </CardContent>
    </Card>
  );
}
