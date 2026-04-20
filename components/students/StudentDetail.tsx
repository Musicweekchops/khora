"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"

interface StudentData {
  id: string
  status: string
  modalidad: string
  lead_source: string
  preferred_day: string
  preferred_time: string
  emergency_contact: string
  emergency_phone: string
  lifetime_value: number
  user: { name: string; email: string; phone: string }
}

export default function StudentDetail({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudent()
  }, [studentId])

  async function loadStudent() {
    const { data, error } = await supabase
      .from("StudentProfile")
      .select("*, User ( name, email, phone )")
      .eq("id", studentId)
      .single()

    if (!error && data) {
      setStudent({
        id: data.id,
        status: data.status ?? "PROSPECT",
        modalidad: data.modalidad ?? "online",
        lead_source: data.lead_source ?? "",
        preferred_day: data.preferred_day ?? "",
        preferred_time: data.preferred_time ?? "",
        emergency_contact: data.emergency_contact ?? "",
        emergency_phone: data.emergency_phone ?? "",
        lifetime_value: data.lifetime_value ?? 0,
        user: {
          name: data.User?.name ?? "—",
          email: data.User?.email ?? "—",
          phone: data.User?.phone ?? "",
        },
      })
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm("¿Seguro que quieres eliminar este alumno?")) return
    await supabase.from("StudentProfile").delete().eq("id", studentId)
    window.location.href = "/dashboard/alumnos"
  }

  if (loading) return <div className="animate-pulse h-64 bg-white rounded-3xl" />
  if (!student) return <p className="text-neutral-500">Alumno no encontrado</p>

  const statusLabels: Record<string, string> = {
    ACTIVE: "Activo", PROSPECT: "Prospecto", TRIAL: "Prueba", PAUSED: "Pausado", INACTIVE: "Inactivo",
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-3xl font-bold text-violet-600">
            {student.user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">{student.user.name}</h1>
            <p className="text-neutral-500 font-medium">{student.user.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/dashboard/alumnos/editar?id=${studentId}`}
            className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-2xl text-sm font-bold hover:bg-neutral-200 transition-colors"
          >
            ✏️ Editar
          </Link>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-50 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-100 transition-colors"
          >
            🗑️ Eliminar
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <InfoCard label="Estado" value={statusLabels[student.status] ?? student.status} icon="📈" />
        <InfoCard label="Modalidad" value={student.modalidad === "online" ? "Virtual" : "Presencial"} icon="🎓" />
        <InfoCard label="Valor Acumulado" value={formatCurrency(student.lifetime_value)} icon="💰" />
        <InfoCard label="Teléfono" value={student.user.phone || "—"} icon="📞" />
        <InfoCard label="Día Preferido" value={student.preferred_day || "—"} icon="🗓️" />
        <InfoCard label="Hora Preferida" value={student.preferred_time || "—"} icon="⏰" />
      </div>

      {student.emergency_contact && (
        <div className="bg-red-50 rounded-3xl p-6 border border-red-100">
          <h3 className="font-bold text-red-700 mb-2">🚨 Contacto de Emergencia</h3>
          <p className="text-sm text-red-600">{student.emergency_contact} — {student.emergency_phone}</p>
        </div>
      )}
    </div>
  )
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5">
      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{icon} {label}</p>
      <p className="text-lg font-black text-neutral-900">{value}</p>
    </div>
  )
}
