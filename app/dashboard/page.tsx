"use client"

import TeacherDashboard from "@/components/dashboard/TeacherDashboard"
import StudentDashboard from "@/components/dashboard/StudentDashboard"
import { useAuth } from "@/lib/context/AuthContext"

export default function DashboardPage() {
  const { profile, loading } = useAuth()

  if (loading) return null
  if (!profile) return null

  return (
    <>
      {profile.role === "TEACHER" ? (
        <TeacherDashboard user={profile} />
      ) : (
        <StudentDashboard user={profile} />
      )}
    </>
  )
}
