"use client"

import { useParams } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import StudentDetail from "@/components/students/StudentDetail"

export default function AlumnoDetailPage() {
  const { id } = useParams()
  const { profile, loading } = useAuth()

  if (loading) return null
  if (!profile || profile.role !== "TEACHER") return null

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <a
          href="/dashboard/alumnos"
          className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          <span>←</span> Volver a Alumnos
        </a>
      </div>
      
      <StudentDetail studentId={id as string} />
    </div>
  )
}
