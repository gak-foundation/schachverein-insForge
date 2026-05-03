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
    <div className="py-8">
      <div className="flex items-baseline justify-between mb-8 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-heading tracking-tight">Mannschaftskämpfe</h2>
          <p className="text-sm text-muted-foreground mt-1">Nächste Spieltage</p>
        </div>
        <Link href="/dashboard/teams" className="text-sm font-semibold uppercase tracking-widest hover:text-primary transition-colors">
          Alle anzeigen
        </Link>
      </div>
      <div className="space-y-0">
        {matches.map((match) => (
          <Link key={match.id} href="/dashboard/teams" className="group block border-b border-border/40 py-6 hover:bg-muted/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="flex flex-col items-center justify-center w-16">
                  <span className="text-4xl font-heading tracking-tighter group-hover:text-primary transition-colors">
                    {match.matchDate ? new Date(match.matchDate).toLocaleDateString("de-DE", { day: "2-digit" }) : "-"}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mt-1">
                    {match.matchDate ? new Date(match.matchDate).toLocaleDateString("de-DE", { month: "short" }) : "TBA"}
                  </span>
                </div>
                <div>
                  <p className="text-xl font-heading tracking-tight text-foreground group-hover:text-primary transition-colors">{match.homeTeamName}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" />
                    {match.location || "Heimspiel"}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all mr-4 transform group-hover:translate-x-2" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
