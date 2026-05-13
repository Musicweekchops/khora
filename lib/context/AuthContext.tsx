"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

// -------------------------------------------------------------------
// Tipos
// -------------------------------------------------------------------
export interface UserProfile {
  id: string
  email: string
  name: string
  phone: string | null
  role: 'TEACHER' | 'STUDENT'
  is_admin: boolean
  teacherProfileId: string | null
  studentProfileId: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

// -------------------------------------------------------------------
// Rutas públicas
// -------------------------------------------------------------------
const PUBLIC_PATHS = ['/login', '/register', '/', '/agendar']

function isPublicPath(pathname: string | null) {
  if (!pathname) return false
  const publicPaths = ['/login', '/register', '/', '/agendar']
  return publicPaths.some(p => pathname === p || pathname.startsWith('/agendar/'))
}

// -------------------------------------------------------------------
// Provider
// -------------------------------------------------------------------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const profileRef = React.useRef<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const sessionRef = React.useRef<Session | null>(null)

  // Sincronizar Refs con State
  useEffect(() => {
    profileRef.current = profile
    sessionRef.current = session
  }, [profile, session])

  // ---------------------------------------------------------------
  // Cargar perfil desde public.User
  // ---------------------------------------------------------------
  const fetchProfile = useCallback(async (authUser: User, retries = 3): Promise<UserProfile | null> => {
    let attempt = 0
    while (attempt < retries) {
      try {
        const { data, error } = await supabase
          .from('User')
          .select(`
            id, email, name, phone, role, is_admin,
            TeacherProfile ( id ),
            StudentProfile ( id )
          `)
          .eq('id', authUser.id)
          .maybeSingle()

        if (error) throw error

        if (data) {
          const tp = Array.isArray(data.TeacherProfile) ? data.TeacherProfile[0] : data.TeacherProfile
          const sp = Array.isArray(data.StudentProfile) ? data.StudentProfile[0] : data.StudentProfile

          return {
            id: data.id,
            email: data.email,
            name: data.name,
            phone: data.phone,
            role: data.role as 'TEACHER' | 'STUDENT',
            is_admin: data.is_admin ?? false,
            teacherProfileId: tp?.id ?? null,
            studentProfileId: sp?.id ?? null,
          }
        }
        
        console.warn(`[Auth] No profile found for ${authUser.id}, attempt ${attempt + 1}/${retries}`)
      } catch (e: any) {
        console.error(`[Auth] fetchProfile error (attempt ${attempt + 1}/${retries}):`, e.message)
      }
      
      attempt++
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
    return null
  }, [])

  // ---------------------------------------------------------------
  // Single source of truth: onAuthStateChange
  // ---------------------------------------------------------------
  useEffect(() => {
    let mounted = true
    let initialCheckDone = false

    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('⚠️ [Auth] Timeout — unlocking UI')
        setLoading(false)
      }
    }, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return

        console.log(`🔔 Auth event: ${event} | initialCheckDone: ${initialCheckDone}`)

        // 1. Evitar recargas redundantes si es el mismo usuario (Token Refresh o tab focus)
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && 
            sessionRef.current?.user?.id === currentSession?.user?.id) {
          console.log(`⏸️ Ignorando ${event} - Mismo usuario (Token Refresh)`)
          setSession(currentSession) // Solo actualizamos la sesión internamente
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        // 2. Si hay usuario, cargar perfil SOLO si es necesario
        let fetchedProfile = null
        if (currentSession?.user) {
          fetchedProfile = await fetchProfile(currentSession.user)
          if (mounted) setProfile(fetchedProfile)
        } else {
          if (mounted) setProfile(null)
        }

        if (mounted) setLoading(false)
        initialCheckDone = true

        // 4. Ping de presencia (avisa a la base de datos que estamos activos)
        if (currentSession?.user) {
          supabase.rpc('ping_presence').then(({ error }) => {
            if (error) console.warn('Ping falló:', error.message)
          })
        }

        // 5. Redirecciones controladas
        if (event === 'SIGNED_IN') {
          // Si no había sesión, o si estamos en una ruta pública (como /login), redirigir
          if (!sessionRef.current || isPublicPath(pathname)) {
            router.push(fetchedProfile?.is_admin ? '/dashboard/admin' : '/dashboard')
          }
        }
        if (event === 'SIGNED_OUT') {
          router.push('/login')
        }
      },
    )

    // Trigger initial session check
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return
      if (loading && !initialCheckDone) {
        setSession(s)
        setUser(s?.user ?? null)
        if (s?.user) {
          fetchProfile(s.user).then(p => {
            if (mounted) {
              setProfile(p)
              setLoading(false)
            }
          })
        } else {
          setLoading(false)
        }
      }
    }).catch(err => {
      console.warn('[Auth] getSession fallback error:', err.message)
      if (mounted && loading) setLoading(false)
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [router, fetchProfile])

  // ---------------------------------------------------------------
  // Protección de rutas
  // ---------------------------------------------------------------
  useEffect(() => {
    if (loading) return

    // 1. Unauthenticated users trying to access private routes -> to /login
    if (!user && !isPublicPath(pathname)) {
      router.push('/login')
    }
    
    // 2. Authenticated users sitting on /login -> to dashboard
    if (user && profile && isPublicPath(pathname)) {
      router.push(profile.is_admin ? '/dashboard/admin' : '/dashboard')
    }
  }, [user, profile, loading, pathname, router])

  // ---------------------------------------------------------------
  // Presencia (Heartbeat) en Tiempo Real
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!user) return

    // Ping inmediato al cargar la app
    supabase.rpc('ping_presence').then(({ error }) => {
      if (error) console.warn('Ping falló:', error.message)
    })

    // Ping cada 4 minutos mientras tengan la pestaña abierta
    const interval = setInterval(() => {
      supabase.rpc('ping_presence').then(({ error }) => {
        if (error) console.warn('Ping falló:', error.message)
      })
    }, 4 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user])

  // ---------------------------------------------------------------
  // Sign out
  // ---------------------------------------------------------------
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
