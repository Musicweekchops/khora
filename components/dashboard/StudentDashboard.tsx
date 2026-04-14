"use client"

import { signOut } from "next-auth/react"

interface StudentDashboardProps {
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  return (
    <>
      <div>
        {/* Próxima Clase */}
        <div className="bg-gradient-to-br from-primary/80 to-primary rounded-xl shadow-lg p-8 mb-8 text-white shadow-primary/20">
          <h2 className="text-2xl font-bold mb-4">📅 Próxima Clase</h2>
          <div className="text-center py-8">
            <p className="text-lg opacity-90">No tienes clases programadas</p>
            <p className="text-sm opacity-75 mt-2">
              Contacta a tu profesor para agendar tu primera clase
            </p>
          </div>
        </div>

        {/* Progreso */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            📊 Mi Progreso
          </h2>
          <div className="text-center py-12 text-neutral-400 font-medium">
            <p className="text-lg">Aún no has tomado clases</p>
            <p className="text-sm mt-2 font-normal">Tu progreso aparecerá aquí después de tu primera clase</p>
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado de Pago */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              💰 Estado de Pago
            </h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-neutral-600 font-medium">No hay pagos pendientes</p>
            </div>
          </div>

          {/* Tareas Pendientes */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              📝 Tareas Pendientes
            </h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-neutral-600 font-medium">No tienes tareas asignadas</p>
            </div>
          </div>
        </div>

        {/* Historial de Clases */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">
            📚 Historial de Clases
          </h2>
          <div className="text-center py-12 text-neutral-400 font-medium">
            <p className="text-lg">Aún no has tomado ninguna clase</p>
            <p className="text-sm mt-2 font-normal">Tu historial de clases aparecerá aquí</p>
          </div>
        </div>
      </div>
    </>
  )
}
