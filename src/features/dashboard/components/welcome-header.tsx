import { LayoutDashboard } from "lucide-react";

type WelcomeHeaderProps = {
  firstName: string;
  subtitle: string;
  roleLabel: string;
};

export function WelcomeHeader({ firstName, subtitle, roleLabel }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">
          Willkommen, {firstName}!
        </h1>
        <p className="mt-2 text-muted-foreground text-lg">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 bg-accent rounded-full text-accent-foreground text-sm font-bold shadow-sm border border-border/50">
        <LayoutDashboard className="h-4 w-4" />
        <span className="uppercase tracking-widest text-[10px]">{roleLabel}</span>
      </div>
    </div>
  );
}
