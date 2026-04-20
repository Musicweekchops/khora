"use client"

import Sidebar from "@/components/dashboard/Sidebar"
import { useAuth } from "@/lib/context/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push("/login")
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F1F4F8]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F1F4F8] p-10 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-neutral-100 max-w-md w-full">
          <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">⏳</div>
          <h2 className="text-2xl font-black text-neutral-900 mb-2">Cargando Perfil…</h2>
          <p className="text-neutral-500 font-medium mb-6 text-sm">
            El sistema está sincronizando tu cuenta. Si este mensaje persiste por más de 10 segundos, cierra sesión e intenta de nuevo.
          </p>
          <button
            onClick={async () => { await signOut(); router.push("/login") }}
            className="w-full px-6 py-3 bg-neutral-900 text-white rounded-xl font-bold shadow-lg hover:bg-primary transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#F1F4F8]">
      <Sidebar user={{ name: profile.name, role: profile.role }} />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  )
}
