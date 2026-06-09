"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

interface PaymentRow {
  id: string
  student_name: string
  amount: number
  method: string
  date: string
  notes: string | null
  payment_type: string | null
  created_at: string
}

interface StudentOption {
  id: string
  name: string
}

interface Props {
  academyId: string
}

export default function AcademyPayments({ academyId }: Props) {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [students, setStudents] = useState<StudentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState({
    student_id: "",
    amount: "",
    method: "TRANSFER",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    payment_type: "MONTHLY"
  })

  useEffect(() => {
    if (academyId) {
      loadData()
    }
  }, [academyId])

  async function loadData() {
    try {
      setLoading(true)
      // Cargar alumnos de la academia
      const { data: stData } = await supabase
        .from("StudentProfile")
        .select("id, User ( name )")
        .eq("academy_id", academyId)

      const stOpts = (stData ?? []).map((s: any) => {
        const u = Array.isArray(s.User) ? s.User[0] : s.User
        return {
          id: s.id,
          name: u?.name ?? "—",
        }
      })
      setStudents(stOpts)

      // Cargar pagos
      const { data: payData, error } = await supabase
        .from("Payment")
        .select(`
          id, amount, method, date, notes, payment_type, created_at,
          StudentProfile (
            User ( name )
          )
        `)
        .eq("academy_id", academyId)
        .order("date", { ascending: false })

      if (error) throw error

      const rows: PaymentRow[] = (payData ?? []).map((p: any) => {
        const sp = p.StudentProfile
        const u = Array.isArray(sp?.User) ? sp.User[0] : sp?.User
        return {
          id: p.id,
          student_name: u?.name ?? "Sin asignar",
          amount: Number(p.amount ?? 0),
          method: p.method,
          date: p.date,
          notes: p.notes,
          payment_type: p.payment_type,
          created_at: p.created_at,
        }
      })
      setPayments(rows)
    } catch (err) {
      console.error("Error loading payments:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.student_id || !form.amount) return
    setSaving(true)

    try {
      const { error } = await supabase.from("Payment").insert({
        academy_id: academyId,
        student_id: form.student_id,
        amount: parseFloat(form.amount),
        method: form.method,
        date: form.date,
        notes: form.notes.trim() || null,
        payment_type: form.payment_type
      })

      if (error) throw error

      toast.success("Pago registrado con éxito")
      setShowForm(false)
      setForm({
        student_id: "",
        amount: "",
        method: "TRANSFER",
        date: new Date().toISOString().slice(0, 10),
        notes: "",
        payment_type: "MONTHLY"
      })
      loadData()
    } catch (err: any) {
      console.error("Error creating payment:", err)
      toast.error(err.message ?? "Error al registrar el pago")
    } finally {
      setSaving(false)
    }
  }

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0)
  const thisMonth = new Date().toISOString().slice(0, 7)
  const revenueThisMonth = payments
    .filter(p => p.date.startsWith(thisMonth))
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">Ingresos del Mes</p>
          <p className="text-2xl font-black text-emerald-600 tracking-tight">{formatCurrency(revenueThisMonth)}</p>
        </div>
        <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm">
          <p className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-1">Ingresos Totales</p>
          <p className="text-2xl font-black text-neutral-900 tracking-tight">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-neutral-900">Historial de Pagos</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Registrar Pago
        </button>
      </div>

      {/* Manual payment form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-neutral-100 p-6 shadow-sm">
          <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider mb-4">Registrar Pago Manual</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Alumno</label>
                <select
                  required value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
                >
                  <option value="" disabled>Seleccionar...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Monto ($)</label>
                <input
                  type="number" required min="0" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Monto pagado"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Método de Pago</label>
                <select
                  value={form.method} onChange={e => setForm(p => ({ ...p, method: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="TRANSFER">🔗 Transferencia Bancaria</option>
                  <option value="CASH">💵 Efectivo</option>
                  <option value="MERCADOPAGO">💳 MercadoPago</option>
                  <option value="OTHER">⚙️ Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Fecha</label>
                <input
                  type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full text-sm px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Tipo de Pago</label>
                <select
                  value={form.payment_type} onChange={e => setForm(p => ({ ...p, payment_type: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="MONTHLY">Mensualidad</option>
                  <option value="SINGLE">Clase Única</option>
                  <option value="TRIAL">Clase de Prueba</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Notas / Comentarios</label>
              <input
                type="text" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className="w-full text-sm px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none"
                placeholder="Ej: Transferencia del mes de Junio"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-lg hover:bg-neutral-200"
              >
                Cancelar
              </button>
              <button
                type="submit" disabled={saving}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg"
              >
                {saving ? "Procesando..." : "Registrar Pago"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History table */}
      <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center animate-pulse space-y-2">
            <div className="h-6 w-full bg-neutral-100 rounded" />
            <div className="h-6 w-full bg-neutral-100 rounded" />
          </div>
        ) : payments.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm font-medium text-neutral-500">Aún no se han registrado pagos para esta academia.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Alumno</th>
                  <th className="px-6 py-3.5">Monto</th>
                  <th className="px-6 py-3.5">Fecha</th>
                  <th className="px-6 py-3.5">Método</th>
                  <th className="px-6 py-3.5">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-neutral-50/40 transition-colors text-sm">
                    <td className="px-6 py-4 font-semibold text-neutral-900">{p.student_name}</td>
                    <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(p.amount)}</td>
                    <td className="px-6 py-4 text-neutral-500">{p.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-700">
                        {p.method === "TRANSFER" ? "Transferencia" : p.method === "CASH" ? "Efectivo" : p.method === "MERCADOPAGO" ? "MercadoPago" : "Otro"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-400 text-xs truncate max-w-xs">{p.notes ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
