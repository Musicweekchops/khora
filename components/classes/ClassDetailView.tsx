"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatTime } from "@/lib/utils"
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  User, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Save, 
  StickyNote, 
  ClipboardList,
  Library,
  ExternalLink,
  ChevronLeft
} from "lucide-react"

interface ClassData {
  id: string; date: string; start_time: string; end_time: string
  status: string; modalidad: string; duration: number
  student_name: string; student_id: string | null; teacher_id: string
}
interface Note { 
  id: string; content: string; created_at: string; content_id?: string | null;
  LibraryContent?: { title: string; url: string; type: string } | null
}
interface Task { 
  id: string; title: string; description: string | null; completed: boolean;
  content_id?: string | null; created_at: string;
  LibraryContent?: { title: string; url: string; type: string } | null
}
interface StudentOption { id: string; name: string }
interface LibraryItem { id: string; title: string; category: string }

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
  const [newNote, setNewNote] = useState({ content: "", content_id: "" })
  const [newTask, setNewTask] = useState({ title: "", description: "", content_id: "" })
  const [library, setLibrary] = useState<LibraryItem[]>([])
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

    const { data: n } = await supabase
      .from("ClassNote")
      .select("*, LibraryContent(title, url, type)")
      .eq("class_id", classId)
      .order("created_at", { ascending: false })
    if (n) setNotes(n as any)

    const { data: t } = await supabase
      .from("Task")
      .select("*, LibraryContent(title, url, type)")
      .eq("class_id", classId)
      .order("created_at", { ascending: false })
    if (t) setTasks(t as any)

    // Load entire library for selection
    const { data: lib } = await supabase
      .from("LibraryContent")
      .select("id, title, category")
      .eq("teacher_id", classData!.teacher_id)
      .order("category")
    if (lib) setLibrary(lib)

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
    if (!newNote.content.trim()) return
    setSaving(true)
    await supabase.from("ClassNote").insert({ 
      class_id: classId, 
      content: newNote.content.trim(),
      content_id: newNote.content_id || null
    })
    setNewNote({ content: "", content_id: "" })
    await loadAll()
    setSaving(false)
  }

  async function addTask() {
    if (!newTask.title.trim()) return
    setSaving(true)
    await supabase.from("Task").insert({
      class_id: classId, 
      student_id: cls?.student_id ?? null,
      teacher_id: cls?.teacher_id ?? null,
      title: newTask.title.trim(), 
      description: newTask.description.trim() || null,
      content_id: newTask.content_id || null
    })
    setNewTask({ title: "", description: "", content_id: "" })
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

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    SCHEDULED: { label: "Programada", color: "bg-sky-50 text-sky-700 border-sky-100", icon: Calendar },
    COMPLETED: { label: "Completada", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelada", color: "bg-red-50 text-red-600 border-red-100", icon: Trash2 },
  }
  const sc = statusConfig[cls.status] ?? statusConfig.SCHEDULED

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-[40px] border border-neutral-100 p-8 shadow-sm">
        {/* Breadcrumb */}
        <div className="flex items-center gap-3 text-sm mb-8">
          <Link href="/dashboard/clases" className="p-2 hover:bg-neutral-50 rounded-xl transition-colors text-neutral-400 hover:text-violet-600">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2 text-neutral-400 font-medium">
            <span className="opacity-40">Clases</span>
            <span className="text-neutral-200">/</span>
            <span className="text-neutral-900 font-bold">
              {new Date(cls.date + "T12:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
            </span>
          </div>
          {cls.student_id && (
            <>
              <span className="text-neutral-200">·</span>
              <Link href={`/dashboard/alumnos/detalles?id=${cls.student_id}`} className="text-violet-600 font-bold hover:underline flex items-center gap-1.5">
                <User className="w-4 h-4 text-violet-400" />
                {cls.student_name}
              </Link>
            </>
          )}
        </div>

        {editing ? (
          /* ── EDIT MODE ── */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
                  <Edit3 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900">Editar Clase</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="px-5 py-2.5 bg-neutral-100 text-neutral-600 rounded-2xl text-xs font-bold hover:bg-neutral-200 transition-colors">Cancelar</button>
                <button onClick={saveEdit} disabled={savingEdit} className="px-6 py-2.5 bg-neutral-900 text-white rounded-2xl text-xs font-bold hover:bg-violet-600 transition-colors disabled:opacity-50 flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {savingEdit ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Fecha de Clase</label>
                <input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Hora Inicio</label>
                <input type="time" value={editForm.start_time} onChange={e => setEditForm(p => ({ ...p, start_time: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Hora Fin</label>
                <input type="time" value={editForm.end_time} onChange={e => setEditForm(p => ({ ...p, end_time: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Asignar Alumno</label>
                <select value={editForm.student_id} onChange={e => setEditForm(p => ({ ...p, student_id: e.target.value }))} className="field">
                  <option value="">Sin asignar</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Modalidad</label>
                <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 rounded-[20px]">
                  {(["online", "presencial"] as const).map(m => (
                    <button key={m} type="button" onClick={() => setEditForm(p => ({ ...p, modalidad: m }))}
                      className={`py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${editForm.modalidad === m ? "bg-white text-violet-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"}`}>
                      {m === "online" ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Estado de Clase</label>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-neutral-100 rounded-[20px]">
                  {(["SCHEDULED", "COMPLETED", "CANCELLED"] as const).map(s => (
                    <button key={s} type="button" onClick={() => setEditForm(p => ({ ...p, status: s }))}
                      className={`py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                        editForm.status === s ? statusConfig[s].color + " shadow-sm font-black" : "text-neutral-400 hover:text-neutral-600"
                      }`}>
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="pt-6 border-t border-neutral-100 flex justify-between items-center">
              <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-tight">Zona de riesgo</p>
              <button onClick={deleteClass} className="px-4 py-2 text-xs text-red-400 font-bold hover:bg-red-50 rounded-xl transition-all flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Eliminar Clase
              </button>
            </div>
          </div>
        ) : (
          /* ── VIEW MODE ── */
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-4xl font-black text-neutral-900 tracking-tight capitalize">
                  {new Date(cls.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1.5 text-neutral-500 font-bold">
                    <Clock className="w-4 h-4 text-neutral-300" />
                    <span>{formatTime(cls.start_time)} – {formatTime(cls.end_time)}</span>
                  </div>
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-200" />
                  <div className="text-neutral-500 font-bold">{cls.duration} min</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest border ${sc.color}`}>
                  <sc.icon className="w-4 h-4" />
                  {sc.label}
                </div>
                <button onClick={() => setEditing(true)}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-violet-600 transition-all flex items-center gap-2 shadow-lg shadow-neutral-900/10">
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <InfoBlock label="Alumno" icon={<User className="w-4 h-4 text-blue-400" />}>
                {cls.student_id ? (
                  <Link href={`/dashboard/alumnos/detalles?id=${cls.student_id}`} className="text-violet-600 font-black hover:underline">{cls.student_name}</Link>
                ) : (
                  <span className="text-neutral-400 font-bold">Sin asignar</span>
                )}
              </InfoBlock>
              <InfoBlock label="Horario" icon={<Clock className="w-4 h-4 text-amber-400" />}>
                <span className="font-black text-neutral-900">{formatTime(cls.start_time)} – {formatTime(cls.end_time)}</span>
              </InfoBlock>
              <InfoBlock label="Duración" icon={<Calendar className="w-4 h-4 text-emerald-400" />}>
                <span className="font-black text-neutral-900">{cls.duration} min</span>
              </InfoBlock>
              <InfoBlock label="Modalidad" icon={<MapPin className="w-4 h-4 text-rose-400" />}>
                <span className="font-black text-neutral-900 flex items-center gap-2">
                  {cls.modalidad === "online" ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                  <span className="capitalize">{cls.modalidad}</span>
                </span>
              </InfoBlock>
            </div>
          </div>
        )}
      </div>

      {/* CONTENT: Notes & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* NOTES */}
        <div className="bg-white rounded-[40px] border border-neutral-100 p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl text-neutral-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
                <StickyNote className="w-5 h-5" />
              </div>
              Notas de la Clase
            </h3>
          </div>

          <div className="bg-neutral-50 rounded-[32px] p-6 space-y-4 border border-neutral-100">
            <textarea 
              value={newNote.content} 
              onChange={e => setNewNote(p => ({...p, content: e.target.value}))}
              placeholder="Observaciones, progreso, temas cubiertos…" 
              rows={4}
              className="w-full bg-transparent border-0 outline-none text-sm font-medium resize-none text-neutral-700 placeholder:text-neutral-300" 
            />
            
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200/50">
              <div className="flex items-center gap-2">
                <select 
                  value={newNote.content_id}
                  onChange={e => setNewNote(p => ({...p, content_id: e.target.value}))}
                  className="bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-500 outline-none hover:border-violet-300 transition-colors"
                >
                  <option value="">📎 Sin material</option>
                  {library.map(item => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={addNote} 
                disabled={!newNote.content.trim() || saving}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-600 transition-all disabled:opacity-30 shadow-lg shadow-neutral-900/10 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saving ? "..." : "Guardar Nota"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {notes.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50/50 rounded-[32px] border border-dashed border-neutral-200">
                <p className="text-sm text-neutral-400 font-bold italic">Sin notas todavía</p>
              </div>
            ) : notes.map(n => (
              <div key={n.id} className="bg-white border border-neutral-100 rounded-3xl p-6 group relative hover:shadow-md transition-all">
                <p className="text-sm text-neutral-800 font-medium whitespace-pre-wrap leading-relaxed">{n.content}</p>
                
                {n.LibraryContent && (
                  <div className="mt-4 p-3 bg-violet-50 rounded-2xl flex items-center justify-between group/link">
                    <div className="flex items-center gap-2">
                      <Library className="w-4 h-4 text-violet-400" />
                      <span className="text-xs font-black text-violet-700">{n.LibraryContent.title}</span>
                    </div>
                    <a href={n.LibraryContent.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:scale-110 transition-transform">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-50">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                    {new Date(n.created_at).toLocaleString("es-CL", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <button onClick={() => deleteNote(n.id)} className="text-[10px] text-red-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 font-black uppercase tracking-widest">Eliminar</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TASKS */}
        <div className="bg-white rounded-[40px] border border-neutral-100 p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl text-neutral-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <ClipboardList className="w-5 h-5" />
              </div>
              Tareas Asignadas
            </h3>
          </div>

          <div className="bg-neutral-50 rounded-[32px] p-6 space-y-4 border border-neutral-100">
            <input 
              type="text" 
              value={newTask.title} 
              onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
              placeholder="Título de la tarea..."
              className="w-full bg-transparent border-0 outline-none text-base font-black text-neutral-900 placeholder:text-neutral-300" 
            />
            <textarea 
              value={newTask.description} 
              onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
              placeholder="Detalles opcionales…" 
              rows={2}
              className="w-full bg-transparent border-0 outline-none text-sm font-medium resize-none text-neutral-600 placeholder:text-neutral-300" 
            />
            
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200/50">
              <div className="flex items-center gap-2">
                <select 
                  value={newTask.content_id}
                  onChange={e => setNewTask(p => ({...p, content_id: e.target.value}))}
                  className="bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs font-bold text-neutral-500 outline-none hover:border-emerald-300 transition-colors"
                >
                  <option value="">📎 Adjuntar material</option>
                  {library.map(item => (
                    <option key={item.id} value={item.id}>{item.title}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={addTask} 
                disabled={!newTask.title.trim() || saving}
                className="px-6 py-2.5 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-30 shadow-lg shadow-neutral-900/10 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {saving ? "..." : "Asignar Tarea"}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50/50 rounded-[32px] border border-dashed border-neutral-200">
                <p className="text-sm text-neutral-400 font-bold italic">Sin tareas asignadas</p>
              </div>
            ) : tasks.map(t => (
              <div key={t.id} className="flex flex-col p-5 bg-white border border-neutral-100 rounded-3xl hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  <button onClick={() => toggleTask(t.id, t.completed)}
                    className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      t.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-neutral-200 hover:border-violet-400"
                    }`}>
                    {t.completed && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black text-sm tracking-tight ${t.completed ? "line-through text-neutral-300" : "text-neutral-900"}`}>{t.title}</p>
                    {t.description && <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">{t.description}</p>}
                  </div>
                  <button onClick={() => deleteTask(t.id)} className="text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {t.LibraryContent && (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-[20px] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Library className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{t.LibraryContent.title}</span>
                    </div>
                    <a href={t.LibraryContent.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:scale-110 transition-transform">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
                
                <div className="mt-4 pt-3 border-t border-neutral-50 flex justify-between items-center">
                  <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                    Asignada el {new Date(t.created_at).toLocaleDateString("es-CL")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .field { width: 100%; padding: 0.875rem 1.25rem; border: 1px solid #f3f4f6; background: #fff; border-radius: 1.25rem; outline: none; font-weight: 800; font-size: 0.875rem; color: #171717; transition: all 0.2s; }
        .field:focus { border-color: #8b5cf6; background: #fff; box-shadow: 0 0 0 4px rgba(139,92,246,0.05); }
      `}</style>
    </div>
  )
}

function InfoBlock({ label, icon, children }: { label: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-50/50 rounded-[32px] p-6 border border-neutral-100/50 hover:bg-white hover:shadow-sm transition-all">
      <div className="flex items-center gap-2 mb-2">
        <div className="opacity-60">{icon}</div>
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
      </div>
      <div className="text-base font-black text-neutral-900">{children}</div>
    </div>
  )
}

