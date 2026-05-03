import { TrendingUp, ArrowUpRight } from "lucide-react";

type ActivityCardProps = {
  gamesThisMonth: number;
};

export function ActivityCard({ gamesThisMonth }: ActivityCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border/60 p-8 shadow-sm group hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <h2 className="text-xl font-heading tracking-tight text-foreground">Aktivität</h2>
      </div>
      <div className="mb-2">
        <span className="text-8xl font-heading tracking-tighter text-foreground">{gamesThisMonth}</span>
      </div>
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2 mt-2">
        <ArrowUpRight className="h-4 w-4 text-primary" />
        Gespielte Partien diesen Monat
      </p>
    </div>
  );
}
