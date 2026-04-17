"use client"

import { useAuth } from "@/lib/context/AuthContext"
import ClassForm from "@/components/classes/ClassForm"

export default function NuevaClasePage() {
  const { profile, loading } = useAuth()

  if (loading) return null
  if (!profile || profile.role !== "TEACHER") return null

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Agendar Nueva Clase
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Programa una clase para un alumno
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <ClassForm />
        </div>
      </main>
    </div>
  )
}
