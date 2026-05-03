import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getDashboardStats } from "@/features/audit/actions";
import { getCurrentClubId } from "@/lib/actions/utils";
import { getClubById } from "@/lib/clubs/queries";
import { VorstandDashboard } from "@/features/dashboard/pages/vorstand-dashboard";
import { SpielleiterDashboard } from "@/features/dashboard/pages/spielleiter-dashboard";
import { KassenwartDashboard } from "@/features/dashboard/pages/kassenwart-dashboard";
import { JugendwartDashboard } from "@/features/dashboard/pages/jugendwart-dashboard";
import { TrainerDashboard } from "@/features/dashboard/pages/trainer-dashboard";
import { MitgliedDashboard } from "@/features/dashboard/pages/mitglied-dashboard";
import { ElternDashboard } from "@/features/dashboard/pages/eltern-dashboard";
import type { DashboardData } from "@/features/dashboard";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;
  const role = (user?.role as string) ?? "mitglied";
  const isSuperAdmin = user?.isSuperAdmin ?? false;

  const clubId = await getCurrentClubId();
  if (!clubId) {
    if (isSuperAdmin) {
      redirect("/super-admin");
    }
    redirect("/onboarding");
  }

  const club = await getClubById(clubId);
  const onboardingCompleted = (club?.settings as any)?.onboardingCompleted === true;

  const stats = await getDashboardStats();

  const dashboardData: DashboardData = {
    stats,
    user,
    club,
    onboardingCompleted,
  };

  switch (role) {
    case "admin":
    case "vorstand":
      return <VorstandDashboard {...dashboardData} />;
    case "spielleiter":
      return <SpielleiterDashboard {...dashboardData} />;
    case "kassenwart":
      return <KassenwartDashboard {...dashboardData} />;
    case "jugendwart":
      return <JugendwartDashboard {...dashboardData} />;
    case "trainer":
      return <TrainerDashboard {...dashboardData} />;
    case "mitglied":
      return <MitgliedDashboard {...dashboardData} />;
    case "eltern":
      return <ElternDashboard {...dashboardData} />;
    default:
      return <VorstandDashboard {...dashboardData} />;
  }
}
