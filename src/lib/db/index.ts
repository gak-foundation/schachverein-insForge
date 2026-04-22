import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Determine if we are running in a serverless environment (like Vercel)
// or a long-running process (like a background worker or local dev)
const isServerless = !!process.env.VERCEL || !!process.env.NEXT_PUBLIC_VERCEL_ENV;
const isSupabasePooler = connectionString.includes("pooler.supabase.com");

// In serverless environments with a connection pooler, keep connections per instance low
// as the pooler handles the actual connection multiplexing to the database.
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