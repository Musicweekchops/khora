"use client"

import type { UserProfile } from "@/lib/context/AuthContext"

export default function StudentDashboard({ profile }: { profile: UserProfile }) {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Mi Panel</h1>
        <p className="text-neutral-500 font-medium mt-1">Hola, {profile.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-neutral-100 p-8">
          <span className="text-3xl mb-4 block">📖</span>
          <h3 className="text-lg font-bold text-neutral-900 mb-2">Mis Clases</h3>
          <p className="text-sm text-neutral-500">Tu historial de clases programadas aparecerá aquí.</p>
        </div>
        <div className="bg-white rounded-2xl border border-neutral-100 p-8">
          <span className="text-3xl mb-4 block">📝</span>
          <h3 className="text-lg font-bold text-neutral-900 mb-2">Mis Tareas</h3>
          <p className="text-sm text-neutral-500">Las tareas asignadas por tu profesor aparecerán aquí.</p>
        </div>
      </div>
    </div>
  )
}
