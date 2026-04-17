"use client"

import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import ClassDetail from "@/components/classes/ClassDetail"

export default function ClaseDetailPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
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
                href="/dashboard/clases"
                className="text-gray-600 hover:text-gray-900"
              >
                ← Volver a Clases
              </a>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Detalle de Clase
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ClassDetail classId={id as string} />
      </main>
    </div>
  )
}
