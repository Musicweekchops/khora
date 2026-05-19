"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatTime, toDateStr } from "@/lib/utils"
import type { UserProfile } from "@/lib/context/AuthContext"

interface Stats { activeStudents: number; classesToday: number; pendingBookings: number; monthlyRevenue: number }
interface TodayClass { id: string; start_time: string; end_time: string; student_name: string; status: string; modalidad: string }

export default function TeacherDashboard({ profile }: { profile: UserProfile }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [todayClasses, setTodayClasses] = useState<TodayClass[]>([])
  const [loading, setLoading] = useState(true)

  const [showMobileMsg, setShowMobileMsg] = useState(true)

  useEffect(() => {
    if (profile.teacherProfileId) loadAll(profile.teacherProfileId)
  }, [profile.teacherProfileId])

  useEffect(() => {
    const timer = setTimeout(() => setShowMobileMsg(false), 4500)
    return () => clearTimeout(timer)
  }, [])

  async function loadAll(teacherId: string) {
    try {
      const now = new Date()
      const today = toDateStr(now)
      const startOfMonth = toDateStr(new Date(now.getFullYear(), now.getMonth(), 1))

      const [students, todayCl, bookings, payments] = await Promise.all([
        supabase.from("StudentProfile").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId),
        supabase.from("Class").select("id, start_time, end_time, status, modalidad, StudentProfile ( User ( name ) )").eq("teacher_id", teacherId).eq("date", today).neq("status", "CANCELLED").order("start_time"),
        supabase.from("Booking").select("id", { count: "exact", head: true }).eq("teacher_id", teacherId).eq("status", "PENDING"),
        supabase.from("Payment").select("amount").eq("teacher_id", teacherId).gte("date", startOfMonth),
      ])

      setStats({
        activeStudents: students.count ?? 0,
        classesToday: todayCl.data?.length ?? 0,
        pendingBookings: bookings.count ?? 0,
        monthlyRevenue: payments.data?.reduce((s, p) => s + (p.amount || 0), 0) ?? 0,
      })

      if (todayCl.data) {
        setTodayClasses(todayCl.data.map((c: any) => ({
          id: c.id, start_time: c.start_time, end_time: c.end_time,
          student_name: c.StudentProfile?.User?.name ?? "Sin asignar",
          status: c.status, modalidad: c.modalidad,
        })))
      }
    } catch (err) {
      console.error("[Dashboard]", err)
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
      {/* Mobile Library Warning */}
      {showMobileMsg && (
        <div className="lg:hidden fixed top-24 left-4 right-4 z-[60] animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="bg-neutral-900/95 backdrop-blur-xl text-white p-4 rounded-3xl shadow-2xl shadow-neutral-900/20 border border-neutral-700 flex items-start gap-3">
            <span className="text-2xl">💻</span>
            <div className="flex-1">
              <p className="text-[13px] font-black tracking-tight leading-tight mb-0.5">Gestión de Biblioteca</p>
              <p className="text-[11px] text-neutral-400 font-medium leading-snug">
                Por seguridad de tus archivos, la subida de material solo está disponible desde la versión de computador.
              </p>
            </div>
            <button onClick={() => setShowMobileMsg(false)} className="text-neutral-500 hover:text-white p-1">✕</button>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Panel de Control</h1>
        <p className="text-neutral-500 font-medium mt-1">Bienvenido, {profile.name}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        {loading
          ? [1, 2, 3, 4].map(i => <div key={i} className="bg-white/50 rounded-2xl border p-4 md:p-6 animate-pulse h-28" />)
          : cards.map(card => (
              <div key={card.title} className={`bg-gradient-to-br ${card.color} rounded-2xl p-4 md:p-6 border transition-all hover:shadow-md flex flex-col justify-between`}>
                <div className="mb-2 md:mb-4"><span className="text-2xl">{card.icon}</span></div>
                <div>
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60 mb-0.5 md:mb-1 truncate">{card.title}</p>
                  <p className="text-xl md:text-3xl font-black tracking-tight">{card.value}</p>
                </div>
              </div>
            ))}
      </div>

      {/* Today's Classes - Clickable */}
      <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/30">
          <h2 className="font-black text-neutral-900 flex items-center gap-2">
            <span className="w-2 h-5 bg-sky-500 rounded-full" /> Clases de Hoy
          </h2>
          <Link href="/dashboard/agenda" className="text-violet-600 text-xs font-black uppercase tracking-widest hover:underline">
            Ver Agenda Completa →
          </Link>
        </div>

        {todayClasses.length === 0 ? (
          <div className="p-12 text-center">
            <span className="text-4xl opacity-30 block mb-3">🗓️</span>
            <p className="text-neutral-500 font-bold">Sin clases programadas para hoy</p>
            <Link href="/dashboard/agenda" className="text-violet-600 text-sm font-bold hover:underline mt-2 inline-block">+ Agendar una clase</Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {todayClasses.map(c => (
              <Link key={c.id} href={`/dashboard/clases/detalles?id=${c.id}`}>
                <div className="p-5 flex items-center gap-4 hover:bg-violet-50/30 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center">
                    <span className="text-sm font-black text-sky-600">{formatTime(c.start_time)}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900 group-hover:text-violet-600 transition-colors">{c.student_name}</p>
                    <p className="text-sm text-neutral-500">{formatTime(c.start_time)} – {formatTime(c.end_time)} · {c.modalidad === "online" ? "📹 Virtual" : "🏠 Presencial"}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                    c.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" : c.status === "CONFIRMED" ? "bg-indigo-100 text-indigo-700" : "bg-sky-100 text-sky-700"
                  }`}>
                    {c.status === "COMPLETED" ? "Completada" : c.status === "CONFIRMED" ? "Confirmada" : "Programada"}
                  </span>
                  <span className="text-neutral-300 group-hover:text-violet-400 transition-colors">→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <span className="w-2 h-6 bg-primary rounded-full" /> Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard title="Nuevo Alumno" description="Registrar ficha y contacto" icon="✨" href="/dashboard/alumnos/nuevo" highlight />
          <ActionCard title="Agendar Clase" description="Desde el calendario semanal" icon="📅" href="/dashboard/agenda" />
          <ActionCard title="Registrar Pago" description="Gestionar finanzas" icon="💸" href="/dashboard/pagos/nuevo" />
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
      <div className={`h-full p-8 rounded-3xl border transition-all duration-300 ${
        highlight
          ? "bg-neutral-900 text-white border-neutral-900 shadow-2xl shadow-neutral-900/20 hover:bg-violet-600 hover:border-violet-600 hover:-translate-y-1"
          : "bg-white border-neutral-100 hover:border-violet-300 hover:shadow-xl hover:-translate-y-1"
      }`}>
        <div className="text-3xl mb-6 transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <h3 className={`text-xl font-black mb-2 tracking-tight ${highlight ? "text-white" : "text-neutral-900"}`}>{title}</h3>
        <p className={`text-sm font-medium leading-relaxed ${highlight ? "text-white/60" : "text-neutral-500"}`}>{description}</p>
      </div>
    </Link>
  )
}
