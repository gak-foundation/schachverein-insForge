"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/auth/permissions";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { 
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { navigation, type NavGroup } from "./navigation";

interface SidebarProps {
  role: string;
  permissions: string[];
  isSuperAdmin?: boolean;
  clubSwitcher?: React.ReactNode;
}

export function Sidebar({ role, permissions, isSuperAdmin, clubSwitcher }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const filteredNavigation = navigation
    .map((group: NavGroup) => ({
      ...group,
      items: group.items.filter((item) =>
        hasPermission(role, permissions, item.permission, isSuperAdmin),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const navContent = (
    <div className="flex h-full flex-col bg-card border-r shadow-sm">
      <div className="flex h-20 items-center gap-3 px-6 border-b">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
          <span className="text-2xl font-serif">♔</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold tracking-tight">Schachverein</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Club Management</span>
        </div>
      </div>

      {clubSwitcher && (
        <div className="border-b">
          {clubSwitcher}
        </div>
      )}

      <nav className="flex-1 space-y-8 overflow-y-auto px-4 py-6 scrollbar-hide">
        {filteredNavigation.map((group) => (
          <div key={group.label} className="space-y-2">
            <p className="px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
              {group.label}
            </p>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="h-3 w-3 opacity-50" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t p-4 space-y-2">
        <button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            window.location.href = "/auth/login";
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group"
        >
          <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive" />
          Abmelden
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-background border shadow-md lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden border-none p-0 w-full h-full cursor-default"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-col transition-transform duration-300 lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {navContent}
      </aside>
    </>
  );
}
