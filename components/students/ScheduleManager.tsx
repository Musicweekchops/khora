"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { DAY_NAMES, generateClassesForSchedule, deleteFutureClasses, rescheduleFutureClasses } from "@/lib/schedule"
import { formatTime } from "@/lib/utils"

interface Schedule {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  modalidad: string
  is_active: boolean
  start_date: string
}

interface Props {
  studentId: string
  teacherId: string
}

export default function ScheduleManager({ studentId, teacherId }: Props) {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [message, setMessage] = useState("")

  const [form, setForm] = useState({
    day_of_week: 1,
    start_time: "14:00",
    end_time: "15:00",
    modalidad: "presencial",
    start_date: new Date().toISOString().split("T")[0],
  })

  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    day_of_week: 1,
    start_time: "14:00",
    end_time: "15:00",
    modalidad: "presencial",
    start_date: new Date().toISOString().split("T")[0],
  })

  useEffect(() => { loadSchedules() }, [studentId])

  async function loadSchedules() {
    const { data } = await supabase
      .from("Schedule")
      .select("*")
      .eq("student_id", studentId)
      .order("day_of_week")

    if (data) setSchedules(data)
    setLoading(false)
  }

  async function handleCreate() {
    if (saving) return
    setSaving(true)
    setMessage("")

    const { data, error } = await supabase
      .from("Schedule")
      .insert({
        student_id: studentId,
        teacher_id: teacherId,
        day_of_week: form.day_of_week,
        start_time: form.start_time,
        end_time: form.end_time,
        modalidad: form.modalidad,
        start_date: form.start_date,
      })
      .select()
      .maybeSingle()

    if (error) {
      setMessage("Error: " + error.message)
      setSaving(false)
      return
    }

    // Auto-generate classes for target month and next month based on start_date
    try {
      const startD = new Date(form.start_date + "T12:00")
      const r1 = await generateClassesForSchedule(
        data.id, teacherId, studentId,
        form.day_of_week, form.start_time, form.end_time, form.modalidad, startD
      )
      const nextMonth = new Date(startD.getFullYear(), startD.getMonth() + 1, 15)
      const r2 = await generateClassesForSchedule(
        data.id, teacherId, studentId,
        form.day_of_week, form.start_time, form.end_time, form.modalidad, nextMonth
      )
      setMessage(`✓ Horario creado. ${r1.created + r2.created} clases generadas a partir del inicio establecido.`)
    } catch (e: any) {
      setMessage("Horario creado pero error generando clases: " + e.message)
    }

    setShowForm(false)
    setSaving(false)
    setForm({ day_of_week: 1, start_time: "14:00", end_time: "15:00", modalidad: "presencial", start_date: new Date().toISOString().split("T")[0] })
    loadSchedules()
  }

  async function handleGenerate(schedule: Schedule) {
    setGenerating(schedule.id)
    setMessage("")

    try {
      const now = new Date()
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15)
      const r = await generateClassesForSchedule(
        schedule.id, teacherId, studentId,
        schedule.day_of_week, schedule.start_time, schedule.end_time, schedule.modalidad, nextMonth
      )
      setMessage(`✓ ${r.created} clases generadas para ${nextMonth.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}. ${r.skipped} ya existían.`)
    } catch (e: any) {
      setMessage("Error: " + e.message)
    }

    setGenerating(null)
  }

  async function handleDelete(scheduleId: string) {
    if (!confirm("¿Eliminar este horario y todas sus clases futuras pendientes?")) return

    const deleted = await deleteFutureClasses(scheduleId)
    await supabase.from("Schedule").delete().eq("id", scheduleId)
    setMessage(`Horario eliminado. ${deleted} clases futuras removidas.`)
    loadSchedules()
  }

  async function handleToggle(schedule: Schedule) {
    await supabase.from("Schedule").update({ is_active: !schedule.is_active }).eq("id", schedule.id)
    loadSchedules()
  }

  function startEdit(schedule: Schedule) {
    setEditingScheduleId(schedule.id)
    setEditForm({
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time.slice(0, 5),
      end_time: schedule.end_time.slice(0, 5),
      modalidad: schedule.modalidad,
      start_date: schedule.start_date ? schedule.start_date.split("T")[0] : new Date().toISOString().split("T")[0],
    })
  }

  async function handleUpdate(scheduleId: string) {
    setSaving(true)
    setMessage("")

    // 1. Update Schedule in Supabase
    const { error: updateError } = await supabase
      .from("Schedule")
      .update({
        day_of_week: editForm.day_of_week,
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        modalidad: editForm.modalidad,
        start_date: editForm.start_date,
      })
      .eq("id", scheduleId)

    if (updateError) {
      setMessage("Error al actualizar horario: " + updateError.message)
      setSaving(false)
      return
    }

    // 2. Reschedule future classes
    try {
      const res = await rescheduleFutureClasses(
        scheduleId,
        teacherId,
        studentId,
        editForm.day_of_week,
        editForm.start_time,
        editForm.end_time,
        editForm.modalidad
      )
      setMessage(`✓ Horario actualizado. Se eliminaron ${res.deleted} clases antiguas y se generaron ${res.created} nuevas clases en bloque.`)
    } catch (e: any) {
      setMessage("Horario actualizado pero error al reprogramar clases: " + e.message)
    }

    setEditingScheduleId(null)
    setSaving(false)
    loadSchedules()
  }

  if (loading) return <div className="kh-skeleton h-32" />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" />
            <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
          </svg>
          Horarios Recurrentes
        </h3>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="kh-btn-primary text-xs py-1.5 px-3">
            + Agregar
          </button>
        )}
      </div>

      {/* Message */}
      {message && (
        <div className={`text-xs font-medium p-3 rounded-lg ${message.startsWith("✓") ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="kh-card p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="kh-label">Día de la semana</label>
              <select value={form.day_of_week} onChange={e => setForm(p => ({ ...p, day_of_week: Number(e.target.value) }))} className="kh-input">
                {DAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
              </select>
            </div>
            <div>
              <label className="kh-label">Modalidad</label>
              <select value={form.modalidad} onChange={e => setForm(p => ({ ...p, modalidad: e.target.value }))} className="kh-input">
                <option value="presencial">Presencial</option>
                <option value="online">Virtual</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="kh-label">Hora inicio</label>
              <input type="time" value={form.start_time} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} className="kh-input" />
            </div>
            <div>
              <label className="kh-label">Hora fin</label>
              <input type="time" value={form.end_time} onChange={e => setForm(p => ({ ...p, end_time: e.target.value }))} className="kh-input" />
            </div>
          </div>
          <div>
            <label className="kh-label">Fecha de inicio</label>
            <input type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} className="kh-input" />
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="kh-btn-secondary text-xs py-1.5">Cancelar</button>
            <button onClick={handleCreate} disabled={saving} className="kh-btn-primary text-xs py-1.5">
              {saving ? "Creando..." : "Crear y generar clases"}
            </button>
          </div>
        </div>
      )}

      {/* Existing schedules */}
      {schedules.length === 0 && !showForm ? (
        <div className="text-center py-8">
          <p className="text-sm text-neutral-400">Sin horario recurrente definido</p>
          <p className="text-xs text-neutral-300 mt-1">Agrega uno para generar clases automáticamente cada mes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map(s => {
            const isEditing = editingScheduleId === s.id
            
            if (isEditing) {
              return (
                <div key={s.id} className="kh-card p-5 space-y-4 border-2 border-violet-500/50 bg-violet-50/10">
                  <h4 className="text-xs font-bold text-violet-600 uppercase tracking-wider">Editar Horario Recurrente</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="kh-label">Día de la semana</label>
                      <select value={editForm.day_of_week} onChange={e => setEditForm(p => ({ ...p, day_of_week: Number(e.target.value) }))} className="kh-input">
                        {DAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="kh-label">Modalidad</label>
                      <select value={editForm.modalidad} onChange={e => setEditForm(p => ({ ...p, modalidad: e.target.value }))} className="kh-input">
                        <option value="presencial">Presencial</option>
                        <option value="online">Virtual</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="kh-label">Hora inicio</label>
                      <input type="time" value={editForm.start_time} onChange={e => setEditForm(p => ({ ...p, start_time: e.target.value }))} className="kh-input" />
                    </div>
                    <div>
                      <label className="kh-label">Hora fin</label>
                      <input type="time" value={editForm.end_time} onChange={e => setEditForm(p => ({ ...p, end_time: e.target.value }))} className="kh-input" />
                    </div>
                  </div>
                  <div>
                    <label className="kh-label">Fecha de inicio</label>
                    <input type="date" value={editForm.start_date} onChange={e => setEditForm(p => ({ ...p, start_date: e.target.value }))} className="kh-input" />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setEditingScheduleId(null)} className="kh-btn-secondary text-xs py-1.5">Cancelar</button>
                    <button onClick={() => handleUpdate(s.id)} disabled={saving} className="kh-btn-primary text-xs py-1.5 bg-violet-600 hover:bg-violet-700">
                      {saving ? "Guardando..." : "Guardar y Reprogramar"}
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={s.id} className={`kh-card p-4 flex items-center gap-4 ${!s.is_active ? "opacity-50" : ""}`}>
                {/* Day badge */}
                <div className="w-14 h-14 rounded-xl bg-neutral-100 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase">{DAY_NAMES[s.day_of_week].slice(0, 3)}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-500 mt-0.5">
                    <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" />
                    <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
                  </svg>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900">
                    Cada {DAY_NAMES[s.day_of_week]}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {formatTime(s.start_time)} – {formatTime(s.end_time)} · {s.modalidad === "online" ? "Virtual" : "Presencial"}
                    {s.start_date && ` · Inicia el ${new Date(s.start_date + "T12:00").toLocaleDateString("es-CL")}`}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleGenerate(s)}
                    disabled={generating === s.id}
                    className="kh-btn-secondary text-[11px] py-1 px-2.5"
                    title="Generar clases del próximo mes"
                  >
                    {generating === s.id ? "..." : "📅 Generar mes"}
                  </button>
                  <button
                    onClick={() => startEdit(s)}
                    className="kh-btn-secondary text-[11px] py-1 px-2"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button onClick={() => handleToggle(s)} className="kh-btn-secondary text-[11px] py-1 px-2" title={s.is_active ? "Pausar" : "Activar"}>
                    {s.is_active ? "⏸" : "▶"}
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="kh-btn-secondary text-[11px] py-1 px-2 text-red-500 hover:text-red-700" title="Eliminar">
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
