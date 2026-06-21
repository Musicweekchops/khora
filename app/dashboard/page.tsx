"use client"
 
import { useAuth } from "@/lib/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import TeacherDashboard from "@/components/dashboard/TeacherDashboard"
import StudentDashboard from "@/components/dashboard/StudentDashboard"
import AcademyDashboard from "@/components/dashboard/AcademyDashboard"

export default function DashboardPage() {
  const { profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (profile && profile.role === "STUDENT") {
      router.replace("/dashboard/agendar")
    }
  }, [profile, router])

  if (!profile) return null

  if (profile.role === "ACADEMY") {
    return <AcademyDashboard />
  }

  if (profile.role === "TEACHER") {
    return <TeacherDashboard profile={profile} />
  }

  // Para alumnos, mostramos un indicador de carga corto mientras redirige
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
