"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"
import { Trash2 } from "lucide-react"
import ReceiptUploader, { ParsedReceiptData } from "@/components/ui/ReceiptUploader"

interface PaymentRow {
  id: string
  student_name: string
  amount: number
  method: string
  date: string
  notes: string | null
  payment_type: string | null
  created_at: string
  receipt_url?: string | null
  transfer_id?: string | null
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
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<Set<string>>(new Set())
  const [confirmDeletePayments, setConfirmDeletePayments] = useState<PaymentRow[] | null>(null)
  const [deletingPayments, setDeletingPayments] = useState(false)
  const [students, setStudents] = useState<StudentOption[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form state
  const [form, setForm] = useState<{
    student_id: string
    amount: string
    method: string
    date: string
    notes: string
    payment_type: string
    receipt_url?: string | null
    transfer_id?: string | null
  }>({
    student_id: "",
    amount: "",
    method: "TRANSFER",
    date: new Date().toISOString().slice(0, 10),
    notes: "",
    payment_type: "MONTHLY",
    receipt_url: null,
    transfer_id: null,
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
      let { data: payData, error } = await supabase
        .from("Payment")
        .select(`
          id, amount, method, date, notes, payment_type, created_at, receipt_url, transfer_id,
          StudentProfile (
            User ( name )
          )
        `)
        .eq("academy_id", academyId)
        .order("date", { ascending: false })

      if (error) {
        console.warn("[AcademyPayments] Fallback query:", error.message)
        const fallback = await supabase
          .from("Payment")
          .select(`
            id, amount, method, date, notes, payment_type, created_at,
            StudentProfile (
              User ( name )
            )
          `)
          .eq("academy_id", academyId)
          .order("date", { ascending: false })
        payData = (fallback.data || []).map((p: any) => ({ ...p, receipt_url: null, transfer_id: null }))
      }

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
          receipt_url: p.receipt_url,
          transfer_id: p.transfer_id,
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
        payment_type: form.payment_type,
        receipt_url: form.receipt_url || null,
        transfer_id: form.transfer_id || null,
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

      if (academyId) loadData()
    } catch (err: any) {
      console.error("Error deleting payments:", err)
      toast.error("Error al eliminar los cobros.")
    } finally {
      setDeletingPayments(false)
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
            <ReceiptUploader
              currentReceiptUrl={form.receipt_url}
              onParsedData={(data: ParsedReceiptData) => {
                setForm(p => ({
                  ...p,
                  amount: data.amount ? String(data.amount) : p.amount,
                  date: data.date ? data.date : p.date,
                  notes: data.notes ? (p.notes ? `${p.notes} · ${data.notes}` : data.notes) : p.notes,
                  receipt_url: data.receiptUrl !== undefined ? data.receiptUrl : p.receipt_url,
                  transfer_id: data.transferId !== undefined ? data.transferId : p.transfer_id,
                }))
              }}
            />

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
            <table className="w-full border-collapse text-left text-sm min-w-[550px]">
              <thead>
                <tr className="bg-neutral-50/50 border-b border-neutral-100 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
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
                    <tr key={p.id} className={`hover:bg-neutral-50/40 transition-colors text-sm ${isSelected ? "bg-red-50/40" : ""}`}>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectPayment(p.id)}
                          className="rounded border-neutral-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 font-semibold text-neutral-900 whitespace-nowrap">{p.student_name}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600 whitespace-nowrap">{formatCurrency(p.amount)}</td>
                      <td className="px-6 py-4 text-neutral-500 whitespace-nowrap">{p.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-neutral-100 text-neutral-700">
                          {p.method === "TRANSFER" ? "Transferencia" : p.method === "CASH" ? "Efectivo" : p.method === "MERCADOPAGO" ? "MercadoPago" : "Otro"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-400 text-xs max-w-xs">
                        <div className="space-y-1">
                          <div>{p.notes ?? "—"}</div>
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
