import { createClient as createInsForgeClient, type InsForgeClient } from '@insforge/sdk';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? 'https://4d3rbpyx.eu-central.insforge.app';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

function getAnonKey(): string | undefined {
  if (typeof window !== 'undefined') {
    return INSFORGE_ANON_KEY;
  }
  return INSFORGE_ANON_KEY;
}

type InsForgeClientWithFrom = InsForgeClient & {
  from: InsForgeClient['database']['from'];
};

function wrapClient(client: InsForgeClient): InsForgeClientWithFrom {
  return new Proxy(client, {
    get(target, prop) {
      if (prop === 'from') {
        return target.database.from.bind(target.database);
      }
      return (target as any)[prop];
    },
  }) as unknown as InsForgeClientWithFrom;
}

/**
 * Browser client for client components.
 */
export function createClient(): InsForgeClientWithFrom {
  return wrapClient(createInsForgeClient({
    baseUrl: INSFORGE_URL,
    anonKey: getAnonKey(),
  }));
}

/**
 * Server client with anon key for server components and API routes.
 */
export function createServerClient(): InsForgeClientWithFrom {
  return wrapClient(createInsForgeClient({
    baseUrl: INSFORGE_URL,
    anonKey: getAnonKey() ?? '',
  }));
}

/**
 * Server client with admin privileges (bypasses RLS).
 * Uses the anon key with elevated permissions on the InsForge backend.
 */
export function createServiceClient(): InsForgeClientWithFrom {
  return wrapClient(createInsForgeClient({
    baseUrl: INSFORGE_URL,
    anonKey: getAnonKey() ?? '',
  }));
}

/**
 * Singleton InsForge instance.
 */
export const insforge = wrapClient(createInsForgeClient({
  baseUrl: INSFORGE_URL,
  anonKey: getAnonKey(),
}));

export const auth = insforge.auth;

export { INSFORGE_URL };
