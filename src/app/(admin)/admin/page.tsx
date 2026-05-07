import { redirect } from "next/navigation";
import { getSessionWithClub } from "@/lib/auth/session";
import { getAllClubsAction, getAllUsersAction } from "@/lib/clubs/actions";
import { AdminDashboard } from "./admin-dashboard";

export default async function AdminPage() {
  const session = await getSessionWithClub();

  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  const allClubs = await getAllClubsAction();
  const allUsers = await getAllUsersAction();

  return (
    <AdminDashboard
      clubs={allClubs as any}
      users={allUsers as any}
      stats={{
        totalUsers: allUsers.length,
        totalClubs: allClubs.length,
      }}
    />
  );
}
