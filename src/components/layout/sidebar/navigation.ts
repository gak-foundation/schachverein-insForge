import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Layers, 
  Shield, 
  Trophy, 
  ClipboardList, 
  CircleDollarSign, 
  FileText, 
  UserCog, 
  type LucideIcon
} from "lucide-react";
import { PERMISSIONS, type Permission } from "@/lib/auth/permissions";

export type NavItem = {
  name: string;
  href: string;
  icon: LucideIcon;
  permission: Permission;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const navigation: NavGroup[] = [
  {
    label: "Allgemein",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, permission: PERMISSIONS.MEMBERS_READ },
      { name: "Mitglieder", href: "/dashboard/members", icon: Users, permission: PERMISSIONS.MEMBERS_READ },
      { name: "Kalender", href: "/dashboard/calendar", icon: Calendar, permission: PERMISSIONS.EVENTS_READ },
      { name: "Saisons", href: "/dashboard/seasons", icon: Layers, permission: PERMISSIONS.EVENTS_READ },
    ],
  },
  {
    label: "Schach",
    items: [
      { name: "Mannschaften", href: "/dashboard/teams", icon: Shield, permission: PERMISSIONS.TEAMS_READ },
      { name: "Turniere", href: "/dashboard/tournaments", icon: Trophy, permission: PERMISSIONS.TOURNAMENTS_READ },
      { name: "Partien", href: "/dashboard/games", icon: ClipboardList, permission: PERMISSIONS.GAMES_READ },
    ],
  },
  {
    label: "Verwaltung",
    items: [
      { name: "Finanzen", href: "/dashboard/finance", icon: CircleDollarSign, permission: PERMISSIONS.FINANCE_READ },
      { name: "Protokolle", href: "/dashboard/protocols", icon: FileText, permission: PERMISSIONS.ADMIN_AUDIT },
    ],
  },
  {
    label: "Administration",
    items: [
      { name: "Benutzer", href: "/dashboard/admin/users", icon: UserCog, permission: PERMISSIONS.ADMIN_USERS },
    ],
  },
];
