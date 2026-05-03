import { ROLE_LABELS } from "@/lib/auth/permissions";
import Link from "next/link";

type MembershipCardProps = {
  role: string;
  permissionsCount: number;
};

export function MembershipCard({ role, permissionsCount }: MembershipCardProps) {
  return (
    <div className="bg-foreground text-background p-8 mt-8 relative overflow-hidden">
      <div className="absolute -right-8 -bottom-12 opacity-10 pointer-events-none select-none">
        <span className="text-9xl font-heading text-background">♔</span>
      </div>
      <div className="relative z-10">
        <h3 className="text-2xl font-heading tracking-tight mb-2">Mitgliedschaft</h3>
        <p className="text-sm text-background/60 mb-8">Dein Profil-Status</p>
        
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between border-b border-background/20 pb-2">
            <span className="text-xs uppercase tracking-widest text-background/60 font-semibold">Rolle</span>
            <span className="text-sm font-heading">{ROLE_LABELS[role] || role}</span>
          </div>
          <div className="flex items-center justify-between border-b border-background/20 pb-2">
            <span className="text-xs uppercase tracking-widest text-background/60 font-semibold">Berechtigungen</span>
            <span className="text-sm font-heading">{permissionsCount} Aktiv</span>
          </div>
        </div>
        
        <Link href="/dashboard/profile" className="inline-block text-xs uppercase tracking-widest font-semibold border-b border-background hover:text-background/80 transition-colors pb-1">
          Profil bearbeiten
        </Link>
      </div>
    </div>
  );
}
