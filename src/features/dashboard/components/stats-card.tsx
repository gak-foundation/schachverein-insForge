import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type StatsCardProps = {
  label: string;
  value: number | string;
  desc: string;
  icon: LucideIcon;
  href: string;
};

export function StatsCard({ label, value, desc, icon: Icon, href }: StatsCardProps) {
  return (
    <Link href={href}>
      <Card className="hover:shadow-2xl transition-all duration-300 group relative border-border/50 hover:border-primary/20">
        <div className="absolute top-4 right-4 h-10 w-10 rounded-xl flex items-center justify-center bg-accent border shadow-sm group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <CardHeader className="pb-2">
          <CardDescription className="font-bold uppercase tracking-widest text-[10px]">{label}</CardDescription>
          <CardTitle className="text-4xl font-bold pt-2">{value}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground font-medium">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
