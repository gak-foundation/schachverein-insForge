import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    <Card className="shadow-lg border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Schnellaktionen</CardTitle>
        <CardDescription>Häufige Verwaltungsaufgaben</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Button variant="outline" className="w-full h-20 flex-col gap-2 hover:bg-primary hover:text-primary-foreground group">
                <action.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
