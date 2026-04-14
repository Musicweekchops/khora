'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  tasks: Array<{
    id: string
    title: string
    completed: boolean
  }>
}

interface DashboardClassesData {
  currentClass: ClassData | null
  upcomingClasses: ClassData[]
  isInProgress: boolean
}

export default function DashboardClasses() {
  const router = useRouter()
  const [data, setData] = useState<DashboardClassesData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchData()

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/classes/current')
      if (response.ok) {
        const result = await response.json()
        
        // También obtener próximas clases
        const upcomingResponse = await fetch('/api/classes?status=SCHEDULED')
        let upcomingClasses: ClassData[] = []
        
        if (upcomingResponse.ok) {
          const allClasses = await upcomingResponse.json()
          const now = new Date()
          
          upcomingClasses = allClasses
            .filter((c: ClassData) => new Date(c.date) > now)
            .sort((a: ClassData, b: ClassData) => 
              new Date(a.date).getTime() - new Date(b.date).getTime()
            )
            .slice(0, 5) // Próximas 5 clases
        }
        
        setData({
          currentClass: result.currentClass,
          upcomingClasses,
          isInProgress: result.isInProgress || false
        })
      }
    } catch (error) {
      console.error('Error al cargar clases:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateClassStatus = async (classId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          attendanceMarked: true
        })
      })

      if (response.ok) {
        await fetchData()
        router.refresh()
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" style={{ padding: '0 15px' }}>
      {/* CLASE ACTUAL - IZQUIERDA */}
      <div>
        {!currentClass ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">📅 No hay clases programadas para hoy</p>
            <Link
              href="/dashboard/clases/nueva"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Agendar Clase
            </Link>
          </div>
        ) : (
          <div className={`rounded-lg shadow-lg p-6 ${
            isInProgress 
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
          }`}>
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center space-x-2">
                <span>{isInProgress ? '🎯' : '📅'}</span>
                <span>{isInProgress ? 'CLASE EN CURSO' : 'PRÓXIMA CLASE HOY'}</span>
              </h2>
              {isInProgress && (
                <span className="px-3 py-1 bg-white text-green-600 text-sm font-bold rounded-full animate-pulse">
                  EN VIVO
                </span>
              )}
            </div>

            {/* Hora */}
            <div className="mb-4">
              <p className="text-3xl font-bold">
                ⏰ {currentClass.startTime} - {currentClass.endTime}
              </p>
              {!isInProgress && (
                <p className="text-lg opacity-90 mt-1">
                  {getTimeUntilClass(currentClass.date, currentClass.startTime)}
                </p>
              )}
            </div>

            {/* Información del Alumno */}
            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
              <p className="text-2xl font-bold mb-2">
                👤 {currentClass.student.user.name}
              </p>
              <div className="flex items-center space-x-4 text-sm opacity-90">
                <span>
                  {currentClass.modalidad === 'online' ? '📹 Online' : '🎓 Presencial'}
                </span>
                <span>•</span>
                <span>{currentClass.duration} minutos</span>
                <span>•</span>
                <span className="px-2 py-1 bg-white bg-opacity-30 rounded">
                  {currentClass.status === 'SCHEDULED' ? 'Programada' : 
                   currentClass.status === 'CONFIRMED' ? 'Confirmada' : 
                   currentClass.status}
                </span>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="space-y-2">
              <div className="flex space-x-2">
                {currentClass.status === 'SCHEDULED' && (
                  <button
                    onClick={() => updateClassStatus(currentClass.id, 'CONFIRMED')}
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50 transition-colors"
                  >
                    ✓ Confirmar Asistencia
                  </button>
                )}
                
                {(currentClass.status === 'CONFIRMED' || isInProgress) && (
                  <button
                    onClick={() => updateClassStatus(currentClass.id, 'COMPLETED')}
                    disabled={updating}
                    className="flex-1 px-4 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50 transition-colors"
                  >
                    ✓ Marcar Completada
                  </button>
                )}

                <button
                  onClick={() => updateClassStatus(currentClass.id, 'NO_SHOW')}
                  disabled={updating}
                  className="px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 font-medium disabled:opacity-50 transition-colors"
                >
                  ✗ No Asistió
                </button>
              </div>

              <div className="flex space-x-2">
                <Link
                  href={`/dashboard/clases/${currentClass.id}`}
                  className="flex-1 px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 font-medium text-center transition-colors"
                >
                  📝 Agregar Nota
                </Link>
                
                <Link
                  href={`/dashboard/clases/${currentClass.id}`}
                  className="flex-1 px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 font-medium text-center transition-colors"
                >
                  📋 Ver Detalle
                </Link>
              </div>
            </div>

            {/* Info Adicional */}
            {currentClass.tasks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white border-opacity-20">
                <p className="text-sm opacity-90">
                  ✏️ {currentClass.tasks.length} tarea{currentClass.tasks.length !== 1 ? 's' : ''} pendiente{currentClass.tasks.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PRÓXIMAS CLASES - DERECHA */}
      <div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">📋 Próximas Clases</h2>
            <Link
              href="/dashboard/agenda"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ver Agenda →
            </Link>
          </div>

          {upcomingClasses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No hay clases próximas programadas</p>
              <Link
                href="/dashboard/clases/nueva"
                className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Agendar Clase
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingClasses.map((clase) => (
                <Link
                  key={clase.id}
                  href={`/dashboard/clases/${clase.id}`}
                  className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{clase.student.user.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(clase.date)} • {clase.startTime}
                      </p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <span>{clase.modalidad === 'online' ? '📹' : '🎓'}</span>
                        <span>{clase.duration} min</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {clase.status === 'SCHEDULED' ? 'Programada' : clase.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {getTimeUntilClass(clase.date, clase.startTime)}
                      </p>
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
