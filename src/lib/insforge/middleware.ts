import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/insforge'

interface SessionOptions {
  domain?: string
}

function clearSessionCookies(
  request: NextRequest,
  response: NextResponse,
  opts?: SessionOptions,
) {
  const deleteOpts = opts?.domain
    ? { domain: opts.domain, path: '/' }
    : { path: '/' }

  response.cookies.delete({ name: 'insforge_session', ...deleteOpts })
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
  const token = request.cookies.get('insforge_session')?.value

  if (token) {
    try {
      const client = createServerClient()
      // In server mode we must explicitly refresh with the cookie token
      const { data: refreshed } = await client.auth.refreshSession({ refreshToken: token })
      if (!refreshed?.accessToken) {
        clearSessionCookies(request, authResponse, opts)
        user = null
      } else {
        const { data, error } = await client.auth.getCurrentUser()
        if (error) {
          clearSessionCookies(request, authResponse, opts)
          user = null
        } else {
          user = data?.user || null
        }
      }
    } catch (error) {
      clearSessionCookies(request, authResponse, opts)
      user = null
    }
  }

  return { authResponse, user }
}
