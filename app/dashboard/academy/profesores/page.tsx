"use client"

import { useAuth } from "@/lib/context/AuthContext"
import AcademyTeacherList from "@/components/academy/AcademyTeacherList"

export default function AcademyTeachersPage() {
  const { profile } = useAuth()
  const academyId = profile?.academyProfileId

  if (!profile || profile.role !== "ACADEMY") {
    return (
      <div className="p-8 text-center text-sm text-neutral-500 font-sans">
        No tienes permisos para acceder a esta página.
      </div>
    )
  }

  if (!academyId) {
    return (
      <div className="p-8 text-center animate-pulse font-sans">
        Cargando perfil de academia...
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-widest mb-1 font-sans">Academia</p>
        <h1 className="text-2xl font-semibold text-neutral-900 tracking-tight font-sans">Profesores</h1>
        <p className="text-xs text-neutral-400 mt-0.5 font-sans">Administra los profesores de tu academia, crea cuentas y supervisa su estado.</p>
      </div>

      <AcademyTeacherList academyId={academyId} />
    </div>
  )
}
