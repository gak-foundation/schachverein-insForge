"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  members: "Mitglieder",
  teams: "Mannschaften",
  tournaments: "Turniere",
  games: "Partien",
  calendar: "Kalender",
  seasons: "Saisons",
  finance: "Finanzen",
  settings: "Einstellungen",
  profile: "Profil",
  new: "Neu",
  edit: "Bearbeiten",
  admin: "Administration",
  users: "Benutzer",
  protocols: "Protokolle",
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1 && segments[0] === "dashboard") return (
    <div className="flex items-center gap-1 text-sm text-muted-foreground">
       <LayoutDashboard className="h-4 w-4 mr-2" />
       <span className="font-semibold text-foreground">Übersicht</span>
    </div>
  );

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const isLast = index === segments.length - 1;
    const label = routeLabels[segment] || segment;

    return {
      href,
      label,
      isLast,
    };
  });

  return (
    <nav className={cn("flex items-center gap-1 text-sm text-muted-foreground", className)}>
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((crumb) => (
        <React.Fragment key={crumb.href}>
          <ChevronRight className="h-4 w-4 mx-0.5 opacity-50" />
          {crumb.isLast ? (
            <span className="font-semibold text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

import { LayoutDashboard } from "lucide-react";
