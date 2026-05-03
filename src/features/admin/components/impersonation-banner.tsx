"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export function ImpersonationBanner({ clubName }: { clubName?: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        <span className="text-sm font-medium">
          Sie sind eingeloggt als {clubName || "Verein"}. (Impersonation-Modus)
        </span>
      </div>
      <form action="/api/auth/unimpersonate" method="POST">
        <Button size="sm" variant="secondary" type="submit">
          Zurueck zum Admin
        </Button>
      </form>
    </div>
  );
}
