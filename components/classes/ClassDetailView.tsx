"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatTime } from "@/lib/utils"

interface ClassData {
  id: string; date: string; start_time: string; end_time: string
  status: string; modalidad: string; duration: number
  student_name: string; student_id: string | null
}
interface Note { id: string; content: string; created_at: string }
interface Task { id: string; title: string; description: string; completed: boolean }

export default function ClassDetailView({ classId }: { classId: string }) {
  const [cls, setCls] = useState<ClassData | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState("")
  const [newTask, setNewTask] = useState({ title: "", description: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [classId])

  async function loadAll() {
    setLoading(true)

    const { data: c } = await supabase
      .from("Class")
      .select("id, date, start_time, end_time, status, modalidad, duration, student_id, StudentProfile ( User ( name ) )")
      .eq("id", classId).single()

    if (c) {
      setCls({
        id: c.id, date: c.date, start_time: c.start_time, end_time: c.end_time,
        status: c.status, modalidad: c.modalidad, duration: c.duration ?? 60,
        student_name: (c as any).StudentProfile?.User?.name ?? "Sin asignar",
        student_id: c.student_id,
      })
    }

    const { data: n } = await supabase.from("ClassNote").select("*").eq("class_id", classId).order("created_at", { ascending: false })
    if (n) setNotes(n)

    const { data: t } = await supabase.from("Task").select("*").eq("class_id", classId).order("created_at", { ascending: false })
    if (t) setTasks(t)

    setLoading(false)
  }

  async function addNote() {
    if (!newNote.trim()) return
    setSaving(true)
    await supabase.from("ClassNote").insert({ class_id: classId, content: newNote.trim() })
    setNewNote("")
    await loadAll()
    setSaving(false)
  }

  async function addTask() {
    if (!newTask.title.trim()) return
    setSaving(true)
    await supabase.from("Task").insert({
      class_id: classId,
      student_id: cls?.student_id ?? null,
      title: newTask.title.trim(),
      description: newTask.description.trim() || null,
    })
    setNewTask({ title: "", description: "" })
    await loadAll()
    setSaving(false)
  }

  async function toggleTask(taskId: string, completed: boolean) {
    await supabase.from("Task").update({ completed: !completed }).eq("id", taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t))
  }

  async function updateStatus(status: string) {
    await supabase.from("Class").update({ status }).eq("id", classId)
    setCls(prev => prev ? { ...prev, status } : prev)
  }

  async function deleteTask(taskId: string) {
    await supabase.from("Task").delete().eq("id", taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  async function deleteNote(noteId: string) {
    await supabase.from("ClassNote").delete().eq("id", noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  if (loading) return <div className="animate-pulse space-y-4">{[1,2].map(i => <div key={i} className="h-32 bg-white rounded-3xl" />)}</div>
  if (!cls) return <p className="text-neutral-500">Clase no encontrada</p>

  const statusConfig: Record<string, { label: string; color: string }> = {
    SCHEDULED: { label: "Programada", color: "bg-sky-100 text-sky-700" },
    COMPLETED: { label: "Completada", color: "bg-emerald-100 text-emerald-700" },
    CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-600" },
  }
  const sc = statusConfig[cls.status] ?? statusConfig.SCHEDULED

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <Link href="/dashboard/clases" className="text-sm text-violet-600 font-bold hover:underline mb-2 inline-block">← Volver a Clases</Link>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
              Clase del {new Date(cls.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
            </h1>
          </div>
          <select
            value={cls.status}
            onChange={e => updateStatus(e.target.value)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-0 outline-none cursor-pointer ${sc.color}`}
          >
            <option value="SCHEDULED">Programada</option>
            <option value="COMPLETED">Completada</option>
            <option value="CANCELLED">Cancelada</option>
          </select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-neutral-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Alumno</p>
            <p className="text-lg font-black text-neutral-900 mt-1">{cls.student_name}</p>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Horario</p>
            <p className="text-lg font-black text-neutral-900 mt-1">{formatTime(cls.start_time)} – {formatTime(cls.end_time)}</p>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Duración</p>
            <p className="text-lg font-black text-neutral-900 mt-1">{cls.duration} min</p>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-4">
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Modalidad</p>
            <p className="text-lg font-black text-neutral-900 mt-1">{cls.modalidad === "online" ? "📹 Virtual" : "🏠 Presencial"}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NOTES (Notion-style) */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 space-y-4">
          <h3 className="font-black text-neutral-900 flex items-center gap-2">
            <span className="w-2 h-5 bg-violet-500 rounded-full" /> Notas de la Clase
          </h3>

          {/* Add note */}
          <div className="border border-neutral-100 rounded-2xl p-4">
            <textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Escribe observaciones, progreso, temas cubiertos…"
              rows={3}
              className="w-full border-0 outline-none text-sm font-medium resize-none text-neutral-700 placeholder:text-neutral-300"
            />
            <div className="flex justify-end">
              <button onClick={addNote} disabled={!newNote.trim() || saving}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-violet-600 transition-colors disabled:opacity-30">
                {saving ? "..." : "💾 Guardar"}
              </button>
            </div>
          </div>

          {notes.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">Sin notas todavía. Escribe una arriba.</p>
          ) : notes.map(n => (
            <div key={n.id} className="bg-neutral-50 rounded-2xl p-4 group relative">
              <p className="text-sm text-neutral-800 font-medium whitespace-pre-wrap">{n.content}</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-neutral-400">{new Date(n.created_at).toLocaleString("es-CL")}</p>
                <button onClick={() => deleteNote(n.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 font-bold">Borrar</button>
              </div>
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 space-y-4">
          <h3 className="font-black text-neutral-900 flex items-center gap-2">
            <span className="w-2 h-5 bg-emerald-500 rounded-full" /> Tareas Asignadas
          </h3>

          {/* Add task */}
          <div className="border border-neutral-100 rounded-2xl p-4 space-y-3">
            <input
              type="text"
              value={newTask.title}
              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
              placeholder="Título de la tarea (ej: Practicar paradiddles)"
              className="w-full border-0 outline-none text-sm font-bold text-neutral-900 placeholder:text-neutral-300"
            />
            <textarea
              value={newTask.description}
              onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
              placeholder="Descripción opcional…"
              rows={2}
              className="w-full border-0 outline-none text-sm font-medium resize-none text-neutral-600 placeholder:text-neutral-300"
            />
            <div className="flex justify-end">
              <button onClick={addTask} disabled={!newTask.title.trim() || saving}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-30">
                {saving ? "..." : "📝 Asignar Tarea"}
              </button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">Sin tareas asignadas todavía.</p>
          ) : tasks.map(t => (
            <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group">
              <button
                onClick={() => toggleTask(t.id, t.completed)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  t.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-neutral-300 hover:border-violet-400"
                }`}
              >
                {t.completed && <span className="text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${t.completed ? "line-through text-neutral-400" : "text-neutral-900"}`}>{t.title}</p>
                {t.description && <p className="text-xs text-neutral-500 mt-0.5">{t.description}</p>}
              </div>
              <button onClick={() => deleteTask(t.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 font-bold flex-shrink-0">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
