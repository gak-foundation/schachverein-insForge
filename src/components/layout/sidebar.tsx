"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  PERMISSIONS,
  hasPermission,
  type Permission,
} from "@/lib/auth/permissions";
import { useState } from "react";
import { signOut } from "next-auth/react";

type NavItem = {
  name: string;
  href: string;
  icon: string;
  permission: Permission;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const navigation: NavGroup[] = [
  {
    label: "Allgemein",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: "📊", permission: PERMISSIONS.MEMBERS_READ },
      { name: "Mitglieder", href: "/dashboard/members", icon: "👥", permission: PERMISSIONS.MEMBERS_READ },
      { name: "Kalender", href: "/dashboard/calendar", icon: "📅", permission: PERMISSIONS.EVENTS_READ },
      { name: "Saisons", href: "/dashboard/seasons", icon: "📃️", permission: PERMISSIONS.EVENTS_READ },
    ],
  },
  {
    label: "Schach",
    items: [
      { name: "Mannschaften", href: "/dashboard/teams", icon: "♟️", permission: PERMISSIONS.TEAMS_READ },
      { name: "Turniere", href: "/dashboard/tournaments", icon: "🏆", permission: PERMISSIONS.TOURNAMENTS_READ },
      { name: "Partien", href: "/dashboard/games", icon: "📋", permission: PERMISSIONS.GAMES_READ },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      { name: "Finanzen", href: "/dashboard/finance", icon: "💰", permission: PERMISSIONS.FINANCE_READ },
      { name: "Protokolle", href: "/dashboard/protocols", icon: "📄", permission: PERMISSIONS.ADMIN_AUDIT },
    ],
  },
  {
    label: "Administration",
    items: [
      { name: "Benutzer", href: "/dashboard/admin/users", icon: "👤", permission: PERMISSIONS.ADMIN_USERS },
    ],
  },
];

interface SidebarProps {
  role: string;
  permissions: string[];
}

export function Sidebar({ role, permissions }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNavigation = navigation
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        hasPermission(role, permissions, item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const navContent = (
    <>
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="text-2xl">♔</span>
        <span className="text-lg font-semibold">Schachverein</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {filteredNavigation.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href || pathname.startsWith(item.href + "/")
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                    )}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t px-3 py-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          <span className="text-base">🚪</span>
          Abmelden
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 rounded-md bg-white p-2 shadow-md lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-white transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
