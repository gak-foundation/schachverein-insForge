import { getSession } from "@/lib/auth/session";
import { PERMISSIONS, hasPermission } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";
import { getWaitlistApplications, getWaitlistStatusCounts } from "./actions";
import { WaitlistPageClient } from "./waitlist-page-client";

export default async function AdminWaitlistPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions || [], PERMISSIONS.ADMIN_USERS)) {
    redirect("/dashboard");
  }

  const { status } = await searchParams;

  const [applications, statusCounts] = await Promise.all([
    getWaitlistApplications(status),
    getWaitlistStatusCounts(),
  ]);

  return (
    <WaitlistPageClient
      applications={applications}
      statusCounts={statusCounts}
      currentStatus={status}
    />
  );
}
