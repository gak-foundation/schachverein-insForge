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
    <div className="py-10 border-b border-border">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2 className="text-2xl font-heading tracking-tight">Heute wichtig</h2>
          <p className="text-muted-foreground text-sm mt-1">Die wichtigsten Aufgaben und Bereiche auf einen Blick</p>
        </div>
        <span className="uppercase tracking-widest text-[10px] font-bold text-muted-foreground">Schnellstart</span>
      </div>
      <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
        {items.map((item) => (
          <Link key={item.label} href={item.href} className="group block">
            <div className="flex flex-col h-full justify-between pb-4 border-b border-border/40 group-hover:border-primary transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">{item.label}</p>
                  <p className="text-5xl font-heading tracking-tighter mb-2">{item.value}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4">
                 <div className="text-muted-foreground group-hover:text-primary transition-colors">
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
