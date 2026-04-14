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
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ingresos del Mes</p>
              <p className="text-2xl font-bold text-gray-900">
                ${summary.monthlyIncome.toLocaleString()}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pagos Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                ${summary.totalPending.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.pendingPaymentsCount} pagos
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pagos Vencidos</p>
              <p className="text-2xl font-bold text-red-600">
                ${summary.totalOverdue.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.overduePaymentsCount} pagos
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Alumnos Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary.activeStudentsCount}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.studentsUpToDateCount} al día
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alumnos con Deuda */}
      {summary.studentsWithDebt.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-900 mb-4">
            ⚠️ Alumnos con Pagos Pendientes ({summary.studentsWithDebt.length})
          </h2>
          <div className="space-y-3">
            {summary.studentsWithDebt.map((student) => (
              <div key={student.id} className="bg-white rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/dashboard/alumnos/${student.id}`}
                      className="font-bold text-gray-900 hover:text-blue-600"
                    >
                      {student.name}
                    </Link>
                    <div className="mt-2 space-y-1">
                      {student.overduePayments.map((payment) => (
                        <div key={payment.id} className="text-sm">
                          <span className="text-gray-900">
                            ${payment.amount.toLocaleString()} - {payment.description}
                          </span>
                          <span className="text-red-600 ml-2">
                            ({payment.daysOverdue} {payment.daysOverdue === 1 ? "día" : "días"} de atraso)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link
                    href={`/dashboard/pagos/nuevo?studentId=${student.id}`}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
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
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          💳 Últimos Pagos Recibidos
        </h2>
        {summary.recentPayments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay pagos registrados</p>
        ) : (
          <div className="space-y-3">
            {summary.recentPayments.map((payment) => (
              <div key={payment.id} className="flex justify-between items-center py-3 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Link
                      href={`/dashboard/alumnos/${payment.studentId}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {payment.studentName}
                    </Link>
                    <span className="text-sm text-gray-500">
                      {payment.description}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>{payment.method}</span>
                    <span>{new Date(payment.paidAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-lg">
                    ${payment.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tendencia Mensual */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          📈 Ingresos por Mes
        </h2>
        <div className="space-y-3">
          {summary.monthlyTrend.map((month, idx) => (
            <div key={idx} className="flex items-center">
              <div className="w-24 text-sm text-gray-600">
                {month.month}
              </div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full flex items-center justify-end pr-2"
                    style={{
                      width: `${summary.monthlyTrend.length > 0 ? (month.income / Math.max(...summary.monthlyTrend.map(m => m.income))) * 100 : 0}%`
                    }}
                  >
                    <span className="text-white text-sm font-medium">
                      ${month.income.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resumen Anual */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
        <h2 className="text-2xl font-bold mb-2">Ingresos del Año</h2>
        <p className="text-5xl font-bold mb-2">
          ${summary.yearlyIncome.toLocaleString()}
        </p>
        <p className="text-blue-200">
          Promedio mensual: ${Math.round(summary.yearlyIncome / 12).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
