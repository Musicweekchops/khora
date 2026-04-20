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
// Rutas públicas que no requieren sesión
// -------------------------------------------------------------------
const PUBLIC_PATHS = ['/login', '/register', '/', '/agendar']

function isPublicPath(pathname: string | null) {
  if (!pathname) return false
  return PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith('/agendar'))
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
  // Cargar perfil público desde Supabase
  // ---------------------------------------------------------------
  const fetchProfile = useCallback(async (authUser: User) => {
    try {
      // Consultar User + perfiles vinculados
      const { data, error } = await supabase
        .from('User')
        .select(`
          id, email, name, phone, role,
          TeacherProfile ( id ),
          StudentProfile ( id )
        `)
        .eq('id', authUser.id)
        .maybeSingle()

      if (error) {
        console.error('[Auth] Error consultando perfil:', error.message)
        return null
      }

      if (!data) {
        console.warn('[Auth] No se encontró fila en public.User para', authUser.id)
        return null
      }

      // Normalizar respuesta (Supabase puede devolver array u objeto)
      const tp = Array.isArray(data.TeacherProfile)
        ? data.TeacherProfile[0]
        : data.TeacherProfile
      const sp = Array.isArray(data.StudentProfile)
        ? data.StudentProfile[0]
        : data.StudentProfile

      const formatted: UserProfile = {
        id: data.id,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role as 'TEACHER' | 'STUDENT',
        teacherProfileId: tp?.id ?? null,
        studentProfileId: sp?.id ?? null,
      }

      return formatted
    } catch (e) {
      console.error('[Auth] Excepción en fetchProfile:', e)
      return null
    }
  }, [])

  // ---------------------------------------------------------------
  // Inicialización + listener
  // ---------------------------------------------------------------
  useEffect(() => {
    let mounted = true

    // Safety timeout: si en 6s no resolvió, desbloquear UI
    const timeout = setTimeout(() => {
      if (mounted && loading) setLoading(false)
    }, 6000)

    async function init() {
      try {
        const { data: { session: s } } = await supabase.auth.getSession()
        if (!mounted) return

        setSession(s)
        setUser(s?.user ?? null)

        if (s?.user) {
          const p = await fetchProfile(s.user)
          if (mounted) setProfile(p)
        }
      } catch (err) {
        console.error('[Auth] init error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (!mounted) return

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          const p = await fetchProfile(currentSession.user)
          if (mounted) setProfile(p)
        } else {
          setProfile(null)
        }

        if (mounted) setLoading(false)

        if (event === 'SIGNED_IN') router.push('/dashboard')
        if (event === 'SIGNED_OUT') router.push('/login')
      },
    )

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
