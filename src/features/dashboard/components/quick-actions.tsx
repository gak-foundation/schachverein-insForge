import Link from "next/link";

type QuickAction = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type QuickActionsProps = {
  actions: QuickAction[];
};

export function QuickActions({ actions }: QuickActionsProps) {
  if (actions.length === 0) return null;

  return (
    <div className="py-8 border-b border-border/40">
      <div className="mb-6">
        <h2 className="text-xl font-heading tracking-tight">Schnellaktionen</h2>
      </div>
      <div className="flex flex-wrap gap-x-12 gap-y-6">
        {actions.map((action) => (
          <Link key={action.label} href={action.href} className="group flex items-center gap-3">
            <span className="h-8 w-8 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:text-background group-hover:border-foreground transition-all">
              <action.icon className="h-3 w-3" />
            </span>
            <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
