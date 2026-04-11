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
  finance: "Finanzen",
  settings: "Einstellungen",
  profile: "Profil",
  new: "Neu",
  edit: "Bearbeiten",
};

export function Breadcrumbs({ className }: { className?: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) return null;

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
    <nav className={cn("flex items-center gap-1 text-sm text-gray-500 mb-4", className)}>
      <Link
        href="/dashboard"
        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.href}>
          <ChevronRight className="h-4 w-4 mx-1" />
          {crumb.isLast ? (
            <span className="font-medium text-gray-900">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="hover:text-gray-700 transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
