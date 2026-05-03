"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { UserProfile } from "@/lib/context/AuthContext"
import { 
  Calendar, 
  Clock, 
  ClipboardList, 
  Video, 
  ChevronRight,
  BookOpen
} from "lucide-react"
import Link from "next/link"

interface StudentStats {
  upcomingClasses: number
  pendingTasks: number
  totalMaterials: number
}

export default function StudentDashboard({ profile }: { profile: UserProfile }) {
  const [stats, setStats] = useState<StudentStats>({ upcomingClasses: 0, pendingTasks: 0, totalMaterials: 0 })
  const [nextClass, setNextClass] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.studentProfileId) loadData()
  }, [profile?.studentProfileId])

  async function loadData() {
    setLoading(true)
    const now = new Date().toISOString()
    
    // 1. Next Class
    const { data: nc } = await supabase
      .from("Class")
      .select("*, TeacherProfile(User(name))")
      .eq("student_id", profile.studentProfileId!)
      .gte("date", now.split('T')[0])
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(1)
      .maybeSingle()
    
    if (nc) setNextClass(nc)

    // 2. Stats
    const { count: upcoming } = await supabase
      .from("Class")
      .select("*", { count: 'exact', head: true })
      .eq("student_id", profile.studentProfileId!)
      .gte("date", now.split('T')[0])

    const { count: tasks } = await supabase
      .from("Task")
      .select("*", { count: 'exact', head: true })
      .eq("student_id", profile.studentProfileId!)
      .eq("completed", false)

    // 3. Materials count
    const { data: studentProfile } = await supabase
      .from("StudentProfile")
      .select("teacher_id")
      .eq("id", profile.studentProfileId!)
      .single()

    const { count: materials } = await supabase
      .from("LibraryContent")
      .select("*", { count: 'exact', head: true })
      .eq("teacher_id", studentProfile?.teacher_id)
      .eq("is_public", true)

    setStats({
      upcomingClasses: upcoming || 0,
      pendingTasks: tasks || 0,
      totalMaterials: materials || 0
    })

    setLoading(false)
  }

  if (loading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-48 bg-neutral-100 rounded-[40px]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-32 bg-neutral-100 rounded-3xl" />)}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* WELCOME */}
      <div className="bg-neutral-900 rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl font-black tracking-tight mb-2">¡Hola, {profile.name}! 👋</h1>
          <p className="text-neutral-500 font-medium max-w-md">Bienvenido a tu panel de estudio. Aquí tienes un resumen de tu progreso y próximas clases.</p>
          
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/dashboard/clases" className="px-6 py-3 bg-white text-neutral-900 rounded-2xl text-xs font-black hover:bg-neutral-100 transition-all flex items-center gap-2">
              Explorar mis clases <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Subtler shapes */}
        <div className="absolute top-[-40%] right-[-10%] w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[5%] w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full" />
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Clases Pendientes" 
          value={stats.upcomingClasses} 
          icon={<Calendar className="w-6 h-6" />} 
          color="bg-slate-50 text-slate-600"
          href="/dashboard/clases"
        />
        <StatCard 
          label="Tareas por Hacer" 
          value={stats.pendingTasks} 
          icon={<ClipboardList className="w-6 h-6" />} 
          color="bg-neutral-50 text-neutral-600"
          href="/dashboard/tareas"
        />
        <StatCard 
          label="Material Asignado" 
          value={stats.totalMaterials} 
          icon={<BookOpen className="w-6 h-6" />} 
          color="bg-indigo-50 text-indigo-600"
          href="/dashboard/biblioteca"
        />
      </div>

      {/* NEXT CLASS FOCUS */}
      {nextClass && (
        <div className="bg-white rounded-[40px] border border-neutral-100 p-8 shadow-sm">
          <h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.2em] mb-6">Próxima Clase</h3>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-neutral-50 rounded-3xl flex flex-col items-center justify-center border border-neutral-100">
                <span className="text-[10px] font-black text-neutral-400 uppercase">{new Date(nextClass.date).toLocaleDateString('es-CL', { month: 'short' })}</span>
                <span className="text-xl font-black text-neutral-900 leading-none">{new Date(nextClass.date).getDate() + 1}</span>
              </div>
              <div>
                <h4 className="text-xl font-black text-neutral-900 tracking-tight">Próxima Clase</h4>
                <div className="flex items-center gap-3 mt-1 text-sm text-neutral-500 font-medium">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-40" /> {nextClass.start_time.slice(0,5)}</span>
                  <span className="w-1 h-1 rounded-full bg-neutral-200" />
                  <span className="flex items-center gap-1.5"><Video className="w-4 h-4 opacity-40" /> {nextClass.modalidad === "online" ? "Virtual" : "Presencial"}</span>
                </div>
              </div>
            </div>
            <Link 
              href={`/dashboard/clases/detalles?id=${nextClass.id}`}
              className="px-8 py-4 bg-neutral-100 text-neutral-900 rounded-3xl text-sm font-black hover:bg-neutral-900 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              Ver Detalles de Clase
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon, color, href }: any) {
  const content = (
    <>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
        <p className="text-3xl font-black text-neutral-900">{value}</p>
      </div>
      {href && <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-neutral-600 transition-colors" />}
    </>
  )

  const className = "bg-white rounded-[32px] p-6 border border-neutral-100 shadow-sm flex items-center gap-5 hover:shadow-md hover:border-neutral-200 transition-all group cursor-pointer"

  if (href) {
    return <Link href={href} className={className}>{content}</Link>
  }
  return <div className={className}>{content}</div>
}
