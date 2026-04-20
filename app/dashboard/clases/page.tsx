"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatDate, formatTime } from "@/lib/utils"

interface ClassRow {
  id: string
  date: string
  start_time: string
  end_time: string
  status: string
  modalidad: string
  student_name: string
}

export default function ClasesPage() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.teacherProfileId) loadClasses(profile.teacherProfileId)
  }, [profile?.teacherProfileId])

  async function loadClasses(teacherId: string) {
    const { data, error } = await supabase
      .from("Class")
      .select(`id, date, start_time, end_time, status, modalidad, StudentProfile ( User ( name ) )`)
      .eq("teacher_id", teacherId)
      .order("date", { ascending: false })
      .limit(50)

    if (!error && data) {
      setClasses(data.map((c: any) => ({
        id: c.id,
        date: c.date,
        start_time: c.start_time,
        end_time: c.end_time,
        status: c.status ?? "SCHEDULED",
        modalidad: c.modalidad ?? "online",
        student_name: c.StudentProfile?.User?.name ?? "Sin asignar",
      })))
    }
    setLoading(false)
  }

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-sky-100 text-sky-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-600",
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Clases</h1>
          <p className="text-neutral-500 font-medium mt-1">{classes.length} registradas</p>
        </div>
        <Link href="/dashboard/clases/nueva" className="px-6 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-violet-600 transition-colors shadow-lg">
          + Nueva Clase
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse h-20" />)}</div>
      ) : classes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100">
          <span className="text-5xl mb-4 block opacity-30">📖</span>
          <p className="text-neutral-900 font-bold text-lg">Sin clases todavía</p>
        </div>
      ) : (
        <div className="space-y-3">
          {classes.map(c => (
            <div key={c.id} className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center gap-4 hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-50 to-sky-100 flex flex-col items-center justify-center">
                <span className="text-[10px] font-bold text-sky-600 uppercase">{new Date(c.date + "T12:00").toLocaleDateString("es-CL", { weekday: "short" })}</span>
                <span className="text-lg font-black text-sky-700">{new Date(c.date + "T12:00").getDate()}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-neutral-900">{c.student_name}</p>
                <p className="text-sm text-neutral-500">{formatTime(c.start_time)} – {formatTime(c.end_time)} · {c.modalidad === "online" ? "Virtual" : "Presencial"}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[c.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                {c.status === "SCHEDULED" ? "Programada" : c.status === "COMPLETED" ? "Completada" : "Cancelada"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
