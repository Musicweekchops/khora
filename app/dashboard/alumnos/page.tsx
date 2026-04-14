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
