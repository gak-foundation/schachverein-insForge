import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// Query client for regular queries
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });

// Type exports
export type Database = typeof db;