"use client"

import Sidebar from "@/components/dashboard/Sidebar"
import { useAuth } from "@/lib/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#F1F4F8] p-10">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-6"></div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#F1F4F8] p-10 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">
            ⚠️
          </div>
          <h2 className="text-2xl font-black text-neutral-900 mb-2">Perfil No Encontrado</h2>
          <p className="text-neutral-500 font-medium mb-8 text-sm">
            El sistema reconoce tu inicio de sesión, pero no existe una fila para ti en la base de datos pública. Esto ocurre si la base de datos falló al registrarte (por el error anterior del Trigger SQL).
          </p>
          <p className="text-neutral-500 font-bold mb-8 text-sm">
            Solución: Cierra sesión aquí abajo, luego ve a la consola de Supabase (Editor ▸ Authentication), borra tu correo allí, y vuelve a registrarte en Khora.
          </p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={async () => {
                await signOut()
                router.push('/login')
              }}
              className="w-full px-6 py-3 bg-neutral-900 text-white rounded-xl font-black shadow-lg hover:bg-primary transition-colors cursor-pointer"
            >
              Cerrar Sesión Definitivamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F1F4F8]">
      {/* Sidebar */}
      <Sidebar user={{ name: profile.name, role: profile.role }} />

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
