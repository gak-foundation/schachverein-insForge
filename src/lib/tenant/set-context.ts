import { createServiceClient } from "@/lib/insforge";

/**
 * Set the Postgres configuration parameter `app.current_club_id`
 * so that RLS policies can filter by tenant.
 */
export async function setTenantContext(clubId: string) {
  const client = createServiceClient();
  await client.rpc("set_config", {
    key: "app.current_club_id",
    value: clubId,
  });
}
