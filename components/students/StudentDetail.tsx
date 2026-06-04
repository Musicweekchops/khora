"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import ScheduleManager from "@/components/students/ScheduleManager"
import { toast } from "sonner"
import { Lock, Save, Trash2, Edit3, BookOpen, ExternalLink, Plus, PlayCircle, FileText } from "lucide-react"
import LastSeenBadge from "@/components/ui/LastSeenBadge"
import { RichText } from "@/components/ui/RichText"
import LibraryPickerModal from "@/components/ui/LibraryPickerModal"

interface StudentData {
  id: string; user_id: string; teacher_id: string; status: string; modalidad: string; lead_source: string
  preferred_day: string; preferred_time: string; emergency_contact: string; emergency_phone: string
  lifetime_value: number; created_at: string; collection_active: boolean; monthly_fee: number; last_seen_at: string | null
  user: { name: string; email: string; phone: string }
}

interface ClassRow { id: string; date: string; start_time: string; end_time: string; status: string; modalidad: string }
interface TaskRow { id: string; title: string; completed: boolean; created_at: string; class_date: string }
interface PaymentRow { id: string; amount: number; method: string; date: string; notes?: string }
interface NoteRow { id: string; content: string; created_at: string; class_date: string }

export default function StudentDetail({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<StudentData | null>(null)
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "classes" | "tasks" | "payments" | "notes" | "materiales">("overview")
  const [newNote, setNewNote] = useState("")
  const [addingNote, setAddingNote] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [generatingLink, setGeneratingLink] = useState(false)

  // Deletar / Migración de alumnos
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [otherStudents, setOtherStudents] = useState<{ id: string; name: string; email: string }[]>([])
  const [selectedTargetId, setSelectedTargetId] = useState("")
  const [deleting, setDeleting] = useState(false)
  const [deleteMode, setDeleteMode] = useState<"total" | "migrate">("migrate")

  // Materiales asignados
  const [accessList, setAccessList] = useState<any[]>([])
  const [library, setLibrary] = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [assignId, setAssignId] = useState("")
  const [assignTitle, setAssignTitle] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => { loadAll() }, [studentId])

  async function loadAll() {
    setLoading(true)

    // Student profile
    const { data: sp } = await supabase
      .from("StudentProfile")
      .select("*, User ( name, email, phone, last_sign_in_at )")
      .eq("id", studentId).maybeSingle()

    if (sp) {
      setStudent({
        id: sp.id, user_id: sp.user_id, teacher_id: sp.teacher_id, status: sp.status ?? "PROSPECT",
        modalidad: sp.modalidad ?? "online", lead_source: sp.lead_source ?? "",
        preferred_day: sp.preferred_day ?? "", preferred_time: sp.preferred_time ?? "",
        emergency_contact: sp.emergency_contact ?? "", emergency_phone: sp.emergency_phone ?? "",
        lifetime_value: sp.lifetime_value ?? 0, created_at: sp.created_at,
        collection_active: sp.collection_active ?? true, monthly_fee: sp.monthly_fee ?? 0,
        last_seen_at: sp.User?.last_sign_in_at ?? null,
        user: { name: sp.User?.name ?? "—", email: sp.User?.email ?? "—", phone: sp.User?.phone ?? "" },
      })
    }

    // Classes
    const { data: cl } = await supabase
      .from("Class")
      .select("id, date, start_time, end_time, status, modalidad")
      .eq("student_id", studentId)
      .order("date", { ascending: false })

    if (cl) setClasses(cl)

    // Tasks
    const { data: tk } = await supabase
      .from("Task")
      .select("id, title, completed, created_at, Class ( date )")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false })

    if (tk) setTasks(tk.map((t: any) => ({
      id: t.id, title: t.title, completed: t.completed,
      created_at: t.created_at, class_date: t.Class?.date ?? "",
    })))

    // Payments
    const { data: py } = await supabase
      .from("Payment")
      .select("id, amount, method, date, notes")
      .eq("student_id", studentId)
      .order("date", { ascending: false })

    if (py) setPayments(py)

    // Notes from all classes of this student
    const { data: nt } = await supabase
      .from("ClassNote")
      .select("id, content, created_at, Class!inner ( date, student_id )")
      .eq("Class.student_id", studentId)
      .order("created_at", { ascending: false })

    if (nt) setNotes(nt.map((n: any) => ({
      id: n.id, content: n.content, created_at: n.created_at, class_date: n.Class?.date ?? "",
    })))

    // Assigned materials & playlists
    if (sp?.teacher_id) {
      const [acc, lib, pl] = await Promise.all([
        supabase.from("StudentLibraryAccess").select("id, created_at, LibraryContent(id, title, type, url), LibraryPlaylist(id, title, description)").eq("student_id", studentId),
        supabase.from("LibraryContent").select("id, title, type, category, url").eq("teacher_id", sp.teacher_id).order("title"),
        supabase.from("LibraryPlaylist").select("id, title, description").eq("teacher_id", sp.teacher_id).order("title")
      ])
      if (acc.data) setAccessList(acc.data)
      if (lib.data) setLibrary(lib.data)
      if (pl.data) setPlaylists(pl.data)
    }

    // Cargar otros alumnos del profesor para opción de migración
    if (sp?.teacher_id) {
      const { data: otherS } = await supabase
        .from("StudentProfile")
        .select("id, User ( name, email )")
        .eq("teacher_id", sp.teacher_id)
        .neq("id", studentId)
        .order("created_at", { ascending: false })

      if (otherS) {
        setOtherStudents(otherS.map((s: any) => ({
          id: s.id,
          name: s.User?.name || "Alumno Sin Nombre",
          email: s.User?.email || "Sin email"
        })))
      }
    }

    setLoading(false)
  }

  async function handleAssignAccess() {
    if (!assignId || !student) return
    setAssigning(true)

    const isPlaylist = assignId.startsWith("playlist_")
    const contentId = !isPlaylist ? assignId.replace("item_", "") : null
    const playlistId = isPlaylist ? assignId.replace("playlist_", "") : null

    const { error } = await supabase.from("StudentLibraryAccess").upsert({
      student_id: studentId,
      content_id: contentId || null,
      playlist_id: playlistId || null,
      assigned_by: student.teacher_id
    }, { onConflict: contentId ? 'student_id,content_id' : 'student_id,playlist_id' })

    if (error) toast.error("Error al asignar: " + error.message)
    else {
      toast.success("Asignado exitosamente")
      setAssignId("")
      setAssignTitle("")
      await loadAll()
    }
    setAssigning(false)
  }

  async function handleRemoveAccess(id: string) {
    if (!confirm("¿Quitar acceso a este material o serie?")) return
    const { error } = await supabase.from("StudentLibraryAccess").delete().eq("id", id)
    if (error) toast.error("Error al quitar acceso")
    else {
      toast.success("Acceso removido")
      setAccessList(prev => prev.filter(a => a.id !== id))
    }
  }

  async function toggleTask(taskId: string, completed: boolean) {
    await supabase.from("Task").update({ completed: !completed }).eq("id", taskId)
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !completed } : t))
  }

  async function updateStatus(newStatus: string) {
    await supabase.from("StudentProfile").update({ status: newStatus }).eq("id", studentId)
    setStudent(prev => prev ? { ...prev, status: newStatus } : prev)
  }

  async function toggleCollectionActive() {
    if (!student) return
    const newState = !student.collection_active
    await supabase.from("StudentProfile").update({ collection_active: newState }).eq("id", studentId)
    setStudent(prev => prev ? { ...prev, collection_active: newState } : prev)
    toast.success(newState ? "Cobranza automática activada" : "Cobranza desactivada para este ciclo")
  }

  async function confirmDelete() {
    if (deleteMode === "migrate" && !selectedTargetId) {
      toast.error("Por favor, selecciona un alumno de destino para migrar el historial.")
      return
    }

    setDeleting(true)
    try {
      const targetId = deleteMode === "migrate" ? selectedTargetId : null
      const { error } = await supabase.rpc("migrate_and_delete_student", {
        p_source_student_id: studentId,
        p_target_student_id: targetId
      })

      if (error) {
        toast.error("Error al eliminar alumno: " + error.message)
      } else {
        toast.success(targetId ? "¡Alumno eliminado e historial migrado con éxito!" : "Alumno eliminado y todo su historial borrado.")
        window.location.href = "/dashboard/alumnos"
      }
    } catch (err: any) {
      toast.error("Error inesperado: " + err.message)
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }
  
  async function handleResetPassword() {
    const newPass = prompt("Ingresa la nueva contraseña temporal para el alumno:")
    if (!newPass) return
    if (newPass.length < 6) return toast.error("La contraseña debe tener al menos 6 caracteres")

    const { error } = await supabase.rpc('reset_student_password', {
      p_user_id: student?.user_id,
      p_new_password: newPass
    })

    if (error) {
      toast.error("Error al restablecer contraseña: " + error.message)
    } else {
      toast.success("Contraseña restablecida con éxito")
    }
  }

  async function handleCopyPaymentLink() {
    if (!student) return
    setGeneratingLink(true)
    try {
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/mercadopago-checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": anonKey,
          "Authorization": `Bearer ${anonKey}`
        },
        body: JSON.stringify({
          teacher_id: student.teacher_id,
          student_id: student.id,
          item_type: "MONTHLY"
        })
      })

      const data = await res.json()
      if (res.ok && data.checkoutUrl) {
        await navigator.clipboard.writeText(data.checkoutUrl)
        toast.success("¡Link de pago copiado al portapapeles! Envíalo a los padres por WhatsApp.")
      } else {
        toast.error(data.error || "No se pudo generar el link de pago.")
      }
    } catch (err) {
      toast.error("Error al conectar con la pasarela de pagos.")
    } finally {
      setGeneratingLink(false)
    }
  }

  if (loading) return <div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-2xl" />)}</div>
  if (!student) return <p className="text-neutral-500">Alumno no encontrado</p>

  const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    PROSPECT: { label: "Prospecto", color: "text-amber-700", bg: "bg-amber-100" },
    TRIAL: { label: "Prueba", color: "text-sky-700", bg: "bg-sky-100" },
    ACTIVE: { label: "Activo", color: "text-emerald-700", bg: "bg-emerald-100" },
    PAUSED: { label: "Pausado", color: "text-neutral-600", bg: "bg-neutral-100" },
    INACTIVE: { label: "Inactivo", color: "text-red-600", bg: "bg-red-100" },
  }
  const sc = statusConfig[student.status] ?? statusConfig.PROSPECT

  const daysSinceJoined = Math.floor((Date.now() - new Date(student.created_at).getTime()) / (1000 * 60 * 60 * 24))
  const completedClasses = classes.filter(c => c.status === "COMPLETED").length
  const completedTasks = tasks.filter(t => t.completed).length
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0)

  // Monthly class progress
  const now = new Date()
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const thisMonthEndStr = `${thisMonthEnd.getFullYear()}-${String(thisMonthEnd.getMonth() + 1).padStart(2, "0")}-${String(thisMonthEnd.getDate()).padStart(2, "0")}`
  const monthClasses = classes.filter(c => c.date >= thisMonthStart && c.date <= thisMonthEndStr)
  const monthCompleted = monthClasses.filter(c => c.status === "COMPLETED").length
  const monthTotal = monthClasses.length

  const tabs = [
    { key: "overview", label: "Resumen", icon: "📊" },
    { key: "schedule", label: "Horario", icon: "↻" },
    { key: "classes", label: `Clases (${classes.length})`, icon: "📖" },
    { key: "tasks", label: `Tareas (${tasks.length})`, icon: "📝" },
    { key: "payments", label: `Pagos (${payments.length})`, icon: "💰" },
    { key: "notes", label: `Notas (${notes.length})`, icon: "📋" },
    { key: "materiales", label: `Materiales (${accessList.length})`, icon: "📚" },
  ]

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-2xl md:rounded-3xl border border-neutral-100 p-4 md:p-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex items-center gap-4 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-2xl md:text-3xl font-bold text-violet-600 shadow-inner">
              {student.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight">{student.user.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-neutral-500 font-medium text-sm md:text-base">{student.user.email}</p>
                <LastSeenBadge lastSeenAt={student.last_seen_at} size="md" />
              </div>
              {student.user.phone && <p className="text-neutral-400 text-xs md:text-sm mt-0.5">📞 {student.user.phone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            {/* Status selector */}
            <select
              value={student.status}
              onChange={e => updateStatus(e.target.value)}
              className={`flex-1 md:flex-none px-3 md:px-4 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wider border-0 outline-none cursor-pointer ${sc.bg} ${sc.color}`}
            >
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handleResetPassword}
                title="Restablecer Contraseña"
                className="p-2.5 bg-neutral-100 text-neutral-500 rounded-xl hover:bg-amber-100 hover:text-amber-700 transition-all"
              >
                <Lock className="w-4 h-4" />
              </button>
              <Link href={`/dashboard/alumnos/editar?id=${studentId}`} className="p-2.5 md:px-5 md:py-2.5 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-bold hover:bg-neutral-200 transition-colors flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Editar</span>
              </Link>
              <button onClick={() => setShowDeleteModal(true)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Eliminar Alumno">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mt-8">
          <MiniStat label="Mes" value={`${monthCompleted}/${monthTotal}`} icon="↻" />
          <MiniStat label="Días" value={String(daysSinceJoined)} icon="📅" />
          <MiniStat label="Clases" value={String(completedClasses)} icon="📖" />
          <MiniStat label="Tareas" value={`${completedTasks}/${tasks.length}`} icon="✅" />
          <MiniStat label="Pagado" value={formatCurrency(totalPaid)} icon="💰" />
          <MiniStat label="Tipo" value={student.modalidad === "online" ? "Virtual" : "Casa"} icon="🎓" />
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? "bg-neutral-900 text-white shadow-lg"
                : "bg-white text-neutral-500 border border-neutral-100 hover:border-neutral-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Info */}
            <div className="bg-white rounded-3xl border border-neutral-100 p-6 space-y-4">
              <h3 className="font-black text-neutral-900 flex items-center gap-2"><span className="w-2 h-5 bg-violet-500 rounded-full" /> Información</h3>
              <InfoRow label="Estado" value={sc.label} />
              <InfoRow label="Fuente" value={student.lead_source || "—"} />
              <InfoRow label="Día preferido" value={student.preferred_day || "—"} />
              <InfoRow label="Hora preferida" value={student.preferred_time || "—"} />
              <InfoRow label="Miembro desde" value={new Date(student.created_at).toLocaleDateString("es-CL")} />
              <InfoRow label="Canal de Pago" value={payments.some(p => p.method === "MERCADOPAGO") ? "💳 Mercado Pago (Automatizado)" : "💵 Registro Manual"} />
            </div>
            {/* Emergency */}
            <div className="bg-white rounded-3xl border border-neutral-100 p-6 space-y-4">
              <h3 className="font-black text-neutral-900 flex items-center gap-2"><span className="w-2 h-5 bg-red-500 rounded-full" /> Contacto de Emergencia</h3>
              <InfoRow label="Nombre" value={student.emergency_contact || "No registrado"} />
              <InfoRow label="Teléfono" value={student.emergency_phone || "—"} />
              <div className="pt-4 border-t border-neutral-50">
                <h4 className="font-bold text-neutral-900 text-sm mb-3">Últimas Clases</h4>
                {classes.slice(0, 3).map(c => (
                  <Link key={c.id} href={`/dashboard/clases/detalles?id=${c.id}`} className="flex items-center justify-between py-2 text-sm hover:bg-violet-50 -mx-2 px-2 rounded-lg transition-colors group">
                    <span className="text-neutral-600 group-hover:text-violet-600 font-medium transition-colors">{new Date(c.date + "T12:00").toLocaleDateString("es-CL")}</span>
                    <span className={`text-xs font-bold uppercase ${c.status === "COMPLETED" ? "text-emerald-600" : "text-sky-600"}`}>{c.status === "COMPLETED" ? "Completada" : "Programada"}</span>
                  </Link>
                ))}
                {classes.length === 0 && <p className="text-neutral-400 text-sm">Sin clases registradas</p>}
              </div>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="bg-white rounded-3xl border border-neutral-100 p-8 shadow-sm">
            <ScheduleManager studentId={studentId} teacherId={student.teacher_id} />
          </div>
        )}

        {activeTab === "classes" && (
          <div className="bg-white rounded-2xl md:rounded-3xl border border-neutral-100 overflow-hidden">
            {classes.length === 0 ? (
              <div className="p-12 text-center"><span className="text-4xl opacity-30 block mb-3">📖</span><p className="text-neutral-500 font-bold">Sin clases registradas</p></div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm min-w-[600px] md:min-w-0">
                <thead><tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="text-left px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Fecha</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Horario</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Modalidad</th>
                  <th className="text-left px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Estado</th>
                </tr></thead>
                <tbody>
                  {classes.map(c => (
                    <tr key={c.id} className="border-b border-neutral-50 hover:bg-violet-50/30 cursor-pointer transition-colors" onClick={() => window.location.href = `/dashboard/clases/detalles?id=${c.id}`}>
                      <td className="px-6 py-4 font-bold text-neutral-900">{new Date(c.date + "T12:00").toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "short" })}</td>
                      <td className="px-6 py-4 text-neutral-600">{formatTime(c.start_time)} – {formatTime(c.end_time)}</td>
                      <td className="px-6 py-4 text-neutral-500">{c.modalidad === "online" ? "📹 Virtual" : "🏠 Presencial"}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          c.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : c.status === "CANCELLED" ? "bg-red-100 text-red-600" : "bg-sky-100 text-sky-700"
                        }`}>{c.status === "COMPLETED" ? "Completada" : c.status === "CANCELLED" ? "Cancelada" : "Programada"}</span>
                      </td>
                      <td className="px-2 text-neutral-300">→</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-3">
            {tasks.length === 0 ? (
              <div className="bg-white rounded-3xl border p-12 text-center"><span className="text-4xl opacity-30 block mb-3">📝</span><p className="text-neutral-500 font-bold">Sin tareas asignadas</p></div>
            ) : tasks.map(t => (
              <div key={t.id} className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center gap-4 group hover:shadow-sm transition-all">
                <button onClick={() => toggleTask(t.id, t.completed)} className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${t.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-neutral-300 hover:border-violet-400"}`}>
                  {t.completed && "✓"}
                </button>
                <div className="flex-1">
                  <p className={`font-bold ${t.completed ? "line-through text-neutral-400" : "text-neutral-900"}`}>{t.title}</p>
                  {t.class_date && <p className="text-xs text-neutral-400 mt-0.5">Clase del {new Date(t.class_date + "T12:00").toLocaleDateString("es-CL")}</p>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="bg-white rounded-2xl md:rounded-3xl border border-neutral-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Pagado</p>
                <p className="text-3xl font-black text-emerald-700">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Automatización</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyPaymentLink}
                    disabled={generatingLink}
                    className="px-3 py-2 rounded-xl text-xs font-black transition-all border bg-white text-violet-600 border-violet-200 hover:bg-violet-50 flex items-center gap-2 disabled:opacity-50"
                  >
                    {generatingLink ? (
                      <span className="w-3 h-3 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
                    ) : (
                      "🔗"
                    )}
                    <span>{generatingLink ? "Generando..." : "Copiar Link de Pago"}</span>
                  </button>
                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="px-3 py-2 rounded-xl text-xs font-black transition-all border bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50 flex items-center gap-2"
                  >
                    👁️ Ver Correo
                  </button>
                  <button
                    onClick={toggleCollectionActive}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border flex items-center gap-2 ${
                      student.collection_active
                        ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                        : "bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${student.collection_active ? "bg-amber-500 animate-pulse" : "bg-neutral-400"}`} />
                    {student.collection_active ? "Cobranza Activa (Desactivar)" : "Cobranza Pausada (Activar)"}
                  </button>
                </div>
              </div>
            </div>

            {/* PREVIEW MODAL */}
            {showPreviewModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
                <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                  <div className="flex justify-between items-center p-4 border-b border-neutral-100">
                    <h3 className="font-black text-neutral-900">Vista Previa de Correo Automático</h3>
                    <button onClick={() => setShowPreviewModal(false)} className="w-8 h-8 flex items-center justify-center bg-neutral-100 rounded-full text-neutral-500 hover:bg-neutral-200">✕</button>
                  </div>
                  <div className="bg-neutral-50 p-6 flex justify-center">
                    {/* The Email UI */}
                    <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden text-left font-sans">
                      <div className="h-1.5 bg-gradient-to-r from-violet-500 to-blue-500 w-full" />
                      <div className="p-8">
                        <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-xl text-violet-500 font-bold mb-6">💳</div>
                        <h1 className="text-xl font-black text-neutral-900 mb-2 tracking-tight">Hola {student.user.name.split(' ')[0]}</h1>
                        <p className="text-sm text-neutral-600 mb-8 leading-relaxed">Tu resumen de cuenta de <strong>{new Date().toLocaleDateString("es-CL", { month: "long" })}</strong> ya está disponible.</p>
                        
                        <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-center mb-8">
                          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2">Total a pagar</p>
                          <p className="text-3xl font-black text-neutral-900 tracking-tighter">${(student.monthly_fee || 0).toLocaleString("es-CL")}</p>
                        </div>

                        <div className="bg-red-50 border-l-2 border-red-500 p-3 rounded-r-xl mb-8">
                          <p className="text-xs text-red-900 leading-relaxed">Por favor, ponte en contacto con tu profesor para gestionar la transferencia.</p>
                        </div>
                        <hr className="border-dashed border-neutral-200 mb-6" />
                        <p className="text-[10px] text-center text-neutral-400">Si ya realizaste el pago, ignora este mensaje.<br/><em>Enviado automáticamente por Khora</em></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {payments.length === 0 ? (
              <div className="p-12 text-center"><span className="text-4xl opacity-30 block mb-3">💰</span><p className="text-neutral-500 font-bold">Sin pagos registrados</p></div>
            ) : (
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full text-sm min-w-[500px] md:min-w-0">
                  <thead>
                    <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left">
                      <th className="px-6 py-3">Fecha</th>
                      <th className="px-6 py-3">Monto</th>
                      <th className="px-6 py-3">Método</th>
                      <th className="px-6 py-3">Notas / Comentarios</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-neutral-900 whitespace-nowrap">
                          {new Date(p.date + "T12:00").toLocaleDateString("es-CL")}
                        </td>
                        <td className="px-6 py-4 font-black text-emerald-600 whitespace-nowrap">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="px-6 py-4 text-neutral-500 font-medium whitespace-nowrap">
                          {p.method === "TRANSFER" ? "💸 Transferencia" : p.method === "CASH" ? "💵 Efectivo" : p.method === "CARD" ? "💳 Tarjeta" : p.method === "MERCADOPAGO" ? "💳 Mercado Pago" : p.method ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-neutral-600 text-xs">
                          {p.notes ? (
                            <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-2.5 max-w-md font-medium text-neutral-600 leading-relaxed shadow-sm flex items-start gap-2">
                              <span className="text-sm mt-0.5">💬</span>
                              <span>{p.notes}</span>
                            </div>
                          ) : (
                            <span className="text-neutral-300 italic">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            {/* Add note */}
            <div className="bg-white rounded-2xl border border-neutral-100 p-5">
              <textarea
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Escribe una nota sobre este alumno…"
                rows={3}
                className="w-full border-0 outline-none text-sm font-medium resize-none text-neutral-700 placeholder:text-neutral-300"
              />
              <div className="flex justify-end mt-2">
                <button
                  disabled={!newNote.trim() || addingNote}
                  onClick={async () => {
                    if (!newNote.trim() || !classes.length) return
                    setAddingNote(true)
                    await supabase.from("ClassNote").insert({ class_id: classes[0].id, content: newNote.trim() })
                    setNewNote("")
                    await loadAll()
                    setAddingNote(false)
                  }}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-violet-600 transition-colors disabled:opacity-30"
                >
                  {addingNote ? "Guardando..." : "💾 Guardar Nota"}
                </button>
              </div>
            </div>

            {notes.length === 0 ? (
              <div className="bg-white rounded-3xl border p-12 text-center"><span className="text-4xl opacity-30 block mb-3">📋</span><p className="text-neutral-500 font-bold">Sin notas todavía</p></div>
            ) : notes.map(n => (
              <div key={n.id} className="bg-white rounded-2xl border border-neutral-100 p-5">
                <div onClick={e => e.stopPropagation()}>
                  <RichText text={n.content} className="text-sm text-neutral-800 font-medium" />
                </div>
                <p className="text-xs text-neutral-400 mt-3">{new Date(n.created_at).toLocaleDateString("es-CL")} {n.class_date ? `· Clase del ${new Date(n.class_date + "T12:00").toLocaleDateString("es-CL")}` : ""}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === "materiales" && (
          <div className="bg-white rounded-[40px] border border-neutral-100 p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-black text-xl text-neutral-900 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-bold">📚</div>
                Materiales y Series Asignadas
              </h3>
            </div>

            <div className="bg-neutral-50 rounded-[32px] p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-neutral-100">
              <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all truncate shadow-sm ${
                    assignId
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                      : "bg-white text-neutral-600 border-neutral-200 hover:border-indigo-300 hover:text-neutral-900"
                  }`}
                >
                  <BookOpen className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{assignId ? `📎 ${assignTitle || "Material Seleccionado"}` : "📎 Seleccionar Material o Serie"}</span>
                </button>
                {assignId && (
                  <button
                    type="button"
                    onClick={() => { setAssignId(""); setAssignTitle(""); }}
                    className="p-3 text-neutral-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all flex-shrink-0"
                    title="Quitar selección"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button 
                onClick={handleAssignAccess}
                disabled={!assignId || assigning}
                className="w-full sm:w-auto px-8 py-3.5 bg-neutral-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-neutral-900/10 transition-all"
              >
                <Plus className="w-4 h-4" />
                {assigning ? "Asignando..." : "Asignar Acceso"}
              </button>
            </div>

            <div className="space-y-4">
              {accessList.length === 0 ? (
                <div className="text-center py-12 bg-neutral-50/50 rounded-[32px] border border-dashed border-neutral-200">
                  <p className="text-sm text-neutral-400 font-bold italic">No hay series ni materiales asignados explícitamente</p>
                </div>
              ) : accessList.map(acc => (
                <div key={acc.id} className="p-5 bg-white rounded-3xl border border-neutral-100 flex items-center justify-between group hover:shadow-md hover:border-indigo-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${acc.LibraryPlaylist ? 'bg-indigo-50 text-indigo-600' : 'bg-violet-50 text-violet-600'}`}>
                      {acc.LibraryPlaylist ? "📚" : (acc.LibraryContent?.type === 'video' ? <PlayCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />)}
                    </div>
                    <div>
                      <p className="font-black text-neutral-900 text-base">{acc.LibraryPlaylist ? acc.LibraryPlaylist.title : acc.LibraryContent?.title}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">
                        {acc.LibraryPlaylist ? "Serie Completa" : acc.LibraryContent?.type} · Asignado el {new Date(acc.created_at).toLocaleDateString("es-CL")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {acc.LibraryPlaylist ? (
                      <Link href={`/dashboard/biblioteca?playlist=${acc.LibraryPlaylist.id}`} className="p-3 bg-neutral-50 text-neutral-700 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    ) : (acc.LibraryContent?.url && (
                      <a href={acc.LibraryContent.url} target="_blank" rel="noopener noreferrer" className="p-3 bg-neutral-50 text-neutral-700 rounded-2xl hover:bg-violet-600 hover:text-white transition-all shadow-sm">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ))}
                    <button 
                      onClick={() => handleRemoveAccess(acc.id)} 
                      title="Quitar acceso"
                      className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <LibraryPickerModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelect={(selectedId, item) => {
          setAssignId(selectedId)
          setAssignTitle(item.title)
        }}
        library={library}
        playlists={playlists}
        currentSelectedId={assignId}
      />

      {/* MODAL DE ELIMINACIÓN Y MIGRACIÓN */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#1a1a24] text-white border border-[#2d2d3d] rounded-[32px] max-w-lg w-full overflow-hidden shadow-2xl relative p-8 md:p-10 animate-in zoom-in duration-200 font-sans">
            
            {/* Fondo geométrico sutil */}
            <div className="absolute top-[-30%] right-[-10%] w-64 h-64 bg-red-500/5 blur-[80px] rounded-full" />
            <div className="absolute bottom-[-10%] left-[5%] w-48 h-48 bg-violet-500/5 blur-[80px] rounded-full" />

            <div className="relative z-10 space-y-6">
              {/* Encabezado */}
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-lg mb-4">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white">Eliminar Alumno</h3>
                <p className="text-neutral-400 text-sm mt-2 leading-relaxed">
                  ¿Seguro que deseas dar de baja la cuenta de <strong className="text-white">{student.user.name}</strong>? Su correo electrónico (<span className="text-violet-300 font-semibold">{student.user.email}</span>) quedará liberado inmediatamente.
                </p>
              </div>

              {/* Selección de Modo */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">Selecciona una opción de borrado:</p>
                
                {/* Opción Migrar (Recomendada) */}
                <button
                  type="button"
                  onClick={() => setDeleteMode("migrate")}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    deleteMode === "migrate"
                      ? "bg-violet-950/20 border-violet-500/50 shadow-md"
                      : "bg-[#13131a] border-[#2d2d3d] hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🔄</span>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">Eliminar y Migrar Historial (Recomendado)</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        Transfiere sus clases, tareas, pagos y materiales a otro alumno. Ideal para cambios de correo.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Opción Borrado Total */}
                <button
                  type="button"
                  onClick={() => setDeleteMode("total")}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    deleteMode === "total"
                      ? "bg-red-950/20 border-red-500/50 shadow-md"
                      : "bg-[#13131a] border-[#2d2d3d] hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🗑️</span>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">Borrado Total (Sin Traspaso)</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        Elimina al alumno de raíz. Todo su historial de pagos y accesos se borrará de forma permanente.
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Selector de alumno destino si elige Migrar */}
              {deleteMode === "migrate" && (
                <div className="space-y-2 animate-in slide-in-from-top duration-200">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest px-1">
                    👥 Alumno Destino de la Migración:
                  </label>
                  {otherStudents.length === 0 ? (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-2xl text-xs font-bold text-center leading-relaxed">
                      ⚠️ No tienes otros alumnos registrados en el sistema para poder migrar el historial. Debes crear el alumno nuevo primero.
                    </div>
                  ) : (
                    <select
                      value={selectedTargetId}
                      onChange={(e) => setSelectedTargetId(e.target.value)}
                      className="w-full bg-[#13131a] border border-[#2d2d3d] text-white rounded-2xl p-3.5 text-sm font-bold focus:outline-none focus:border-violet-500 transition-all cursor-pointer"
                    >
                      <option value="">-- Seleccionar Alumno Destino --</option>
                      {otherStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.email})</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false)
                    setSelectedTargetId("")
                  }}
                  disabled={deleting}
                  className="flex-1 py-3.5 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting || (deleteMode === "migrate" && (!selectedTargetId || otherStudents.length === 0))}
                  className={`flex-1 py-3.5 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 shadow-lg flex items-center justify-center gap-2 ${
                    deleteMode === "migrate"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-950/20"
                      : "bg-red-600 hover:bg-red-500 shadow-red-950/20"
                  }`}
                >
                  {deleting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "✓"
                  )}
                  <span>{deleteMode === "migrate" ? "Migrar y Eliminar" : "Eliminar de Raíz"}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="bg-neutral-50 rounded-2xl p-4 text-center">
      <span className="text-lg">{icon}</span>
      <p className="text-xl font-black text-neutral-900 mt-1">{value}</p>
      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
      <span className="text-sm text-neutral-500">{label}</span>
      <span className="text-sm font-bold text-neutral-900">{value}</span>
    </div>
  )
}
