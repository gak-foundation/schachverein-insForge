import { redirect } from "next/navigation";
import { getSessionWithClub } from "@/lib/auth/session";
import { getAllClubsAction, getAllUsersAction } from "@/lib/clubs/actions";
import { db } from "@/lib/db";
import { clubs, authUsers } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { SuperAdminDashboard } from "./super-admin-dashboard";

export default async function SuperAdminPage() {
  const session = await getSessionWithClub();

  if (!session?.user.isSuperAdmin) {
    redirect("/dashboard");
  }

  // Get all clubs and users
  const allClubs = await getAllClubsAction();
  const allUsers = await getAllUsersAction();

  // Get system stats
  const totalUsers = await db.select({ count: count() }).from(authUsers);
  const totalClubs = await db.select({ count: count() }).from(clubs);
  const activeSubscriptions = await db
    .select({ count: count() })
    .from(clubs)
    .where(eq(clubs.subscriptionStatus, "active"));

  const stats = {
    totalUsers: totalUsers[0]?.count ?? 0,
    totalClubs: totalClubs[0]?.count ?? 0,
    activeSubscriptions: activeSubscriptions[0]?.count ?? 0,
    proClubs: allClubs.filter((c) => c.plan === "pro").length,
    enterpriseClubs: allClubs.filter((c) => c.plan === "enterprise").length,
  };

  return <SuperAdminDashboard clubs={allClubs as any} users={allUsers as any} stats={stats} />;
}
