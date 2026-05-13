"use client"

import { useAuth } from "@/lib/context/AuthContext"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

const ADMIN_NAV = [
  { name: "Global", href: "/dashboard/admin", icon: "🌐", description: "Métricas globales" },
  { name: "Profesores", href: "/dashboard/admin/profesores", icon: "👨‍🏫", description: "Gestión de profesores" },
  { name: "Alumnos", href: "/dashboard/admin/alumnos", icon: "👥", description: "Todos los alumnos" },
  { name: "Finanzas", href: "/dashboard/admin/finanzas", icon: "💰", description: "Ingresos de la plataforma" },
  { name: "Sistema", href: "/dashboard/admin/sistema", icon: "⚙️", description: "Configuración" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && (!profile || !profile.is_admin)) {
      router.replace("/dashboard")
    }
  }, [profile, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center animate-pulse">
            <span className="text-white text-sm font-bold">SA</span>
          </div>
          <div className="flex gap-1">
            {[0, 150, 300].map(d => (
              <div key={d} className="w-1.5 h-1.5 rounded-full bg-rose-500/50 animate-bounce" style={{ animationDelay: `${d}ms` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!profile?.is_admin) return null

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Admin Sidebar — Dark, distinct */}
      <aside className="hidden lg:flex flex-col h-screen w-[260px] fixed left-0 top-0 z-50 bg-neutral-900 border-r border-neutral-800">
        {/* Header */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-neutral-800">
          <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/50">
            <span className="text-white text-xs font-black">SA</span>
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none">Super Admin</h1>
            <p className="text-[10px] text-neutral-500 font-medium mt-0.5">Panel de Control Global</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map(item => {
            const isActive = pathname === item.href || (item.href !== "/dashboard/admin" && pathname?.startsWith(item.href))
            return (
              <Link key={item.name} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-rose-600/20 text-rose-400 border border-rose-600/30"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800 border border-transparent"
                }`}>
                  <span className="text-base">{item.icon}</span>
                  <div>
                    <p className={`font-bold text-[13px] ${isActive ? "text-rose-300" : ""}`}>{item.name}</p>
                    <p className="text-[10px] text-neutral-600">{item.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Switch to teacher view */}
        <div className="p-3 border-t border-neutral-800 space-y-1">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-neutral-500 hover:text-violet-400 hover:bg-violet-900/20 transition-all text-[13px] font-medium border border-transparent">
              <span>↩️</span>
              <span>Volver a mi panel</span>
            </div>
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-rose-900 text-rose-300 flex items-center justify-center text-xs font-black">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-neutral-300 truncate">{profile.name}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-rose-500">Super Admin</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 text-neutral-600 hover:text-red-400 hover:bg-red-900/20 rounded-xl transition-colors text-[13px] font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-[260px] min-h-screen">
        <div className="p-6 lg:p-10 max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
