"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatTime } from "@/lib/utils"

interface ClassData {
  id: string; date: string; start_time: string; end_time: string
  status: string; modalidad: string; duration: number
  student_name: string; student_id: string | null; teacher_id: string
}
interface Note { id: string; content: string; created_at: string }
interface Task { id: string; title: string; description: string; completed: boolean }
interface StudentOption { id: string; name: string }

export default function ClassDetailView({ classId }: { classId: string }) {
  const router = useRouter()
  const { profile } = useAuth()
  const [cls, setCls] = useState<ClassData | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [loading, setLoading] = useState(true)

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ date: "", start_time: "", end_time: "", student_id: "", modalidad: "", status: "" })
  const [savingEdit, setSavingEdit] = useState(false)

  // Notes & tasks
  const [newNote, setNewNote] = useState("")
  const [newTask, setNewTask] = useState({ title: "", description: "" })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadAll() }, [classId])

  async function loadAll() {
    setLoading(true)

    const { data: c } = await supabase
      .from("Class")
      .select("id, date, start_time, end_time, status, modalidad, duration, student_id, teacher_id, StudentProfile ( User ( name ) )")
      .eq("id", classId).single()

    if (c) {
      const classData: ClassData = {
        id: c.id, date: c.date, start_time: c.start_time, end_time: c.end_time,
        status: c.status, modalidad: c.modalidad, duration: c.duration ?? 60,
        student_name: (c as any).StudentProfile?.User?.name ?? "Sin asignar",
        student_id: c.student_id, teacher_id: c.teacher_id,
      }
      setCls(classData)
      setEditForm({
        date: classData.date, start_time: classData.start_time.slice(0, 5),
        end_time: classData.end_time.slice(0, 5), student_id: classData.student_id ?? "",
        modalidad: classData.modalidad, status: classData.status,
      })

      // Load students for this teacher
      const { data: st } = await supabase
        .from("StudentProfile")
        .select("id, User ( name )")
        .eq("teacher_id", classData.teacher_id)
      if (st) setStudents(st.map((s: any) => ({ id: s.id, name: s.User?.name ?? "—" })))
    }

    const { data: n } = await supabase.from("ClassNote").select("*").eq("class_id", classId).order("created_at", { ascending: false })
    if (n) setNotes(n)

    const { data: t } = await supabase.from("Task").select("*").eq("class_id", classId).order("created_at", { ascending: false })
    if (t) setTasks(t)

    setLoading(false)
  }

  async function saveEdit() {
    setSavingEdit(true)
    const { error } = await supabase.from("Class").update({
      date: editForm.date,
      start_time: editForm.start_time,
      end_time: editForm.end_time,
      student_id: editForm.student_id || null,
      modalidad: editForm.modalidad,
      status: editForm.status,
    }).eq("id", classId)

    if (!error) {
      setEditing(false)
      await loadAll()
    }
    setSavingEdit(false)
  }

  async function deleteClass() {
    if (!confirm("¿Seguro que deseas eliminar esta clase y todas sus notas y tareas?")) return
    await supabase.from("Class").delete().eq("id", classId)
    router.push("/dashboard/clases")
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
      class_id: classId, student_id: cls?.student_id ?? null,
      teacher_id: cls?.teacher_id ?? null,
      title: newTask.title.trim(), description: newTask.description.trim() || null,
    })
    setNewTask({ title: "", description: "" })
    await loadAll()
    setSaving(false)
  }

  async function toggleTask(taskId: string, completed: boolean) {
    await supabase.from("Task").update({ completed: !completed }).eq("id", taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t))
  }

  async function deleteNote(noteId: string) {
    await supabase.from("ClassNote").delete().eq("id", noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  async function deleteTask(taskId: string) {
    await supabase.from("Task").delete().eq("id", taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-3xl" />)}</div>
  if (!cls) return <p className="text-neutral-500">Clase no encontrada</p>

  const statusConfig: Record<string, { label: string; color: string }> = {
    SCHEDULED: { label: "Programada", color: "bg-sky-100 text-sky-700" },
    COMPLETED: { label: "Completada", color: "bg-emerald-100 text-emerald-700" },
    CANCELLED: { label: "Cancelada", color: "bg-red-100 text-red-600" },
  }
  const sc = statusConfig[cls.status] ?? statusConfig.SCHEDULED

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <Link href="/dashboard/clases" className="text-neutral-400 hover:text-violet-600 font-medium transition-colors">Clases</Link>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-900 font-bold">
            {new Date(cls.date + "T12:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
          </span>
          {cls.student_id && (
            <>
              <span className="text-neutral-300">·</span>
              <Link href={`/dashboard/alumnos/detalles?id=${cls.student_id}`} className="text-violet-600 font-bold hover:underline">
                {cls.student_name}
              </Link>
            </>
          )}
        </div>

        {editing ? (
          /* ── EDIT MODE ── */
          <div className="space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-neutral-900">Editar Clase</h2>
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="px-4 py-2 bg-neutral-100 text-neutral-600 rounded-xl text-xs font-bold">Cancelar</button>
                <button onClick={saveEdit} disabled={savingEdit} className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-violet-600 transition-colors disabled:opacity-50">
                  {savingEdit ? "Guardando..." : "✓ Guardar"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Fecha</label>
                <input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Inicio</label>
                <input type="time" value={editForm.start_time} onChange={e => setEditForm(p => ({ ...p, start_time: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Fin</label>
                <input type="time" value={editForm.end_time} onChange={e => setEditForm(p => ({ ...p, end_time: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Alumno</label>
                <select value={editForm.student_id} onChange={e => setEditForm(p => ({ ...p, student_id: e.target.value }))} className="field">
                  <option value="">Sin asignar</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Modalidad</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
                  {(["online", "presencial"] as const).map(m => (
                    <button key={m} type="button" onClick={() => setEditForm(p => ({ ...p, modalidad: m }))}
                      className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${editForm.modalidad === m ? "bg-white text-violet-600 shadow-sm" : "text-neutral-400"}`}>
                      {m === "online" ? "📹 Virtual" : "🏠 Presencial"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Estado</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-neutral-100 rounded-xl">
                  {(["SCHEDULED", "COMPLETED", "CANCELLED"] as const).map(s => (
                    <button key={s} type="button" onClick={() => setEditForm(p => ({ ...p, status: s }))}
                      className={`py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        editForm.status === s ? statusConfig[s].color + " shadow-sm" : "text-neutral-400"
                      }`}>
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="pt-4 border-t border-neutral-100">
              <button onClick={deleteClass} className="text-xs text-red-400 font-bold hover:text-red-600 transition-colors">
                🗑️ Eliminar esta clase permanentemente
              </button>
            </div>
          </div>
        ) : (
          /* ── VIEW MODE ── */
          <>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
                  {new Date(cls.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                </h1>
                <p className="text-neutral-500 font-medium mt-1">
                  {formatTime(cls.start_time)} – {formatTime(cls.end_time)} · {cls.duration} min
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${sc.color}`}>{sc.label}</span>
                <button onClick={() => setEditing(true)}
                  className="px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-bold hover:bg-neutral-200 transition-colors">
                  ✏️ Editar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <InfoBlock label="Alumno" icon="👤">
                {cls.student_id ? (
                  <Link href={`/dashboard/alumnos/detalles?id=${cls.student_id}`} className="text-violet-600 font-black hover:underline">{cls.student_name}</Link>
                ) : (
                  <span className="text-neutral-400 font-bold">Sin asignar</span>
                )}
              </InfoBlock>
              <InfoBlock label="Horario" icon="⏰">
                <span className="font-black text-neutral-900">{formatTime(cls.start_time)} – {formatTime(cls.end_time)}</span>
              </InfoBlock>
              <InfoBlock label="Duración" icon="⏱️">
                <span className="font-black text-neutral-900">{cls.duration} min</span>
              </InfoBlock>
              <InfoBlock label="Modalidad" icon="🎓">
                <span className="font-black text-neutral-900">{cls.modalidad === "online" ? "📹 Virtual" : "🏠 Presencial"}</span>
              </InfoBlock>
            </div>
          </>
        )}
      </div>

      {/* CONTENT: Notes & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NOTES */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 space-y-4">
          <h3 className="font-black text-neutral-900 flex items-center gap-2">
            <span className="w-2 h-5 bg-violet-500 rounded-full" /> Notas de la Clase
          </h3>

          <div className="border border-neutral-100 rounded-2xl p-4">
            <textarea value={newNote} onChange={e => setNewNote(e.target.value)}
              placeholder="Observaciones, progreso, temas cubiertos…" rows={3}
              className="w-full border-0 outline-none text-sm font-medium resize-none text-neutral-700 placeholder:text-neutral-300" />
            <div className="flex justify-end">
              <button onClick={addNote} disabled={!newNote.trim() || saving}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-violet-600 transition-colors disabled:opacity-30">
                {saving ? "..." : "💾 Guardar"}
              </button>
            </div>
          </div>

          {notes.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">Sin notas todavía</p>
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

          <div className="border border-neutral-100 rounded-2xl p-4 space-y-3">
            <input type="text" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
              placeholder="Título (ej: Practicar paradiddles a 120 BPM)"
              className="w-full border-0 outline-none text-sm font-bold text-neutral-900 placeholder:text-neutral-300" />
            <textarea value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
              placeholder="Descripción opcional…" rows={2}
              className="w-full border-0 outline-none text-sm font-medium resize-none text-neutral-600 placeholder:text-neutral-300" />
            <div className="flex justify-end">
              <button onClick={addTask} disabled={!newTask.title.trim() || saving}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors disabled:opacity-30">
                {saving ? "..." : "📝 Asignar"}
              </button>
            </div>
          </div>

          {tasks.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">Sin tareas asignadas</p>
          ) : tasks.map(t => (
            <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group">
              <button onClick={() => toggleTask(t.id, t.completed)}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  t.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-neutral-300 hover:border-violet-400"
                }`}>
                {t.completed && <span className="text-xs">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${t.completed ? "line-through text-neutral-400" : "text-neutral-900"}`}>{t.title}</p>
                {t.description && <p className="text-xs text-neutral-500 mt-0.5">{t.description}</p>}
              </div>
              <button onClick={() => deleteTask(t.id)} className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 font-bold flex-shrink-0">✕</button>
            </div>
          ))}
        </div>
      </div>

      <style jsx global>{`
        .field { width: 100%; padding: 0.75rem 1rem; border: 1px solid #e5e7eb; background: white; border-radius: 0.75rem; outline: none; font-weight: 700; font-size: 0.875rem; color: #171717; transition: all 0.2s; }
        .field:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139,92,246,0.1); }
      `}</style>
    </div>
  )
}

function InfoBlock({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-50 rounded-2xl p-4">
      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-1">{icon} {label}</p>
      <div className="text-lg mt-1">{children}</div>
    </div>
  )
}
