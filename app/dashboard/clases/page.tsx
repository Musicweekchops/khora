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
    if (profile?.role === "TEACHER" && profile.teacherProfileId) {
      loadClassesTeacher(profile.teacherProfileId)
    } else if (profile?.role === "STUDENT" && profile.studentProfileId) {
      loadClassesStudent(profile.studentProfileId)
    }
  }, [profile])

  async function loadClassesTeacher(teacherId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from("Class")
      .select(`id, date, start_time, end_time, status, modalidad, StudentProfile(User(name))`)
      .eq("teacher_id", teacherId)
      .order("date", { ascending: true }) // CRONOLÓGICO
      .limit(50)

    if (!error && data) {
      setClasses(data.map((c: any) => {
        const studentName = Array.isArray(c.StudentProfile?.User)
          ? c.StudentProfile?.User[0]?.name
          : c.StudentProfile?.User?.name

        return {
          id: c.id,
          date: c.date,
          start_time: c.start_time,
          end_time: c.end_time,
          status: c.status ?? "SCHEDULED",
          modalidad: c.modalidad ?? "online",
          student_name: studentName ?? "Sin asignar",
        }
      }))
    }
    setLoading(false)
  }

  async function loadClassesStudent(studentId: string) {
    setLoading(true)
    const { data, error } = await supabase
      .from("Class")
      .select(`id, date, start_time, end_time, status, modalidad, TeacherProfile(User(name))`)
      .eq("student_id", studentId)
      .order("date", { ascending: true }) // CRONOLÓGICO: de la más próxima hacia adelante
      .limit(50)

    if (!error && data) {
      setClasses(data.map((c: any) => {
        const teacherName = Array.isArray(c.TeacherProfile?.User) 
          ? c.TeacherProfile?.User[0]?.name 
          : c.TeacherProfile?.User?.name
        
        return {
          id: c.id,
          date: c.date,
          start_time: c.start_time,
          end_time: c.end_time,
          status: c.status ?? "SCHEDULED",
          modalidad: c.modalidad ?? "online",
          student_name: teacherName ? `Prof. ${teacherName}` : "Prof. Desconocido",
        }
      }))
    }
    setLoading(false)
  }

  const statusColors: Record<string, string> = {
    SCHEDULED: "bg-sky-100 text-sky-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-600",
  }

  // Agrupar clases por mes
  const groupedClasses = classes.reduce((acc, currentClass) => {
    // Formato de fecha para el título (ej: "Agosto 2026")
    const dateObj = new Date(currentClass.date + "T12:00")
    const monthYear = dateObj.toLocaleDateString("es-CL", { month: "long", year: "numeric" })
    const capitalizedMonth = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)
    
    if (!acc[capitalizedMonth]) {
      acc[capitalizedMonth] = []
    }
    acc[capitalizedMonth].push(currentClass)
    return acc
  }, {} as Record<string, ClassRow[]>)

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Clases</h1>
          <p className="text-neutral-500 font-medium mt-1">{classes.length} registradas</p>
        </div>
        {profile?.role === "TEACHER" && (
          <Link href="/dashboard/clases/nueva" className="px-6 py-3 bg-neutral-900 text-white rounded-2xl text-sm font-bold hover:bg-violet-600 transition-colors shadow-lg">
            + Nueva Clase
          </Link>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse h-20" />)}</div>
      ) : classes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-neutral-100">
          <span className="text-5xl mb-4 block opacity-30">📖</span>
          <p className="text-neutral-900 font-bold text-lg">Sin clases todavía</p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(groupedClasses).map(([monthStr, monthClasses]) => (
            <div key={monthStr} className="space-y-4">
              <h2 className="text-xl font-black text-neutral-800 flex items-center gap-3">
                <span className="w-2 h-6 bg-violet-500 rounded-full" />
                {monthStr}
              </h2>
              <div className="grid gap-3">
                {monthClasses.map(c => (
                  <Link key={c.id} href={`/dashboard/clases/detalles?id=${c.id}`}>
                    <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-center gap-5 hover:shadow-md hover:border-violet-200 transition-all group cursor-pointer">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-50 to-violet-100 flex flex-col items-center justify-center border border-violet-100/50">
                        <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest">{new Date(c.date + "T12:00").toLocaleDateString("es-CL", { weekday: "short" })}</span>
                        <span className="text-xl font-black text-violet-900 leading-none mt-0.5">{new Date(c.date + "T12:00").getDate()}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-neutral-900 group-hover:text-violet-600 transition-colors text-lg">{c.student_name}</p>
                        <p className="text-sm text-neutral-500 font-medium flex items-center gap-2 mt-1">
                          <span className="flex items-center gap-1 opacity-70">🕒 {formatTime(c.start_time)} – {formatTime(c.end_time)}</span>
                          <span className="w-1 h-1 rounded-full bg-neutral-300" />
                          <span className="flex items-center gap-1 opacity-70">{c.modalidad === "online" ? "💻 Virtual" : "🏠 Presencial"}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[c.status] ?? "bg-neutral-100 text-neutral-500"}`}>
                          {c.status === "SCHEDULED" ? "Programada" : c.status === "COMPLETED" ? "Completada" : "Cancelada"}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors text-neutral-400">
                          →
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
