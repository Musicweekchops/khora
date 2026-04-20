"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import StudentDetail from "@/components/students/StudentDetail"

function DetailContent() {
  const params = useSearchParams()
  const id = params.get("id")
  if (!id) return <p className="text-neutral-500">ID de alumno no proporcionado.</p>
  return <StudentDetail studentId={id} />
}

export default function DetallesAlumnoPage() {
  return <Suspense fallback={<div className="animate-pulse h-32" />}><DetailContent /></Suspense>
}
