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
  ChevronLeft,
  FileText,
  PlayCircle,
  BookOpen,
  Forward
} from "lucide-react"
import VideoPlayer from "@/components/ui/VideoPlayer"
import { useToast } from "@/components/ui/Toast"
import LibraryPickerModal from "@/components/ui/LibraryPickerModal"

interface ClassData {
  id: string; date: string; start_time: string; end_time: string
  status: string; modalidad: string; duration: number
  student_name: string; student_email?: string; student_id: string | null; teacher_id: string
}
interface Note { 
  id: string; content: string; created_at: string; content_id?: string | null; playlist_id?: string | null;
  LibraryContent?: { title: string; url: string; type: string } | null;
  LibraryPlaylist?: { title: string; description: string | null } | null;
}
interface Task { 
  id: string; title: string; description: string | null; completed: boolean;
  content_id?: string | null; playlist_id?: string | null; created_at: string;
  LibraryContent?: { title: string; url: string; type: string } | null;
  LibraryPlaylist?: { title: string; description: string | null } | null;
  progress?: number;
}
interface StudentOption { id: string; name: string }
interface LibraryItem { id: string; title: string; category: string; type: string; url?: string }
interface Playlist { id: string; title: string; description: string | null }

export default function ClassDetailView({ classId }: { classId: string }) {
  const router = useRouter()
  const { profile } = useAuth()
  const { toast } = useToast()
  const [cls, setCls] = useState<ClassData | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [reviewTasks, setReviewTasks] = useState<Task[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [loading, setLoading] = useState(true)

  // Edit mode
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ date: "", start_time: "", end_time: "", student_id: "", modalidad: "", status: "" })
  const [savingEdit, setSavingEdit] = useState(false)

  // Notes & tasks
  const [newNote, setNewNote] = useState({ content: "", attached_id: "", attached_title: "", attached_type: "" })
  const [newTask, setNewTask] = useState({ title: "", description: "", attached_id: "", attached_title: "", attached_type: "", progress: 0 })
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null)
  const [editingTaskForm, setEditingTaskForm] = useState({ title: "", description: "", attached_id: "", attached_title: "", attached_type: "", progress: 0 })
  const [library, setLibrary] = useState<LibraryItem[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [saving, setSaving] = useState(false)
  const [modalTarget, setModalTarget] = useState<"note" | "task" | "edit_task" | null>(null)

  useEffect(() => {
    loadAll()

    // ── REAL-TIME SUBSCRIPTION ──
    // Subscribe to changes in notes and tasks for this specific class
    const channel = supabase
      .channel(`class-updates-${classId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ClassNote', filter: `class_id=eq.${classId}` },
        () => {
          console.log('[Realtime] Note change detected, reloading...')
          loadNotesAndTasks() 
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Task', filter: `class_id=eq.${classId}` },
        () => {
          console.log('[Realtime] Task change detected, reloading...')
          loadNotesAndTasks()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [classId])

  async function loadAll() {
    setLoading(true)
    try {
      const { data: c } = await supabase
        .from("Class")
        .select("id, date, start_time, end_time, status, modalidad, duration, student_id, teacher_id, StudentProfile ( User ( name, email ) )")
        .eq("id", classId).maybeSingle()

      if (c) {
        const classData: ClassData = {
          id: c.id, date: c.date, start_time: c.start_time, end_time: c.end_time,
          status: c.status, modalidad: c.modalidad, duration: c.duration ?? 60,
          student_name: (c as any).StudentProfile?.User?.name ?? "Sin asignar",
          student_email: (c as any).StudentProfile?.User?.email,
          student_id: c.student_id, teacher_id: c.teacher_id,
        }
        setCls(classData)
        setEditForm({
          date: classData.date, start_time: classData.start_time.slice(0, 5),
          end_time: classData.end_time.slice(0, 5), student_id: classData.student_id ?? "",
          modalidad: classData.modalidad, status: classData.status,
        })

        const { data: st } = await supabase
          .from("StudentProfile")
          .select("id, User ( name )")
          .eq("teacher_id", classData.teacher_id)
        if (st) setStudents(st.map((s: any) => ({ id: s.id, name: s.User?.name ?? "—" })))

        const { data: lib } = await supabase
          .from("LibraryContent")
          .select("id, title, category, type, url")
          .eq("teacher_id", classData.teacher_id)
          .order("category")
          .order("category")
        if (lib) setLibrary(lib)

        const { data: pl } = await supabase
          .from("LibraryPlaylist")
          .select("id, title, description")
          .eq("teacher_id", classData.teacher_id)
          .order("title")
        if (pl) setPlaylists(pl)

        await loadNotesAndTasks(classData)
      } else {
        await loadNotesAndTasks(null)
      }
    } finally {
      setLoading(false)
    }
  }

  async function loadNotesAndTasks(currentCls?: ClassData | null) {
    let activeCls = currentCls || cls

    // Garantizar que activeCls y student_id estén cargados para evitar condiciones de carrera en el estado de React
    if (!activeCls || !activeCls.student_id || !activeCls.date || !activeCls.start_time) {
      const { data: c } = await supabase
        .from("Class")
        .select("student_id, teacher_id, date, start_time")
        .eq("id", classId)
        .maybeSingle()
      if (c) {
        activeCls = {
          id: classId,
          student_id: c.student_id,
          teacher_id: c.teacher_id,
          date: c.date,
          start_time: c.start_time
        } as any
      }
    }

    // 1. Fetch Class Notes
    const { data: n } = await supabase
      .from("ClassNote")
      .select("*, LibraryContent!ClassNote_content_id_fkey(title, url, type), LibraryPlaylist!ClassNote_playlist_id_fkey(title, description)")
      .eq("class_id", classId)
      .order("created_at", { ascending: false })
    if (n) setNotes(n as any)

    // 2. Fetch all student tasks if student is present
    if (activeCls && activeCls.student_id) {
      const { data: siblingClasses } = await supabase
        .from("Class")
        .select("id, date, start_time")
        .eq("student_id", activeCls.student_id)
        .order("date", { ascending: false })
        .order("start_time", { ascending: false })

      if (siblingClasses && siblingClasses.length > 0) {
        const classIds = siblingClasses.map(sc => sc.id)

        console.log("[DEBUG] loadNotesAndTasks started (Date-based)", {
          classId,
          activeClsStudentId: activeCls.student_id,
          activeClsDate: activeCls.date,
          activeClsTime: activeCls.start_time,
          siblingClassesCount: siblingClasses.length,
          siblingClassesDetails: siblingClasses.map((sc, idx) => ({ idx, id: sc.id, date: sc.date, start_time: sc.start_time })),
        })

        const { data: allTasks } = await supabase
          .from("Task")
          .select("*, LibraryContent(title, url, type), LibraryPlaylist(title, description)")
          .in("class_id", classIds)
          .order("created_at", { ascending: false })

        if (allTasks) {
          // Tareas asignadas hoy (created in this classId)
          const todayT = allTasks.filter(t => t.class_id === classId)
          setTasks(todayT as any)

          // Helper robusto: convierte fecha+hora a timestamp ISO para comparación exacta.
          // Normaliza el start_time a HH:MM para evitar problemas con "18:00:00" vs "18:00"
          const toTimestamp = (date: string, time: string) => {
            const normalizedTime = (time || "00:00").slice(0, 5) // tomar solo HH:MM
            return new Date(`${date}T${normalizedTime}:00`).getTime()
          }

          const activeTs = toTimestamp(activeCls.date, activeCls.start_time)

          // Filter tasks from classes that are chronologically STRICTLY BEFORE the current active class
          const pastTasksWithDetails = allTasks
            .map(t => {
              const sc = siblingClasses.find(sc => sc.id === t.class_id)
              return { task: t, class: sc }
            })
            .filter(item => {
              if (!item.class || !activeCls?.date || !activeCls?.start_time) return false
              // Excluir explícitamente la clase actual (class_id === classId)
              if (item.class.id === classId) return false
              return toTimestamp(item.class.date, item.class.start_time) < activeTs
            })

          console.log("[DEBUG] allTasks fetched", {
            allTasksCount: allTasks.length,
            allTasksDetails: allTasks.map(t => ({ id: t.id, title: t.title, class_id: t.class_id, completed: t.completed })),
            pastTasksWithDetails: pastTasksWithDetails.map(item => ({ title: item.task.title, date: item.class?.date })),
          })

          // Find all distinct past classes that actually have tasks assigned to them
          const pastClassesWithTasks = siblingClasses.filter(sc => 
            pastTasksWithDetails.some(item => item.class?.id === sc.id)
          )

          if (pastClassesWithTasks.length > 0) {
            // Since siblingClasses is sorted descending by date/time, the first element here
            // is the chronologically most recent past class with tasks!
            const mostRecentPastClass = pastClassesWithTasks[0]
            const mostRecentPastClassId = mostRecentPastClass.id

            // Gather:
            // A. All tasks from that most recent past class (completed or not)
            // B. Any other older past tasks that are still pending (completed === false)
            const revT = pastTasksWithDetails
              .filter(item => {
                if (item.class?.id === mostRecentPastClassId) return true
                if (item.task.completed === false) return true
                return false
              })
              .map(item => item.task)

            console.log("[DEBUG] Filtered reviewTasks (Date-based)", {
              mostRecentPastClassId,
              mostRecentPastClassDate: mostRecentPastClass.date,
              revTCount: revT.length,
              revTTitles: revT.map(t => t.title)
            })

            setReviewTasks(revT as any)
          } else {
            setReviewTasks([])
          }
        } else {
          setTasks([])
          setReviewTasks([])
        }
      } else {
        setTasks([])
        setReviewTasks([])
      }
    } else {
      // Fallback if no student is assigned
      const { data: t } = await supabase
        .from("Task")
        .select("*, LibraryContent(title, url, type), LibraryPlaylist(title, description)")
        .eq("class_id", classId)
        .order("created_at", { ascending: false })
      if (t) setTasks(t as any)
      setReviewTasks([])
    }
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
    console.log("[ClassDetail] addNote started", { classId, content: newNote.content })
    setSaving(true)
    
    const isPlaylist = newNote.attached_id.startsWith("playlist_")
    const contentId = !isPlaylist && newNote.attached_id ? newNote.attached_id.replace("item_", "") : null
    const playlistId = isPlaylist ? newNote.attached_id.replace("playlist_", "") : null

    try {
      const { error, data } = await supabase.from("ClassNote").insert({ 
        class_id: classId, 
        content: newNote.content.trim(),
        content_id: contentId,
        playlist_id: playlistId
      }).select()
      
      if (error) {
        console.error("Error al guardar nota (DB):", error)
        toast(`Error: ${error.message}`, "error")
      } else {
        console.log("Nota guardada OK", data)
        if (cls?.student_id && (contentId || playlistId)) {
          const { error: slaErr } = await supabase.from("StudentLibraryAccess").upsert({
            student_id: cls.student_id,
            content_id: contentId || null,
            playlist_id: playlistId || null,
            assigned_by: cls.teacher_id
          }, { onConflict: contentId ? 'student_id,content_id' : 'student_id,playlist_id' })
          if (slaErr) console.error("Error SLA:", slaErr)
        }
        setNewNote({ content: "", attached_id: "", attached_title: "", attached_type: "" })
        toast("Nota guardada con éxito", "success")
        await loadNotesAndTasks()
      }
    } catch (err: any) {
      console.error("Error al guardar nota (Exception):", err)
      toast("Error inesperado al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  async function addTask() {
    if (!newTask.title.trim()) return
    setSaving(true)

    const isPlaylist = newTask.attached_id.startsWith("playlist_")
    const contentId = !isPlaylist && newTask.attached_id ? newTask.attached_id.replace("item_", "") : null
    const playlistId = isPlaylist ? newTask.attached_id.replace("playlist_", "") : null

    try {
      const { error, data } = await supabase.from("Task").insert({
        class_id: classId, 
        student_id: cls?.student_id ?? null,
        teacher_id: cls?.teacher_id ?? null,
        title: newTask.title.trim(), 
        description: newTask.description.trim() || null,
        content_id: contentId,
        playlist_id: playlistId,
        progress: newTask.progress || 0
      }).select()

      if (error) {
        toast("Error al asignar tarea", "error")
      } else {
        toast("Tarea asignada correctamente", "success")
        if (cls?.student_id && (contentId || playlistId)) {
          const { error: slaErr } = await supabase.from("StudentLibraryAccess").upsert({
            student_id: cls.student_id,
            content_id: contentId || null,
            playlist_id: playlistId || null,
            assigned_by: cls.teacher_id
          }, { onConflict: contentId ? 'student_id,content_id' : 'student_id,playlist_id' })
          if (slaErr) console.error("Error SLA:", slaErr)
        }
        if (cls?.student_email) {
          // Trigger new task email
          supabase.functions.invoke("send-email", {
            body: {
              to: cls.student_email,
              type: "NEW_TASK",
              params: {
                studentName: cls.student_name,
                taskTitle: newTask.title.trim(),
                taskDescription: newTask.description.trim() || "",
                assignedDate: new Date().toLocaleDateString("es-CL", { day: "numeric", month: "long" }),
                link: window.location.origin + "/dashboard/tareas"
              }
            }
          }).catch(err => console.error("Error sending task email:", err))
        }
        setNewTask({ title: "", description: "", attached_id: "", attached_title: "", attached_type: "", progress: 0 })
        await loadNotesAndTasks()
      }
    } catch (err) {
      toast("Error inesperado al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    await supabase.from("Task").update({ completed: !completed }).eq("id", taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t))
    setReviewTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t))
  }

  async function deleteNote(noteId: string) {
    await supabase.from("ClassNote").delete().eq("id", noteId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
  }

  async function deleteTask(taskId: string) {
    await supabase.from("Task").delete().eq("id", taskId)
    setTasks(prev => prev.filter(t => t.id !== taskId))
    setReviewTasks(prev => prev.filter(t => t.id !== taskId))
  }

  async function rescheduleTaskToCurrentClass(taskId: string) {
    setSaving(true)
    try {
      const { error } = await supabase
        .from("Task")
        .update({ class_id: classId })
        .eq("id", taskId)

      if (error) {
        toast("Error al reasignar la tarea", "error")
      } else {
        toast("Tarea traspasada a esta clase con éxito", "success")
        await loadNotesAndTasks()
      }
    } catch (err) {
      toast("Error inesperado al reasignar", "error")
    } finally {
      setSaving(false)
    }
  }

  async function saveEditedTask(taskId: string) {
    if (!editingTaskForm.title.trim()) return
    setSaving(true)

    const isPlaylist = editingTaskForm.attached_id.startsWith("playlist_")
    const contentId = !isPlaylist && editingTaskForm.attached_id ? editingTaskForm.attached_id.replace("item_", "") : null
    const playlistId = isPlaylist ? editingTaskForm.attached_id.replace("playlist_", "") : null

    try {
      const { error } = await supabase
        .from("Task")
        .update({
          title: editingTaskForm.title.trim(),
          description: editingTaskForm.description.trim() || null,
          content_id: contentId,
          playlist_id: playlistId,
          progress: editingTaskForm.progress,
          completed: editingTaskForm.progress === 100
        })
        .eq("id", taskId)

      if (error) {
        toast("Error al guardar cambios de la tarea", "error")
      } else {
        toast("Tarea modificada correctamente", "success")
        
        if (cls?.student_id && (contentId || playlistId)) {
          const { error: slaErr } = await supabase.from("StudentLibraryAccess").upsert({
            student_id: cls.student_id,
            content_id: contentId || null,
            playlist_id: playlistId || null,
            assigned_by: cls.teacher_id
          }, { onConflict: contentId ? 'student_id,content_id' : 'student_id,playlist_id' })
          if (slaErr) console.error("Error SLA:", slaErr)
        }
        
        setEditingTaskId(null)
        await loadNotesAndTasks()
      }
    } catch (err) {
      toast("Error inesperado al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="animate-pulse space-y-4">{[1, 2].map(i => <div key={i} className="h-32 bg-white rounded-3xl" />)}</div>
  if (!cls) return <p className="text-neutral-500">Clase no encontrada</p>

  const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    SCHEDULED: { label: "Programada", color: "bg-sky-50 text-sky-700 border-sky-100", icon: Calendar },
    CONFIRMED: { label: "Confirmada", color: "bg-indigo-50 text-indigo-700 border-indigo-100", icon: CheckCircle2 },
    COMPLETED: { label: "Completada", color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
    CANCELLED: { label: "Cancelada", color: "bg-red-50 text-red-600 border-red-100", icon: Trash2 },
  }
  const sc = statusConfig[cls.status] ?? statusConfig.SCHEDULED

  return (
    <div className="space-y-4 md:space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-3xl md:rounded-[40px] border border-neutral-100 p-5 md:p-8 shadow-sm">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] md:text-sm mb-6 md:mb-8">
          <Link href="/dashboard/clases" className="p-1.5 md:p-2 hover:bg-neutral-50 rounded-xl transition-colors text-neutral-400 hover:text-violet-600">
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
          <div className="flex items-center gap-1 md:gap-2 text-neutral-400 font-medium">
            <span className="opacity-40">Clases</span>
            <span className="text-neutral-200">/</span>
            <span className="text-neutral-900 font-bold truncate max-w-[100px] md:max-w-none">
              {new Date(cls.date + "T12:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
            </span>
          </div>
          {cls.student_id && profile?.role === 'TEACHER' && (
            <>
              <span className="text-neutral-200">·</span>
              <Link href={`/dashboard/alumnos/detalles?id=${cls.student_id}`} className="text-violet-600 font-bold hover:underline flex items-center gap-1 md:gap-1.5 truncate max-w-[120px] md:max-w-none">
                <User className="w-3 h-3 md:w-4 md:h-4 text-violet-400" />
                {cls.student_name}
              </Link>
            </>
          )}
        </div>

        {editing ? (
          /* ── EDIT MODE ── */
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-violet-50 text-violet-600 rounded-xl md:rounded-2xl flex items-center justify-center">
                  <Edit3 className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-neutral-900">Editar Clase</h2>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="flex-1 sm:flex-none px-4 py-2 bg-neutral-100 text-neutral-600 rounded-xl text-[10px] font-bold hover:bg-neutral-200 transition-colors">Cancelar</button>
                <button onClick={saveEdit} disabled={savingEdit} className="flex-1 sm:flex-none px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-[10px] font-bold hover:bg-violet-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  <Save className="w-3 h-3" />
                  {savingEdit ? "..." : "Guardar"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Fecha</label>
                <input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Inicio</label>
                <input type="time" value={editForm.start_time} onChange={e => setEditForm(p => ({ ...p, start_time: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Fin</label>
                <input type="time" value={editForm.end_time} onChange={e => setEditForm(p => ({ ...p, end_time: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Alumno</label>
                <select value={editForm.student_id} onChange={e => setEditForm(p => ({ ...p, student_id: e.target.value }))} className="field">
                  <option value="">Sin asignar</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Modalidad</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
                  {(["online", "presencial"] as const).map(m => (
                    <button key={m} type="button" onClick={() => setEditForm(p => ({ ...p, modalidad: m }))}
                      className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 ${editForm.modalidad === m ? "bg-white text-violet-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"}`}>
                      {m === "online" ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1.5 px-1">Estado</label>
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-100 rounded-xl">
                  {(["SCHEDULED", "CONFIRMED", "COMPLETED", "CANCELLED"] as const).map(s => (
                    <button key={s} type="button" onClick={() => setEditForm(p => ({ ...p, status: s }))}
                      className={`py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                        editForm.status === s ? statusConfig[s].color + " shadow-sm font-black" : "text-neutral-400 hover:text-neutral-600"
                      }`}>
                      {statusConfig[s].label.slice(0, 4)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Danger zone */}
            <div className="pt-4 border-t border-neutral-100 flex justify-between items-center">
              <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-tight">Riesgo</p>
              <button onClick={deleteClass} className="px-3 py-1.5 text-[10px] text-red-400 font-bold hover:bg-red-50 rounded-lg transition-all flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          /* ── VIEW MODE ── */
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-400">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-8">
              <div>
                <h1 className="text-2xl md:text-4xl font-black text-neutral-900 tracking-tight capitalize">
                  {new Date(cls.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1.5 text-xs md:text-sm text-neutral-500 font-bold">
                    <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-300" />
                    <span>{formatTime(cls.start_time)} – {formatTime(cls.end_time)}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-neutral-200" />
                  <div className="text-xs md:text-sm text-neutral-500 font-bold">{cls.duration} min</div>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`flex items-center gap-1.5 px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-xs font-black uppercase tracking-widest border ${sc.color}`}>
                  <sc.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  {sc.label}
                </div>
                {profile?.role === "TEACHER" && (
                  <button onClick={() => setEditing(true)}
                    className="flex-1 sm:flex-none px-4 py-2 md:px-6 md:py-2.5 bg-neutral-900 text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:bg-violet-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/10">
                    <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    Editar
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <InfoBlock label="Alumno" icon={<User className="w-3.5 h-3.5 text-blue-400" />}>
                {cls.student_id ? (
                  profile?.role === 'TEACHER' ? (
                    <Link href={`/dashboard/alumnos/detalles?id=${cls.student_id}`} className="text-violet-600 font-black hover:underline">{cls.student_name}</Link>
                  ) : (
                    <span className="text-neutral-900 font-black">{cls.student_name}</span>
                  )
                ) : (
                  <span className="text-neutral-400 font-bold">Sin asignar</span>
                )}
              </InfoBlock>
              <InfoBlock label="Horario" icon={<Clock className="w-3.5 h-3.5 text-amber-400" />}>
                <span className="font-black text-neutral-900">{formatTime(cls.start_time)} – {formatTime(cls.end_time)}</span>
              </InfoBlock>
              <InfoBlock label="Duración" icon={<Calendar className="w-3.5 h-3.5 text-emerald-400" />}>
                <span className="font-black text-neutral-900">{cls.duration} min</span>
              </InfoBlock>
              <InfoBlock label="Modalidad" icon={<MapPin className="w-3.5 h-3.5 text-rose-400" />}>
                <span className="font-black text-neutral-900 flex items-center gap-2">
                  {cls.modalidad === "online" ? <Video className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
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
        <div className="bg-white rounded-3xl md:rounded-[40px] border border-neutral-100 p-5 md:p-8 space-y-6 shadow-sm">
          <h3 className="font-black text-xl text-neutral-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center">
              <StickyNote className="w-5 h-5" />
            </div>
            Notas de la Clase
          </h3>

          {profile?.role === "TEACHER" && (
            <div className="bg-neutral-50 rounded-[32px] p-6 space-y-4 border border-neutral-100">
              <textarea 
                value={newNote.content} 
                onChange={e => setNewNote(p => ({...p, content: e.target.value}))}
                placeholder="Observaciones, progreso, temas cubiertos…" 
                rows={4}
                className="w-full bg-transparent border-0 outline-none text-sm font-medium resize-none text-neutral-700 placeholder:text-neutral-300" 
              />
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200/50 gap-4">
                <div className="flex items-center gap-2 min-w-0">
                  <button 
                    type="button"
                    onClick={() => setModalTarget("note")}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border transition-all truncate shadow-sm ${
                      newNote.attached_id
                        ? "bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100"
                        : "bg-white text-neutral-600 border-neutral-200 hover:border-violet-300 hover:text-neutral-900"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{newNote.attached_id ? `📎 ${newNote.attached_title || "Material Adjunto"}` : "📎 Adjuntar Material"}</span>
                  </button>
                  {newNote.attached_id && (
                    <button
                      type="button"
                      onClick={() => setNewNote(p => ({...p, attached_id: "", attached_title: "", attached_type: ""}))}
                      className="p-2.5 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all flex-shrink-0"
                      title="Quitar adjunto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={addNote} 
                  disabled={!newNote.content.trim() || saving}
                  className="px-6 py-2.5 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-violet-600 disabled:opacity-30 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? "..." : "Guardar Nota"}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {notes.length === 0 ? (
              <div className="text-center py-12 bg-neutral-50/50 rounded-[32px] border border-dashed border-neutral-200">
                <p className="text-sm text-neutral-400 font-bold italic">Sin notas todavía</p>
              </div>
            ) : notes.map(n => (
              <div key={n.id} className="bg-white border border-neutral-100 rounded-3xl p-6 group relative hover:shadow-md transition-all">
                <p className="text-sm text-neutral-800 font-medium whitespace-pre-wrap leading-relaxed">{n.content}</p>
                {n.LibraryContent && (
                  <div className="space-y-4 mt-6">
                    {n.LibraryContent.type === 'video' && n.LibraryContent.url && (
                      <VideoPlayer url={n.LibraryContent.url} title={n.LibraryContent.title} />
                    )}
                    <div className="p-4 bg-violet-50 rounded-2xl flex items-center justify-between group/link border border-violet-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-violet-600">
                          {n.LibraryContent.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-violet-900">{n.LibraryContent.title}</p>
                          <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{n.LibraryContent.type}</p>
                        </div>
                      </div>
                      <a href={n.LibraryContent.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-violet-600 rounded-xl hover:bg-violet-600 hover:text-white transition-all shadow-sm">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                )}
                {n.LibraryPlaylist && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold">📚</div>
                      <div>
                        <p className="text-xs font-black text-indigo-900">{n.LibraryPlaylist.title}</p>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Serie Completa</p>
                      </div>
                    </div>
                    <Link href={`/dashboard/biblioteca?playlist=${n.playlist_id}`} className="px-3 py-1.5 bg-white text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5">
                      Abrir Serie <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-50">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                    {new Date(n.created_at).toLocaleString("es-CL", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {profile?.role === 'TEACHER' && (
                    <button onClick={() => deleteNote(n.id)} className="text-[10px] text-red-400 md:opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-600 font-black uppercase tracking-widest">Eliminar</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TASKS */}
        <div className="bg-white rounded-3xl md:rounded-[40px] border border-neutral-100 p-5 md:p-8 space-y-8 shadow-sm">
          <h3 className="font-black text-xl text-neutral-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            Seguimiento de Tareas
          </h3>

          {(() => {
            const renderTaskItem = (t: Task, isReview: boolean) => {
              const isEditingThisTask = editingTaskId === t.id;

              if (isEditingThisTask) {
                return (
                  <div key={t.id} className="flex flex-col p-5 bg-neutral-50 border border-violet-200 rounded-3xl space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Título de la Tarea</label>
                        <input 
                          type="text" 
                          value={editingTaskForm.title} 
                          onChange={e => setEditingTaskForm(p => ({ ...p, title: e.target.value }))}
                          className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-bold text-neutral-900 outline-none focus:border-violet-400" 
                          placeholder="Título..."
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-1">Descripción / Detalles</label>
                        <textarea 
                          value={editingTaskForm.description || ""} 
                          onChange={e => setEditingTaskForm(p => ({ ...p, description: e.target.value }))}
                          className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-xs font-medium text-neutral-600 outline-none focus:border-violet-400 resize-none" 
                          placeholder="Detalles..."
                          rows={2}
                        />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2">Progreso de la Tarea</label>
                        <div className="flex gap-2">
                          {[0, 25, 50, 75, 100].map(val => (
                            <button
                              type="button"
                              key={val}
                              onClick={() => setEditingTaskForm(p => ({ ...p, progress: val }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                editingTaskForm.progress === val
                                  ? "bg-violet-600 text-white shadow-sm"
                                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                              }`}
                            >
                              {val}%
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 pt-2">
                        <button 
                          type="button"
                          onClick={() => setModalTarget("edit_task")}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border transition-all truncate shadow-sm ${
                            editingTaskForm.attached_id
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-white text-neutral-600 border-neutral-200 hover:border-emerald-300 hover:text-neutral-900"
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{editingTaskForm.attached_id ? `📎 ${editingTaskForm.attached_title || "Material Adjunto"}` : "📎 Adjuntar Material"}</span>
                        </button>
                        {editingTaskForm.attached_id && (
                          <button
                            type="button"
                            onClick={() => setEditingTaskForm(p => ({...p, attached_id: "", attached_title: "", attached_type: ""}))}
                            className="p-2 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all flex-shrink-0"
                            title="Quitar adjunto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-3 border-t border-neutral-200/50">
                      <button 
                        onClick={() => setEditingTaskId(null)}
                        className="px-4 py-2 bg-white hover:bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => saveEditedTask(t.id)}
                        disabled={!editingTaskForm.title.trim() || saving}
                        className="px-4 py-2 bg-neutral-900 hover:bg-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30 flex items-center gap-1"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {saving ? "..." : "Guardar"}
                      </button>
                    </div>
                  </div>
                );
              }

              return (
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
                      {t.description && <p className="text-xs text-neutral-500 font-medium mt-1 uppercase tracking-tighter">{t.description}</p>}
                    </div>
                    {profile?.role === 'TEACHER' && (
                      <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        {isReview && !t.completed && (
                          <button
                            onClick={() => rescheduleTaskToCurrentClass(t.id)}
                            className="text-neutral-400 hover:text-emerald-600 p-1 transition-colors"
                            title="Traspasar a esta clase (para revisar la próxima)"
                          >
                            <Forward className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            const attachedId = t.content_id ? `item_${t.content_id}` : t.playlist_id ? `playlist_${t.playlist_id}` : "";
                            const attachedTitle = t.LibraryContent?.title || t.LibraryPlaylist?.title || "";
                            const attachedType = t.LibraryContent?.type || (t.playlist_id ? "playlist" : "");
                            
                            setEditingTaskForm({
                                title: t.title,
                                description: t.description || "",
                                attached_id: attachedId,
                                attached_title: attachedTitle,
                                attached_type: attachedType,
                                progress: t.progress || 0
                            });
                            setEditingTaskId(t.id);
                          }} 
                          className="text-neutral-400 hover:text-violet-600 p-1 transition-colors"
                          title="Editar tarea"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteTask(t.id)} 
                          className="text-neutral-400 hover:text-red-500 p-1 transition-colors"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* PROGRESS BAR */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                      <span>Progreso de la tarea</span>
                      <span className={t.completed || t.progress === 100 ? "text-emerald-600 font-bold" : "text-violet-600 font-bold"}>
                        {t.completed ? "100%" : `${t.progress || 0}%`}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          t.completed || t.progress === 100 
                            ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                            : "bg-gradient-to-r from-violet-500 to-indigo-500"
                        }`}
                        style={{ width: `${t.completed ? 100 : (t.progress || 0)}%` }}
                      />
                    </div>
                  </div>
                  {t.LibraryContent && (
                    <div className="mt-6 space-y-4">
                      {t.LibraryContent.type === 'video' && t.LibraryContent.url && (
                        <VideoPlayer url={t.LibraryContent.url} title={t.LibraryContent.title} />
                      )}
                      <div className="p-4 bg-emerald-50 rounded-2xl flex items-center justify-between border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-emerald-600">
                            {t.LibraryContent.type === 'video' ? <PlayCircle className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-xs font-black text-emerald-900">{t.LibraryContent.title}</p>
                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t.LibraryContent.type}</p>
                          </div>
                        </div>
                        <a href={t.LibraryContent.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-emerald-600 rounded-xl hover:bg-emerald-600 transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                  {t.LibraryPlaylist && (
                    <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold">📚</div>
                        <div>
                          <p className="text-xs font-black text-indigo-900">{t.LibraryPlaylist.title}</p>
                          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Serie Completa</p>
                        </div>
                      </div>
                      <Link href={`/dashboard/biblioteca?playlist=${t.playlist_id}`} className="px-3 py-1.5 bg-white text-indigo-600 rounded-xl font-bold text-xs hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5">
                        Abrir Serie <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                  <div className="mt-4 pt-3 border-t border-neutral-50 flex justify-between items-center">
                    <p className="text-[9px] font-black text-neutral-300 uppercase tracking-widest">
                      Asignada el {new Date(t.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <>
                {/* SECTION 1: TASKS TO REVIEW TODAY */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">📋 Tareas para revisar hoy</h4>
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">De la clase anterior</span>
                  </div>

                  <div className="space-y-3">
                    {reviewTasks.length === 0 ? (
                      <div className="text-center py-6 bg-neutral-50/50 rounded-2xl border border-dashed border-neutral-200">
                        <p className="text-xs text-neutral-400 font-bold italic">Sin tareas pendientes de la clase pasada</p>
                      </div>
                    ) : reviewTasks.map(t => renderTaskItem(t, true))}
                  </div>
                </div>

                {/* SECTION 2: TASKS ASSIGNED TODAY */}
                <div className="space-y-6 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                    <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">✍️ Tareas asignadas hoy</h4>
                    <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Para la clase siguiente</span>
                  </div>

                  {profile?.role === "TEACHER" && (
                    <div className="bg-neutral-50 rounded-[32px] p-6 space-y-4 border border-neutral-100">
                      <input 
                        type="text" 
                        value={newTask.title} 
                        onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                        placeholder="Título de la nueva tarea..."
                        className="w-full bg-transparent border-0 outline-none text-base font-black text-neutral-900 placeholder:text-neutral-300" 
                      />
                      <textarea 
                        value={newTask.description} 
                        onChange={e => setNewTask(p => ({ ...p, description: e.target.value }))}
                        placeholder="Detalles opcionales…" 
                        rows={2}
                        className="w-full bg-transparent border-0 outline-none text-sm font-medium resize-none text-neutral-600" 
                      />
                      
                      <div className="pt-3 border-t border-neutral-100">
                        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2">Progreso Inicial</label>
                        <div className="flex gap-2">
                          {[0, 25, 50, 75, 100].map(val => (
                            <button
                              type="button"
                              key={val}
                              onClick={() => setNewTask(p => ({ ...p, progress: val }))}
                              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                newTask.progress === val
                                  ? "bg-violet-600 text-white shadow-sm"
                                  : "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50"
                              }`}
                            >
                              {val}%
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-neutral-200/50 gap-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <button 
                            type="button"
                            onClick={() => setModalTarget("task")}
                            className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border transition-all truncate shadow-sm ${
                              newTask.attached_id
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                                : "bg-white text-neutral-600 border-neutral-200 hover:border-emerald-300 hover:text-neutral-900"
                            }`}
                          >
                            <BookOpen className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{newTask.attached_id ? `📎 ${newTask.attached_title || "Material Adjunto"}` : "📎 Adjuntar Material"}</span>
                          </button>
                          {newTask.attached_id && (
                            <button
                              type="button"
                              onClick={() => setNewTask(p => ({...p, attached_id: "", attached_title: "", attached_type: ""}))}
                              className="p-2.5 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all flex-shrink-0"
                              title="Quitar adjunto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <button 
                          onClick={addTask} 
                          disabled={!newTask.title.trim() || saving}
                          className="px-6 py-2.5 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 disabled:opacity-30 shadow-lg flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {saving ? "..." : "Asignar"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {tasks.length === 0 ? (
                      <div className="text-center py-8 bg-neutral-50/50 rounded-[32px] border border-dashed border-neutral-200">
                        <p className="text-sm text-neutral-400 font-bold italic">No has asignado tareas en esta clase</p>
                      </div>
                    ) : tasks.map(t => renderTaskItem(t, false))}
                  </div>
                </div>
              </>
            )
          })()}
        </div>
      </div>

      <style jsx global>{`
        .field { width: 100%; padding: 0.875rem 1.25rem; border: 1px solid #f3f4f6; background: #fff; border-radius: 1.25rem; outline: none; font-weight: 800; font-size: 0.875rem; color: #171717; transition: all 0.2s; }
        .field:focus { border-color: #8b5cf6; background: #fff; box-shadow: 0 0 0 4px rgba(139,92,246,0.05); }
      `}</style>

      <LibraryPickerModal
        isOpen={modalTarget !== null}
        onClose={() => setModalTarget(null)}
        onSelect={(selectedId, item) => {
          if (modalTarget === "note") {
            setNewNote(p => ({ ...p, attached_id: selectedId, attached_title: item.title, attached_type: item.type }))
          }
          if (modalTarget === "task") {
            setNewTask(p => ({ ...p, attached_id: selectedId, attached_title: item.title, attached_type: item.type }))
          }
          if (modalTarget === "edit_task") {
            setEditingTaskForm(p => ({ ...p, attached_id: selectedId, attached_title: item.title, attached_type: item.type }))
          }
        }}
        library={library}
        playlists={playlists}
        currentSelectedId={
          modalTarget === "note" 
            ? newNote.attached_id 
            : modalTarget === "task" 
            ? newTask.attached_id 
            : modalTarget === "edit_task" 
            ? editingTaskForm.attached_id 
            : ""
        }
      />
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

