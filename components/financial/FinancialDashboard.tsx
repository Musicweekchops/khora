"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface FinancialSummary {
  monthlyIncome: number
  yearlyIncome: number
  totalPending: number
  totalOverdue: number
  activeStudentsCount: number
  studentsWithDebtCount: number
  studentsUpToDateCount: number
  pendingPaymentsCount: number
  overduePaymentsCount: number
  recentPayments: Array<{
    id: string
    amount: number
    description: string
    method: string
    paidAt: string
    studentName: string
    studentId: string
  }>
  studentsWithDebt: Array<{
    id: string
    name: string
    overduePayments: Array<{
      id: string
      amount: number
      description: string
      dueDate: string
      daysOverdue: number
    }>
  }>
  monthlyTrend: Array<{
    month: string
    income: number
  }>
}

export default function FinancialDashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      const response = await fetch("/api/financial/dashboard")
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error("Error al cargar resumen financiero:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Cargando datos financieros...</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Error al cargar datos financieros</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Ingresos del Mes"
          value={`$${summary.monthlyIncome.toLocaleString()}`}
          icon="💰"
          color="emerald"
          subtitle="Recaudación actual"
        />
        <MetricCard
          title="Pagos Pendientes"
          value={`$${summary.totalPending.toLocaleString()}`}
          icon="⏳"
          color="amber"
          subtitle={`${summary.pendingPaymentsCount} transacciones`}
        />
        <MetricCard
          title="Pagos Vencidos"
          value={`$${summary.totalOverdue.toLocaleString()}`}
          icon="⚠️"
          color="destructive"
          subtitle={`${summary.overduePaymentsCount} alumnos en mora`}
        />
        <MetricCard
          title="Alumnos Activos"
          value={summary.activeStudentsCount.toString()}
          icon="👥"
          color="primary"
          subtitle={`${summary.studentsUpToDateCount} al día`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lado Izquierdo: Deudas y Recientes */}
        <div className="lg:col-span-2 space-y-8">
          {/* Alumnos con Deuda */}
          {summary.studentsWithDebt.length > 0 && (
            <div className="bg-destructive/5 border border-destructive/20 rounded-3xl overflow-hidden">
              <div className="p-6 bg-destructive/10 border-b border-destructive/10 flex items-center justify-between">
                <h2 className="text-destructive font-black uppercase tracking-widest text-sm flex items-center gap-2">
                  <span className="animate-pulse">⚠️</span> Alumnos con Pagos Pendientes
                </h2>
                <span className="px-3 py-1 bg-destructive text-white text-[10px] font-black rounded-full">
                  {summary.studentsWithDebt.length} ALERTAS
                </span>
              </div>
              <div className="p-6 space-y-4">
                {summary.studentsWithDebt.map((student) => (
                  <div key={student.id} className="bg-white rounded-2xl p-6 border border-destructive/10 shadow-sm hover:shadow-md transition-all group">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <Link
                          href={`/dashboard/alumnos/${student.id}`}
                          className="text-lg font-black text-neutral-900 group-hover:text-destructive transition-colors"
                        >
                          {student.name}
                        </Link>
                        <div className="mt-2 space-y-1">
                          {student.overduePayments.map((payment) => (
                            <div key={payment.id} className="text-sm font-medium flex items-center gap-2">
                              <span className="text-neutral-500">{payment.description}:</span>
                              <span className="text-destructive font-bold">${payment.amount.toLocaleString()}</span>
                              <span className="text-[10px] font-black text-destructive/60 uppercase">
                                ({payment.daysOverdue}D de retraso)
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/pagos/nuevo?studentId=${student.id}`}
                        className="w-full sm:w-auto px-6 py-2.5 bg-destructive text-white rounded-xl font-bold text-sm hover:bg-destructive/90 transition-all text-center shadow-lg shadow-destructive/20"
                      >
                        Registrar Pago
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Últimos Pagos Recibidos */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-lg font-black text-neutral-900">Historial Reciente</h2>
              <span className="text-emerald-600 font-bold text-xs uppercase tracking-widest">Últimos {summary.recentPayments.length} depósitos</span>
            </div>
            {summary.recentPayments.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-neutral-400 font-medium">No se registran pagos este periodo</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-50">
                {summary.recentPayments.map((payment) => (
                  <div key={payment.id} className="p-6 hover:bg-neutral-50/50 transition-colors group">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">
                          🏦
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/alumnos/${payment.studentId}`}
                            className="font-black text-neutral-900 hover:text-primary transition-colors block"
                          >
                            {payment.studentName}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-bold text-neutral-400 uppercase tracking-tighter">
                              {payment.description}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-neutral-200" />
                            <span className="text-xs font-bold text-neutral-400">
                              {new Date(payment.paidAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-600">
                          +${payment.amount.toLocaleString()}
                        </p>
                        <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">
                          {payment.method}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Tendencia y Resumen */}
        <div className="space-y-8">
          {/* Tendencia Mensual */}
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm p-8">
            <h2 className="text-lg font-black text-neutral-900 mb-8 flex items-center gap-2">
              <span className="w-2 h-6 bg-primary rounded-full" />
              Tendencia 2024
            </h2>
            <div className="space-y-6">
              {summary.monthlyTrend.map((month, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-black text-neutral-400 uppercase tracking-widest">{month.month}</span>
                    <span className="text-xs font-black text-neutral-900">${month.income.toLocaleString()}</span>
                  </div>
                  <div className="bg-neutral-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-1000 group-hover:bg-primary-600 shadow-[0_0_10px_rgba(255,107,0,0.3)]"
                      style={{
                        width: `${summary.monthlyTrend.length > 0 ? (month.income / Math.max(...summary.monthlyTrend.map(m => m.income))) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen Anual */}
          <div className="bg-neutral-900 rounded-3xl p-8 text-white relative overflow-hidden group shadow-2xl shadow-neutral-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10">
              <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Total Recaudado</h2>
              <p className="text-4xl font-black tracking-tighter mb-2">
                ${summary.yearlyIncome.toLocaleString()}
              </p>
              <div className="pt-6 mt-6 border-t border-white/10 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-white/40 font-black uppercase tracking-wider">Promedio Mensual</p>
                  <p className="text-lg font-bold">${Math.round(summary.yearlyIncome / 12).toLocaleString()}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">
                  📈
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon, color, subtitle }: {
  title: string
  value: string
  icon: string
  color: 'emerald' | 'amber' | 'destructive' | 'primary'
  subtitle: string
}) {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    destructive: "text-destructive bg-destructive/5 border-destructive/10",
    primary: "text-primary bg-primary/5 border-primary/10"
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border transition-transform group-hover:scale-110 ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-3xl font-black text-neutral-900 tracking-tighter">{value}</p>
      <p className="text-[10px] text-neutral-500 font-bold mt-1 uppercase opacity-60 font-mono italic">{subtitle}</p>
    </div>
  )
}
