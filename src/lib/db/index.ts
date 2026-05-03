import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * FIX FÜR NEXT.JS HMR
 * 
 * Wir deaktivieren Prepared Statements in der Entwicklung UNBEDINGT.
 * Next.js HMR hält oft veraltete Client-Instanzen im Speicher.
 */

/**
 * DATABASE CONNECTION CONFIGURATION
 */
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || "";

if (!connectionString) {
  console.warn("⚠️ Keine Datenbank-URL gefunden (DATABASE_URL oder DIRECT_URL).");
}

const isServerless = !!process.env.VERCEL || !!process.env.NEXT_PUBLIC_VERCEL_ENV;

// Robust InsForge detection
const isInsForge = connectionString.includes("insforge.dev");

// Singleton-Pattern for Next.js HMR
const globalForDb = globalThis as unknown as {
  _dbClient?: ReturnType<typeof postgres>;
  _db?: ReturnType<typeof drizzle<typeof schema>>;
};

function createClient() {
  const isDev = process.env.NODE_ENV === "development";
  
  // We disable prepared statements in development to be safe with HMR
  const prepare = !isDev;

  if (isDev) {
    try {
      const urlObj = new URL(connectionString.replace('postgresql://', 'http://')); 
      console.log(`🔌 DB-Verbindung: ${prepare ? "PREPARED" : "SIMPLE (No-$1)"} | SSL: ${isInsForge ? "YES" : "NO"} | Host: ${urlObj.host} | User: ${urlObj.username}`);
    } catch (e) {
      console.log(`🔌 DB-Verbindung: ${prepare ? "PREPARED" : "SIMPLE (No-$1)"} | SSL: ${isInsForge ? "YES" : "NO"} | Malformed URL`);
    }
  }

  return postgres(connectionString, {
    max: isDev ? 2 : (isServerless ? 1 : 10),
    idle_timeout: 20,
    connect_timeout: 10,
    max_lifetime: 60 * 30, 
    prepare: prepare,
    // Use rejectUnauthorized: false for better compatibility with cloud providers
    ssl: isInsForge ? { rejectUnauthorized: false } : false,
    onnotice: () => {},
  });
}

function getClient() {
  if (!globalForDb._dbClient) {
    globalForDb._dbClient = createClient();
  }
  return globalForDb._dbClient;
}

function getDb() {
  if (!globalForDb._db) {
    try {
      globalForDb._db = drizzle(getClient(), { schema });
    } catch (e) {
      console.warn("Failed to initialize Drizzle:", (e as Error).message);
      return null as any;
    }
  }
  return globalForDb._db;
}

function createBuildTimeProxy(): any {
  const chainable: Record<string, unknown> = {};

  const chainHandler: ProxyHandler<any> = {
    get(_, prop) {
      if (prop === 'then') {
        return (resolve: (v: any) => void) => resolve([]);
      }
      return new Proxy(chainable, chainHandler);
    },
    apply() {
      return new Proxy(chainable, chainHandler);
    },
  };

  return new Proxy(chainable, chainHandler);
}

const isBuildTime = process.env.NEXT_PHASE === "phase-production-build" || process.env.NEXT_PHASE === "phase-development-build";

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    if ((isBuildTime || !connectionString) && typeof prop === 'string') {
      return createBuildTimeProxy();
    }
    try {
      const instance = getDb();
      if (!instance) return createBuildTimeProxy();
      return (instance as any)[prop];
    } catch (e) {
      return createBuildTimeProxy();
    }
  },
}) as unknown as ReturnType<typeof drizzle<typeof schema>>;

export type Database = typeof db;
