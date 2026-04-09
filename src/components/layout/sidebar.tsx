"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navigation = [
  {
    label: "Allgemein",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: "📊" },
      { name: "Mitglieder", href: "/dashboard/members", icon: "👥" },
      { name: "Kalender", href: "/dashboard/calendar", icon: "📅" },
    ],
  },
  {
    label: "Schach",
    items: [
      { name: "Mannschaften", href: "/dashboard/teams", icon: "♟️" },
      { name: "Turniere", href: "/dashboard/tournaments", icon: "🏆" },
      { name: "Partien", href: "/dashboard/games", icon: "📋" },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      { name: "Finanzen", href: "/dashboard/finance", icon: "💰" },
      { name: "Protokolle", href: "/dashboard/protocols", icon: "📄" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Header */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <span className="text-2xl">♔</span>
        <span className="text-lg font-semibold">Schachverein</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {navigation.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      pathname === item.href
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

      {/* Footer */}
      <div className="border-t px-3 py-3">
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <span className="text-base">🚪</span>
            Abmelden
          </button>
        </form>
      </div>
    </aside>
  );
}