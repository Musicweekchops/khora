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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🥁 Mi Portal de Alumno
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Bienvenido, {user.name}
              </p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Próxima Clase */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <h2 className="text-2xl font-bold mb-4">📅 Próxima Clase</h2>
          <div className="text-center py-8">
            <p className="text-lg opacity-90">No tienes clases programadas</p>
            <p className="text-sm opacity-75 mt-2">
              Contacta a tu profesor para agendar tu primera clase
            </p>
          </div>
        </div>

        {/* Progreso */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📊 Mi Progreso
          </h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Aún no has tomado clases</p>
            <p className="text-sm mt-2">Tu progreso aparecerá aquí después de tu primera clase</p>
          </div>
        </div>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Estado de Pago */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              💰 Estado de Pago
            </h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-gray-600">No hay pagos pendientes</p>
            </div>
          </div>

          {/* Tareas Pendientes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              📝 Tareas Pendientes
            </h3>
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✨</div>
              <p className="text-gray-600">No tienes tareas asignadas</p>
            </div>
          </div>
        </div>

        {/* Historial de Clases */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            📚 Historial de Clases
          </h2>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Aún no has tomado ninguna clase</p>
            <p className="text-sm mt-2">Tu historial de clases aparecerá aquí</p>
          </div>
        </div>
      </main>
    </>
  )
}
