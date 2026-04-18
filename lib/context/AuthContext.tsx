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
      // Simplificar la estructura para que sea fácil de usar
      const formattedProfile = {
        ...data,
        teacherProfileId: (data.teacherProfile as any)?.[0]?.id || (data.teacherProfile as any)?.id,
        studentProfileId: (data.studentProfile as any)?.[0]?.id || (data.studentProfile as any)?.id,
      }
      setProfile(formattedProfile)
    } else {
      console.warn('[AuthContext] Usuario sin perfil en la tabla User.')
      setProfile(null)
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
      setSession(currentSession)
      setUser(currentSession?.user ?? null)
      
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id)
      } else {
        setProfile(null)
      }

      setLoading(false)

      if (_event === 'SIGNED_IN') {
        router.push('/dashboard')
      }
      
      if (_event === 'SIGNED_OUT') {
        router.push('/login')
      }
    })

    return () => {
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
