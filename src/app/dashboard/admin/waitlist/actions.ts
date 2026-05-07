import { createServiceClient } from "@/lib/insforge";

export async function getWaitlistApplications(status?: string) {
  const client = createServiceClient();
  let query = client
    .from("waitlist_applications")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching waitlist applications:", error);
    return [];
  }

  return (data || []).map((app: any) => ({
    ...app,
    clubName: app.club_name,
    contactEmail: app.contact_email,
    contactName: app.contact_name,
    memberCount: app.member_count,
    createdAt: app.created_at,
  }));
}

export async function getWaitlistStatusCounts() {
  const client = createServiceClient();
  const { data: allApplications, error } = await client
    .from("waitlist_applications")
    .select("status");

  if (error) {
    console.error("Error fetching waitlist counts:", error);
    return {};
  }

  const statusCounts: Record<string, number> = {};
  allApplications?.forEach((app: any) => {
    statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
  });

  return statusCounts;
}
