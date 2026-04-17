"use client"

import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import PaymentForm from "@/components/payments/PaymentForm"

export default function NuevoPagoPage() {
  const searchParams = useSearchParams()
  const { profile, loading } = useAuth()
  
  const studentId = searchParams.get("studentId") || undefined

  if (loading) return null
  if (!profile || profile.role !== "TEACHER") return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Registrar Pago Manual
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Registra pagos por transferencia, efectivo u otros métodos
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <PaymentForm preselectedStudentId={studentId} />
        </div>
      </main>
    </div>
  )
}
