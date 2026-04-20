"use client"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import ClassDetailView from "@/components/classes/ClassDetailView"

function Content() {
  const params = useSearchParams()
  const id = params.get("id")
  if (!id) return <p className="text-neutral-500">ID de clase no proporcionado.</p>
  return <ClassDetailView classId={id} />
}

export default function ClaseDetallePage() {
  return <Suspense fallback={<div className="animate-pulse h-64 bg-white rounded-3xl" />}><Content /></Suspense>
}
