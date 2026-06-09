"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import CreateTeacherModal from "@/components/academy/CreateTeacherModal"

interface AcademyMetrics {
  totalTeachers: number
  totalStudents: number
  totalRevenue: number
  revenueThisMonth: number
  activeStudents: number
}

interface TeacherRow {
  id: string
  user_id: string
  name: string
  email: string
  instrumento: string | null
  students: number
  status: string
}

export default function AcademyDashboard() {
  const { profile } = useAuth()
  const [metrics, setMetrics] = useState<AcademyMetrics | null>(null)
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [busy, setBusy] = useState(true)
  const [showCreateTeacher, setShowCreateTeacher] = useState(false)
  const academyId = profile?.academyProfileId

  useEffect(() => {
    if (academyId) load()
  }, [academyId])

  async function load() {
    try {
      // Cargar profesores de la academia
      const { data: at } = await supabase
        .from("AcademyTeacher")
        .select(`
          id, status,
          TeacherProfile (
            id, user_id, instrumento,
            User ( name, email ),
            StudentProfile ( id, status )
          )
        `)
        .eq("academy_id", academyId!)

      const teacherRows: TeacherRow[] = (at ?? []).map((row: any) => {
        const tp = row.TeacherProfile
        const u = Array.isArray(tp?.User) ? tp.User[0] : tp?.User
        const students = tp?.StudentProfile?.length ?? 0
        return {
          id: tp?.id ?? "",
          user_id: tp?.user_id ?? "",
          name: u?.name ?? "—",
          email: u?.email ?? "—",
          instrumento: tp?.instrumento ?? null,
          students,
          status: row.status,
        }
      })
      setTeachers(teacherRows)

      // Cargar métricas de pagos
      const now = new Date()
      const thisMonth = now.toISOString().slice(0, 7)
      const { data: payments } = await supabase
        .from("Payment")
        .select("amount, date")
        .eq("academy_id", academyId!)

      const totalRevenue = (payments ?? []).reduce((s, p) => s + Number(p.amount ?? 0), 0)
      const revenueThisMonth = (payments ?? [])
        .filter(p => p.date?.startsWith(thisMonth))
        .reduce((s, p) => s + Number(p.amount ?? 0), 0)

      // Alumnos de la academia
      const { data: students } = await supabase
        .from("StudentProfile")
        .select("id, status")
        .eq("academy_id", academyId!)

      setMetrics({
        totalTeachers: teacherRows.length,
        totalStudents: students?.length ?? 0,
        activeStudents: (students ?? []).filter(s => s.status === "ACTIVE").length,
        totalRevenue,
        revenueThisMonth,
      })
    } finally {
      setBusy(false)
    }
  }

  if (busy) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-10 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-neutral-100 rounded-lg" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-24 bg-neutral-100 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-neutral-100 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10 space-y-8 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-1">Academia</p>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Panel de control</h1>
        </div>
        <button
          onClick={() => setShowCreateTeacher(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
          </svg>
          Añadir Profesor
        </button>
      </div>

      {/* KPI Cards */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Profesores", value: String(metrics?.totalTeachers ?? 0) },
            { label: "Alumnos totales", value: String(metrics?.totalStudents ?? 0), sub: `${metrics?.activeStudents ?? 0} activos` },
            { label: "Ingresos del mes", value: formatCurrency(metrics?.revenueThisMonth ?? 0) },
            { label: "Facturación total", value: formatCurrency(metrics?.totalRevenue ?? 0) },
          ].map(c => (
            <div key={c.label} className="bg-white border border-neutral-100 rounded-2xl px-5 py-4 shadow-sm">
              <p className="text-[11px] text-neutral-400 mb-1.5">{c.label}</p>
              <p className="text-xl font-semibold text-neutral-900 tracking-tight">{c.value}</p>
              {c.sub && <p className="text-[11px] text-neutral-400 mt-1">{c.sub}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Profesores */}
      <section className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Mis Profesores</h2>
          <span className="text-xs text-neutral-400">{teachers.length} en total</span>
        </div>

        {teachers.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-neutral-700 mb-1">Sin profesores aún</p>
            <p className="text-xs text-neutral-400 mb-4">Comienza añadiendo tu primer profesor a la academia</p>
            <button
              onClick={() => setShowCreateTeacher(true)}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Añadir primer profesor
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {teachers.map(t => (
              <div key={t.id} className="px-6 py-3 flex items-center gap-4 hover:bg-neutral-50/60 transition-colors">
                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center justify-center text-sm flex-shrink-0">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{t.name}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{t.email}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-medium text-neutral-700">{t.instrumento ?? "—"}</p>
                  <p className="text-[11px] text-neutral-400">{t.students} alumnos</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  t.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral-100 text-neutral-500'
                }`}>
                  {t.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Crear Profesor */}
      {showCreateTeacher && academyId && (
        <CreateTeacherModal
          academyId={academyId}
          onClose={() => setShowCreateTeacher(false)}
          onCreated={() => { setShowCreateTeacher(false); load() }}
        />
      )}
    </div>
  )
}
