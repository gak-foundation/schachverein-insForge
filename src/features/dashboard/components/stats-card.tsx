import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type StatsCardProps = {
  label: string;
  value: number | string;
  desc: string;
  icon: LucideIcon;
  href: string;
};

export function StatsCard({ label, value, desc, icon: Icon, href }: StatsCardProps) {
  return (
    <Link href={href} className="group block">
      <div className="flex flex-col h-full justify-between transition-opacity duration-300 hover:opacity-70">
        <div className="flex justify-between items-start mb-6">
          <span className="uppercase tracking-widest text-[10px] font-semibold text-muted-foreground">{label}</span>
          <Icon className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
        </div>
        <div>
          <div className="text-6xl font-heading tracking-tighter mb-2">{value}</div>
          <p className="text-xs text-muted-foreground font-medium">{desc}</p>
        </div>
      </div>
    </Link>
  );
}
