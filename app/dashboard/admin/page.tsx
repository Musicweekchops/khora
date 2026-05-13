"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { formatCurrency } from "@/lib/utils"
import LastSeenBadge from "@/components/ui/LastSeenBadge"

interface AdminMetrics {
  totalTeachers: number;
  totalStudents: number;
  totalRevenue: number;
  teachersData: any[];
}

export default function AdminDashboardPage() {
  const { profile } = useAuth()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.is_admin) {
      loadAdminData()
    }
  }, [profile])

  async function loadAdminData() {
    try {
      // 1. Fetch all teachers with their users
      const { data: teachers } = await supabase
        .from("TeacherProfile")
        .select(`
          id, region, created_at, business_name, user_id,
          User ( name, email, is_admin ),
          StudentProfile ( id ),
          Payment ( amount )
        `)
        
      if (!teachers) return

      // 2. Fetch last_seen for all teacher user IDs
      const userIds = teachers.map((t: any) => t.user_id).filter(Boolean)
      const { data: seenData } = await supabase
        .from("user_last_seen")
        .select("id, last_sign_in_at")
        .in("id", userIds)

      const seenMap: Record<string, string | null> = {}
      for (const row of seenData ?? []) seenMap[row.id] = row.last_sign_in_at

      let totalStudents = 0;
      let totalRevenue = 0;

      const formattedTeachers = teachers.map((t: any) => {
        const studentCount = t.StudentProfile?.length || 0;
        const teacherRevenue = (t.Payment || []).reduce((acc: number, p: any) => acc + (Number(p.amount) || 0), 0);
        
        totalStudents += studentCount;
        totalRevenue += teacherRevenue;

        return {
          id: t.id,
          user_id: t.user_id,
          name: t.User?.name || 'Desconocido',
          email: t.User?.email || '',
          region: t.region || 'No especificada',
          students: studentCount,
          revenue: teacherRevenue,
          businessName: t.business_name || '-',
          last_seen_at: seenMap[t.user_id] ?? null,
        }
      })

      formattedTeachers.sort((a, b) => b.revenue - a.revenue)

      setMetrics({
        totalTeachers: formattedTeachers.length,
        totalStudents,
        totalRevenue,
        teachersData: formattedTeachers
      })
    } catch (e) {
      console.error("Error loading admin data:", e)
    } finally {
      setLoading(false)
    }
  }

  if (!profile?.is_admin) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-neutral-500">
        <p>No tienes permisos para ver esta página.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-10 w-48 bg-neutral-200 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-neutral-200 rounded-2xl"></div>
        <div className="h-32 bg-neutral-200 rounded-2xl"></div>
        <div className="h-32 bg-neutral-200 rounded-2xl"></div>
      </div>
      <div className="h-64 bg-neutral-200 rounded-2xl"></div>
    </div>
  }

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Panel de Control</h1>
        <p className="text-neutral-500 font-medium mt-1">Visión global de Khora</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-black text-violet-500 uppercase tracking-widest mb-2">Profesores Activos</p>
            <h2 className="text-4xl font-black text-neutral-900">{metrics?.totalTeachers || 0}</h2>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-violet-50 rounded-full blur-2xl" />
        </div>
        
        <div className="bg-white rounded-[32px] p-8 border border-neutral-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2">Total Alumnos</p>
            <h2 className="text-4xl font-black text-neutral-900">{metrics?.totalStudents || 0}</h2>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-50 rounded-full blur-2xl" />
        </div>

        <div className="bg-neutral-900 rounded-[32px] p-8 border border-neutral-800 shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">Volumen Transado Global</p>
            <h2 className="text-4xl font-black text-white">{formatCurrency(metrics?.totalRevenue || 0)}</h2>
          </div>
          <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />
        </div>
      </div>

      {/* Teacher List */}
      <div className="bg-white rounded-[32px] border border-neutral-100 p-8 shadow-sm">
        <h3 className="text-xl font-black text-neutral-900 mb-6">Ranking de Profesores</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Profesor</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Conexión</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Región</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Alumnos</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Facturación</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {metrics?.teachersData.map((t, idx) => (
                <tr key={t.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center text-xs">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5">
                          <LastSeenBadge lastSeenAt={t.last_seen_at} size="sm" />
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900">{t.name}</p>
                        <p className="text-[11px] text-neutral-400">{t.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <LastSeenBadge lastSeenAt={t.last_seen_at} size="md" />
                  </td>
                  <td className="py-4">
                    <span className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                      {t.region}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-bold text-neutral-700">{t.students}</td>
                  <td className="py-4 text-sm font-black text-emerald-600">{formatCurrency(t.revenue)}</td>
                  <td className="py-4">
                    <button className="text-xs font-bold text-violet-600 hover:text-violet-800 transition-colors">Ver Detalles</button>
                  </td>
                </tr>
              ))}
              {metrics?.teachersData.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-neutral-400 text-sm">
                    No hay profesores registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
