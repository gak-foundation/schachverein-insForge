import { createClient as createInsForgeClient, type InsForgeClient } from '@insforge/sdk';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? '';
const INSFORGE_ANON_KEY = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
const INSFORGE_SERVICE_ROLE_KEY = process.env.INSFORGE_SERVICE_ROLE_KEY;

function getAnonKey(): string | undefined {
  if (typeof window !== 'undefined') {
    return INSFORGE_ANON_KEY;
  }
  return INSFORGE_ANON_KEY;
}

export type InsForgeClientWithFrom = InsForgeClient & {
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
 * Server client for server components, middleware and API routes.
 *
 * Always operates in server mode (isServerMode: true), which means the SDK
 * will NOT attempt browser cookie-based auth. Pass an `accessToken` to
 * authenticate as a specific user.
 *
 * To authenticate via cookies, use `createServerAuthClient()` from server-auth.ts.
 */
export function createServerClient(accessToken?: string): InsForgeClientWithFrom {
  const client = wrapClient(createInsForgeClient({
    baseUrl: INSFORGE_URL,
    anonKey: getAnonKey() ?? '',
    isServerMode: true,
    ...(accessToken ? { edgeFunctionToken: accessToken } : {}),
  }));
  return client;
}

/**
 * Server client with admin privileges (bypasses RLS).
 * Uses the service role key for elevated permissions.
 */
export function createServiceClient(): InsForgeClientWithFrom {
  return wrapClient(createInsForgeClient({
    baseUrl: INSFORGE_URL,
    anonKey: INSFORGE_SERVICE_ROLE_KEY ?? getAnonKey() ?? '',
    isServerMode: true,
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
