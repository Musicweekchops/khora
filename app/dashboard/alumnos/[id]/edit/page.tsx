"use client"

import { useParams } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import StudentForm from "@/components/students/StudentForm"

export default function EditarAlumnoPage() {
  const { id } = useParams()
  const { profile, loading } = useAuth()

  if (loading) return null
  if (!profile || profile.role !== "TEACHER") return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <a
                href={`/dashboard/alumnos/${id}`}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Volver
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Editar Alumno
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Actualiza la información del alumno
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <StudentForm mode="edit" studentId={id as string} />
        </div>
      </main>
    </div>
  )
}
