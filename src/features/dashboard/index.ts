import { VorstandDashboard } from "./pages/vorstand-dashboard";
import { SportwartDashboard } from "./pages/sportwart-dashboard";
import { KassenwartDashboard } from "./pages/kassenwart-dashboard";
import { JugendwartDashboard } from "./pages/jugendwart-dashboard";
import { TrainerDashboard } from "./pages/trainer-dashboard";
import { MitgliedDashboard } from "./pages/mitglied-dashboard";
import { ElternDashboard } from "./pages/eltern-dashboard";

type DashboardStats = {
  memberCount: number;
  teamCount: number;
  activeTournaments: number;
  pendingPayments: number;
  avgDwz: number | null;
  gamesThisMonth: number;
  upcomingMatches: Array<{
    id: string;
    matchDate: Date | null;
    homeTeamName: string;
    location: string | null;
  }>;
  upcomingEvents: Array<{
    id: string;
    title: string;
    startDate: Date;
  }>;
  children: Array<{
    id: string;
    firstName: string;
    lastName: string;
    role?: string;
  }>;
};

type DashboardUser = {
  name?: string;
  role?: string;
  permissions?: string[];
  memberId?: string;
  isSuperAdmin?: boolean;
};

type DashboardClub = {
  logoUrl?: string | null;
  settings?: Record<string, unknown>;
};

export type DashboardData = {
  stats: DashboardStats;
  user: DashboardUser;
  club?: DashboardClub;
  onboardingCompleted: boolean;
};

const ROLE_DASHBOARD_MAP: Record<string, React.ComponentType<DashboardData>> = {
  vorstand: VorstandDashboard,
  sportwart: SportwartDashboard,
  jugendwart: JugendwartDashboard,
  kassenwart: KassenwartDashboard,
  trainer: TrainerDashboard,
  mitglied: MitgliedDashboard,
  eltern: ElternDashboard,
};

export function getRoleDashboard(role: string): React.ComponentType<DashboardData> {
  return ROLE_DASHBOARD_MAP[role] ?? VorstandDashboard;
}
