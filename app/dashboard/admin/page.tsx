"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatLastSeen } from "@/lib/utils"
import LastSeenBadge from "@/components/ui/LastSeenBadge"
import Link from "next/link"
import { usePathname } from "next/navigation"

// ── Types ──────────────────────────────────────────────────────────────────
interface TeacherRow {
  id: string; name: string; email: string; region: string
  students: number; activeStudents: number; revenue: number
  last_seen_at: string | null; joinedAt: string
}
interface KPIs {
  totalTeachers: number; newTeachersThisMonth: number
  totalStudents: number; activeStudents: number
  totalRevenue: number; revenueThisMonth: number
  avgStudentsPerTeacher: number; avgRevenuePerTeacher: number
}

// ── Helpers ────────────────────────────────────────────────────────────────
function Stat({ label, value, sub, green }: { label: string; value: string; sub?: string; green?: boolean }) {
  return (
    <div className="bg-neutral-800/60 border border-neutral-700/50 rounded-xl p-4">
      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-xl font-black tracking-tight ${green ? "text-emerald-400" : "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-neutral-600 mt-0.5 font-medium">{sub}</p>}
    </div>
  )
}

function regionFlag(region: string) {
  const r = (region ?? "").toLowerCase()
  if (r.includes("metropolitana")) return "🏙️"
  if (r.includes("valpar")) return "⛵"
  if (r.includes("biob")) return "🌲"
  if (r.includes("arauc")) return "🌄"
  if (r.includes("atacama")) return "🏜️"
  return "📍"
}

const ADMIN_NAV = [
  { name: "Global", href: "/dashboard/admin" },
  { name: "Profesores", href: "/dashboard/admin/profesores" },
  { name: "Finanzas", href: "/dashboard/admin/finanzas" },
]

// ── Component ──────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { profile, user, loading } = useAuth()
  const pathname = usePathname()
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [sort, setSort] = useState<"revenue" | "students" | "name">("revenue")

  useEffect(() => { if (profile?.is_admin) load() }, [profile])

  async function load() {
    try {
      const now = new Date()
      const thisMonth = now.toISOString().slice(0, 7)
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: raw } = await supabase
        .from("TeacherProfile")
        .select(`id, region, created_at, user_id,
          User ( name, email, last_sign_in_at ),
          StudentProfile ( id, status ),
          Payment ( amount, date )`)

      if (!raw) return

      let totalStudents = 0, activeStudents = 0, totalRevenue = 0, revenueThisMonth = 0
      const newTeachersThisMonth = raw.filter((t: any) => t.created_at >= thisMonthStart).length

      const rows: TeacherRow[] = raw.map((t: any) => {
        const students = t.StudentProfile?.length ?? 0
        const active = (t.StudentProfile ?? []).filter((s: any) => s.status === "ACTIVE").length
        const rev = (t.Payment ?? []).reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0)
        const revMonth = (t.Payment ?? []).filter((p: any) => p.date?.startsWith(thisMonth))
          .reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0)
        totalStudents += students; activeStudents += active
        totalRevenue += rev; revenueThisMonth += revMonth
        return {
          id: t.id, name: t.User?.name ?? "—", email: t.User?.email ?? "—",
          region: t.region ?? "No especificada", students, activeStudents: active,
          revenue: rev, last_seen_at: t.User?.last_sign_in_at ?? null, joinedAt: t.created_at,
        }
      })

      setKpis({
        totalTeachers: rows.length, newTeachersThisMonth, totalStudents, activeStudents,
        totalRevenue, revenueThisMonth,
        avgStudentsPerTeacher: rows.length ? Math.round(totalStudents / rows.length) : 0,
        avgRevenuePerTeacher: rows.length ? Math.round(totalRevenue / rows.length) : 0,
      })
      setTeachers(rows)
    } finally { setDataLoading(false) }
  }

  // Auth guard — wait for profile to load before deciding
  if (loading || (user && !profile)) {
    return (
      <div className="fixed inset-0 bg-neutral-950 flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 animate-pulse flex items-center justify-center">
            <span className="text-white text-xs font-black">SA</span>
          </div>
          <p className="text-neutral-600 text-xs">Verificando acceso…</p>
        </div>
      </div>
    )
  }
  if (!profile?.is_admin) return null

  const sorted = [...teachers].sort((a, b) => {
    if (sort === "revenue") return b.revenue - a.revenue
    if (sort === "students") return b.students - a.students
    return a.name.localeCompare(b.name)
  })

  const geoMap: Record<string, { count: number; revenue: number }> = {}
  for (const t of teachers) {
    const key = t.region || "No especificada"
    if (!geoMap[key]) geoMap[key] = { count: 0, revenue: 0 }
    geoMap[key].count++; geoMap[key].revenue += t.revenue
  }
  const geoEntries = Object.entries(geoMap).sort((a, b) => b[1].count - a[1].count)
  const maxCount = Math.max(...geoEntries.map(e => e[1].count), 1)

  return (
    // Full-screen dark overlay that covers the teacher sidebar
    <div className="fixed inset-0 z-40 flex bg-neutral-950 overflow-hidden">

      {/* Admin Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-neutral-900 border-r border-neutral-800 flex flex-col h-full">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-neutral-800">
          <div className="w-7 h-7 rounded-lg bg-rose-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-black">SA</span>
          </div>
          <div>
            <p className="text-xs font-black text-white leading-none">Super Admin</p>
            <p className="text-[9px] text-neutral-500 mt-0.5">Panel Global</p>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-0.5">
          {ADMIN_NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  active ? "bg-rose-600/20 text-rose-300 border border-rose-600/30"
                         : "text-neutral-500 hover:text-white hover:bg-neutral-800"
                }`}>{item.name}</div>
              </Link>
            )
          })}
        </nav>
        <div className="p-3 border-t border-neutral-800 space-y-1">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-neutral-500 hover:text-violet-400 hover:bg-violet-900/20 text-xs font-medium transition-all">
              <span>↩️</span> Mi panel de profesor
            </div>
          </Link>
          <div className="px-3 py-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-rose-900 text-rose-300 flex items-center justify-center text-[10px] font-black">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-[11px] font-bold text-neutral-300 truncate">{profile.name}</p>
              <p className="text-[9px] text-rose-500 font-black uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-[1200px] mx-auto space-y-8 pb-16">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">Panel de Control Global</h1>
              <p className="text-neutral-600 text-sm mt-0.5">
                {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-neutral-800 border border-neutral-700 px-3 py-1.5 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-neutral-400">{kpis?.totalTeachers ?? "—"} profesores</span>
            </div>
          </div>

          {dataLoading ? (
            <div className="grid grid-cols-4 gap-3 animate-pulse">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-20 bg-neutral-800 rounded-xl" />)}
            </div>
          ) : (
            <>
              {/* KPI — Plataforma */}
              <section>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-3">Salud de la Plataforma</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Profesores" value={String(kpis?.totalTeachers ?? 0)} sub={`+${kpis?.newTeachersThisMonth ?? 0} este mes`} />
                  <Stat label="Total Alumnos" value={String(kpis?.totalStudents ?? 0)} sub={`${kpis?.activeStudents ?? 0} activos`} />
                  <Stat label="Alumnos / Profesor" value={String(kpis?.avgStudentsPerTeacher ?? 0)} sub="promedio" />
                  <Stat label="Tasa Actividad"
                    value={kpis?.totalStudents ? `${Math.round((kpis.activeStudents / kpis.totalStudents) * 100)}%` : "—"}
                    sub="alumnos activos / total" green />
                </div>
              </section>

              {/* KPI — Ingresos */}
              <section>
                <p className="text-[10px] font-black uppercase tracking-widest text-neutral-600 mb-3">Ingresos</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Stat label="Volumen Total" value={formatCurrency(kpis?.totalRevenue ?? 0)} green />
                  <Stat label="Este Mes" value={formatCurrency(kpis?.revenueThisMonth ?? 0)} sub={new Date().toLocaleDateString("es-CL", { month: "long" })} green />
                  <Stat label="Ingreso / Profesor" value={formatCurrency(kpis?.avgRevenuePerTeacher ?? 0)} sub="promedio histórico" />
                  <Stat label="Top Facturador"
                    value={teachers.length ? teachers.reduce((a, b) => a.revenue > b.revenue ? a : b, teachers[0]).name.split(" ")[0] : "—"}
                    sub={teachers.length ? formatCurrency(Math.max(...teachers.map(t => t.revenue))) : ""} green />
                </div>
              </section>

              {/* Teacher table + Geo */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Table */}
                <div className="xl:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
                    <h2 className="text-sm font-black text-white">Profesores</h2>
                    <div className="flex items-center gap-1 bg-neutral-800 rounded-lg p-0.5">
                      {(["revenue","students","name"] as const).map(s => (
                        <button key={s} onClick={() => setSort(s)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                            sort === s ? "bg-white text-neutral-900" : "text-neutral-500 hover:text-neutral-300"
                          }`}>
                          {s === "revenue" ? "Ingresos" : s === "students" ? "Alumnos" : "Nombre"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="divide-y divide-neutral-800/80">
                    {sorted.map((t, i) => {
                      const months = Math.floor((Date.now() - new Date(t.joinedAt).getTime()) / (1000*60*60*24*30))
                      return (
                        <div key={t.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-neutral-800/40 transition-colors">
                          <span className="text-[10px] font-black text-neutral-700 w-4 text-right">{i + 1}</span>
                          <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 rounded-xl bg-neutral-800 border border-neutral-700 text-neutral-400 font-bold flex items-center justify-center text-xs">
                              {t.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5">
                              <LastSeenBadge lastSeenAt={t.last_seen_at} size="sm" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{t.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-neutral-600">{regionFlag(t.region)} {t.region}</span>
                              <span className="text-neutral-700">·</span>
                              <span className={`text-[10px] font-medium ${formatLastSeen(t.last_seen_at).isOnline ? "text-emerald-400" : "text-neutral-600"}`}>
                                {formatLastSeen(t.last_seen_at).label}
                              </span>
                            </div>
                          </div>
                          <div className="text-right w-16">
                            <p className="text-sm font-black text-white">{t.students}</p>
                            <p className="text-[10px] text-neutral-600">{t.activeStudents} act.</p>
                          </div>
                          <div className="text-right w-24">
                            <p className="text-sm font-black text-emerald-400">{formatCurrency(t.revenue)}</p>
                            <p className="text-[10px] text-neutral-600">{months}m activo</p>
                          </div>
                        </div>
                      )
                    })}
                    {teachers.length === 0 && (
                      <div className="p-10 text-center text-neutral-600 text-sm">Sin profesores registrados.</div>
                    )}
                  </div>
                </div>

                {/* Geo */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-800">
                    <h2 className="text-sm font-black text-white">Distribución Geográfica</h2>
                    <p className="text-[11px] text-neutral-600 mt-0.5">Por región</p>
                  </div>
                  <div className="p-5 space-y-5">
                    {geoEntries.map(([region, data]) => (
                      <div key={region}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-[12px] font-bold text-neutral-300">{regionFlag(region)} {region}</span>
                          <span className="text-[11px] font-black text-white">{data.count} <span className="text-neutral-600 font-normal">prof.</span></span>
                        </div>
                        <div className="h-1 bg-neutral-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-rose-700 to-rose-500 rounded-full"
                            style={{ width: `${(data.count / maxCount) * 100}%` }} />
                        </div>
                        <p className="text-[10px] text-neutral-600 mt-1">{formatCurrency(data.revenue)} facturado</p>
                      </div>
                    ))}
                    {geoEntries.length === 0 && <p className="text-neutral-600 text-sm">Sin datos.</p>}
                  </div>
                  {geoEntries.length > 0 && (
                    <div className="mx-5 mb-5 p-3 bg-neutral-800/50 border border-neutral-700 rounded-xl">
                      <p className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Insight</p>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        <strong className="text-white">{geoEntries[0][0]}</strong> concentra el{" "}
                        <strong className="text-rose-400">{Math.round((geoEntries[0][1].count / teachers.length) * 100)}%</strong> y genera{" "}
                        <strong className="text-emerald-400">{formatCurrency(geoEntries[0][1].revenue)}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
