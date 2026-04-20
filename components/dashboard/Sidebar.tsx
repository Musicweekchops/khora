"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"
import { cn } from "@/lib/utils"

const NAV = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Alumnos", href: "/dashboard/alumnos", icon: "👥" },
  { name: "CRM", href: "/dashboard/crm", icon: "📋" },
  { name: "Agenda", href: "/dashboard/agenda", icon: "📅" },
  { name: "Clases", href: "/dashboard/clases", icon: "📖" },
  { name: "Financiero", href: "/dashboard/financiero", icon: "💰" },
]

interface SidebarProps {
  user: { name: string; role: string }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <div
      className="flex flex-col h-screen w-64 fixed left-0 top-0 z-50"
      style={{ background: "#1a1a2e", borderRight: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-lg"
          style={{
            background: "linear-gradient(135deg, rgba(139,92,246,0.8), rgba(79,70,229,0.8))",
            boxShadow: "0 0 20px rgba(139,92,246,0.3)",
          }}
        >
          🥁
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Khora</h1>
          <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>
            Gestión de clases
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 pt-4 overflow-y-auto scrollbar-thin">
        {NAV.map(item => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/20"
                    : "text-neutral-400 hover:text-white hover:bg-white/5",
                )}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Profile */}
      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-bold text-white border border-white/10">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 py-2 rounded-lg transition-colors text-xs font-medium"
          >
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}
