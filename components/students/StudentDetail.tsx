"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"

interface StudentDetailProps {
  studentId: string
}

export default function StudentDetail({ studentId }: StudentDetailProps) {
  const router = useRouter()
  const { profile: userProfile } = useAuth()
  const [student, setStudent] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (studentId) {
      fetchStudent()
    }
  }, [studentId])

  const fetchStudent = async () => {
    try {
      const { data, error } = await supabase
        .from('StudentProfile')
        .select(`
          *,
          user:User(*),
          classes:Class(*),
          payments:Payment(*)
        `)
        .eq('id', studentId)
        .single()

      if (error) throw error
      
      // Formatear datos para el componente
      const formattedData = {
        ...data,
        totalClassesTaken: data.classes?.filter((c: any) => c.status === 'COMPLETED').length || 0,
        totalMonthsActive: data.createdAt ? Math.max(1, Math.ceil((new Date().getTime() - new Date(data.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))) : 0,
        lastClassDate: data.classes?.filter((c: any) => c.status === 'COMPLETED').sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || null,
        reschedulesThisMonth: data.classes?.filter((c: any) => {
          const d = new Date(c.date)
          const now = new Date()
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && c.status === 'RESCHEDULED'
        }).length || 0,
        classes: data.classes?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [],
        payments: data.payments?.sort((a: any, b: any) => new Date(b.paidAt || b.date).getTime() - new Date(a.paidAt || a.date).getTime()) || [],
        tasks: [] // Tareas se manejarán por separado si es necesario
      }

      setStudent(formattedData)
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
      const { error } = await supabase
        .from('StudentProfile')
        .update({ status: 'INACTIVE' })
        .eq('id', studentId)

      if (error) throw error

      router.push("/dashboard/alumnos")
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
      ACTIVE: "bg-emerald-50 text-emerald-700 border border-emerald-100",
      INACTIVE: "bg-neutral-100 text-neutral-600 border border-neutral-200",
      TRIAL: "bg-amber-50 text-amber-700 border border-amber-100",
      PROSPECT: "bg-sky-50 text-sky-700 border border-sky-100",
      PAUSED: "bg-orange-50 text-orange-700 border border-orange-100"
    }
    
    const labels = {
      ACTIVE: "Activo",
      INACTIVE: "Inactivo",
      TRIAL: "Prueba",
      PROSPECT: "Prospecto",
      PAUSED: "Pausado"
    }

    return (
      <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con acciones */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-bold text-3xl">
                {student.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">{student.user.name}</h2>
              <p className="text-neutral-500 mt-1 font-medium">{student.user.email}</p>
              <p className="text-neutral-500">{student.user.phone || "Sin teléfono"}</p>
              <div className="mt-3">
                {getStatusBadge(student.status)}
              </div>
            </div>
          </div>

          <div className="flex space-x-2 w-full md:w-auto">
            <Link
              href={`/dashboard/alumnos/${studentId}/edit`}
              className="flex-1 md:flex-none text-center px-4 py-2 border border-neutral-200 rounded-lg text-neutral-600 hover:bg-neutral-50 transition-colors font-medium"
            >
              Editar Perfil
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1 md:flex-none px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive hover:text-white disabled:opacity-50 transition-all font-medium border border-destructive/20"
            >
              {deleting ? "Desactivando..." : "Desactivar"}
            </button>
          </div>
        </div>
      </div>

      {/* Grid de información */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información General */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
          <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <span>👤</span> Información General
          </h3>
          <div className="space-y-4">
            <InfoRow label="Modalidad" value={student.modalidad === "online" ? "📹 Online" : "🎓 Presencial"} />
            <InfoRow label="Día Preferido" value={student.preferredDay || "No especificado"} />
            <InfoRow label="Hora Preferida" value={student.preferredTime || "No especificada"} />
            <InfoRow label="Fuente de Lead" value={student.leadSource || "No especificado"} />
            <InfoRow label="Fecha de Registro" value={new Date(student.createdAt).toLocaleDateString()} />
          </div>
        </div>

        {/* Métricas */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
          <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <span>📊</span> Métricas de Desempeño
          </h3>
          <div className="space-y-4">
            <InfoRow label="Total de Clases" value={student.totalClassesTaken.toString()} />
            <InfoRow label="Meses Activo" value={student.totalMonthsActive.toString()} />
            <InfoRow 
              label="Lifetime Value" 
              value={`$${student.lifetimeValue.toLocaleString()}`} 
              highlight
            />
            <InfoRow 
              label="Última Clase" 
              value={student.lastClassDate ? new Date(student.lastClassDate).toLocaleDateString() : "Sin clases aún"} 
            />
            <InfoRow 
              label="Reagendamientos (Mes)" 
              value={`${student.reschedulesThisMonth}/2`} 
            />
          </div>
        </div>

        {/* Contacto de Emergencia */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
          <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <span>🆘</span> Contacto de Emergencia
          </h3>
          <div className="space-y-4">
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
        <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
          <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
            <span>💳</span> Suscripción Activa
          </h3>
          {student.subscriptions && student.subscriptions.length > 0 ? (
            <div className="space-y-4">
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
            <div className="text-center py-4 bg-neutral-50 rounded-lg border border-dashed border-neutral-200">
              <p className="text-neutral-500 text-sm">Sin suscripción activa</p>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Clases */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <span>📚</span> Historial de Clases
          </h3>
          <Link
            href={`/dashboard/clases/nueva?studentId=${studentId}`}
            className="text-primary hover:underline text-sm font-bold"
          >
            Agendar Nueva →
          </Link>
        </div>
        {student.classes && student.classes.length > 0 ? (
          <div className="space-y-3">
            {student.classes.slice(0, 5).map((clase: any) => (
              <div key={clase.id} className="flex justify-between items-center py-3 border-b border-neutral-100 last:border-b-0">
                <div>
                  <p className="font-bold text-neutral-900">
                    {new Date(clase.scheduledDate).toLocaleDateString()} - {new Date(clase.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <p className="text-xs text-neutral-500 font-medium">
                    {clase.modalidad} • Asistencia: {clase.status}
                  </p>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  clase.status === "COMPLETED" 
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                    : clase.status === "SCHEDULED" 
                      ? "bg-sky-50 text-sky-700 border border-sky-100"
                      : "bg-neutral-100 text-neutral-600 border border-neutral-200"
                }`}>
                  {clase.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-400 text-sm text-center py-4">Aún no ha tomado clases</p>
        )}
      </div>

      {/* Pagos */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <span>💰</span> Historial de Pagos
          </h3>
          <Link
            href={`/dashboard/pagos/nuevo?studentId=${studentId}`}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-bold shadow-sm transition-all"
          >
            + Registrar Pago
          </Link>
        </div>
        
        {student.payments && student.payments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.payments.slice(0, 10).map((pago: any) => (
              <div key={pago.id} className="border border-neutral-100 rounded-xl p-4 bg-neutral-50/50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <p className="font-bold text-neutral-900 text-lg">
                        ${pago.amount.toLocaleString()}
                      </p>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        pago.status === "PAID" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : pago.status === "PENDING" 
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                      }`}>
                        {pago.status === "PAID" ? "Pagado" : pago.status === "PENDING" ? "Pendiente" : "Vencido"}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-2 font-medium">{pago.description || "Sin descripción"}</p>
                    <div className="flex items-center space-x-4 text-[11px] text-neutral-400 font-bold uppercase tracking-tight">
                      <span>{pago.method || "N/A"}</span>
                      {pago.paidAt && (
                        <span>Pagado: {new Date(pago.paidAt).toLocaleDateString()}</span>
                      )}
                      {!pago.paidAt && pago.dueDate && (
                        <span>Vence: {new Date(pago.dueDate).toLocaleDateString()}</span>
                      )}
                      {pago.isAutomatic && (
                        <span className="text-primary">• Automático</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl">
            <p className="text-neutral-500 mb-4">Sin pagos registrados</p>
            <Link
              href={`/dashboard/pagos/nuevo?studentId=${studentId}`}
              className="inline-block px-6 py-2 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors font-bold text-sm"
            >
              Registrar Primer Pago
            </Link>
          </div>
        )}
      </div>

      {/* Tareas Asignadas */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
        <h3 className="text-lg font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <span>📝</span> Tareas Recientes
        </h3>
        {student.tasks && student.tasks.length > 0 ? (
          <div className="space-y-4">
            {student.tasks.slice(0, 5).map((tarea: any) => (
              <div key={tarea.id} className="p-4 border border-neutral-100 rounded-xl hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900">{tarea.title}</p>
                    <p className="text-sm text-neutral-500 mt-1">{tarea.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${
                    tarea.completed 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                      : "bg-amber-50 text-amber-700 border border-amber-100"
                  }`}>
                    {tarea.completed ? "Completada" : "Pendiente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-neutral-400 text-sm">Sin tareas asignadas</p>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-neutral-50 last:border-b-0">
      <span className="text-neutral-500 text-sm font-medium">{label}</span>
      <span className={`font-bold ${highlight ? "text-primary text-lg" : "text-neutral-900 text-sm"}`}>
        {value}
      </span>
    </div>
  )
}
