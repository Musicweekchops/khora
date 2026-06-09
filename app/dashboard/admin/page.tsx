"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatLastSeen } from "@/lib/utils"
import LastSeenBadge from "@/components/ui/LastSeenBadge"
import AdminShell from "@/components/admin/AdminShell"

// ── Types ──────────────────────────────────────────────────────
interface TeacherRow {
  id: string; user_id: string; name: string; email: string; region: string
  students: number; activeStudents: number; revenue: number; avgFee: number
  last_seen_at: string | null; joinedAt: string; is_suspended: boolean
  classCount: number; topDay: string; instrumento: string | null
}
interface KPIs {
  totalTeachers: number; newThisMonth: number
  totalStudents: number; activeStudents: number
  totalRevenue: number; revenueThisMonth: number
  avgStudentsPerTeacher: number; avgFeeAcrossPlatform: number
  mostActiveTeacher: string; topMonth: string
  totalClasses: number
}

const DAYS_ES = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"]
const MONTHS_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"]

function regionFlag(r: string) {
  const s = (r ?? "").toLowerCase()
  if (s.includes("metropolitana")) return "🏙️"
  if (s.includes("valpar")) return "⛵"
  if (s.includes("biob")) return "🌲"
  if (s.includes("arauc")) return "🌄"
  if (s.includes("atacama")) return "🏜️"
  return "📍"
}

function InsightCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl px-5 py-4 shadow-sm">
      <p className="text-[11px] text-neutral-400 mb-1.5">{label}</p>
      <p className="text-xl font-semibold text-neutral-900 tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-neutral-400 mt-1">{sub}</p>}
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { profile } = useAuth()
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [teachers, setTeachers] = useState<TeacherRow[]>([])
  const [busy, setBusy] = useState(true)
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<"revenue" | "students" | "usage">("revenue")
  const [selected, setSelected] = useState<TeacherRow | null>(null)
  const [confirm, setConfirm] = useState<{ action: "delete" | "suspend" | "unsuspend"; teacher: TeacherRow } | null>(null)
  const [actionBusy, setActionBusy] = useState(false)
  const [geoMap, setGeoMap] = useState<Record<string, { count: number; revenue: number }>>({})
  const [dayMap, setDayMap] = useState<Record<string, number>>({})
  const [monthMap, setMonthMap] = useState<Record<string, number>>({})

  // Academy Admin States
  const [academyKPIs, setAcademyKPIs] = useState({
    totalAcademies: 0,
    avgRevenuePerAcademy: 0,
    avgStudentsPerAcademy: 0,
    totalTeachersInAcademies: 0
  })
  const [academyRows, setAcademyRows] = useState<any[]>([])
  const [showAcademiesTable, setShowAcademiesTable] = useState(true)

  useEffect(() => { if (profile?.is_admin) load() }, [profile])

  async function load() {
    try {
      const now = new Date()
      const thisMonth = now.toISOString().slice(0, 7)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      // 1. Fetch teachers
      const { data: raw, error } = await supabase
        .from("TeacherProfile")
        .select(`id, region, created_at, user_id, instrumento,
          User ( name, email, last_sign_in_at, is_admin ),
          StudentProfile ( id, status ),
          Payment ( amount, date )`)

      if (error) { console.error("[Admin] query error:", error.message); return }
      if (!raw) return

      // Optional: monthly_fee (requires migration 014)
      const { data: feeRows } = await supabase
        .from("StudentProfile").select("id, teacher_id, monthly_fee")
      const feeByTeacher: Record<string, number[]> = {}
      for (const f of feeRows ?? []) {
        const tid = f.teacher_id
        if (!feeByTeacher[tid]) feeByTeacher[tid] = []
        if (Number(f.monthly_fee ?? 0) > 0) feeByTeacher[tid].push(Number(f.monthly_fee))
      }

      // Optional: suspension flags (requires migration 016)
      const { data: suspensions } = await supabase
        .from("TeacherProfile").select("id, is_suspended")
      const suspendMap: Record<string, boolean> = {}
      for (const s of suspensions ?? []) suspendMap[s.id] = s.is_suspended ?? false

      // Optional: class data for day-of-week analytics
      const { data: classes } = await supabase
        .from("Class").select("teacher_id, date")
      const classMap: Record<string, any[]> = {}
      for (const c of classes ?? []) {
        if (!classMap[c.teacher_id]) classMap[c.teacher_id] = []
        classMap[c.teacher_id].push(c)
      }

      let totalStudents = 0, activeStudents = 0, totalRevenue = 0, revenueThisMonth = 0
      let totalFees = 0, feeCount = 0
      const newThisMonth = raw.filter((t: any) => t.created_at >= startOfMonth).length
      const _dayMap: Record<string, number> = {}
      const _monthMap: Record<string, number> = {}
      const _geoMap: Record<string, { count: number; revenue: number }> = {}

      const rows: TeacherRow[] = raw
        .filter((t: any) => !t.User?.is_admin)
        .map((t: any) => {
          const allStudents = t.StudentProfile?.length ?? 0
          const active = (t.StudentProfile ?? []).filter((s: any) => s.status === "ACTIVE").length
          const rev = (t.Payment ?? []).reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0)
          const revM = (t.Payment ?? []).filter((p: any) => p.date?.startsWith(thisMonth))
            .reduce((s: number, p: any) => s + Number(p.amount ?? 0), 0)

          // Avg fee
          const fees = feeByTeacher[t.id] ?? []
          const avgFee = fees.length ? fees.reduce((a: number, b: number) => a + b, 0) / fees.length : 0
          fees.forEach((f: number) => { totalFees += f; feeCount++ })

          // Day of week from separately-fetched classes
          const teacherClasses = classMap[t.id] ?? []
          const classDays: Record<string, number> = {}
          teacherClasses.forEach((c: any) => {
            if (!c.date) return
            const day = DAYS_ES[new Date(c.date + "T12:00").getDay()]
            classDays[day] = (classDays[day] ?? 0) + 1
            _dayMap[day] = (_dayMap[day] ?? 0) + 1
          })
          const topDay = Object.entries(classDays).sort((a,b) => b[1]-a[1])[0]?.[0] ?? "—"

          // Month distribution from payments
          ;(t.Payment ?? []).forEach((p: any) => {
            if (!p.date) return
            const m = MONTHS_ES[new Date(p.date).getMonth()]
            _monthMap[m] = (_monthMap[m] ?? 0) + 1
          })

          // Geo
          const k = t.region ?? "No especificada"
          if (!_geoMap[k]) _geoMap[k] = { count: 0, revenue: 0 }
          _geoMap[k].count++; _geoMap[k].revenue += rev

          totalStudents += allStudents; activeStudents += active; totalRevenue += rev; revenueThisMonth += revM
          return {
            id: t.id, user_id: t.user_id, name: t.User?.name ?? "—", email: t.User?.email ?? "—",
            region: t.region ?? "No especificada", students: allStudents, activeStudents: active,
            revenue: rev, avgFee, last_seen_at: t.User?.last_sign_in_at ?? null, joinedAt: t.created_at,
            is_suspended: suspendMap[t.id] ?? false,
            classCount: teacherClasses.length, topDay,
            instrumento: t.instrumento ?? null,
          }
        })

      const topMonth = Object.entries(_monthMap).sort((a,b) => b[1]-a[1])[0]?.[0] ?? "—"
      const mostActive = [...rows].sort((a,b) => (b.last_seen_at ?? "").localeCompare(a.last_seen_at ?? ""))[0]?.name ?? "—"
      const totalClasses = classes?.length ?? 0

      setKpis({
        totalTeachers: rows.length, newThisMonth, totalStudents, activeStudents,
        totalRevenue, revenueThisMonth,
        avgStudentsPerTeacher: rows.length ? Math.round(totalStudents / rows.length) : 0,
        avgFeeAcrossPlatform: feeCount ? Math.round(totalFees / feeCount) : 0,
        mostActiveTeacher: mostActive, topMonth,
        totalClasses,
      })
      setTeachers(rows)
      setGeoMap(_geoMap)
      setDayMap(_dayMap)
      setMonthMap(_monthMap)

      // 2. Fetch Academy Data
      const { data: academyRaw, error: acErr } = await supabase
        .from("AcademyProfile")
        .select(`
          id, name, slug, region, is_active, plan, created_at,
          AcademyTeacher ( id, status ),
          StudentProfile:StudentProfile!academy_id ( id ),
          Payment:Payment!academy_id ( amount )
        `)

      if (acErr) {
        console.error("[Admin] Academy query error:", acErr.message)
      }

      let totalAcademies = 0
      let avgRevenuePerAcademy = 0
      let avgStudentsPerAcademy = 0
      let totalTeachersInAcademies = 0
      let academyRowsList: any[] = []

      if (academyRaw) {
        totalAcademies = academyRaw.length
        let totalAcRevenue = 0
        let totalAcStudents = 0

        academyRowsList = academyRaw.map((ac: any) => {
          const activeTeachers = (ac.AcademyTeacher ?? []).filter((at: any) => at.status === 'ACTIVE').length
          const studentsCount = ac.StudentProfile?.length ?? 0
          const revenueSum = (ac.Payment ?? []).reduce((sum: number, p: any) => sum + Number(p.amount ?? 0), 0)
          
          totalAcRevenue += revenueSum
          totalAcStudents += studentsCount
          totalTeachersInAcademies += activeTeachers

          return {
            id: ac.id,
            name: ac.name,
            slug: ac.slug,
            region: ac.region ?? "No especificada",
            activeTeachers,
            studentsCount,
            revenueSum,
            plan: ac.plan,
            is_active: ac.is_active
          }
        })

        avgRevenuePerAcademy = totalAcademies ? Math.round(totalAcRevenue / totalAcademies) : 0
        avgStudentsPerAcademy = totalAcademies ? Math.round(totalAcStudents / totalAcademies) : 0
      }

      setAcademyKPIs({
        totalAcademies,
        avgRevenuePerAcademy,
        avgStudentsPerAcademy,
        totalTeachersInAcademies
      })
      setAcademyRows(academyRowsList)

    } finally { setBusy(false) }
  }

  async function executeAction() {
    if (!confirm) return
    setActionBusy(true)
    try {
      if (confirm.action === "delete") {
        await supabase.from("TeacherProfile").delete().eq("id", confirm.teacher.id)
        setTeachers(p => p.filter(t => t.id !== confirm.teacher.id))
        if (selected?.id === confirm.teacher.id) setSelected(null)
      } else {
        const suspended = confirm.action === "suspend"
        await supabase.from("TeacherProfile").update({ is_suspended: suspended }).eq("id", confirm.teacher.id)
        setTeachers(p => p.map(t => t.id === confirm.teacher.id ? { ...t, is_suspended: suspended } : t))
        if (selected?.id === confirm.teacher.id) setSelected(prev => prev ? { ...prev, is_suspended: suspended } : prev)
      }
      setConfirm(null)
    } finally { setActionBusy(false) }
  }

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.email.toLowerCase().includes(search.toLowerCase()))
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "revenue") return b.revenue - a.revenue
    if (sort === "students") return b.students - a.students
    return b.classCount - a.classCount
  })

  const geoEntries = Object.entries(geoMap).sort((a,b) => b[1].count - a[1].count)
  const maxGeo = Math.max(...geoEntries.map(e => e[1].count), 1)
  const topDayEntry = Object.entries(dayMap).sort((a,b) => b[1]-a[1])[0]

  return (
    <AdminShell>
      <div className="max-w-6xl mx-auto px-8 py-10 space-y-8 pb-16">

        {/* Confirm modal */}
        {confirm && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/25 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[340px]">
              <h3 className="text-base font-semibold text-neutral-900 mb-1">
                {confirm.action === "delete" ? "Eliminar cuenta" : confirm.action === "suspend" ? "Pausar acceso" : "Reactivar acceso"}
              </h3>
              <p className="text-sm text-neutral-500 mb-5 leading-relaxed">
                {confirm.action === "delete"
                  ? `Se eliminarán permanentemente la cuenta de ${confirm.teacher.name} y todos sus datos. Esta acción no se puede deshacer.`
                  : confirm.action === "suspend"
                  ? `${confirm.teacher.name} no podrá acceder a la plataforma hasta que se reactive su cuenta.`
                  : `Se restaurará el acceso de ${confirm.teacher.name} a la plataforma.`}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setConfirm(null)} className="flex-1 px-4 py-2 text-sm font-medium bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200 transition-colors">
                  Cancelar
                </button>
                <button onClick={executeAction} disabled={actionBusy}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors disabled:opacity-50 ${
                    confirm.action === "delete" ? "bg-red-500 hover:bg-red-600" : confirm.action === "suspend" ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"
                  }`}>
                  {actionBusy ? "…" : confirm.action === "delete" ? "Eliminar" : confirm.action === "suspend" ? "Pausar" : "Reactivar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div>
          <p className="text-[11px] font-medium text-neutral-400 uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight">Resumen de la plataforma</h1>
        </div>

        {busy ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">{[1,2,3,4,5].map(i => <div key={i} className="h-20 bg-white rounded-2xl"/>)}</div>
            <div className="h-64 bg-white rounded-2xl"/>
          </div>
        ) : (
          <>
            {/* KPIs row 1 — Volumen */}
            <section>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">Volumen</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <InsightCard label="Profesores registrados" value={String(kpis?.totalTeachers ?? 0)} sub={`+${kpis?.newThisMonth ?? 0} este mes`} />
                <InsightCard label="Total de alumnos" value={String(kpis?.totalStudents ?? 0)} sub={`${kpis?.activeStudents ?? 0} activos`} />
                <InsightCard label="Clases agendadas" value={String(kpis?.totalClasses ?? 0)} sub="en toda la plataforma" />
                <InsightCard label="Facturación del mes" value={formatCurrency(kpis?.revenueThisMonth ?? 0)} sub={new Date().toLocaleDateString("es-CL",{month:"long"})} />
                <InsightCard label="Volumen total" value={formatCurrency(kpis?.totalRevenue ?? 0)} sub="acumulado histórico" />
              </div>
            </section>

            {/* KPIs row 2 — Inteligencia */}
            <section>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">Inteligencia</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InsightCard label="Cobro promedio" value={formatCurrency(kpis?.avgFeeAcrossPlatform ?? 0)} sub="mensualidad media en la plataforma" />
                <InsightCard label="Alumnos por profesor" value={String(kpis?.avgStudentsPerTeacher ?? 0)} sub="promedio de ocupación" />
                <InsightCard label="Más activo en plataforma" value={kpis?.mostActiveTeacher ?? "—"} sub="último en conectarse" />
                <InsightCard
                  label="Día con más clases"
                  value={topDayEntry?.[0] ?? "—"}
                  sub={topDayEntry ? `${topDayEntry[1]} clases registradas` : "sin datos"}
                />
              </div>
            </section>

            {/* KPIs row 3 — Academias */}
            <section>
              <p className="text-[10px] font-semibold text-neutral-400 uppercase tracking-widest mb-3">Academias</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <InsightCard label="Academias registradas" value={String(academyKPIs.totalAcademies)} sub="activas en Khora" />
                <InsightCard label="Promedio ingresos / ac." value={formatCurrency(academyKPIs.avgRevenuePerAcademy)} sub="facturación media" />
                <InsightCard label="Promedio alumnos / ac." value={`${academyKPIs.avgStudentsPerAcademy} alumnos`} sub="promedio de alumnos" />
                <InsightCard label="Total profesores en ac." value={String(academyKPIs.totalTeachersInAcademies)} sub="profesores vinculados" />
              </div>
            </section>

            {/* Meses con más alumnos — mini bar chart */}
            {Object.keys(monthMap).length > 0 && (
              <section className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-neutral-900 mb-4">Meses con más actividad</h2>
                <div className="flex items-end gap-2 h-16">
                  {MONTHS_ES.filter(m => monthMap[m]).map(m => {
                    const max = Math.max(...Object.values(monthMap))
                    const h = Math.round((monthMap[m] / max) * 100)
                    return (
                      <div key={m} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                        <div className="w-full bg-neutral-900 rounded-sm transition-all duration-500" style={{ height: `${h}%`, minHeight: 4 }} />
                        <span className="text-[9px] text-neutral-400 font-medium">{m.slice(0,3)}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            {/* Teacher table + Geo + Detail panel */}
            <div className="flex gap-5">
              <div className="flex-1 min-w-0 space-y-5">

                {/* Table */}
                <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between gap-4">
                    <h2 className="text-sm font-semibold text-neutral-900 whitespace-nowrap">Cuentas de profesores</h2>
                    <input 
                      type="text" 
                      placeholder="Buscar profesor..." 
                      value={search} 
                      onChange={e => setSearch(e.target.value)}
                      className="text-sm px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500/20 w-full max-w-xs"
                    />
                    <div className="flex gap-1 bg-neutral-100 rounded-lg p-0.5 flex-shrink-0">
                      {(["revenue","students","usage"] as const).map(s => (
                        <button key={s} onClick={() => setSort(s)}
                          className={`px-3 py-1 text-[11px] font-medium rounded-md transition-all ${sort===s?"bg-white text-neutral-900 shadow-sm":"text-neutral-400"}`}>
                          {s==="revenue"?"Ingresos":s==="students"?"Alumnos":"Uso"}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="divide-y divide-neutral-50 max-h-[500px] overflow-y-auto">
                    {sorted.map((t, i) => {
                      const months = Math.floor((Date.now() - new Date(t.joinedAt).getTime()) / (1000*60*60*24*30))
                      const { label: seenLabel, isOnline } = formatLastSeen(t.last_seen_at)
                      const isSelected = selected?.id === t.id
                      return (
                        <div
                          key={t.id}
                          onClick={() => setSelected(isSelected ? null : t)}
                          className={`px-6 py-3 flex items-center gap-4 cursor-pointer transition-colors group ${
                            isSelected ? "bg-neutral-50" : "hover:bg-neutral-50/60"
                          } ${t.is_suspended ? "opacity-50" : ""}`}
                        >
                          <span className="text-[11px] text-neutral-300 w-4 text-right">{i+1}</span>
                          <div className="relative flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 font-semibold flex items-center justify-center text-xs">
                              {t.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5">
                              <LastSeenBadge lastSeenAt={t.last_seen_at} size="sm" />
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-neutral-900 truncate">{t.name}</p>
                              {t.is_suspended && <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-medium">Pausado</span>}
                            </div>
                            <p className="text-[11px] text-neutral-400">{regionFlag(t.region)} {t.region} · <span className={isOnline?"text-emerald-500":""}>{seenLabel}</span></p>
                          </div>
                          <div className="text-right">
                            <p className="text-[12px] font-semibold text-neutral-800">{t.students} alumnos</p>
                            <p className="text-[11px] text-neutral-400">{months}m en plataforma</p>
                          </div>
                          <div className="text-right w-24">
                            <p className="text-[13px] font-semibold text-emerald-600">{formatCurrency(t.revenue)}</p>
                            <p className="text-[11px] text-neutral-400">{t.classCount} clases</p>
                          </div>
                          {/* Actions */}
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setConfirm({ action: t.is_suspended ? "unsuspend" : "suspend", teacher: t })}
                              className="px-2 py-1 rounded-lg bg-amber-50 text-amber-600 text-[11px] font-medium hover:bg-amber-100 transition-colors"
                            >
                              {t.is_suspended ? "Reactivar" : "Pausar"}
                            </button>
                            <button
                              onClick={() => setConfirm({ action: "delete", teacher: t })}
                              className="px-2 py-1 rounded-lg bg-red-50 text-red-500 text-[11px] font-medium hover:bg-red-100 transition-colors"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )
                    })}
                    {teachers.length === 0 && (
                      <div className="px-6 py-12 text-center text-neutral-400 text-sm">Sin cuentas registradas.</div>
                    )}
                  </div>
                </div>

                {/* Academies Table */}
                <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-neutral-50 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-900">Academias registradas</h2>
                    <button
                      onClick={() => setShowAcademiesTable(!showAcademiesTable)}
                      className="text-xs text-neutral-400 font-medium hover:text-neutral-600 transition-colors"
                    >
                      {showAcademiesTable ? "Contraer" : "Expandir"}
                    </button>
                  </div>
                  {showAcademiesTable && (
                    <div className="divide-y divide-neutral-50 max-h-[400px] overflow-y-auto">
                      {academyRows.map(ac => (
                        <div key={ac.id} className="px-6 py-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">{ac.name}</p>
                            <p className="text-xs text-neutral-400">Slug: {ac.slug} · Región: {ac.region}</p>
                          </div>
                          <div className="text-right text-xs space-y-0.5">
                            <p className="font-semibold text-neutral-800">{ac.activeTeachers} profesores activos</p>
                            <p className="text-neutral-400">{ac.studentsCount} alumnos</p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-bold text-emerald-600">{formatCurrency(ac.revenueSum)}</p>
                            <p className="text-[10px] text-neutral-400 uppercase font-black">{ac.plan}</p>
                          </div>
                          <div>
                            <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              ac.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                            }`}>
                              {ac.is_active ? "Activo" : "Inactivo"}
                            </span>
                          </div>
                        </div>
                      ))}
                      {academyRows.length === 0 && (
                        <div className="px-6 py-12 text-center text-neutral-400 text-sm">Sin academias registradas.</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Geo */}
                <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-5">
                  <h2 className="text-sm font-semibold text-neutral-900 mb-4">Distribución geográfica</h2>
                  <div className="space-y-4">
                    {geoEntries.map(([region, data]) => (
                      <div key={region}>
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="text-[12px] text-neutral-700 font-medium">{regionFlag(region)} {region}</span>
                          <div className="text-right">
                            <span className="text-[12px] font-semibold text-neutral-800">{data.count} prof.</span>
                            <span className="text-[11px] text-neutral-400 ml-2">{formatCurrency(data.revenue)}</span>
                          </div>
                        </div>
                        <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full bg-neutral-800 rounded-full" style={{ width: `${(data.count/maxGeo)*100}%` }}/>
                        </div>
                      </div>
                    ))}
                    {geoEntries.length === 0 && <p className="text-sm text-neutral-400">Sin datos geográficos.</p>}
                  </div>
                  {geoEntries.length > 0 && teachers.length > 0 && (
                    <div className="mt-4 px-4 py-3 bg-neutral-50 rounded-xl">
                      <p className="text-[11px] text-neutral-500 leading-relaxed">
                        <strong className="text-neutral-800">{geoEntries[0][0]}</strong> concentra el{" "}
                        {Math.round((geoEntries[0][1].count / teachers.length) * 100)}% de los profesores
                        con <span className="text-emerald-600 font-medium">{formatCurrency(geoEntries[0][1].revenue)}</span> en facturación.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Teacher detail panel */}
              {selected && (
                <div className="w-72 flex-shrink-0 bg-white border border-neutral-100 rounded-2xl shadow-sm overflow-hidden self-start sticky top-4">
                  <div className="px-5 py-4 border-b border-neutral-50 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-neutral-900">Detalle</h2>
                    <button onClick={() => setSelected(null)} className="w-6 h-6 flex items-center justify-center bg-neutral-100 rounded-full text-neutral-500 hover:bg-neutral-200 text-xs">✕</button>
                  </div>
                  <div className="p-5 space-y-5">
                    {/* Avatar */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-xl font-semibold text-neutral-600">
                        {selected.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">{selected.name}</p>
                        <p className="text-[11px] text-neutral-400">{selected.email}</p>
                        <LastSeenBadge lastSeenAt={selected.last_seen_at} size="md" />
                      </div>
                    </div>

                    {/* Details */}
                    {[
                      { label: "Región", value: `${regionFlag(selected.region)} ${selected.region}` },
                      { label: "En plataforma", value: `${Math.floor((Date.now()-new Date(selected.joinedAt).getTime())/(1000*60*60*24*30))} meses` },
                      { label: "Total alumnos", value: `${selected.students} (${selected.activeStudents} activos)` },
                      { label: "Total facturado", value: formatCurrency(selected.revenue) },
                      { label: "Cobro promedio", value: selected.avgFee > 0 ? formatCurrency(selected.avgFee) : "—" },
                      { label: "Clases registradas", value: String(selected.classCount) },
                      { label: "Día con más clases", value: selected.topDay },
                      { label: "Estado", value: selected.is_suspended ? "⚠️ Pausado" : "✅ Activo" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-start">
                        <span className="text-[11px] text-neutral-400">{label}</span>
                        <span className="text-[12px] font-medium text-neutral-800 text-right max-w-[55%]">{value}</span>
                      </div>
                    ))}

                    {/* Instrument select */}
                    <div className="pt-3 border-t border-neutral-100 space-y-1.5">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Especialidad / Instrumento</label>
                      <select
                        value={selected.instrumento || ""}
                        onChange={async (e) => {
                          const val = e.target.value
                          const { error } = await supabase
                            .from("TeacherProfile")
                            .update({ instrumento: val || null })
                            .eq("id", selected.id)

                          if (error) {
                            alert("Error al actualizar: " + error.message)
                          } else {
                            setTeachers(prev => prev.map(t => t.id === selected.id ? { ...t, instrumento: val || null } : t))
                            setSelected(prev => prev ? { ...prev, instrumento: val || null } : null)
                          }
                        }}
                        className="w-full text-xs font-bold bg-neutral-50 border border-neutral-100 rounded-xl px-3 py-2 outline-none focus:bg-white focus:border-violet-300 transition-all cursor-pointer"
                      >
                        <option value="">No especificado</option>
                        <option value="Batería">🥁 Batería</option>
                        <option value="Piano / Teclado">🎹 Piano / Teclado</option>
                        <option value="Guitarra">🎸 Guitarra</option>
                        <option value="Bajo Eléctrico">🎸 Bajo Eléctrico</option>
                        <option value="Canto / Voz">🎤 Canto / Voz</option>
                        <option value="Producción Musical">🎚️ Producción Musical</option>
                        <option value="Otros">🎵 Otros</option>
                      </select>
                    </div>

                    <div className="pt-2 space-y-2 border-t border-neutral-100">
                      <button
                        onClick={() => setConfirm({ action: selected.is_suspended ? "unsuspend" : "suspend", teacher: selected })}
                        className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                          selected.is_suspended
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "bg-amber-50 text-amber-600 hover:bg-amber-100"
                        }`}
                      >
                        {selected.is_suspended ? "Reactivar acceso" : "Pausar acceso"}
                      </button>
                      <button
                        onClick={() => setConfirm({ action: "delete", teacher: selected })}
                        className="w-full py-2 rounded-xl text-sm font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                      >
                        Eliminar cuenta
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  )
}
