"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface StudentDetailProps {
  studentId: string
}

export default function StudentDetail({ studentId }: StudentDetailProps) {
  const router = useRouter()
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchStudent()
  }, [studentId])

  const fetchStudent = async () => {
    try {
      const response = await fetch(`/api/students/${studentId}`)
      if (response.ok) {
        const data = await response.json()
        setStudent(data)
      }
    } catch (error) {
      console.error("Error al cargar alumno:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de desactivar este alumno?")) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: "DELETE"
      })

      if (response.ok) {
        router.push("/dashboard/alumnos")
        router.refresh()
      }
    } catch (error) {
      console.error("Error al desactivar alumno:", error)
      alert("Error al desactivar el alumno")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando información...</p>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Alumno no encontrado</p>
      </div>
    )
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
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-2xl">
                {student.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{student.user.name}</h2>
              <p className="text-gray-600 mt-1">{student.user.email}</p>
              <p className="text-gray-600">{student.user.phone || "Sin teléfono"}</p>
              <div className="mt-2">
                {getStatusBadge(student.status)}
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Link
              href={`/dashboard/alumnos/${studentId}/edit`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Editar
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {deleting ? "Desactivando..." : "Desactivar"}
            </button>
          </div>
        </div>
      </div>

      {/* Grid de información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información General */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Información General
          </h3>
          <div className="space-y-3">
            <InfoRow label="Modalidad" value={student.modalidad === "online" ? "📹 Online" : "🎓 Presencial"} />
            <InfoRow label="Día Preferido" value={student.preferredDay || "No especificado"} />
            <InfoRow label="Hora Preferida" value={student.preferredTime || "No especificada"} />
            <InfoRow label="Fuente de Lead" value={student.leadSource || "No especificado"} />
            <InfoRow label="Fecha de Registro" value={new Date(student.createdAt).toLocaleDateString()} />
          </div>
        </div>

        {/* Métricas */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Métricas
          </h3>
          <div className="space-y-3">
            <InfoRow label="Total de Clases" value={student.totalClassesTaken.toString()} />
            <InfoRow label="Meses Activo" value={student.totalMonthsActive.toString()} />
            <InfoRow 
              label="Lifetime Value" 
              value={`$${student.lifetimeValue.toLocaleString()}`} 
            />
            <InfoRow 
              label="Última Clase" 
              value={student.lastClassDate ? new Date(student.lastClassDate).toLocaleDateString() : "Sin clases aún"} 
            />
            <InfoRow 
              label="Reagendamientos este mes" 
              value={`${student.reschedulesThisMonth}/2`} 
            />
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Contacto de Emergencia
          </h3>
          <div className="space-y-3">
            <InfoRow 
              label="Nombre" 
              value={student.emergencyContact || "No especificado"} 
            />
            <InfoRow 
              label="Teléfono" 
              value={student.emergencyPhone || "No especificado"} 
            />
          </div>
        </div>

        {/* Suscripción Activa */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Suscripción Activa
          </h3>
          {student.subscriptions && student.subscriptions.length > 0 ? (
            <div className="space-y-3">
              <InfoRow label="Plan" value={student.subscriptions[0].plan?.name || "N/A"} />
              <InfoRow 
                label="Clases Usadas" 
                value={`${student.subscriptions[0].classesUsed}/${student.subscriptions[0].classesTotal}`} 
              />
              <InfoRow 
                label="Válido hasta" 
                value={new Date(student.subscriptions[0].endDate).toLocaleDateString()} 
              />
            </div>
          ) : (
            <p className="text-gray-500">Sin suscripción activa</p>
          )}
        </div>
      </div>

      {/* Historial de Clases */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Historial de Clases Recientes
        </h3>
        {student.classes && student.classes.length > 0 ? (
          <div className="space-y-3">
            {student.classes.slice(0, 5).map((clase: any) => (
              <div key={clase.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(clase.scheduledDate).toLocaleDateString()} - {new Date(clase.scheduledDate).toLocaleTimeString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {clase.modalidad} • {clase.status}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  clase.status === "COMPLETED" 
                    ? "bg-green-100 text-green-800" 
                    : clase.status === "SCHEDULED" 
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                }`}>
                  {clase.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Aún no ha tomado clases</p>
        )}
      </div>

      {/* Pagos */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            💰 Historial de Pagos
          </h3>
          <a
            href={`/dashboard/pagos/nuevo?studentId=${studentId}`}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            + Registrar Pago
          </a>
        </div>
        
        {student.payments && student.payments.length > 0 ? (
          <div className="space-y-3">
            {student.payments.slice(0, 10).map((pago: any) => (
              <div key={pago.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="font-bold text-gray-900 text-lg">
                        ${pago.amount.toLocaleString()}
                      </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pago.status === "PAID" 
                          ? "bg-green-100 text-green-800" 
                          : pago.status === "PENDING" 
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}>
                        {pago.status === "PAID" ? "Pagado" : pago.status === "PENDING" ? "Pendiente" : "Vencido"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 mb-1">{pago.description || "Sin descripción"}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{pago.method || "N/A"}</span>
                      {pago.paidAt && (
                        <span>Pagado: {new Date(pago.paidAt).toLocaleDateString()}</span>
                      )}
                      {!pago.paidAt && pago.dueDate && (
                        <span>Vence: {new Date(pago.dueDate).toLocaleDateString()}</span>
                      )}
                      {pago.isAutomatic && (
                        <span className="text-blue-600">• Automático</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Sin pagos registrados</p>
            <a
              href={`/dashboard/pagos/nuevo?studentId=${studentId}`}
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Registrar Primer Pago
            </a>
          </div>
        )}
      </div>

      {/* Tareas Asignadas */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Tareas Recientes
        </h3>
        {student.tasks && student.tasks.length > 0 ? (
          <div className="space-y-3">
            {student.tasks.slice(0, 5).map((tarea: any) => (
              <div key={tarea.id} className="py-2 border-b last:border-b-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{tarea.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{tarea.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    tarea.completed 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {tarea.completed ? "Completada" : "Pendiente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Sin tareas asignadas</p>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  )
}
