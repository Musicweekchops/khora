"use client"

import StudentsList from "@/components/students/StudentsList"
import { useAuth } from "@/lib/context/AuthContext"

export default function AlumnosPage() {
  const { profile, loading } = useAuth()

  if (loading) return null
  if (!profile || profile.role !== "TEACHER") return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Gestión de Alumnos
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Administra tus alumnos y su información
        </p>
      </div>
      <StudentsList />
    </div>
  )
}
