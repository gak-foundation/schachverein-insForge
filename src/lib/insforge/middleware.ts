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
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  let user = null
  const token = request.cookies.get('insforge_session')?.value

  if (token) {
    try {
      const supabase = createServerClient()
      const { data, error } = await supabase.auth.getCurrentUser()
      
      if (error) {
        clearSessionCookies(request, supabaseResponse, opts)
        user = null
      } else {
        user = data?.user || null
      }
    } catch (error) {
      clearSessionCookies(request, supabaseResponse, opts)
      user = null
    }
  }

  return { supabaseResponse, user }
}
