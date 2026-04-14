import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import TeacherDashboard from "@/components/dashboard/TeacherDashboard"
import StudentDashboard from "@/components/dashboard/StudentDashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <>
      {session.user.role === "TEACHER" ? (
        <TeacherDashboard user={session.user} />
      ) : (
        <StudentDashboard user={session.user} />
      )}
    </>
  )
}
