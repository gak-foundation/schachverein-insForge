import type { LucideIcon } from "lucide-react";
import Link from "next/link";
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
    <div className="py-10">
      <div className="flex items-baseline justify-between mb-6">
        <div>
          <h2 className="text-2xl font-heading tracking-tight text-foreground">Heute wichtig</h2>
          <p className="text-muted-foreground text-sm mt-1">Die wichtigsten Aufgaben und Bereiche auf einen Blick</p>
        </div>
        <span className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">Schnellstart</span>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <Link key={item.label} href={item.href} className="group block h-full">
            <div className="flex flex-col h-full justify-between bg-card rounded-xl border border-border/60 p-6 shadow-sm group-hover:border-primary/30 group-hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">{item.label}</p>
                  <p className="text-5xl font-heading tracking-tighter mb-2 text-foreground">{item.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/40">
                 <div className={cn("rounded-lg p-2 transition-colors", item.tone, "group-hover:opacity-80")}>
                  <item.icon className="h-4 w-4" />
                </div>
                <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors">{item.hint}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
