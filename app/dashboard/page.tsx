"use client"

import TeacherDashboard from "@/components/dashboard/TeacherDashboard"
import StudentDashboard from "@/components/dashboard/StudentDashboard"
import { useAuth } from "@/lib/context/AuthContext"

export default function DashboardPage() {
  const { profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-neutral-500">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p>Cargando sesión...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-xl font-bold text-red-600 mb-2">Tu perfil aún no se genera en la base de datos.</p>
        <p className="text-neutral-500 max-w-md mb-6">El sistema te registró, pero no pudimos extraer tu rol (Teacher/Student). Si acabas de registrarte, asegúrate de haber ejecutado el SQL Trigger correctamente en Supabase para que cree tu "User" y "TeacherProfile".</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
          Refrescar Página
        </button>
      </div>
    )
  }

  // Fallback si teacherProfileId falla y el loader de components se queda infinito
  if (profile.role === "TEACHER" && !profile.teacherProfileId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <p className="text-xl font-bold text-orange-600 mb-2">Falta tu TeacherProfile en Supabase</p>
        <p className="text-neutral-500 max-w-md mb-6">La tabla "User" registra que eres profesor, pero la tabla "TeacherProfile" no tiene una fila con tu userId. El Trigger de Postgres falló al crearlo. Vuelve a ejecutar el Trigger en el SQL Editor y crea un nuevo usuario.</p>
      </div>
    )
  }

  return (
    <>
      {profile.role === "TEACHER" ? (
        <TeacherDashboard user={profile} />
      ) : (
        <StudentDashboard user={profile} />
      )}
    </>
  )
}
