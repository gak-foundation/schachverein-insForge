import { createServiceClient } from "@/lib/insforge";

/**
 * Set the Postgres configuration parameter pp.current_club_id
 * so that RLS policies can filter by tenant.
 *
 * @deprecated Reserved for future use. PostgREST/InsForge requires session-scoped clients for set_config to work.
 */
export async function setTenantContext(clubId: string) {
  const client = createServiceClient();
  await client.rpc("set_config", {
    key: "app.current_club_id",
    value: clubId,
  });
}
