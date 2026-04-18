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
  const { user, profile, loading } = useAuth()
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
        <div className="text-center bg-black text-lime-400 font-mono p-4 rounded-xl shadow-lg border border-lime-500/30">
          <p className="font-bold border-b border-lime-500/20 pb-2 mb-2">🚨 DIAGNÓSTICO EN VIVO 🚨</p>
          <p>⏳ loading: <span className="text-white">true</span></p>
          <p>👤 user_id: <span className="text-white">{user?.id ? 'Conectado' : 'null'}</span></p>
          <p>📂 profile: <span className="text-white">{profile ? 'Cargado' : 'null'}</span></p>
          <p className="text-xs text-lime-600 mt-2 italic">Por favor toma captura de este cuadro</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-[#F1F4F8] p-10">
        <div className="text-center bg-black text-rose-400 font-mono p-4 rounded-xl shadow-lg border border-red-500/30">
          <p className="font-bold border-b border-rose-500/20 pb-2 mb-2">🚨 PANTALLA EN BLANCO EVITADA 🚨</p>
          <p>⏳ loading: <span className="text-white">false</span></p>
          <p>👤 user: <span className="text-white">{user ? 'Conectado' : 'Falso/Nulo'}</span></p>
          <p>📂 profile: <span className="text-white">{profile ? 'Cargado' : 'Falso/Nulo'}</span></p>
          <p className="text-xs text-rose-600 mt-2 italic">Por favor toma captura de este cuadro</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-rose-600 text-white rounded hover:bg-rose-500">Refrescar</button>
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
