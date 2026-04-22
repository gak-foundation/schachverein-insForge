import { sql } from "drizzle-orm";
import { db } from "./index";

/**
 * A wrapper to execute a Drizzle query while respecting Row Level Security (RLS).
 * It sets the local session variables based on the Supabase JWT token or a given User ID/Role.
 * 
 * Why? By default, Drizzle connects as the superuser/postgres role via DATABASE_URL,
 * bypassing all RLS policies in the database. To enforce RLS, we must temporarily
 * assume the identity of the authenticated user within a transaction.
 * 
 * Usage example:
 * ```typescript
 * await withRLS(userId, "mitglied", async (tx) => {
 *   return await tx.select().from(members);
 * });
 * ```
 */
export async function withRLS<T>(
  userId: string,
  role: string = "authenticated",
  callback: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    // Inject the user's context into the current Postgres transaction session
    // These variables can be read by Supabase RLS policies via auth.uid() or auth.role()
    await tx.execute(
      sql`
        SELECT set_config('request.jwt.claims', json_build_object('sub', ${userId}, 'role', ${role})::text, true);
        SELECT set_config('role', 'authenticated', true);
      `
    );

    // Execute the actual query with RLS applied
    const result = await callback(tx);

    // Resetting context isn't strictly necessary if `true` (local) is passed to set_config
    // and the connection pooler is in Transaction mode, but for extra safety:
    await tx.execute(
      sql`
        SELECT set_config('request.jwt.claims', '', true);
        SELECT set_config('role', 'postgres', true);
      `
    );

    return result;
  });
}
