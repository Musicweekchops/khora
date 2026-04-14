import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import StudentForm from "@/components/students/StudentForm"

export default async function EditarAlumnoPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "TEACHER") {
    redirect("/login")
  }

  // Await params in Next.js 15
  const { id } = await params

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <StudentForm mode="edit" studentId={id} />
        </div>
      </main>
    </div>
  )
}
