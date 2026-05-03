"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatCurrency } from "@/lib/utils"

interface PaymentRow { amount: number; date: string; student_id: string }
interface StudentRow { id: string; status: string; lifetime_value: number; created_at: string; lead_source: string; name: string }
interface UnpaidStudent { id: string; name: string; email: string; modalidad: string }
interface PaymentModal { studentId: string; studentName: string; amount: string; method: string; notes: string }

export default function FinancieroPage() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [students, setStudents] = useState<StudentRow[]>([])
  const [unpaidStudents, setUnpaidStudents] = useState<UnpaidStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<PaymentModal | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  useEffect(() => {
    if (profile?.teacherProfileId) loadAll(profile.teacherProfileId)
  }, [profile?.teacherProfileId])

  async function loadAll(teacherId: string) {
    const now = new Date()
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`

    const [{ data: py }, { data: sp }, { data: activeStudents }] = await Promise.all([
      supabase.from("Payment").select("amount, date, student_id").eq("teacher_id", teacherId).order("date", { ascending: false }),
      supabase.from("StudentProfile").select("id, status, lifetime_value, created_at, lead_source, User ( name )").eq("teacher_id", teacherId),
      supabase.from("StudentProfile")
        .select("id, modalidad, User ( name, email )")
        .eq("teacher_id", teacherId)
        .eq("status", "ACTIVE"),
    ])

    if (py) setPayments(py)
    if (sp) setStudents(sp.map((s: any) => ({
      id: s.id, status: s.status ?? "PROSPECT", lifetime_value: s.lifetime_value ?? 0,
      created_at: s.created_at, lead_source: s.lead_source ?? "", name: s.User?.name ?? "—",
    })))

    // Alumnos activos sin pago registrado este mes
    if (activeStudents && py) {
      const paidThisMonth = new Set(
        py.filter(p => p.date >= startOfMonth).map(p => p.student_id)
      )
      setUnpaidStudents(
        activeStudents
          .filter((s: any) => !paidThisMonth.has(s.id))
          .map((s: any) => ({
            id: s.id,
            name: s.User?.name ?? "—",
            email: s.User?.email ?? "—",
            modalidad: s.modalidad ?? "online",
          }))
      )
    }

    setLoading(false)
  }

  async function handleRegisterPayment() {
    if (!modal || !profile?.teacherProfileId) return
    if (!modal.amount || isNaN(Number(modal.amount))) {
      setSaveError("Ingresa un monto válido")
      return
    }
    setSaving(true)
    setSaveError("")

    const today = new Date().toISOString().split("T")[0]
    const { error } = await supabase.from("Payment").insert({
      student_id: modal.studentId,
      teacher_id: profile.teacherProfileId,
      amount: Number(modal.amount),
      method: modal.method || "TRANSFER",
      date: today,
      notes: modal.notes || null,
    })

    if (error) {
      setSaveError("Error al guardar el pago.")
      setSaving(false)
      return
    }

    setModal(null)
    setSaving(false)
    await loadAll(profile.teacherProfileId)
  }

  // ── Métricas ──
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split("T")[0]
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split("T")[0]

  const totalRevenue = payments.reduce((s, p) => s + p.amount, 0)
  const thisMonthPayments = payments.filter(p => p.date >= startOfMonth)
  const lastMonthPayments = payments.filter(p => p.date >= startOfLastMonth && p.date <= endOfLastMonth)
  const monthlyRevenue = thisMonthPayments.reduce((s, p) => s + p.amount, 0)
  const lastMonthRevenue = lastMonthPayments.reduce((s, p) => s + p.amount, 0)
  const revenueGrowth = lastMonthRevenue > 0 ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0

  const activeStudentsList = students.filter(s => s.status === "ACTIVE")
  const inactiveStudents = students.filter(s => s.status === "INACTIVE")
  const totalStudents = students.length

  const avgLTV = totalStudents > 0 ? Math.round(students.reduce((s, st) => s + st.lifetime_value, 0) / totalStudents) : 0
  const avgTicket = payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0
  const conversionRate = totalStudents > 0 ? Math.round((activeStudentsList.length / totalStudents) * 100) : 0
  const churnRate = totalStudents > 0 ? Math.round((inactiveStudents.length / totalStudents) * 100) : 0
  const avgDuration = activeStudentsList.length > 0
    ? Math.round(activeStudentsList.reduce((s, st) => s + (Date.now() - new Date(st.created_at).getTime()) / (1000 * 60 * 60 * 24), 0) / activeStudentsList.length)
    : 0
  const revenuePerStudent = activeStudentsList.length > 0 ? Math.round(monthlyRevenue / activeStudentsList.length) : 0

  const leadSourceCounts: Record<string, number> = {}
  students.forEach(s => { if (s.lead_source) leadSourceCounts[s.lead_source] = (leadSourceCounts[s.lead_source] || 0) + 1 })
  const topSources = Object.entries(leadSourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const monthlyData: { month: string; total: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStr = d.toLocaleDateString("es-CL", { month: "short" })
    const start = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    const endD = new Date(d.getFullYear(), d.getMonth() + 1, 0)
    const end = `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, "0")}-${String(endD.getDate()).padStart(2, "0")}`
    const total = payments.filter(p => p.date >= start && p.date <= end).reduce((s, p) => s + p.amount, 0)
    monthlyData.push({ month: monthStr, total })
  }
  const maxMonthly = Math.max(...monthlyData.map(m => m.total), 1)
  const currentMonthLabel = now.toLocaleDateString("es-CL", { month: "long", year: "numeric" })

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)}</div>

  return (
    <div className="space-y-8">

      {/* ── Payment Modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-neutral-900">Registrar Pago</h2>
              <p className="text-neutral-500 text-sm font-medium mt-1">
                Alumno: <strong className="text-neutral-900">{modal.studentName}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2">Monto *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                  <input
                    type="number"
                    placeholder="90000"
                    value={modal.amount}
                    onChange={e => setModal(m => m ? { ...m, amount: e.target.value } : null)}
                    className="w-full pl-8 pr-4 py-3 border border-neutral-200 rounded-2xl font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2">Método de Pago</label>
                <select
                  value={modal.method}
                  onChange={e => setModal(m => m ? { ...m, method: e.target.value } : null)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-2xl font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                >
                  <option value="TRANSFER">Transferencia</option>
                  <option value="CASH">Efectivo</option>
                  <option value="CARD">Tarjeta</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block mb-2">Notas (opcional)</label>
                <input
                  type="text"
                  placeholder="Ej: Pago mensualidad Mayo"
                  value={modal.notes}
                  onChange={e => setModal(m => m ? { ...m, notes: e.target.value } : null)}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-2xl font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
                />
              </div>

              {saveError && (
                <p className="text-red-600 text-sm font-bold bg-red-50 px-4 py-3 rounded-2xl">⚠️ {saveError}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setModal(null); setSaveError("") }}
                className="flex-1 px-4 py-3 bg-neutral-100 text-neutral-600 rounded-2xl text-sm font-black hover:bg-neutral-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRegisterPayment}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "✓"}
                {saving ? "Guardando..." : "Marcar como Pagado"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Dashboard Financiero</h1>
          <p className="text-neutral-500 font-medium mt-1">Métricas estratégicas de tu escuela</p>
        </div>
        <Link href="/dashboard/pagos/nuevo" className="px-6 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg">
          + Registrar Pago
        </Link>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Ingresos del Mes" value={formatCurrency(monthlyRevenue)} change={revenueGrowth} icon="💰" accent="emerald" />
        <KPICard title="Ingresos Totales" value={formatCurrency(totalRevenue)} icon="🏦" accent="violet" />
        <KPICard title="Ticket Promedio" value={formatCurrency(avgTicket)} icon="🎫" accent="sky" />
        <KPICard title="Revenue / Alumno" value={formatCurrency(revenuePerStudent)} subtitle="activos este mes" icon="📊" accent="amber" />
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="LTV Promedio" value={formatCurrency(avgLTV)} subtitle="lifetime value" icon="💎" accent="violet" />
        <KPICard title="Tasa de Conversión" value={`${conversionRate}%`} subtitle={`${activeStudentsList.length}/${totalStudents}`} icon="📈" accent="emerald" />
        <KPICard title="Tasa de Churn" value={`${churnRate}%`} subtitle={`${inactiveStudents.length} inactivos`} icon="📉" accent="red" />
        <KPICard title="Duración Promedio" value={`${avgDuration} días`} subtitle="alumnos activos" icon="⏱️" accent="sky" />
      </div>

      {/* Chart + Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-6">
          <h3 className="font-black text-neutral-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-5 bg-emerald-500 rounded-full" /> Ingresos Últimos 6 Meses
          </h3>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-neutral-900">{formatCurrency(m.total)}</span>
                <div className="w-full bg-emerald-100 rounded-t-xl relative" style={{ height: `${Math.max((m.total / maxMonthly) * 100, 4)}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-xl" />
                </div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-neutral-100 p-6">
          <h3 className="font-black text-neutral-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-5 bg-violet-500 rounded-full" /> Fuentes de Leads
          </h3>
          {topSources.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-8">Sin datos de fuentes</p>
          ) : (
            <div className="space-y-4">
              {topSources.map(([source, count]) => {
                const pct = Math.round((count / totalStudents) * 100)
                return (
                  <div key={source}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-neutral-700">{source}</span>
                      <span className="text-sm font-black text-neutral-900">{count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Unpaid Students Section ── */}
      <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-red-50/40">
          <div>
            <h3 className="font-black text-neutral-900 flex items-center gap-2">
              <span className="w-2 h-5 bg-red-500 rounded-full" />
              Sin Pago — {currentMonthLabel}
            </h3>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              {unpaidStudents.length > 0
                ? `${unpaidStudents.length} alumno${unpaidStudents.length > 1 ? "s activos" : " activo"} sin pago registrado`
                : "¡Todos los alumnos activos tienen pago registrado! 🎉"}
            </p>
          </div>
          {unpaidStudents.length > 0 && (
            <span className="bg-red-100 text-red-700 text-xs font-black px-3 py-1.5 rounded-full">
              {unpaidStudents.length} pendiente{unpaidStudents.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {unpaidStudents.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl block mb-3">✅</span>
            <p className="text-neutral-500 font-bold">Todo al día este mes</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {unpaidStudents.map(s => (
              <div key={s.id} className="px-6 py-4 flex items-center gap-4 hover:bg-neutral-50/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center text-sm font-black text-red-500 flex-shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/dashboard/alumnos/detalles?id=${s.id}`}
                    className="font-bold text-neutral-900 hover:text-violet-600 transition-colors block truncate text-sm"
                  >
                    {s.name}
                  </Link>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-neutral-400 truncate">{s.email}</span>
                    <span className="text-neutral-200 text-xs">·</span>
                    <span className="text-xs text-neutral-400">{s.modalidad === "online" ? "📹 Virtual" : "🏠 Presencial"}</span>
                  </div>
                </div>

                <button
                  onClick={() => setModal({
                    studentId: s.id,
                    studentName: s.name,
                    amount: "",
                    method: "TRANSFER",
                    notes: "",
                  })}
                  className="flex-shrink-0 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all"
                >
                  💳 Registrar Pago
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KPICard({ title, value, subtitle, change, icon, accent }: {
  title: string; value: string; subtitle?: string; change?: number; icon: string
  accent: "emerald" | "violet" | "sky" | "amber" | "red"
}) {
  const colors = {
    emerald: "from-emerald-500/10 to-emerald-500/5 border-emerald-200",
    violet: "from-violet-500/10 to-violet-500/5 border-violet-200",
    sky: "from-sky-500/10 to-sky-500/5 border-sky-200",
    amber: "from-amber-500/10 to-amber-500/5 border-amber-200",
    red: "from-red-500/10 to-red-500/5 border-red-200",
  }
  return (
    <div className={`bg-gradient-to-br ${colors[accent]} rounded-2xl p-5 border`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{icon}</span>
        {change !== undefined && (
          <span className={`text-xs font-black ${change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{title}</p>
      <p className="text-2xl font-black text-neutral-900 mt-1">{value}</p>
      {subtitle && <p className="text-[10px] text-neutral-400 font-bold uppercase mt-0.5">{subtitle}</p>}
    </div>
  )
}
