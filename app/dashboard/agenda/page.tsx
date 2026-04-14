import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import WeeklyCalendar from '@/components/dashboard/Calendar/WeeklyCalendar'

export default async function AgendaPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'TEACHER') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                📅 Agenda Semanal
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Vista de calendario con todas tus clases programadas
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-300 to-yellow-500" />
            <span className="text-gray-700">Clase de Prueba</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-blue-600" />
            <span className="text-gray-700">Clase Individual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400 to-green-600" />
            <span className="text-gray-700">Plan Mensual</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-red-400 to-red-600" />
            <span className="text-gray-700">🔴 Booking Público Pendiente</span>
          </div>
        </div>

        {/* Calendar */}
        <WeeklyCalendar />
      </main>
    </div>
  )
}
