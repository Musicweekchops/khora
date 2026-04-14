import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import StudentDetail from "@/components/students/StudentDetail"

export default async function AlumnoDetailPage({
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
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <a
          href="/dashboard/alumnos"
          className="text-neutral-500 hover:text-neutral-900 transition-colors flex items-center gap-1 text-sm font-medium"
        >
          <span>←</span> Volver a Alumnos
        </a>
      </div>
      
      <StudentDetail studentId={id} />
    </div>
  )
}
