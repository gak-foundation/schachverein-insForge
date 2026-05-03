import { TrendingUp, ArrowUpRight } from "lucide-react";

type ActivityCardProps = {
  gamesThisMonth: number;
};

export function ActivityCard({ gamesThisMonth }: ActivityCardProps) {
  return (
    <div className="py-8 border-b border-border/40 group">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <h2 className="text-xl font-heading tracking-tight">Aktivität</h2>
      </div>
      <div className="mb-2">
        <span className="text-8xl font-heading tracking-tighter text-foreground">{gamesThisMonth}</span>
      </div>
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2 mt-2">
        <ArrowUpRight className="h-4 w-4" />
        Gespielte Partien diesen Monat
      </p>
    </div>
  );
}
