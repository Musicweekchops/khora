"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

interface TeacherOption {
  id: string
  name: string
  instrumento: string | null
}

interface Props {
  academyId: string
  studentId: string
  studentName: string
  currentTeacherId: string | null
  currentTeacherName: string
  onClose: () => void
  onReassigned: () => void
}

export default function ReassignStudentModal({
  academyId,
  studentId,
  studentName,
  currentTeacherId,
  currentTeacherName,
  onClose,
  onReassigned
}: Props) {
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadTeachers()
  }, [])

  async function loadTeachers() {
    try {
      const { data: at, error } = await supabase
        .from("AcademyTeacher")
        .select(`
          TeacherProfile (
            id, instrumento,
            User ( name )
          )
        `)
        .eq("academy_id", academyId)
        .eq("status", "ACTIVE")

      if (error) throw error

      const options: TeacherOption[] = (at ?? [])
        .map((row: any) => {
          const tp = row.TeacherProfile
          const u = Array.isArray(tp?.User) ? tp.User[0] : tp?.User
          return {
            id: tp?.id ?? "",
            name: u?.name ?? "—",
            instrumento: tp?.instrumento ?? null,
          }
        })
        .filter(t => t.id && t.id !== currentTeacherId)

      setTeachers(options)
    } catch (err) {
      console.error("Error loading teachers for reassign:", err)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTeacherId) return
    setError("")
    setLoading(true)

    try {
      const { error } = await supabase
        .from("StudentProfile")
        .update({ teacher_id: selectedTeacherId })
        .eq("id", studentId)

      if (error) throw error

      onReassigned()
    } catch (err: any) {
      setError(err.message ?? "Error al reasignar el alumno")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/25 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">Reasignar Alumno</h2>
            <p className="text-xs text-neutral-400 mt-0.5">{studentName}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center bg-neutral-100 rounded-full text-neutral-500 hover:bg-neutral-200 text-xs transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 text-sm font-medium p-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-100 text-xs">
            <span className="text-neutral-400 font-semibold block mb-1">Profesor actual</span>
            <span className="text-neutral-700 font-bold">{currentTeacherName || "Ninguno"}</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Nuevo Profesor Asignado</label>
            {teachers.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No hay otros profesores activos en la academia para asignar.</p>
            ) : (
              <select
                required
                value={selectedTeacherId}
                onChange={e => setSelectedTeacherId(e.target.value)}
                className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all bg-white"
              >
                <option value="" disabled>Seleccionar profesor...</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.instrumento ?? "Sin definir"})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedTeacherId}
              className="flex-1 px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Procesando...</>
              ) : "Reasignar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
