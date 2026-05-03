import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type TodayItem = {
  label: string;
  value: string;
  hint: string;
  href: string;
  icon: LucideIcon;
  tone: string;
};

type TodayItemsProps = {
  items: TodayItem[];
};

export function TodayItems({ items }: TodayItemsProps) {
  if (items.length === 0) return null;

  return (
    <Card className="border-border/50 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Heute wichtig</CardTitle>
            <CardDescription>Die wichtigsten Aufgaben und Bereiche auf einen Blick</CardDescription>
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
            Schnellstart
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <Link key={item.label} href={item.href}>
            <div className="flex h-full flex-col justify-between rounded-xl border border-border/60 bg-background p-4 transition-colors hover:border-primary/30 hover:bg-accent/40">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{item.value}</p>
                </div>
                <div className={cn("rounded-lg p-2", item.tone)}>
                  <item.icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{item.hint}</p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
