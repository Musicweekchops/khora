import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import PaymentForm from "@/components/payments/PaymentForm"

export default async function NuevoPagoPage({
  searchParams
}: {
  searchParams: Promise<{ studentId?: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEACHER") {
    redirect("/login")
  }

  const params = await searchParams
  const preselectedStudentId = params.studentId

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <PaymentForm preselectedStudentId={preselectedStudentId} />
        </div>
      </main>
    </div>
  )
}
