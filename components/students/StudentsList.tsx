"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Student {
  id: string
  name: string
  email: string
  phone: string | null
  status: string
  modalidad: string | null
  totalClassesTaken: number
  lifetimeValue: number
  hasPendingPayments: boolean
  lastClassDate: string | null
}

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("ALL") // ALL, ACTIVE, INACTIVE, TRIAL

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await fetch("/api/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error al cargar alumnos:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-800",
      INACTIVE: "bg-gray-100 text-gray-800",
      TRIAL: "bg-blue-100 text-blue-800",
      PROSPECT: "bg-yellow-100 text-yellow-800",
      PAUSED: "bg-orange-100 text-orange-800"
    }
    
    const labels = {
      ACTIVE: "Activo",
      INACTIVE: "Inactivo",
      TRIAL: "Prueba",
      PROSPECT: "Prospecto",
      PAUSED: "Pausado"
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const filteredStudents = students.filter(student => {
    if (filter === "ALL") return true
    return student.status === filter
  })

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando alumnos...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header con filtros y botón agregar */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              filter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setFilter("ACTIVE")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              filter === "ACTIVE"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Activos ({students.filter(s => s.status === "ACTIVE").length})
          </button>
          <button
            onClick={() => setFilter("TRIAL")}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              filter === "TRIAL"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Prueba ({students.filter(s => s.status === "TRIAL").length})
          </button>
        </div>

        <Link
          href="/dashboard/alumnos/nuevo"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + Agregar Alumno
        </Link>
      </div>

      {/* Tabla de alumnos */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-gray-600 text-lg mb-4">No hay alumnos registrados</p>
          <Link
            href="/dashboard/alumnos/nuevo"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Agregar Primer Alumno
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Modalidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clases
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LTV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {student.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{student.email}</div>
                    <div className="text-sm text-gray-500">{student.phone || "Sin teléfono"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(student.status)}
                    {student.hasPendingPayments && (
                      <span className="ml-2 text-xs text-red-600">⚠️ Pago pendiente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.modalidad === "online" ? "📹 Online" : "🎓 Presencial"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.totalClassesTaken} clases
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${student.lifetimeValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/dashboard/alumnos/${student.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver
                    </Link>
                    <Link
                      href={`/dashboard/alumnos/${student.id}/edit`}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
