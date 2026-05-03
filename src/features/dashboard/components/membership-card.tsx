import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type MembershipCardProps = {
  role: string;
  permissionsCount: number;
};

export function MembershipCard({ role, permissionsCount }: MembershipCardProps) {
  return (
    <Card className="shadow-lg border-border/50 bg-primary text-primary-foreground overflow-hidden relative">
      <div className="absolute bottom-[-20%] right-[-10%] opacity-20 pointer-events-none">
        <span className="text-9xl font-serif">♔</span>
      </div>
      <CardHeader>
        <CardTitle className="text-xl">Mitgliedschaft</CardTitle>
        <CardDescription className="text-primary-foreground/70">Dein Profil-Status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Rolle:</span>
          <span className="px-2 py-0.5 rounded-md bg-primary-foreground/20 text-xs font-bold uppercase tracking-widest">{role}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Berechtigungen:</span>
          <span className="text-sm font-bold">{permissionsCount} Aktiv</span>
        </div>
        <Link href="/dashboard/profile" className="block pt-2">
          <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-bold">Profil bearbeiten</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
