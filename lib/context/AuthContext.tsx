"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  profile: any | null
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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<any | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('User')
        .select('*, teacherProfile:"TeacherProfile"(id), studentProfile:"StudentProfile"(id)')
        .eq('id', userId)
        .single()
      
      if (error) {
        console.error('[AuthContext] Error letal obteniendo el Perfil de public.User:', error)
        setProfile(null)
        return
      }

      if (data) {
        const formattedProfile = {
          ...data,
          teacherProfileId: Array.isArray(data.teacherProfile) ? data.teacherProfile[0]?.id : data.teacherProfile?.id,
          studentProfileId: Array.isArray(data.studentProfile) ? data.studentProfile[0]?.id : data.studentProfile?.id,
        }
        setProfile(formattedProfile)
      } else {
        setProfile(null)
      }
    } catch (e) {
      console.error('[AuthContext] FATAL EXCEPTION en fetchProfile:', e)
      setProfile(null)
    }
  }

  useEffect(() => {
    let isMounted = true

    // Salvavidas absoluto: Si después de 5 segundos loading sigue en true, forzarlo a false.
    const safetyTimeout = setTimeout(() => {
      if (isMounted) setLoading(false)
    }, 5000)

    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        if (error) throw error

        if (!isMounted) return
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      if (!isMounted) return
      
      try {
        setSession(currentSession)
        setUser(currentSession?.user ?? null)
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id)
        } else {
          setProfile(null)
        }
      } catch (err) {
        console.error('Error en onAuthStateChange:', err)
      } finally {
        if (isMounted) setLoading(false)
      }

      if (_event === 'SIGNED_IN') {
        router.push('/dashboard')
      }
      
      if (_event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
      isMounted = false
      clearTimeout(safetyTimeout)
      subscription.unsubscribe()
    }
  }, [router])

  // Lógica de protección de rutas básica
  useEffect(() => {
    const publicPaths = ['/login', '/register', '/', '/agendar']
    const isPublicPath = publicPaths.some(path => pathname === path || pathname?.startsWith('/agendar/'))

    if (!loading && !user && !isPublicPath) {
      router.push('/login')
    }
  }, [user, loading, pathname, router])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
