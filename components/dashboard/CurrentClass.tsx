"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ClassData {
  id: string
  scheduledDate: string
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
  notes: Array<{
    id: string
    content: string
  }>
  tasks: Array<{
    id: string
    title: string
    completed: boolean
  }>
}

interface CurrentClassResponse {
  currentClass: ClassData | null
  nextClass: ClassData | null
  isInProgress: boolean
}

export default function CurrentClass() {
  const router = useRouter()
  const [data, setData] = useState<CurrentClassResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchCurrentClass()

    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      fetchCurrentClass()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const fetchCurrentClass = async () => {
    try {
      const response = await fetch("/api/classes/current")
      if (response.ok) {
        const result = await response.json()
        setData(result)
      }
    } catch (error) {
      console.error("Error al cargar clase actual:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateClassStatus = async (classId: string, newStatus: string) => {
    setUpdating(true)
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          status: newStatus,
          attendanceMarked: true
        })
      })

      if (response.ok) {
        await fetchCurrentClass()
        router.refresh()
      }
    } catch (error) {
      console.error("Error al actualizar estado:", error)
    } finally {
      setUpdating(false)
    }
  }

  const getTimeUntilClass = (scheduledDate: string) => {
    const now = new Date()
    const classTime = new Date(scheduledDate)
    const diffMs = classTime.getTime() - now.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 0) return "Iniciada"
    if (diffMins === 0) return "Ahora"
    if (diffMins < 60) return `en ${diffMins} min`
    
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `en ${hours}h ${mins}min`
  }

  const formatTime = (scheduledDate: string, duration: number) => {
    const start = new Date(scheduledDate)
    const end = new Date(start.getTime() + duration * 60000)
    
    const formatHour = (date: Date) => {
      return date.toLocaleTimeString("es-CL", { 
        hour: "2-digit", 
        minute: "2-digit",
        hour12: false
      })
    }

    return `${formatHour(start)} - ${formatHour(end)}`
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const classToShow = data?.currentClass
  const isInProgress = data?.isInProgress || false

  if (!classToShow) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500 text-lg">📅 No hay clases programadas para hoy</p>
        <a
          href="/dashboard/clases/nueva"
          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Agendar Clase
        </a>
      </div>
    )
  }

  return (
    <div className={`rounded-lg shadow-lg p-6 ${
      isInProgress 
        ? "bg-gradient-to-r from-green-500 to-green-600 text-white" 
        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
    }`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center space-x-2">
          <span>{isInProgress ? "🎯" : "📅"}</span>
          <span>{isInProgress ? "CLASE EN CURSO" : "PRÓXIMA CLASE HOY"}</span>
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
          ⏰ {formatTime(classToShow.scheduledDate, classToShow.duration)}
        </p>
        {!isInProgress && (
          <p className="text-lg opacity-90 mt-1">
            {getTimeUntilClass(classToShow.scheduledDate)}
          </p>
        )}
      </div>

      {/* Información del Alumno */}
      <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
        <p className="text-2xl font-bold mb-2">
          👤 {classToShow.student.user.name}
        </p>
        <div className="flex items-center space-x-4 text-sm opacity-90">
          <span>
            {classToShow.modalidad === "online" ? "📹 Online" : "🎓 Presencial"}
          </span>
          <span>•</span>
          <span>{classToShow.duration} minutos</span>
          <span>•</span>
          <span className="px-2 py-1 bg-white bg-opacity-30 rounded">
            {classToShow.status === "SCHEDULED" ? "Programada" : 
             classToShow.status === "CONFIRMED" ? "Confirmada" : 
             classToShow.status}
          </span>
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          {classToShow.status === "SCHEDULED" && (
            <button
              onClick={() => updateClassStatus(classToShow.id, "CONFIRMED")}
              disabled={updating}
              className="flex-1 px-4 py-3 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50 transition-colors"
            >
              ✓ Confirmar Asistencia
            </button>
          )}
          
          {(classToShow.status === "CONFIRMED" || isInProgress) && (
            <button
              onClick={() => updateClassStatus(classToShow.id, "COMPLETED")}
              disabled={updating}
              className="flex-1 px-4 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50 transition-colors"
            >
              ✓ Marcar Completada
            </button>
          )}

          <button
            onClick={() => updateClassStatus(classToShow.id, "NO_SHOW")}
            disabled={updating}
            className="px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 font-medium disabled:opacity-50 transition-colors"
          >
            ✗ No Asistió
          </button>
        </div>

        <div className="flex space-x-2">
          <a
            href={`/dashboard/clases/${classToShow.id}`}
            className="flex-1 px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 font-medium text-center transition-colors"
          >
            📝 Agregar Nota
          </a>
          
          <a
            href={`/dashboard/clases/${classToShow.id}`}
            className="flex-1 px-4 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 font-medium text-center transition-colors"
          >
            📋 Ver Detalle
          </a>
        </div>
      </div>

      {/* Info Adicional */}
      {classToShow.tasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white border-opacity-20">
          <p className="text-sm opacity-90">
            ✏️ {classToShow.tasks.length} tarea{classToShow.tasks.length !== 1 ? "s" : ""} pendiente{classToShow.tasks.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  )
}
