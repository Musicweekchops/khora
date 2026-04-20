"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import StudentForm from "@/components/students/StudentForm"

function EditContent() {
  const params = useSearchParams()
  const id = params.get("id")
  if (!id) return <p className="text-neutral-500">ID de alumno no proporcionado.</p>
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Editar Alumno</h1>
      <StudentForm mode="edit" studentId={id} />
    </div>
  )
}

export default function EditarAlumnoPage() {
  return <Suspense fallback={<div className="animate-pulse h-32" />}><EditContent /></Suspense>
}
