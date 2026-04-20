"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatCurrency } from "@/lib/utils"

interface PaymentRow { amount: number; date: string; student_id: string }
interface StudentRow { id: string; status: string; lifetime_value: number; created_at: string; lead_source: string; name: string }

export default function FinancieroPage() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [students, setStudents] = useState<StudentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.teacherProfileId) loadAll(profile.teacherProfileId)
  }, [profile?.teacherProfileId])

  async function loadAll(teacherId: string) {
    const [{ data: py }, { data: sp }] = await Promise.all([
      supabase.from("Payment").select("amount, date, student_id").eq("teacher_id", teacherId).order("date", { ascending: false }),
      supabase.from("StudentProfile").select("id, status, lifetime_value, created_at, lead_source, User ( name )").eq("teacher_id", teacherId),
    ])

    if (py) setPayments(py)
    if (sp) setStudents(sp.map((s: any) => ({
      id: s.id, status: s.status ?? "PROSPECT", lifetime_value: s.lifetime_value ?? 0,
      created_at: s.created_at, lead_source: s.lead_source ?? "", name: s.User?.name ?? "—",
    })))
    setLoading(false)
  }

  // ── Métricas Estratégicas ──
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

  const activeStudents = students.filter(s => s.status === "ACTIVE")
  const inactiveStudents = students.filter(s => s.status === "INACTIVE")
  const totalStudents = students.length

  // LTV: promedio de lifetime_value de todos los estudiantes
  const avgLTV = totalStudents > 0 ? Math.round(students.reduce((s, st) => s + st.lifetime_value, 0) / totalStudents) : 0

  // Ticket Promedio
  const avgTicket = payments.length > 0 ? Math.round(totalRevenue / payments.length) : 0

  // Tasa de Conversión: activos / total
  const conversionRate = totalStudents > 0 ? Math.round((activeStudents.length / totalStudents) * 100) : 0

  // Churn Rate: inactivos / total
  const churnRate = totalStudents > 0 ? Math.round((inactiveStudents.length / totalStudents) * 100) : 0

  // Duración Promedio (días desde creación para alumnos activos)
  const avgDuration = activeStudents.length > 0
    ? Math.round(activeStudents.reduce((s, st) => s + (Date.now() - new Date(st.created_at).getTime()) / (1000 * 60 * 60 * 24), 0) / activeStudents.length)
    : 0

  // Revenue por alumno activo
  const revenuePerStudent = activeStudents.length > 0 ? Math.round(monthlyRevenue / activeStudents.length) : 0

  // Top fuentes de leads
  const leadSourceCounts: Record<string, number> = {}
  students.forEach(s => { if (s.lead_source) leadSourceCounts[s.lead_source] = (leadSourceCounts[s.lead_source] || 0) + 1 })
  const topSources = Object.entries(leadSourceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Pagos por mes (últimos 6 meses)
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

  // Top students by LTV
  const topStudents = [...students].sort((a, b) => b.lifetime_value - a.lifetime_value).slice(0, 5)

  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-white rounded-3xl animate-pulse" />)}</div>

  return (
    <div className="space-y-8">
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

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Ingresos del Mes" value={formatCurrency(monthlyRevenue)} change={revenueGrowth} icon="💰" accent="emerald" />
        <KPICard title="Ingresos Totales" value={formatCurrency(totalRevenue)} icon="🏦" accent="violet" />
        <KPICard title="Ticket Promedio" value={formatCurrency(avgTicket)} icon="🎫" accent="sky" />
        <KPICard title="Revenue / Alumno" value={formatCurrency(revenuePerStudent)} subtitle="activos este mes" icon="📊" accent="amber" />
      </div>

      {/* KPI Cards Row 2: Strategic */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="LTV Promedio" value={formatCurrency(avgLTV)} subtitle="lifetime value" icon="💎" accent="violet" />
        <KPICard title="Tasa de Conversión" value={`${conversionRate}%`} subtitle={`${activeStudents.length}/${totalStudents}`} icon="📈" accent="emerald" />
        <KPICard title="Tasa de Churn" value={`${churnRate}%`} subtitle={`${inactiveStudents.length} inactivos`} icon="📉" accent="red" />
        <KPICard title="Duración Promedio" value={`${avgDuration} días`} subtitle="alumnos activos" icon="⏱️" accent="sky" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-100 p-6">
          <h3 className="font-black text-neutral-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-5 bg-emerald-500 rounded-full" /> Ingresos Últimos 6 Meses
          </h3>
          <div className="flex items-end gap-3 h-48">
            {monthlyData.map(m => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold text-neutral-900">{formatCurrency(m.total)}</span>
                <div className="w-full bg-emerald-100 rounded-t-xl transition-all relative" style={{ height: `${Math.max((m.total / maxMonthly) * 100, 4)}%` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-xl" />
                </div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase">{m.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
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
                      <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Top Students Table */}
      <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <h3 className="font-black text-neutral-900 flex items-center gap-2">
            <span className="w-2 h-5 bg-amber-400 rounded-full" /> Top Alumnos por Valor
          </h3>
        </div>
        {topStudents.length === 0 ? (
          <div className="p-12 text-center"><p className="text-neutral-400">Sin datos</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="text-left px-6 py-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">#</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Alumno</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">Fuente</th>
                <th className="text-right px-6 py-3 text-xs font-bold text-neutral-400 uppercase tracking-widest">LTV</th>
              </tr>
            </thead>
            <tbody>
              {topStudents.map((s, i) => (
                <tr key={s.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="px-6 py-4 font-black text-neutral-300">{i + 1}</td>
                  <td className="px-6 py-4 font-bold text-neutral-900">
                    <Link href={`/dashboard/alumnos/detalles?id=${s.id}`} className="hover:text-violet-600 transition-colors">{s.name}</Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      s.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : s.status === "PROSPECT" ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"
                    }`}>{s.status}</span>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">{s.lead_source || "—"}</td>
                  <td className="px-6 py-4 text-right font-black text-emerald-600">{formatCurrency(s.lifetime_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
