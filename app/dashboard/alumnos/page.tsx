import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import StudentsList from "@/components/students/StudentsList"

export default async function AlumnosPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEACHER") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Gestión de Alumnos
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Administra tus alumnos y su información
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a
              href="/dashboard"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Dashboard
            </a>
            <a
              href="/dashboard/alumnos"
              className="px-3 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600"
            >
              Alumnos
            </a>
            <a
              href="/dashboard/clases"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Clases
            </a>
            <a
              href="/dashboard/crm"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              CRM
            </a>
            <a
              href="/dashboard/financiero"
              className="px-3 py-4 text-sm font-medium text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-300"
            >
              Financiero
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentsList />
      </main>
    </div>
  )
}
