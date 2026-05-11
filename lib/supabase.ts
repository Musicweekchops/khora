import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // No-op lock para evitar advertencias de Web Locks API y bloqueos
    // en navegadores que no lo soportan bien (ej. Safari/iOS).
    lock: (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => fn(),
  }
})
