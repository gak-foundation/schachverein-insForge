import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Use pool for Edge compatibility
const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });

// Type exports
export type Database = typeof db;