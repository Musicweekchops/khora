"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import type { UserProfile } from "@/lib/context/AuthContext"

interface Stats {
  activeStudents: number
  classesToday: number
  pendingBookings: number
  monthlyRevenue: number
}

export default function TeacherDashboard({ profile }: { profile: UserProfile }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile.teacherProfileId) loadStats(profile.teacherProfileId)
  }, [profile.teacherProfileId])

  async function loadStats(teacherId: string) {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const today = now.toISOString().split("T")[0]

      // Alumnos activos
      const { count: studentCount } = await supabase
        .from("StudentProfile")
        .select("id", { count: "exact", head: true })
        .eq("teacher_id", teacherId)

      // Clases hoy
      const { count: todayCount } = await supabase
        .from("Class")
        .select("id", { count: "exact", head: true })
        .eq("teacher_id", teacherId)
        .eq("date", today)
        .neq("status", "CANCELLED")

      // Bookings pendientes
      const { count: bookingCount } = await supabase
        .from("Booking")
        .select("id", { count: "exact", head: true })
        .eq("teacher_id", teacherId)
        .eq("status", "PENDING")

      // Ingresos del mes
      const { data: payments } = await supabase
        .from("Payment")
        .select("amount")
        .eq("teacher_id", teacherId)
        .gte("date", startOfMonth.split("T")[0])

      const revenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0

      setStats({
        activeStudents: studentCount ?? 0,
        classesToday: todayCount ?? 0,
        pendingBookings: bookingCount ?? 0,
        monthlyRevenue: revenue,
      })
    } catch (err) {
      console.error("[Dashboard] Error loading stats:", err)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    { title: "Alumnos", value: stats?.activeStudents ?? 0, icon: "👤", color: "from-violet-500/10 to-violet-500/5 border-violet-200 text-violet-700" },
    { title: "Clases Hoy", value: stats?.classesToday ?? 0, icon: "📅", color: "from-sky-500/10 to-sky-500/5 border-sky-200 text-sky-700" },
    { title: "Reservas Pendientes", value: stats?.pendingBookings ?? 0, icon: "🔔", color: "from-amber-500/10 to-amber-500/5 border-amber-200 text-amber-700" },
    { title: "Ingresos del Mes", value: formatCurrency(stats?.monthlyRevenue ?? 0), icon: "💰", color: "from-emerald-500/10 to-emerald-500/5 border-emerald-200 text-emerald-700" },
  ]

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Panel de Control</h1>
        <p className="text-neutral-500 font-medium mt-1">Bienvenido, {profile.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading
          ? [1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white/50 rounded-2xl border border-neutral-100 p-6 animate-pulse h-32" />
            ))
          : cards.map(card => (
              <div
                key={card.title}
                className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 border transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{card.icon}</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">{card.title}</p>
                <p className="text-3xl font-black tracking-tight">{card.value}</p>
              </div>
            ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full" />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Nuevo Alumno"
            description="Registrar ficha técnica y contacto"
            icon="✨"
            href="/dashboard/alumnos/nuevo"
            highlight
          />
          <ActionCard
            title="Agendar Clase"
            description="Programar sesión individual"
            icon="📅"
            href="/dashboard/clases/nueva"
          />
          <ActionCard
            title="Registrar Pago"
            description="Gestionar finanzas y recibos"
            icon="💸"
            href="/dashboard/pagos/nuevo"
          />
        </div>
      </div>
    </div>
  )
}

function ActionCard({ title, description, icon, href, highlight }: {
  title: string; description: string; icon: string; href: string; highlight?: boolean
}) {
  return (
    <Link href={href} className="group">
      <div
        className={`h-full p-8 rounded-3xl border transition-all duration-300 ${
          highlight
            ? "bg-neutral-900 text-white border-neutral-900 shadow-2xl shadow-neutral-900/20 hover:bg-violet-600 hover:border-violet-600 hover:-translate-y-1"
            : "bg-white border-neutral-100 hover:border-violet-300 hover:shadow-xl hover:-translate-y-1"
        }`}
      >
        <div className="text-3xl mb-6 transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <h3 className={`text-xl font-black mb-2 tracking-tight ${highlight ? "text-white" : "text-neutral-900"}`}>
          {title}
        </h3>
        <p className={`text-sm font-medium leading-relaxed ${highlight ? "text-white/60" : "text-neutral-500"}`}>
          {description}
        </p>
      </div>
    </Link>
  )
}
