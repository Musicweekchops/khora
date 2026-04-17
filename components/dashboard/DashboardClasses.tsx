'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/context/AuthContext'
import { supabase } from '@/lib/supabase'

interface ClassData {
  id: string
  date: string
  startTime: string
  endTime: string
  duration: number
  status: string
  modalidad: string
  student: {
    id: string
    user: {
      name: string
      email: string
      phone: string
    }
  }
}

interface DashboardClassesData {
  currentClass: ClassData | null
  upcomingClasses: ClassData[]
  isInProgress: boolean
}

export default function DashboardClasses() {
  const router = useRouter()
  const { profile } = useAuth()
  const [data, setData] = useState<DashboardClassesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (profile?.teacherProfileId) {
      fetchData(profile.teacherProfileId)

      const interval = setInterval(() => {
        fetchData(profile.teacherProfileId)
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [profile?.teacherProfileId])

  const fetchData = async (teacherId: string) => {
    try {
      const now = new Date()
      const nowIso = now.toISOString()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

      // 1. Obtener la clase actual o próxima del día
      const { data: dayClasses } = await supabase
        .from('Class')
        .select(`
          *,
          student:StudentProfile(
            id,
            user:User(name, email, phone)
          )
        `)
        .eq('teacherId', teacherId)
        .gte('date', startOfToday)
        .lt('date', endOfToday)
        .order('startTime', { ascending: true })

      let currentClass: ClassData | null = null
      let isInProgress = false

      if (dayClasses && dayClasses.length > 0) {
        const currentTime = now.getHours() * 60 + now.getMinutes()
        
        for (const c of dayClasses) {
          const [startH, startM] = c.startTime.split(':').map(Number)
          const [endH, endM] = (c.endTime || '').split(':').map(Number) || [startH + 1, startM]
          const startTotal = startH * 60 + startM
          const endTotal = endH * 60 + endM

          if (currentTime >= startTotal - 15 && currentTime <= endTotal) {
            currentClass = c as any
            isInProgress = currentTime >= startTotal
            break
          }
          
          if (currentTime < startTotal && !currentClass) {
            currentClass = c as any
          }
        }
      }

      // 2. Obtener próximas clases (desde mañana en adelante)
      const { data: upcoming } = await supabase
        .from('Class')
        .select(`
          *,
          student:StudentProfile(
            id,
            user:User(name, email, phone)
          )
        `)
        .eq('teacherId', teacherId)
        .gt('date', endOfToday)
        .eq('status', 'SCHEDULED')
        .order('date', { ascending: true })
        .limit(5)

      setData({
        currentClass,
        upcomingClasses: (upcoming || []) as any[],
        isInProgress
      })
    } catch (error) {
      console.error('Error al cargar clases:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateClassStatus = async (classId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('Class')
        .update({ 
          status: newStatus,
          // Nota: attendanceStatus o attendanceMarked dependerá de tu lógica de DB
          attendanceStatus: newStatus === 'CONFIRMED' ? 'PRESENT' : 
                           newStatus === 'NO_SHOW' ? 'ABSENT' : null
        })
        .eq('id', classId)

      if (!error) {
        if (profile?.teacherProfileId) {
          await fetchData(profile.teacherProfileId)
        }
      }
    } catch (error) {
      console.error('Error al actualizar estado:', error)
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CL', { 
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  const getTimeUntilClass = (dateString: string, startTime: string) => {
    const now = new Date()
    const classDate = new Date(dateString)
    const [hours, minutes] = startTime.split(':').map(Number)
    classDate.setHours(hours, minutes, 0, 0)
    
    const diffMs = classDate.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 0) return 'Iniciada'
    if (diffMins === 0) return 'Ahora'
    if (diffMins < 60) return `en ${diffMins} min`
    
    const hrs = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `en ${hrs}h ${mins}min`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ padding: '0 15px' }}>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentClass = data?.currentClass
  const upcomingClasses = data?.upcomingClasses || []
  const isInProgress = data?.isInProgress || false

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-1">
      {/* CLASE ACTUAL - IZQUIERDA */}
      <div className="h-full">
        {!currentClass ? (
          <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center h-full min-h-[300px]">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-2xl mb-4 grayscale opacity-50">
              📅
            </div>
            <p className="text-neutral-900 font-bold text-lg">No hay clases activas</p>
            <p className="text-neutral-500 text-sm mt-1 mb-6">Tu agenda está despejada por el momento.</p>
            <Link
              href="/dashboard/agenda"
              className="inline-block px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-bold text-sm shadow-sm"
            >
              Ver Calendario Semanal
            </Link>
          </div>
        ) : (
          <div className={`rounded-2xl shadow-xl overflow-hidden border p-8 h-full transition-all duration-500 ${
            isInProgress 
              ? 'bg-emerald-600 border-emerald-500 text-white' 
              : 'bg-primary border-primary/50 text-white'
          }`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-1">
                  {isInProgress ? 'En curso' : 'Siguiente Sesión'}
                </span>
                <h2 className="text-2xl font-black flex items-center gap-3">
                  <span>{isInProgress ? '🎯' : '🕒'}</span>
                  <span>{currentClass.startTime} - {currentClass.endTime}</span>
                </h2>
              </div>
              {isInProgress && (
                <div className="px-4 py-1 bg-white/20 backdrop-blur-md text-white text-[10px] font-black rounded-full animate-pulse border border-white/30">
                  SESIÓN EN VIVO
                </div>
              )}
            </div>

            {/* Información del Alumno */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10 group hover:bg-white/15 transition-all">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-xl font-bold border border-white/20">
                  {currentClass.student.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-black">{currentClass.student.user.name}</p>
                  <p className="text-xs font-bold opacity-70 uppercase tracking-wider">
                    {currentClass.modalidad === 'online' ? '📹 Videollamada Online' : '🎓 Clase Presencial'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  {currentClass.duration} Minutos
                </span>
                <span className="opacity-40">|</span>
                <span className="px-2 py-0.5 bg-white/20 rounded uppercase tracking-tighter text-[10px]">
                  {currentClass.status === 'SCHEDULED' ? 'Programada' : 
                   currentClass.status === 'CONFIRMED' ? 'Confirmada' : 
                   currentClass.status}
                </span>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentClass.status === 'SCHEDULED' && (
                <button
                  onClick={() => updateClassStatus(currentClass.id, 'CONFIRMED')}
                  disabled={updating}
                  className="px-4 py-3 bg-white text-primary rounded-xl hover:bg-neutral-50 font-black text-sm disabled:opacity-50 transition-all shadow-lg"
                >
                  ✓ Confirmar Asistencia
                </button>
              )}
              
              {(currentClass.status === 'CONFIRMED' || isInProgress) && (
                <button
                  onClick={() => updateClassStatus(currentClass.id, 'COMPLETED')}
                  disabled={updating}
                  className="px-4 py-3 bg-white text-emerald-600 rounded-xl hover:bg-neutral-50 font-black text-sm disabled:opacity-50 transition-all shadow-lg"
                >
                  ✓ Finalizar Clase
                </button>
              )}

              <button
                onClick={() => updateClassStatus(currentClass.id, 'NO_SHOW')}
                disabled={updating}
                className="px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 font-bold text-sm disabled:opacity-50 transition-all"
              >
                ✕ No Asistió
              </button>
              
              <Link
                href={`/dashboard/clases/detalles?id=${currentClass.id}`}
                className="px-4 py-3 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 font-bold text-sm text-center transition-all flex items-center justify-center gap-2"
              >
                📋 Expandir Detalles
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* PRÓXIMAS CLASES - DERECHA */}
      <div className="h-full">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-8 h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full" />
              Próximas Clases
            </h2>
            <Link
              href="/dashboard/agenda"
              className="text-xs font-black text-primary hover:underline tracking-widest uppercase"
            >
              VER TODO →
            </Link>
          </div>

          {upcomingClasses.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center text-xl mb-4 grayscale opacity-30">
                📭
              </div>
              <p className="text-neutral-400 font-medium text-sm">No hay clases próximas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingClasses.map((clase) => (
                <Link
                  key={clase.id}
                  href={`/dashboard/clases/detalles?id=${clase.id}`}
                  className="block group"
                >
                  <div className="flex justify-between items-center p-4 rounded-xl border border-neutral-100 group-hover:border-primary/20 group-hover:shadow-md transition-all bg-neutral-50/30 group-hover:bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        {clase.student.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 group-hover:text-primary transition-colors text-sm">
                          {clase.student.user.name}
                        </p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                          {formatDate(clase.date)} • {clase.startTime}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-neutral-500 uppercase tracking-tighter mb-1">
                        {getTimeUntilClass(clase.date, clase.startTime)}
                      </div>
                      <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-bold rounded group-hover:bg-primary/20 group-hover:text-primary transition-colors uppercase">
                        {clase.status}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
