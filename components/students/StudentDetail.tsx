"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"

interface StudentData {
  id: string; user_id: string; status: string; modalidad: string; lead_source: string
  preferred_day: string; preferred_time: string; emergency_contact: string; emergency_phone: string
  lifetime_value: number; created_at: string
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
  const [activeTab, setActiveTab] = useState<"overview" | "classes" | "tasks" | "payments" | "notes">("overview")
  const [newNote, setNewNote] = useState("")
  const [addingNote, setAddingNote] = useState(false)

  useEffect(() => { loadAll() }, [studentId])

  async function loadAll() {
    setLoading(true)

    // Student profile
    const { data: sp } = await supabase
      .from("StudentProfile")
      .select("*, User ( name, email, phone )")
      .eq("id", studentId).single()

    if (sp) {
      setStudent({
        id: sp.id, user_id: sp.user_id, status: sp.status ?? "PROSPECT",
        modalidad: sp.modalidad ?? "online", lead_source: sp.lead_source ?? "",
        preferred_day: sp.preferred_day ?? "", preferred_time: sp.preferred_time ?? "",
        emergency_contact: sp.emergency_contact ?? "", emergency_phone: sp.emergency_phone ?? "",
        lifetime_value: sp.lifetime_value ?? 0, created_at: sp.created_at,
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

  async function handleDelete() {
    if (!confirm("¿Seguro que deseas eliminar este alumno y todo su historial?")) return
    // Delete the User row (cascades to StudentProfile and everything linked)
    if (student?.user_id) {
      await supabase.from("User").delete().eq("id", student.user_id)
    }
    window.location.href = "/dashboard/alumnos"
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

  const tabs = [
    { key: "overview", label: "Resumen", icon: "📊" },
    { key: "classes", label: `Clases (${classes.length})`, icon: "📖" },
    { key: "tasks", label: `Tareas (${tasks.length})`, icon: "📝" },
    { key: "payments", label: `Pagos (${payments.length})`, icon: "💰" },
    { key: "notes", label: `Notas (${notes.length})`, icon: "📋" },
  ]

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white rounded-3xl border border-neutral-100 p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center text-3xl font-bold text-violet-600 shadow-inner">
              {student.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight">{student.user.name}</h1>
              <p className="text-neutral-500 font-medium">{student.user.email}</p>
              {student.user.phone && <p className="text-neutral-400 text-sm mt-0.5">📞 {student.user.phone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Status selector */}
            <select
              value={student.status}
              onChange={e => updateStatus(e.target.value)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-0 outline-none cursor-pointer ${sc.bg} ${sc.color}`}
            >
              {Object.entries(statusConfig).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
            <Link href={`/dashboard/alumnos/editar?id=${studentId}`} className="px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-bold hover:bg-neutral-200 transition-colors">
              ✏️ Editar
            </Link>
            <button onClick={handleDelete} className="px-5 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors">
              🗑️
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-5 gap-4 mt-8">
          <MiniStat label="Días como alumno" value={String(daysSinceJoined)} icon="📅" />
          <MiniStat label="Clases tomadas" value={String(completedClasses)} icon="📖" />
          <MiniStat label="Tareas completadas" value={`${completedTasks}/${tasks.length}`} icon="✅" />
          <MiniStat label="Total pagado" value={formatCurrency(totalPaid)} icon="💰" />
          <MiniStat label="Modalidad" value={student.modalidad === "online" ? "Virtual" : "Presencial"} icon="🎓" />
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

        {activeTab === "classes" && (
          <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden">
            {classes.length === 0 ? (
              <div className="p-12 text-center"><span className="text-4xl opacity-30 block mb-3">📖</span><p className="text-neutral-500 font-bold">Sin clases registradas</p></div>
            ) : (
              <table className="w-full text-sm">
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
          <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden">
            {payments.length === 0 ? (
              <div className="p-12 text-center"><span className="text-4xl opacity-30 block mb-3">💰</span><p className="text-neutral-500 font-bold">Sin pagos registrados</p></div>
            ) : (
              <>
                <div className="p-6 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-100">
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Total Pagado</p>
                  <p className="text-3xl font-black text-emerald-700">{formatCurrency(totalPaid)}</p>
                </div>
                <table className="w-full text-sm">
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
              </>
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
