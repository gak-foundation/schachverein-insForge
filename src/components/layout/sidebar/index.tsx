"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { hasPermission } from "@/lib/auth/permissions";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import { useActiveClub } from "@/lib/club-context";
import { 
  LogOut,
  Menu,
  X,
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
  const activeClub = useActiveClub();

  const filteredNavigation = navigation
    .map((group: NavGroup) => ({
      ...group,
      items: group.items.filter((item) =>
        hasPermission(role, permissions, item.permission, isSuperAdmin),
      ),
    }))
    .filter((group) => group.items.length > 0);

  const navContent = (
    <div className="flex h-full flex-col bg-card border-r">
      <div className="flex h-20 items-center gap-3 px-5 border-b">
        {activeClub?.logoUrl ? (
          <div className="h-10 w-10 rounded-lg overflow-hidden relative shrink-0 ring-1 ring-border/50">
            <Image src={activeClub.logoUrl} alt={activeClub.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-lg font-bold font-heading">
              {activeClub?.name?.charAt(0)?.toUpperCase() || "S"}
            </span>
          </div>
        )}
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold tracking-tight truncate">
            {activeClub?.name || "Schachverein"}
          </span>
          <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70 font-medium">
            Dashboard
          </span>
        </div>
      </div>

      {clubSwitcher && (
        <div className="border-b">
          {clubSwitcher}
        </div>
      )}

      <nav className="flex-1 space-y-7 overflow-y-auto px-3 py-5 scrollbar-hide">
        {filteredNavigation.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                        isActive
                          ? "bg-accent text-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-md transition-colors duration-150",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}>
                        <Icon className="size-4" />
                      </div>
                      <span className="flex-1">{item.name}</span>
                      {item.badge != null && item.badge > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-destructive/15 text-destructive text-[10px] font-bold px-1.5 leading-none">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            window.location.href = "/auth/login";
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group"
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground group-hover:text-destructive transition-colors">
            <LogOut className="size-4" />
          </div>
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

