"use client"
import StudentForm from "@/components/students/StudentForm"
export default function NuevoAlumnoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Nuevo Alumno</h1>
      <StudentForm mode="create" />
    </div>
  )
}
