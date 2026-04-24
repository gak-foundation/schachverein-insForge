import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const rawConnectionString = process.env.DATABASE_URL || "";

// RLS via Supavisor Transaction Pooler (Port 6543) requires a JWT claim context.
// Without a Supabase PostgREST/Auth proxy, direct queries via port 6543
// evaluate RLS policies with an empty identity, blocking access.
// Fix: rewrite the Pooler URL to the direct Postgres port (5432)
// so the 'postgres' role bypasses RLS naturally.
function getDirectUrl(url: string): string {
  if (typeof url !== "string" || !url) {
    return url;
  }

  // Only rewrite Supabase Pooler transaction port URLs
  if (!url.includes(".pooler.supabase.com:6543")) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    const userParts = urlObj.username.split(".");
    if (userParts.length !== 2 || userParts[0] !== "postgres") {
      return url;
    }
    const projectRef = userParts[1];

    urlObj.username = "postgres";
    urlObj.hostname = `db.${projectRef}.supabase.co`;
    urlObj.port = "5432";

    return urlObj.toString();
  } catch {
    return url;
  }
}

const connectionString = getDirectUrl(rawConnectionString);

const isServerless = !!process.env.VERCEL || !!process.env.NEXT_PUBLIC_VERCEL_ENV;
const isSupabasePooler = rawConnectionString.includes("pooler.supabase.com");

const client = postgres(connectionString, {
  max: isServerless && isSupabasePooler ? 1 : 10,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false, // Required for some connection poolers (like Supavisor) in Transaction mode
  ssl: connectionString.includes("supabase.co") || isSupabasePooler ? "require" : false,
});

export const db = drizzle(client, { schema });

// Type exports
export type Database = typeof db;
