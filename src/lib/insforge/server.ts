import { createClient as createInsForgeClient } from '@insforge/sdk';

const INSFORGE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL ?? 'https://4d3rbpyx.eu-central.insforge.app';
const SERVICE_ROLE_KEY = process.env.INSFORGE_SERVICE_ROLE_KEY;

function getAnonKey(): string | undefined {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
  }
  return process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;
}

export function createServerClient() {
  return createInsForgeClient({
    baseUrl: INSFORGE_URL,
    anonKey: getAnonKey() ?? '',
  });
}

export function createServiceClient() {
  return createInsForgeClient({
    baseUrl: INSFORGE_URL,
    serviceRoleKey: SERVICE_ROLE_KEY,
  });
}

export { INSFORGE_URL };