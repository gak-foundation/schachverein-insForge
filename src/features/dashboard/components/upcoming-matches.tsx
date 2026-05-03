import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";

type Match = {
  id: string;
  matchDate: Date | null;
  homeTeamName: string;
  location: string | null;
};

type UpcomingMatchesProps = {
  matches: Match[];
};

export function UpcomingMatches({ matches }: UpcomingMatchesProps) {
  if (matches.length === 0) return null;

  return (
    <Card className="shadow-lg border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Mannschaftskämpfe</CardTitle>
          <CardDescription>Nächste Spieltage</CardDescription>
        </div>
        <Link href="/dashboard/teams">
          <Button variant="ghost" size="sm" className="gap-2 font-bold text-primary">Alle anzeigen</Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between rounded-xl border p-4 hover:bg-accent transition-all group">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-card border flex flex-col items-center justify-center font-bold">
                  <span className="text-[10px] uppercase text-muted-foreground leading-none">
                    {match.matchDate ? new Date(match.matchDate).toLocaleDateString("de-DE", { month: "short" }) : "TBA"}
                  </span>
                  <span className="text-lg">
                    {match.matchDate ? new Date(match.matchDate).toLocaleDateString("de-DE", { day: "2-digit" }) : "-"}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors">{match.homeTeamName}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {match.location || "Heimspiel"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all mr-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
