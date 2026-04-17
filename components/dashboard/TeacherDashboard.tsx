"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import DashboardClasses from "@/components/dashboard/DashboardClasses"
import TeacherTaskBoard from "@/components/dashboard/tasks/TeacherTaskBoard"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"

interface TeacherDashboardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
    teacherProfileId?: string
  }
}

interface DashboardStats {
  activeStudents: number
  classesToday: number
  pendingBookings: number
  monthlyRevenue: number
  pendingPayments: number
  pendingPaymentsAmount: number
  currentMonth: string
}

export default function TeacherDashboard({ user }: TeacherDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user.teacherProfileId) {
      fetchStats(user.teacherProfileId)
    }
  }, [user.teacherProfileId])

  const fetchStats = async (teacherId: string) => {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

      // 1. Alumnos Activos (con clases este mes)
      const { data: activeClasses } = await supabase
        .from('Class')
        .select('studentId')
        .eq('teacherId', teacherId)
        .gte('date', startOfMonth)
        .not('studentId', 'is', null)

      const uniqueStudents = new Set(activeClasses?.map(c => c.studentId))
      const activeCount = uniqueStudents.size

      // 2. Clases Hoy
      const { count: classesTodayCount } = await supabase
        .from('Class')
        .select('id', { count: 'exact', head: true })
        .eq('teacherId', teacherId)
        .gte('date', startOfToday)
        .lt('date', endOfToday)
        .neq('status', 'CANCELLED')

      // 3. Bookings Pendientes (asumimos compartidos o filtrados por clase del profesor)
      const { count: pendingBookingsCount } = await supabase
        .from('Booking')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'CONFIRMED')

      // 4. Ingresos del Mes (Bookings confirmados)
      const { data: revenueData } = await supabase
        .from('Booking')
        .select('totalPrice')
        .eq('status', 'CONFIRMED')
        .gte('createdAt', startOfMonth)

      const revenue = revenueData?.reduce((acc, curr) => acc + (curr.totalPrice || 0), 0) || 0

      // 5. Pagos Pendientes
      const { data: paymentData, count: pendingPayments } = await supabase
        .from('Payment')
        .select('amount', { count: 'exact' })
        .eq('status', 'PENDING')
      
      const pendingPaymentsAmount = paymentData?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0

      setStats({
        activeStudents: activeCount,
        classesToday: classesTodayCount || 0,
        pendingBookings: pendingBookingsCount || 0,
        monthlyRevenue: revenue,
        pendingPayments: pendingPayments || 0,
        pendingPaymentsAmount,
        currentMonth: new Date(startOfMonth).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
          Panel de Control
        </h1>
        <p className="text-neutral-500 font-medium mt-1">
          Bienvenido de vuelta, {user.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <>
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white/50 backdrop-blur-sm rounded-2xl border border-neutral-100 p-6 animate-pulse h-32" />
            ))}
          </>
        ) : (
          <>
            <StatCard
              title="Alumnos Activos"
              value={stats?.activeStudents.toString() || "0"}
              subtitle="Maestros registrados"
              icon="👤"
              color="primary"
            />
            <StatCard
              title="Clases Hoy"
              value={stats?.classesToday.toString() || "0"}
              subtitle="Programadas"
              icon="📅"
              color="sky"
            />
            <StatCard
              title="Bookings Pendientes"
              value={stats?.pendingBookings.toString() || "0"}
              subtitle="Por aprobar"
              icon="🔔"
              trend={stats && stats.pendingBookings > 0 ? "Revisar CRM" : undefined}
              color="amber"
            />
            <StatCard
              title="Ingresos del Mes"
              value={stats ? formatCurrency(stats.monthlyRevenue) : "$0"}
              subtitle={stats?.currentMonth || "Este mes"}
              icon="💰"
              color="emerald"
            />
          </>
        )}
      </div>

      {/* Clase Actual + Próximas Clases */}
      <DashboardClasses />

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full" />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            title="Nuevo Alumno"
            description="Registrar ficha técnica y contacto"
            icon="✨"
            href="/dashboard/alumnos/nuevo"
            highlight
          />
          <QuickActionCard
            title="Agendar Clase"
            description="Programar sesión individual o prueba"
            icon="📅"
            href="/dashboard/clases/nueva"
          />
          <QuickActionCard
            title="Pagos"
            description="Gestionar finanzas y recibos"
            icon="💸"
            href="/dashboard/pagos"
          />
        </div>
      </div>

      {/* Productivity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50/30">
              <h2 className="text-lg font-black text-neutral-900 uppercase tracking-widest text-xs flex items-center gap-2">
                <span className="w-2 h-4 bg-primary rounded-full" />
                Planificación Semanal
              </h2>
              <Link href="/dashboard/agenda" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">
                Calendario Completo →
              </Link>
            </div>
            <div className="p-12 text-center h-[350px] flex flex-col items-center justify-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-2xl mb-4 grayscale opacity-50">
                🗓️
              </div>
              <p className="text-neutral-900 font-bold">No hay clases pendientes fuera de hoy</p>
              <p className="text-neutral-500 text-sm mt-1 mb-6 max-w-xs mx-auto font-medium">
                Tu semana está organizada. ¡Aprovecha para planificar contenido!
              </p>
            </div>
          </div>
        </div>

        <div className="h-full">
          <TeacherTaskBoard />
        </div>
      </div>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, trend, color }: {
  title: string
  value: string
  subtitle: string
  icon: string
  trend?: string
  color: 'primary' | 'sky' | 'amber' | 'emerald'
}) {
  const colorMap = {
    primary: "text-primary bg-primary/5 border-primary/10",
    sky: "text-sky-600 bg-sky-50 border-sky-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100"
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-neutral-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold border transition-transform group-hover:scale-110 ${colorMap[color]}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-destructive text-white animate-pulse shadow-lg shadow-destructive/20">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-1">{title}</h3>
      <p className="text-3xl font-black text-neutral-900 tracking-tighter">{value}</p>
      <p className="text-[10px] text-neutral-500 font-bold mt-1 uppercase opacity-60 font-mono italic">{subtitle}</p>
    </div>
  )
}

function QuickActionCard({ title, description, icon, href, highlight }: {
  title: string
  description: string
  icon: string
  href: string
  highlight?: boolean
}) {
  return (
    <Link href={href} className="group">
      <div className={`h-full p-8 rounded-3xl border transition-all duration-500 ${
        highlight 
          ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xl shadow-neutral-900/20 hover:bg-primary hover:border-primary hover:-translate-y-2' 
          : 'bg-white border-neutral-100 hover:border-primary/30 hover:shadow-xl hover:-translate-y-2'
      }`}>
        <div className={`text-3xl mb-6 transition-all duration-500 group-hover:scale-125 group-hover:rotate-6 flex`}>
          {icon}
        </div>
        <h3 className={`text-xl font-black mb-2 tracking-tight ${highlight ? 'text-white' : 'text-neutral-900'}`}>
          {title}
        </h3>
        <p className={`text-sm ${highlight ? 'text-white/60' : 'text-neutral-500'} font-medium leading-relaxed`}>
          {description}
        </p>
      </div>
    </Link>
  )
}
