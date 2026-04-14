import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import WeeklyCalendar from '@/components/dashboard/calendar/WeeklyCalendar'

export default async function AgendaPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'TEACHER') {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Calendario Semanal
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Vista de calendario con todas tus clases programadas
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px] font-bold uppercase tracking-wider text-neutral-400 bg-white/50 backdrop-blur-sm p-3 rounded-lg border border-neutral-100 shadow-sm inline-flex">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Clase Individual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-400" />
          <span>Clase de Prueba</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Plan Mensual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive animate-pulse" />
          <span>Booking Pendiente</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden">
        <WeeklyCalendar />
      </div>
    </div>
  )
}
