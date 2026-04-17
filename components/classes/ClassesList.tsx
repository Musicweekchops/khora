"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"

interface Class {
  id: string
  date: string
  startTime: string
  endTime: string
  duration: number
  status: string
  modalidad: string
  isTrialClass: boolean
  student: {
    id: string
    user: {
      name: string
      email: string
    }
  }
}

export default function ClassesList() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<"list" | "week">("list")
  const [statusFilter, setStatusFilter] = useState("ALL")

  useEffect(() => {
    if (profile?.teacherProfileId) {
      fetchClasses(profile.teacherProfileId)
    }
  }, [profile?.teacherProfileId])

  const fetchClasses = async (teacherId: string) => {
    try {
      const { data, error } = await supabase
        .from('Class')
        .select(`
          *,
          student:StudentProfile(
            id,
            user:User(name, email)
          )
        `)
        .eq('teacherId', teacherId)
        .order('date', { ascending: true })
        .order('startTime', { ascending: true })

      if (error) throw error
      setClasses((data || []) as any[])
    } catch (error) {
      console.error("Error al cargar clases:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      CONFIRMED: "bg-green-100 text-green-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-orange-100 text-orange-800",
      RESCHEDULED: "bg-purple-100 text-purple-800"
    }
    
    const labels = {
      SCHEDULED: "Programada",
      CONFIRMED: "Confirmada",
      COMPLETED: "Completada",
      CANCELLED: "Cancelada",
      NO_SHOW: "No asistió",
      RESCHEDULED: "Reagendada"
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CL", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getTodayClasses = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return classes.filter(c => {
      const classDate = new Date(c.date)
      return classDate >= today && classDate < tomorrow
    })
  }

  const getUpcomingClasses = () => {
    const now = new Date()
    return classes
      .filter(c => new Date(c.date) > now && c.status !== "CANCELLED")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }

  const filteredClasses = statusFilter === "ALL" 
    ? classes 
    : classes.filter(c => c.status === statusFilter)

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando clases...</p>
      </div>
    )
  }

  const todayClasses = getTodayClasses()
  const upcomingClasses = getUpcomingClasses()

  return (
    <div className="space-y-6">
      {/* Clases de Hoy */}
      {todayClasses.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-4">
            📅 Clases de Hoy ({todayClasses.length})
          </h2>
          <div className="space-y-3">
            {todayClasses.map((clase) => (
              <div key={clase.id} className="bg-white rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">{clase.student.user.name}</p>
                  <p className="text-sm text-gray-600">
                    {clase.startTime} • {clase.duration} min • {clase.modalidad}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(clase.status)}
                  <Link
                    href={`/dashboard/clases/${clase.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Ver
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header con botón agregar */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              view === "list"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Lista
          </button>
          <button
            onClick={() => setView("week")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              view === "week"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Semana
          </button>
        </div>

        <Link
          href="/dashboard/clases/nueva"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Agendar Clase
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2">
        <button
          onClick={() => setStatusFilter("ALL")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            statusFilter === "ALL"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Todas ({classes.length})
        </button>
        <button
          onClick={() => setStatusFilter("SCHEDULED")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            statusFilter === "SCHEDULED"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Programadas ({classes.filter(c => c.status === "SCHEDULED").length})
        </button>
        <button
          onClick={() => setStatusFilter("CONFIRMED")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            statusFilter === "CONFIRMED"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Confirmadas ({classes.filter(c => c.status === "CONFIRMED").length})
        </button>
        <button
          onClick={() => setStatusFilter("COMPLETED")}
          className={`px-4 py-2 text-sm font-medium rounded-lg ${
            statusFilter === "COMPLETED"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Completadas ({classes.filter(c => c.status === "COMPLETED").length})
        </button>
      </div>

      {/* Vista de Lista */}
      {view === "list" && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {filteredClasses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No hay clases programadas</p>
              <Link
                href="/dashboard/clases/nueva"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Agendar Primera Clase
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Alumno
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Modalidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Duración
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClasses.map((clase) => (
                  <tr key={clase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(clase.date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {clase.startTime} - {clase.endTime}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{clase.student.user.name}</div>
                      {clase.isTrialClass && (
                        <span className="text-xs text-purple-600">Clase de Prueba</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clase.modalidad === "online" ? "📹 Online" : "🎓 Presencial"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {clase.duration} min
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(clase.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/dashboard/clases/${clase.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Ver Detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Vista Semanal */}
      {view === "week" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Próximas Clases</h3>
          {upcomingClasses.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No hay clases próximas programadas</p>
          ) : (
            <div className="space-y-3">
              {upcomingClasses.map((clase) => (
                <div key={clase.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-gray-900">{clase.student.user.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatDate(clase.date)} • {clase.startTime}
                      </p>
                      <p className="text-sm text-gray-500">
                        {clase.modalidad} • {clase.duration} min
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {getStatusBadge(clase.status)}
                      <Link
                        href={`/dashboard/clases/${clase.id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ver Detalle →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
