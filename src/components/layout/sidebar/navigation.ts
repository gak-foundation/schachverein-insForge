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
  Settings,
  Globe,
  ImageIcon,
  Mail,
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
      { name: "Einladungen", href: "/dashboard/einladungen", icon: Mail, permission: PERMISSIONS.MEMBERS_WRITE },
      { name: "Kommunikation", href: "/dashboard/kommunikation", icon: Mail, permission: PERMISSIONS.MEMBERS_WRITE },
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
    label: "Website",
    items: [
      { name: "Seiten", href: "/dashboard/pages", icon: Globe, permission: PERMISSIONS.PAGES_READ },
      { name: "Medien", href: "/dashboard/media", icon: ImageIcon, permission: PERMISSIONS.PAGES_READ },
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
    label: "Einstellungen",
    items: [
      { name: "Mein Profil", href: "/dashboard/profile", icon: Settings, permission: PERMISSIONS.MEMBERS_READ },
      { name: "Benutzer", href: "/dashboard/admin/users", icon: UserCog, permission: PERMISSIONS.ADMIN_USERS },
    ],
  },
];

