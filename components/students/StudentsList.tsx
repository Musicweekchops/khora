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
    <div className="space-y-8">
      {/* Header con filtros y botón agregar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex p-1.5 bg-neutral-100/50 rounded-2xl w-full md:w-auto">
          <FilterButton
            active={filter === "ALL"}
            onClick={() => setFilter("ALL")}
            label="Todos"
            count={students.length}
          />
          <FilterButton
            active={filter === "ACTIVE"}
            onClick={() => setFilter("ACTIVE")}
            label="Activos"
            count={students.filter(s => s.status === "ACTIVE").length}
          />
          <FilterButton
            active={filter === "TRIAL"}
            onClick={() => setFilter("TRIAL")}
            label="Prueba"
            count={students.filter(s => s.status === "TRIAL").length}
          />
        </div>

        <Link
          href="/dashboard/alumnos/nuevo"
          className="w-full md:w-auto px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 font-black text-sm shadow-lg shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>✨</span>
          <span>Nuevo Alumno</span>
        </Link>
      </div>

      {/* Tabla de alumnos */}
      {filteredStudents.length === 0 ? (
        <div className="bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-3xl p-20 text-center">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 grayscale opacity-50">
            👥
          </div>
          <p className="text-neutral-900 font-black text-xl mb-1">No hay alumnos registrados</p>
          <p className="text-neutral-500 text-sm mb-8">Comienza registrando tu primer alumno para gestionar sus clases.</p>
          <Link
            href="/dashboard/alumnos/nuevo"
            className="inline-block px-10 py-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all font-black text-sm shadow-xl shadow-primary/20"
          >
            Agregar Primer Alumno
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-neutral-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-50">
              <thead className="bg-neutral-50/50">
                <tr>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                    Identidad
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                    Contacto
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                    Estado
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                    Actividad
                  </th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                    Valor Total
                  </th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-50">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-neutral-50/30 transition-colors group">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 transition-transform group-hover:scale-110">
                          <span className="text-primary font-black text-lg">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-base font-black text-neutral-900 group-hover:text-primary transition-colors">
                            {student.name}
                          </div>
                          <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                            ID: {student.id.split('-')[0]}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-bold text-neutral-700">{student.email}</div>
                      <div className="text-xs font-medium text-neutral-400 mt-1">{student.phone || "Sin teléfono"}</div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(student.status)}
                        {student.hasPendingPayments && (
                          <span className="text-[10px] font-black text-destructive flex items-center gap-2 uppercase tracking-tighter">
                            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                            Pago pendiente
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-neutral-900">
                          {student.totalClassesTaken} Sesiones
                        </span>
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                          {student.modalidad === "online" ? "📹 Remoto" : "🎓 Sede Central"}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 font-bold text-sm">
                        ${student.lifetimeValue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/dashboard/alumnos/${student.id}`}
                          className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary transition-all shadow-md active:scale-95"
                        >
                          Ficha
                        </Link>
                        <Link
                          href={`/dashboard/alumnos/${student.id}/edit`}
                          className="p-2 text-neutral-400 hover:text-primary transition-colors border border-neutral-100 rounded-xl hover:border-primary/20"
                        >
                          ⚙️
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function FilterButton({ active, onClick, label, count }: {
  active: boolean
  onClick: () => void
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 px-6 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${
        active
          ? "bg-white text-primary shadow-sm"
          : "text-neutral-400 hover:text-neutral-600"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <span>{label}</span>
        {count > 0 && (
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${active ? 'bg-primary/10 text-primary' : 'bg-neutral-200 text-neutral-500'}`}>
            {count}
          </span>
        )}
      </div>
    </button>
  )
}
