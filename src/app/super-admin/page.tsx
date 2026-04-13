import { redirect } from "next/navigation";
import { getSessionWithClub } from "@/lib/auth/session";
import { getAllClubsAction } from "@/lib/clubs/actions";
import { db } from "@/lib/db";
import { clubs, clubMemberships, authUsers } from "@/lib/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { SuperAdminDashboard } from "./super-admin-dashboard";

export default async function SuperAdminPage() {
  const session = await getSessionWithClub();

  if (!session?.user.isSuperAdmin) {
    redirect("/dashboard");
  }

  // Get all clubs with member counts
  const allClubs = await db
    .select({
      id: clubs.id,
      name: clubs.name,
      slug: clubs.slug,
      plan: clubs.plan,
      isActive: clubs.isActive,
      subscriptionStatus: clubs.subscriptionStatus,
      subscriptionExpiresAt: clubs.subscriptionExpiresAt,
      createdAt: clubs.createdAt,
      stripeCustomerId: clubs.stripeCustomerId,
      stripeSubscriptionId: clubs.stripeSubscriptionId,
      memberCount: sql<number>`(
        SELECT COUNT(*) FROM ${clubMemberships}
        WHERE ${clubMemberships.clubId} = ${clubs.id}
        AND ${clubMemberships.status} = 'active'
      )`,
    })
    .from(clubs)
    .orderBy(clubs.createdAt);

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

  return <SuperAdminDashboard clubs={allClubs} stats={stats} />;
}
