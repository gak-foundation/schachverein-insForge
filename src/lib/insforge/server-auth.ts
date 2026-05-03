import { cookies } from 'next/headers';
import { createServerClient, type InsForgeClientWithFrom } from './index';

const ACCESS_COOKIE = 'insforge_access_token';
const REFRESH_COOKIE = 'insforge_refresh_token';

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, accessToken, {
    ...authCookieOptions,
    maxAge: 60 * 15,
  });
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    ...authCookieOptions,
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

export async function getAuthTokensFromCookies() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(ACCESS_COOKIE)?.value,
    refreshToken: cookieStore.get(REFRESH_COOKIE)?.value,
  };
}

export function createServerAuthClientWithToken(accessToken: string): InsForgeClientWithFrom {
  const client = createServerClient(accessToken);
  return client;
}

/**
 * Server-side auth client that reads httpOnly cookies (insforge_access_token /
 * insforge_refresh_token) and obtains an authenticated client.
 *
 * If the access token is expired, it automatically refreshes using the
 * refresh token and writes new cookies.
 *
 * Use this in server components and API routes to get the current user
 * or make authenticated database calls.
 */
export async function createServerAuthClient(): Promise<InsForgeClientWithFrom> {
  const { accessToken, refreshToken } = await getAuthTokensFromCookies();

  if (accessToken) {
    const client = createServerClient(accessToken);
    const { data, error } = await client.auth.getCurrentUser();
    if (!error && data?.user) {
      return client;
    }
  }

  if (refreshToken) {
    const client = createServerClient();
    const { data: refreshed, error } = await client.auth.refreshSession({ refreshToken });
    if (refreshed?.accessToken && refreshed?.refreshToken && !error) {
      await setAuthCookies(refreshed.accessToken, refreshed.refreshToken);
      return createServerClient(refreshed.accessToken);
    }
  }

  return createServerClient();
}
