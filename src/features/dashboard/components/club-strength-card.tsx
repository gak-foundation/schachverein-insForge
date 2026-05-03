import { Target, TrendingUp } from "lucide-react";

type ClubStrengthCardProps = {
  avgDwz: number | null;
  memberCount: number;
};

export function ClubStrengthCard({ avgDwz, memberCount }: ClubStrengthCardProps) {
  return (
    <div className="py-8 border-b border-border/40 group">
      <div className="flex items-center gap-3 mb-6">
        <Target className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        <h2 className="text-xl font-heading tracking-tight">Vereinsstärke (DWZ)</h2>
      </div>
      <div className="mb-2">
        <span className="text-8xl font-heading tracking-tighter text-foreground">{avgDwz ?? "N/A"}</span>
      </div>
      <p className="text-xs uppercase tracking-widest font-semibold text-muted-foreground flex items-center gap-2">
        <TrendingUp className="h-4 w-4" />
        Basierend auf {memberCount} Mitgliedern
      </p>
    </div>
  );
}
