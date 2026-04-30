import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

interface SessionOptions {
  domain?: string
}

function clearSupabaseCookies(
  request: NextRequest,
  response: NextResponse,
  opts?: SessionOptions,
) {
  const deleteOpts = opts?.domain
    ? { domain: opts.domain, path: '/' }
    : { path: '/' }

  for (const cookie of request.cookies.getAll()) {
    if (cookie.name.startsWith('sb-')) {
      response.cookies.delete({ name: cookie.name, ...deleteOpts })
    }
  }
}

function isIgnorableAuthError(error: any): boolean {
  if (!error) return false
  const code = error?.code
  const msg = error?.message?.toLowerCase() || ''
  return (
    code === 'refresh_token_not_found' ||
    code === 'session_not_found' ||
    msg.includes('session missing') ||
    msg.includes('sub claim in jwt does not exist') ||
    msg.includes('invalid refresh token')
  )
}

export async function updateSession(
  request: NextRequest,
  opts?: SessionOptions,
) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          )
        },
      },
      cookieOptions: opts?.domain
        ? { domain: opts.domain, path: '/', sameSite: 'lax', secure: true }
        : undefined,
    },
  )

  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      if (isIgnorableAuthError(error)) {
        clearSupabaseCookies(request, supabaseResponse, opts)
      } else {
        console.error('Auth error in middleware:', error.message)
      }
    } else {
      user = data.user
    }
  } catch (error: any) {
    if (isIgnorableAuthError(error)) {
      clearSupabaseCookies(request, supabaseResponse, opts)
    } else {
      console.error('Unexpected auth error in middleware:', error)
    }
    user = null
  }

  return { supabaseResponse, user }
}
