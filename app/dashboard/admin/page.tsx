"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatLastSeen } from "@/lib/utils"
import LastSeenBadge from "@/components/ui/LastSeenBadge"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

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

function regionFlag(r: string) {
  const s = (r ?? "").toLowerCase()
  if (s.includes("metropolitana")) return "🏙️"
  if (s.includes("valpar")) return "⛵"
  if (s.includes("biob")) return "🌲"
  if (s.includes("arauc")) return "🌄"
  if (s.includes("atacama")) return "🏜️"
  return "📍"
}

const NAV = [
  { label: "Resumen", href: "/dashboard/admin", icon: "▣" },
  { label: "Ajustes", href: "/dashboard/admin/sistema", icon: "⚙" },
]

export default function AdminDashboardPage() {
  const { profile, user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [busy, setBusy] = useState(true)
  const [sort, setSort] = useState<"revenue" | "students">("revenue")

  useEffect(() => { if (profile?.is_admin) load() }, [profile])

  async function load() {
    try {
      const now = new Date()
      const thisMonth = now.toISOString().slice(0, 7)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { data: raw } = await supabase
        .from("TeacherProfile")
        .select(`id, region, created_at, user_id,
          User ( name, email, last_sign_in_at ),
          StudentProfile ( id, status ),
          Payment ( amount, date )`)

      if (!raw) return

      let totalStudents = 0, activeStudents = 0, totalRevenue = 0, revenueThisMonth = 0
      const newTeachersThisMonth = raw.filter((t: any) => t.created_at >= startOfMonth).length

      const rows: TeacherRow[] = raw.map((t: any) => {
        const all = t.StudentProfile?.length ?? 0
        const active = (t.StudentProfile ?? []).filter((s: any) => s.status === "ACTIVE").length
        const rev = (t.Payment ?? []).reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0)
        const revM = (t.Payment ?? []).filter((p: any) => p.date?.startsWith(thisMonth))
          .reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0)
        totalStudents += all; activeStudents += active; totalRevenue += rev; revenueThisMonth += revM
        return {
          id: t.id, name: t.User?.name ?? "—", email: t.User?.email ?? "—",
          region: t.region ?? "No especificada", students: all, activeStudents: active,
          revenue: rev, last_seen_at: t.User?.last_sign_in_at ?? null, joinedAt: t.created_at,
        }
      })

      setKpis({
        totalTeachers: rows.length, newTeachersThisMonth,
        totalStudents, activeStudents, totalRevenue, revenueThisMonth,
        avgStudentsPerTeacher: rows.length ? Math.round(totalStudents / rows.length) : 0,
        avgRevenuePerTeacher: rows.length ? Math.round(totalRevenue / rows.length) : 0,
      })
      setTeachers(rows)
    } finally { setBusy(false) }
  }

  // Auth guard — wait patiently
  if (loading || (user && !profile)) {
    return (
      <div className="fixed inset-0 z-[60] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-neutral-200 border-t-neutral-800 animate-spin" />
          <p className="text-xs text-neutral-400">Verificando acceso</p>
        </div>
      </div>
    )
  }
  if (!profile?.is_admin) return null

  const sorted = [...teachers].sort((a, b) =>
    sort === "revenue" ? b.revenue - a.revenue : b.students - a.students
  )

  const geoMap: Record<string, { count: number; revenue: number }> = {}
  for (const t of teachers) {
    const k = t.region || "No especificada"
    if (!geoMap[k]) geoMap[k] = { count: 0, revenue: 0 }
    geoMap[k].count++; geoMap[k].revenue += t.revenue
  }
  const geoEntries = Object.entries(geoMap).sort((a, b) => b[1].count - a[1].count)
  const maxGeo = Math.max(...geoEntries.map(e => e[1].count), 1)

  return (
    <div className="fixed inset-0 z-[60] flex bg-[#f5f5f7] font-sans">

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="w-52 flex-shrink-0 bg-white border-r border-neutral-200/80 flex flex-col">
        {/* Logo mark */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold tracking-tight">SA</span>
            </div>
            <span className="text-sm font-semibold text-neutral-900">Super Admin</span>
          </div>
          <p className="text-[11px] text-neutral-400 pl-[36px]">Khora Platform</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5">
          {NAV.map(item => {
            const active = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                  active
                    ? "bg-neutral-100 text-neutral-900 font-semibold"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                }`}>
                  <span className="text-[11px] opacity-60">{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-neutral-100 space-y-1">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-all">
              ← Mi panel de profesor
            </div>
          </Link>
          <div className="px-3 py-2 flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-neutral-200 flex items-center justify-center text-[10px] font-semibold text-neutral-600">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-neutral-700 truncate">{profile.name}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-3 py-1.5 rounded-lg text-[12px] text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-10 space-y-10">

          {/* Header */}
          <div>
            <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-1">
              {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Resumen</h1>
          </div>

          {busy ? (
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-20 bg-neutral-200/60 rounded-2xl animate-pulse" />)}
            </div>
          ) : (
            <>
              {/* ── KPIs ── */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Profesores", value: String(kpis?.totalTeachers ?? 0), sub: `+${kpis?.newTeachersThisMonth ?? 0} este mes` },
                  { label: "Alumnos", value: String(kpis?.totalStudents ?? 0), sub: `${kpis?.activeStudents ?? 0} activos` },
                  { label: "Ingreso del mes", value: formatCurrency(kpis?.revenueThisMonth ?? 0), sub: "facturado en el período", green: true },
                  { label: "Volumen total", value: formatCurrency(kpis?.totalRevenue ?? 0), sub: "acumulado histórico", green: true },
                ].map(({ label, value, sub, green }) => (
                  <div key={label} className="bg-white border border-neutral-200/80 rounded-2xl px-5 py-4 shadow-sm">
                    <p className="text-[11px] text-neutral-400 font-medium mb-1.5">{label}</p>
                    <p className={`text-xl font-semibold tracking-tight ${green ? "text-emerald-600" : "text-neutral-900"}`}>{value}</p>
                    <p className="text-[11px] text-neutral-400 mt-1">{sub}</p>
                  </div>
                ))}
              </div>

              {/* ── Secondary KPIs ── */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Alumnos por profesor", value: String(kpis?.avgStudentsPerTeacher ?? 0) },
                  { label: "Ingreso por profesor", value: formatCurrency(kpis?.avgRevenuePerTeacher ?? 0) },
                  { label: "Tasa de actividad", value: kpis?.totalStudents ? `${Math.round((kpis.activeStudents / kpis.totalStudents) * 100)}%` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white border border-neutral-200/80 rounded-2xl px-5 py-4 shadow-sm">
                    <p className="text-[11px] text-neutral-400 font-medium mb-1.5">{label}</p>
                    <p className="text-xl font-semibold text-neutral-900 tracking-tight">{value}</p>
                  </div>
                ))}
              </div>

              {/* ── Table + Geo ── */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Teacher table */}
                <div className="xl:col-span-2 bg-white border border-neutral-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-900">Profesores</h2>
                    <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5">
                      {(["revenue","students"] as const).map(s => (
                        <button key={s} onClick={() => setSort(s)}
                          className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${
                            sort === s ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400"
                          }`}>
                          {s === "revenue" ? "Ingresos" : "Alumnos"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="divide-y divide-neutral-50">
                    {sorted.map((t, i) => {
                      const months = Math.floor((Date.now() - new Date(t.joinedAt).getTime()) / (1000*60*60*24*30))
                      const { label: seenLabel, isOnline } = formatLastSeen(t.last_seen_at)
                      return (
                        <div key={t.id} className="px-6 py-3.5 flex items-center gap-4 hover:bg-neutral-50/80 transition-colors">
                          <span className="text-[11px] text-neutral-300 w-4 text-right font-medium">{i + 1}</span>
                          <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 font-semibold flex items-center justify-center text-xs">
                              {t.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5">
                              <LastSeenBadge lastSeenAt={t.last_seen_at} size="sm" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 truncate">{t.name}</p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              {regionFlag(t.region)} {t.region} · <span className={isOnline ? "text-emerald-500" : ""}>{seenLabel}</span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-neutral-900">{t.students}</p>
                            <p className="text-[11px] text-neutral-400">{t.activeStudents} activos</p>
                          </div>
                          <div className="text-right w-28">
                            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(t.revenue)}</p>
                            <p className="text-[11px] text-neutral-400">{months} meses</p>
                          </div>
                        </div>
                      )
                    })}
                    {teachers.length === 0 && (
                      <div className="px-6 py-12 text-center text-neutral-400 text-sm">Sin profesores registrados.</div>
                    )}
                  </div>
                </div>

                {/* Geographic */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-neutral-100">
                    <h2 className="text-sm font-semibold text-neutral-900">Distribución</h2>
                    <p className="text-[11px] text-neutral-400 mt-0.5">Por región</p>
                  </div>
                  <div className="p-5 space-y-5">
                    {geoEntries.map(([region, data]) => (
                      <div key={region}>
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="text-[12px] text-neutral-700 font-medium">{regionFlag(region)} {region}</span>
                          <span className="text-[12px] font-semibold text-neutral-900">{data.count}</span>
                        </div>
                        <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-neutral-800 rounded-full transition-all duration-500"
                            style={{ width: `${(data.count / maxGeo) * 100}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-neutral-400 mt-1.5">{formatCurrency(data.revenue)}</p>
                      </div>
                    ))}
                    {geoEntries.length === 0 && <p className="text-sm text-neutral-400">Sin datos geográficos.</p>}
                  </div>
                  {geoEntries.length > 0 && teachers.length > 0 && (
                    <div className="mx-5 mb-5 px-4 py-3 bg-neutral-50 border border-neutral-100 rounded-xl">
                      <p className="text-[11px] text-neutral-600 leading-relaxed">
                        <strong className="text-neutral-900">{geoEntries[0][0]}</strong> concentra el{" "}
                        <strong>{Math.round((geoEntries[0][1].count / teachers.length) * 100)}%</strong> de los profesores
                        con <strong className="text-emerald-600">{formatCurrency(geoEntries[0][1].revenue)}</strong> facturado.
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
