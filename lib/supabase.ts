import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // No-op lock solo en SSR para evitar advertencias de Web Locks API.
    // En el navegador, permitimos el lock nativo para evitar desincronización de tokens.
    lock: typeof document === 'undefined' 
      ? (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn()
      : undefined,
  }
})
