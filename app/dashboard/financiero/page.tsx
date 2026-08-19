"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import ReceiptUploader, { ParsedReceiptData } from "@/components/ui/ReceiptUploader"

interface PaymentRow { 
  id: string
  amount: number
  date: string
  student_id: string
  method?: string
  notes?: string | null
  created_at?: string
  student_name?: string
  receipt_url?: string | null
  transfer_id?: string | null
}

interface StudentRow { id: string; status: string; lifetime_value: number; created_at: string; lead_source: string; name: string }
interface UnpaidStudent { id: string; name: string; email: string; modalidad: string }
interface PaymentModal { 
  studentId: string
  studentName: string
  amount: string
  method: string
  date?: string
  notes: string
  receipt_url?: string | null
  transfer_id?: string | null
}

export default function FinancieroPage() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<Set<string>>(new Set())
  const [confirmDeletePayments, setConfirmDeletePayments] = useState<PaymentRow[] | null>(null)
  const [deletingPayments, setDeletingPayments] = useState(false)
  const [students, setStudents] = useState<StudentRow[]>([])
  const [unpaidStudents, setUnpaidStudents] = useState<UnpaidStudent[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<PaymentModal | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const teacherId = profile?.teacherProfileId

  useEffect(() => {
    if (teacherId) loadAll(teacherId)
  }, [teacherId])

  async function loadAll(teacherId: string) {
    setLoading(true)
    const now = new Date()
    const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`

    let { data: py, error: pyErr } = await supabase
      .from("Payment")
      .select("id, amount, date, method, notes, created_at, receipt_url, transfer_id, student_id, StudentProfile ( User ( name ) )")
      .eq("teacher_id", teacherId)
      .order("date", { ascending: false })

    if (pyErr) {
      console.warn("[Financiero] Fallback Payment query:", pyErr.message)
      const fallback = await supabase
        .from("Payment")
        .select("id, amount, date, method, notes, created_at, student_id, StudentProfile ( User ( name ) )")
        .eq("teacher_id", teacherId)
        .order("date", { ascending: false })
      py = (fallback.data || []).map((p: any) => ({ ...p, receipt_url: null, transfer_id: null }))
    }

    const [{ data: sp }, { data: activeStudents }] = await Promise.all([
      supabase.from("StudentProfile").select("id, status, lifetime_value, created_at, lead_source, User ( name )").eq("teacher_id", teacherId),
      supabase.from("StudentProfile")
        .select("id, modalidad, User ( name, email )")
        .eq("teacher_id", teacherId)
        .eq("status", "ACTIVE"),
    ])

    if (py) {
      setPayments(py.map((p: any) => {
        const sp = p.StudentProfile
        const u = Array.isArray(sp?.User) ? sp.User[0] : sp?.User
        return {
          id: p.id,
          amount: Number(p.amount ?? 0),
          date: p.date,
          method: p.method,
          notes: p.notes,
          created_at: p.created_at || p.date,
          student_id: p.student_id,
          student_name: u?.name ?? "Alumno",
          receipt_url: p.receipt_url,
          transfer_id: p.transfer_id,
        }
      }))
    }

    if (sp) setStudents(sp.map((s: any) => ({
      id: s.id, status: s.status ?? "PROSPECT", lifetime_value: s.lifetime_value ?? 0,
      created_at: s.created_at, lead_source: s.lead_source ?? "", name: s.User?.name ?? "—",
    })))

    // Alumnos activos sin pago registrado este mes
    if (activeStudents && py) {
      const paidThisMonth = new Set(
        py.filter((p: any) => p.date >= startOfMonth).map((p: any) => p.student_id)
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

  function toggleSelectPayment(id: string) {
    setSelectedPaymentIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAllPayments() {
    if (selectedPaymentIds.size === payments.length) {
      setSelectedPaymentIds(new Set())
    } else {
      setSelectedPaymentIds(new Set(payments.map(p => p.id)))
    }
  }

  async function handleDeletePayments(paymentsToDelete: PaymentRow[]) {
    if (paymentsToDelete.length === 0) return
    setDeletingPayments(true)
    try {
      const ids = paymentsToDelete.map(p => p.id)
      const { error } = await supabase.from("Payment").delete().in("id", ids)
      if (error) throw error

      toast.success(ids.length === 1 ? "Cobro eliminado exitosamente" : `${ids.length} cobros eliminados exitosamente`)
      setPayments(prev => prev.filter(p => !ids.includes(p.id)))
      setSelectedPaymentIds(new Set())
      setConfirmDeletePayments(null)

      if (profile?.teacherProfileId) loadAll(profile.teacherProfileId)
    } catch (err: any) {
      console.error("Error deleting payments:", err)
      toast.error("Error al eliminar los cobros.")
    } finally {
      setDeletingPayments(false)
    }
  }

  async function handleRegisterPayment() {
    if (!modal || !profile?.teacherProfileId) return
    if (!modal.amount || isNaN(Number(modal.amount))) {
      setSaveError("Ingresa un monto válido")
      return
    }
    setSaving(true)
    setSaveError("")

    const paymentDate = modal.receipt_url ? (modal.notes?.match(/\d{4}-\d{2}-\d{2}/)?.[0] || new Date().toISOString().split("T")[0]) : new Date().toISOString().split("T")[0]
    const { error } = await supabase.from("Payment").insert({
      student_id: modal.studentId,
      teacher_id: profile.teacherProfileId,
      amount: Number(modal.amount),
      method: modal.method || "TRANSFER",
      date: paymentDate,
      notes: modal.notes || null,
      receipt_url: modal.receipt_url || null,
      transfer_id: modal.transfer_id || null,
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
              <ReceiptUploader
                currentReceiptUrl={modal.receipt_url}
                onParsedData={(data: ParsedReceiptData) => {
                  setModal(m => {
                    if (!m) return null
                    return {
                      ...m,
                      amount: data.amount != null ? String(data.amount) : m.amount,
                      date: data.date ? data.date : m.date,
                      notes: data.notes ? (m.notes ? `${m.notes} · ${data.notes}` : data.notes) : m.notes,
                      receipt_url: data.receiptUrl !== undefined ? data.receiptUrl : m.receipt_url,
                      transfer_id: data.transferId !== undefined ? data.transferId : m.transfer_id,
                    }
                  })
                }}
              />

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

      {/* ── Historial de Cobros Registrados ── */}
      <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden space-y-0">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/40">
          <div>
            <h3 className="font-black text-neutral-900 flex items-center gap-2">
              <span className="w-2 h-5 bg-emerald-500 rounded-full" />
              Historial de Cobros Registrados
            </h3>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">
              Todos los cobros recibidos e ingresados en el sistema
            </p>
          </div>
          {payments.length > 0 && (
            <span className="text-xs text-neutral-400 font-bold">
              {payments.length} cobro{payments.length > 1 ? "s" : ""} registrado{payments.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {selectedPaymentIds.size > 0 && (
          <div className="bg-red-50 border-b border-red-100 p-4 flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-red-900 text-xs font-bold">
              <span>⚠️</span>
              <span>{selectedPaymentIds.size} cobro{selectedPaymentIds.size > 1 ? "s" : ""} seleccionado{selectedPaymentIds.size > 1 ? "s" : ""}</span>
            </div>
            <button
              onClick={() => setConfirmDeletePayments(payments.filter(p => selectedPaymentIds.has(p.id)))}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all shadow-sm flex items-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Seleccionado{selectedPaymentIds.size > 1 ? "s" : ""} ({selectedPaymentIds.size})</span>
            </button>
          </div>
        )}

        {payments.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl opacity-30 block mb-3">💰</span>
            <p className="text-neutral-500 font-bold">Sin cobros registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm min-w-[600px] md:min-w-0">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50 text-[10px] font-bold text-neutral-400 uppercase tracking-widest text-left">
                  <th className="px-4 py-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={payments.length > 0 && selectedPaymentIds.size === payments.length}
                      onChange={toggleSelectAllPayments}
                      className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-3.5">Alumno</th>
                  <th className="px-6 py-3.5">Monto</th>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5">Método</th>
                  <th className="px-6 py-3.5">Notas</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {payments.map(p => {
                  const isSelected = selectedPaymentIds.has(p.id)
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-neutral-50/50 transition-colors ${isSelected ? "bg-red-50/40" : ""}`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectPayment(p.id)}
                          className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-neutral-900 whitespace-nowrap">
                        {p.student_name}
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600 whitespace-nowrap">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-6 py-4 text-neutral-500 text-xs whitespace-nowrap">
                        {p.date}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-neutral-600 whitespace-nowrap">
                        {p.method === "TRANSFER" ? "💸 Transferencia" : p.method === "CASH" ? "💵 Efectivo" : p.method === "CARD" ? "💳 Tarjeta" : p.method === "MERCADOPAGO" ? "💳 MercadoPago" : p.method ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-500 max-w-xs">
                        <div className="space-y-1">
                          <div>{p.notes || "—"}</div>
                          {p.receipt_url && (
                            <div>
                              <a
                                href={p.receipt_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-100 text-[10px] font-bold transition-all"
                              >
                                🧾 Ver Comprobante
                              </a>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => setConfirmDeletePayments([p])}
                          title="Eliminar Cobro"
                          className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all inline-flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CONFIRMATION DELETE MODAL */}
      {confirmDeletePayments && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-neutral-100 space-y-6 relative animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100 mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-neutral-900 tracking-tight">
                {confirmDeletePayments.length === 1 ? "¿Eliminar este cobro?" : `¿Eliminar ${confirmDeletePayments.length} cobros seleccionados?`}
              </h3>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">
                Esta acción eliminará el registro financiero de forma permanente.
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 space-y-2 text-xs font-semibold text-neutral-700 max-h-40 overflow-y-auto scrollbar-thin">
              {confirmDeletePayments.map(p => (
                <div key={p.id} className="flex justify-between items-center py-1 border-b border-neutral-100 last:border-0">
                  <span>{p.student_name} ({p.date})</span>
                  <span className="font-black text-emerald-600">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDeletePayments(null)}
                disabled={deletingPayments}
                className="flex-1 py-3 bg-neutral-100 text-neutral-700 rounded-2xl text-xs font-bold hover:bg-neutral-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeletePayments(confirmDeletePayments)}
                disabled={deletingPayments}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deletingPayments ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{deletingPayments ? "Eliminando..." : "Sí, Eliminar"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
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
