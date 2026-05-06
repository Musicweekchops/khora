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
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

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
            id, email, name, phone, role,
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
            teacherProfileId: tp?.id ?? null,
            studentProfileId: sp?.id ?? null,
          }
        }
        
        // If no data, maybe it's too fast? retry
        console.warn(`[Auth] No profile found for ${authUser.id}, attempt ${attempt + 1}/${retries}`)
      } catch (e: any) {
        console.error(`[Auth] fetchProfile error (attempt ${attempt + 1}/${retries}):`, e.message)
      }
      
      attempt++
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Backoff
      }
    }
    return null
  }, [])

  // ---------------------------------------------------------------
  // Single source of truth: onAuthStateChange
  // No separate getSession() call → prevents lock contention
  // ---------------------------------------------------------------
  useEffect(() => {
    let mounted = true

    // Safety fallback: unlock UI after 5 seconds no matter what
    const timeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[Auth] Timeout — unlocking UI')
        setLoading(false)
      }
    }, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return

        console.log(`[Auth] Event: ${event}`)
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          // If we don't have a profile yet, or if it's a critical event, fetch it
          if (!profile || event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') {
            const p = await fetchProfile(currentSession.user)
            if (mounted) setProfile(p)
          }
        } else {
          setProfile(null)
        }

        if (mounted) setLoading(false)

        if (event === 'SIGNED_IN') router.push('/dashboard')
        if (event === 'SIGNED_OUT') router.push('/login')
      },
    )

    // Trigger initial session check via the listener
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return
      if (loading) {
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
      console.warn('[Auth] getSession fallback error (non-fatal):', err.message)
      if (mounted && loading) setLoading(false)
    })

    // ── PERSISTENCE HEARTBEAT ──
    // Every 15 minutes, we touch the session to ensure it's alive and tokens are refreshed
    const heartbeat = setInterval(() => {
      if (mounted && user) {
        console.log('[Auth] Periodic heartbeat refresh...')
        supabase.auth.refreshSession().catch(err => {
          console.warn('[Auth] Heartbeat refresh failed:', err.message)
        })
      }
    }, 15 * 60 * 1000)

    // Listen for tab focus/visibility changes to force a session refresh
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        supabase.auth.refreshSession().catch(() => {
          supabase.auth.getSession().catch(console.warn)
        })
      }
    }
    
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange)
    }

    return () => {
      mounted = false
      clearTimeout(timeout)
      clearInterval(heartbeat)
      subscription.unsubscribe()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
      }
    }
  }, [router, fetchProfile, profile, user, loading])

  // ---------------------------------------------------------------
  // Protección de rutas
  // ---------------------------------------------------------------
  useEffect(() => {
    if (!loading && !user && !isPublicPath(pathname)) {
      router.push('/login')
    }
  }, [user, loading, pathname, router])

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
