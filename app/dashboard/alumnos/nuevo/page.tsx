"use client"

import { useAuth } from "@/lib/context/AuthContext"
import StudentForm from "@/components/students/StudentForm"

export default function NuevoAlumnoPage() {
  const { profile, loading } = useAuth()

  if (loading) return null
  if (!profile || profile.role !== "TEACHER") return null

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">
          Agregar Nuevo Alumno
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Registra un nuevo alumno en el sistema
        </p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
        <StudentForm mode="create" />
      </div>
    </div>
  )
}
