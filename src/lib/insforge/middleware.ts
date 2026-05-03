import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/insforge'

const ACCESS_COOKIE = 'insforge_access_token'
const REFRESH_COOKIE = 'insforge_refresh_token'

interface SessionOptions {
  domain?: string
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

function clearSessionCookies(
  request: NextRequest,
  response: NextResponse,
  opts?: SessionOptions,
) {
  const deleteOpts = opts?.domain
    ? { domain: opts.domain, path: '/' }
    : { path: '/' }

  response.cookies.delete({ name: ACCESS_COOKIE, ...deleteOpts })
  response.cookies.delete({ name: REFRESH_COOKIE, ...deleteOpts })
}

export async function updateSession(
  request: NextRequest,
  opts?: SessionOptions,
) {
  let authResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  let user = null
  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value

  if (accessToken) {
    try {
      const client = createServerClient(accessToken)
      const { data, error } = await client.auth.getCurrentUser()
      if (!error && data?.user) {
        user = data.user
        return { authResponse, user }
      }
    } catch {
      // Fall through to refresh
    }
  }

  if (refreshToken) {
    try {
      const client = createServerClient()
      const { data: refreshed } = await client.auth.refreshSession({ refreshToken })
      if (refreshed?.accessToken && refreshed?.refreshToken) {
        authResponse.cookies.set(ACCESS_COOKIE, refreshed.accessToken, {
          ...cookieOptions,
          maxAge: 60 * 15,
        })
        authResponse.cookies.set(REFRESH_COOKIE, refreshed.refreshToken, {
          ...cookieOptions,
          maxAge: 60 * 60 * 24 * 7,
        })

        const { data, error } = await client.auth.getCurrentUser()
        if (!error && data?.user) {
          user = data.user
        }
      } else {
        clearSessionCookies(request, authResponse, opts)
      }
    } catch {
      clearSessionCookies(request, authResponse, opts)
    }
  }

  return { authResponse, user }
}
