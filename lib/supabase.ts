import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // No-op lock solo en SSR para evitar advertencias de Web Locks API.
    // En el navegador, usamos el comportamiento por defecto de Supabase.
    ...(typeof document === 'undefined' ? {
      lock: (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn()
    } : {})
  }
})
