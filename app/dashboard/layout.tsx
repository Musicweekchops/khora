"use client"

import Sidebar from "@/components/dashboard/Sidebar"
import OnboardingTour from "@/components/dashboard/OnboardingTour"
import PushRegister from "@/components/dashboard/PushRegister"
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
      <div className="flex h-screen w-full items-center justify-center bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center animate-pulse">
            <span className="text-white text-sm font-bold">K</span>
          </div>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#fafafa] p-8">
        <div className="kh-card p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center text-xl mx-auto mb-5">⏳</div>
          <h2 className="kh-title text-lg mb-2">Sincronizando perfil</h2>
          <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
            Si este mensaje persiste por más de 10 segundos, cierra sesión e intenta de nuevo.
          </p>
          <button
            onClick={async () => { await signOut(); router.push("/login") }}
            className="kh-btn-primary w-full py-2.5"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <OnboardingTour />
      <PushRegister />
      <Sidebar user={{ name: profile.name, role: profile.role, is_admin: profile.is_admin }} />
      <main className="flex-1 lg:ml-[240px] min-h-screen pb-32 lg:pb-0">
        <div className="p-4 lg:p-8 max-w-[1400px] mx-auto page-enter">
          {children}
        </div>
      </main>
    </div>
  )
}
