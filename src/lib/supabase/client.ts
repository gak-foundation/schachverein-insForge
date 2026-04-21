import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Browser Client für Client Components
export const createClient = (): SupabaseClient => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Singleton für Client Components
let clientInstance: SupabaseClient | null = null

export const getSupabaseClient = (): SupabaseClient => {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient should only be called in browser environment')
  }
  
  if (!clientInstance) {
    clientInstance = createClient()
  }
  
  return clientInstance
}
