import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * RADIKALER FIX FÜR SUPABASE POOLER & NEXT.JS HMR
 * 
 * Wir deaktivieren Prepared Statements in der Entwicklung UNBEDINGT.
 * Dies ist notwendig, da der Supabase-Pooler (Port 6543) im Transaction Mode 
 * keine benannten Statements ($1, $2) unterstützt und Next.js HMR oft 
 * veraltete Client-Instanzen im Speicher hält.
 */

/**
 * DATABASE CONNECTION CONFIGURATION
 * 
 * We prefer DATABASE_URL (usually the Supavisor Pooler on Port 6543) for the application.
 * DIRECT_URL (Port 5432) is preferred for migrations.
 */
const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || "";

if (!connectionString) {
  console.warn("⚠️ Keine Datenbank-URL gefunden (DATABASE_URL oder DIRECT_URL).");
}

const isServerless = !!process.env.VERCEL || !!process.env.NEXT_PUBLIC_VERCEL_ENV;

// Robust Supabase detection
const isSupabase = connectionString.includes("supabase.co") || 
                   connectionString.includes("supabase.com") || 
                   connectionString.includes("pooler.supabase.com") ||
                   connectionString.includes(":6543");

// Singleton-Pattern for Next.js HMR
const globalForDb = globalThis as unknown as {
  _dbClient?: ReturnType<typeof postgres>;
  _db?: ReturnType<typeof drizzle<typeof schema>>;
};

function createClient() {
  const isDev = process.env.NODE_ENV === "development";
  
  // Supabase Pooler (Port 6543) does NOT support Prepared Statements in Transaction Mode.
  // We disable them for all Supabase connections to be safe.
  const prepare = !isSupabase && !isDev;

  if (isDev) {
    try {
      const urlObj = new URL(connectionString.replace('postgresql://', 'http://')); 
      console.log(`🔌 DB-Verbindung: ${prepare ? "PREPARED" : "SIMPLE (No-$1)"} | SSL: ${isSupabase ? "YES" : "NO"} | Host: ${urlObj.host} | User: ${urlObj.username}`);
    } catch (e) {
      console.log(`🔌 DB-Verbindung: ${prepare ? "PREPARED" : "SIMPLE (No-$1)"} | SSL: ${isSupabase ? "YES" : "NO"} | Malformed URL`);
    }
  }

  return postgres(connectionString, {
    max: isDev ? 2 : (isServerless ? 1 : 10),
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30, 
    prepare: prepare,
    // Use rejectUnauthorized: false for better compatibility with Supabase/Vercel
    ssl: isSupabase ? { rejectUnauthorized: false } : false,
    onnotice: () => {},
  });
}

if (!globalForDb._dbClient) {
  globalForDb._dbClient = createClient();
}

const client = globalForDb._dbClient;

if (!globalForDb._db) {
  globalForDb._db = drizzle(client, { schema });
}

export const db = globalForDb._db;
export type Database = typeof db;
