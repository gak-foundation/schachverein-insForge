import { createServiceClient } from "@/lib/insforge";

/**
 * Database client using InsForge SDK.
 * All database operations must go through client.database.from('table').
 */
export function getDb() {
  return createServiceClient().database;
}

/**
 * Legacy db export for gradual migration.
 * Prefer using createServiceClient().database directly.
 */
export const db = new Proxy({} as any, {
  get(_, tableName: string) {
    if (typeof tableName !== 'string') return undefined;
    const client = createServiceClient();
    return client.database.from(tableName);
  },
});

export type Database = any;
