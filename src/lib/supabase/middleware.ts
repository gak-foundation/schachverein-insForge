import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
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
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - gracefully handle invalid/missing sessions
  let user = null
  try {
    const { data, error } = await supabase.auth.getUser()
    if (error) {
      const isMissingSession =
        error.code === 'refresh_token_not_found' ||
        error.code === 'session_not_found' ||
        error.message?.toLowerCase().includes('session missing')

      if (!isMissingSession) {
        console.error('Auth error in middleware:', error.message)
      }
    } else {
      user = data.user
    }
  } catch (error: any) {
    const isMissingSession =
      error?.code === 'refresh_token_not_found' ||
      error?.code === 'session_not_found' ||
      error?.message?.toLowerCase().includes('session missing')

    if (!isMissingSession) {
      console.error('Unexpected auth error in middleware:', error)
    }
    user = null
  }

  return { supabaseResponse, user }
}
