import { cookies } from 'next/headers';
import { createServerClient, type InsForgeClientWithFrom } from './index';

const SESSION_COOKIE = "insforge_session";

/**
 * Server-side auth client that reads the `insforge_session` cookie and
 * refreshes the session with InsForge to obtain an authenticated client.
 *
 * Use this in server components and API routes to get the current user
 * or make authenticated database calls.
 */
export async function createServerAuthClient(): Promise<InsForgeClientWithFrom> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(SESSION_COOKIE)?.value;
  const client = createServerClient();

  if (refreshToken) {
    const { data: refreshed, error } = await client.auth.refreshSession({ refreshToken });
    if (refreshed?.accessToken && !error) {
      return client;
    }
  }

  return client;
}
