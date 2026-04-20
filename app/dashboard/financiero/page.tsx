"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatCurrency } from "@/lib/utils"

interface PaymentRow {
  id: string; amount: number; method: string; date: string; student_name: string
}

export default function FinancieroPage() {
  const { profile } = useAuth()
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.teacherProfileId) loadPayments(profile.teacherProfileId)
  }, [profile?.teacherProfileId])

  async function loadPayments(teacherId: string) {
    const { data } = await supabase
      .from("Payment")
      .select("id, amount, method, date, StudentProfile ( User ( name ) )")
      .eq("teacher_id", teacherId)
      .order("date", { ascending: false })
      .limit(50)

    if (data) {
      setPayments(data.map((p: any) => ({
        id: p.id, amount: p.amount, method: p.method ?? "", date: p.date,
        student_name: p.StudentProfile?.User?.name ?? "—",
      })))
    }
    setLoading(false)
  }

  const total = payments.reduce((sum, p) => sum + p.amount, 0)

  const methodLabels: Record<string, string> = {
    TRANSFER: "Transferencia", CASH: "Efectivo", CARD: "Tarjeta", OTHER: "Otro",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Financiero</h1>
          <p className="text-neutral-500 font-medium mt-1">Total acumulado: {formatCurrency(total)}</p>
        </div>
        <Link href="/dashboard/pagos/nuevo" className="px-6 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-lg">
          + Registrar Pago
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-200 rounded-2xl p-6 border">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Total Registrado</p>
          <p className="text-3xl font-black text-emerald-700">{formatCurrency(total)}</p>
        </div>
        <div className="bg-gradient-to-br from-sky-500/10 to-sky-500/5 border-sky-200 rounded-2xl p-6 border">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest mb-1">Pagos Registrados</p>
          <p className="text-3xl font-black text-sky-700">{payments.length}</p>
        </div>
        <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-200 rounded-2xl p-6 border">
          <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-1">Promedio por Pago</p>
          <p className="text-3xl font-black text-violet-700">{formatCurrency(payments.length > 0 ? total / payments.length : 0)}</p>
        </div>
      </div>

      {/* Payment List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse h-20" />)}</div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100">
          <span className="text-5xl mb-4 block opacity-30">💰</span>
          <p className="text-neutral-900 font-bold text-lg">Sin pagos registrados</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50">
                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Alumno</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Monto</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Método</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-neutral-400 uppercase tracking-widest">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-neutral-900">{p.student_name}</td>
                  <td className="px-6 py-4 font-black text-emerald-600">{formatCurrency(p.amount)}</td>
                  <td className="px-6 py-4 text-neutral-500">{methodLabels[p.method] ?? p.method}</td>
                  <td className="px-6 py-4 text-neutral-500">{new Date(p.date + "T12:00").toLocaleDateString("es-CL")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
