"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import ScheduleManager from "@/components/students/ScheduleManager"
import { toast } from "sonner"
import { Lock, Save, Trash2, Edit3 } from "lucide-react"

interface StudentData {
  id: string; user_id: string; teacher_id: string; status: string; modalidad: string; lead_source: string
  preferred_day: string; preferred_time: string; emergency_contact: string; emergency_phone: string
  lifetime_value: number; created_at: string; collection_active: boolean; monthly_fee: number
  user: { name: string; email: string; phone: string }
}

interface ClassRow { id: string; date: string; start_time: string; end_time: string; status: string; modalidad: string }
interface TaskRow { id: string; title: string; completed: boolean; created_at: string; class_date: string }
interface PaymentRow { id: string; amount: number; method: string; date: string }
interface NoteRow { id: string; content: string; created_at: string; class_date: string }

export default function StudentDetail({ studentId }: { studentId: string }) {
  const [student, setStudent] = useState<StudentData | null>(null)
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "schedule" | "classes" | "tasks" | "payments" | "notes">("overview")
  const [newNote, setNewNote] = useState("")
  const [addingNote, setAddingNote] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  useEffect(() => { loadAll() }, [studentId])

  async function loadAll() {
    setLoading(true)

    // Student profile
    const { data: sp } = await supabase
      .from("StudentProfile")
      .select("*, User ( name, email, phone )")
      .eq("id", studentId).maybeSingle()

    if (sp) {
      setStudent({
        id: sp.id, user_id: sp.user_id, teacher_id: sp.teacher_id, status: sp.status ?? "PROSPECT",
        modalidad: sp.modalidad ?? "online", lead_source: sp.lead_source ?? "",
        preferred_day: sp.preferred_day ?? "", preferred_time: sp.preferred_time ?? "",
        emergency_contact: sp.emergency_contact ?? "", emergency_phone: sp.emergency_phone ?? "",
        lifetime_value: sp.lifetime_value ?? 0, created_at: sp.created_at,
        collection_active: sp.collection_active ?? true, monthly_fee: sp.monthly_fee ?? 0,
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
      .select("id, amount, method, date")
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

    setLoading(false)
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

  async function handleDelete() {
    if (!confirm("¿Seguro que deseas eliminar este alumno y todo su historial?")) return
    // Delete the User row (cascades to StudentProfile and everything linked)
    if (student?.user_id) {
      await supabase.from("User").delete().eq("id", student.user_id)
    }
    window.location.href = "/dashboard/alumnos"
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
              <p className="text-neutral-500 font-medium text-sm md:text-base">{student.user.email}</p>
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
              <button onClick={handleDelete} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors">
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
                <table className="w-full text-sm min-w-[400px] md:min-w-0">
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                        <td className="px-6 py-4 font-bold text-neutral-900">{new Date(p.date + "T12:00").toLocaleDateString("es-CL")}</td>
                        <td className="px-6 py-4 font-black text-emerald-600">{formatCurrency(p.amount)}</td>
                        <td className="px-6 py-4 text-neutral-500">{p.method ?? "—"}</td>
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
                <p className="text-sm text-neutral-800 font-medium whitespace-pre-wrap">{n.content}</p>
                <p className="text-xs text-neutral-400 mt-3">{new Date(n.created_at).toLocaleDateString("es-CL")} {n.class_date ? `· Clase del ${new Date(n.class_date + "T12:00").toLocaleDateString("es-CL")}` : ""}</p>
              </div>
            ))}
          </div>
        )}
      </div>
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
