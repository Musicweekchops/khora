"use client"

import { useAuth } from "@/lib/context/AuthContext"
import TeacherDashboard from "@/components/dashboard/TeacherDashboard"
import StudentDashboard from "@/components/dashboard/StudentDashboard"

export default function DashboardPage() {
  const { profile } = useAuth()

  if (!profile) return null

  if (profile.role === "TEACHER") {
    return <TeacherDashboard profile={profile} />
  }

  return <StudentDashboard profile={profile} />
}
