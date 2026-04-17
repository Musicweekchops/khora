"use client"

import { useAuth } from "@/lib/context/AuthContext"
import FinancialDashboard from "@/components/financial/FinancialDashboard"

export default function FinancieroPage() {
  const { profile, loading } = useAuth()

  if (loading) return null
  if (!profile || profile.role !== "TEACHER") return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">
            Control Financiero
          </h1>
          <p className="text-sm text-neutral-500 mt-1 font-medium">
            Gestión de ingresos, pagos y métricas de rentabilidad
          </p>
        </div>
      </div>

      <FinancialDashboard />
    </div>
  )
}
