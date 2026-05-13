"use client"

import { useAuth } from "@/lib/context/AuthContext"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/navigation"

const NAV = [
  { section: "Plataforma", items: [
    { label: "Resumen", href: "/dashboard/admin", icon: "▣" },
  ]},
  { section: "Sistema", items: [
    { label: "Ajustes", href: "/dashboard/admin/sistema", icon: "⚙" },
  ]},
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { profile, user, loading, signOut } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  useEffect(() => {
    // If auth check is done and user is either not logged in or not an admin, kick them out
    if (!loading && (!user || (profile && !profile.is_admin))) {
      router.replace("/dashboard")
    }
  }, [loading, user, profile, router])

  // Show spinner only while loading, or if we have a user but are still waiting for the profile
  if (loading || (user && profile === null && loading)) {
    return (
      <div className="fixed inset-0 z-[60] bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-neutral-200 border-t-neutral-800 animate-spin" />
          <p className="text-[11px] text-neutral-400 font-medium tracking-wide">Cargando...</p>
        </div>
      </div>
    )
  }

  // Safety net
  if (!profile?.is_admin) return null

  return (
    <div className="fixed inset-0 z-[60] flex bg-[#f5f5f7] font-sans">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-white border-r border-neutral-200/80 flex flex-col">
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">SA</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900 leading-tight">Khora Admin</p>
              <p className="text-[10px] text-neutral-400">Panel de control</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-4">
          {NAV.map(group => (
            <div key={group.section}>
              <p className="px-3 pb-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-widest">{group.section}</p>
              {group.items.map(item => {
                const active = pathname === item.href || (item.href !== "/dashboard/admin" && pathname?.startsWith(item.href))
                return (
                  <Link key={item.href} href={item.href}>
                    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all ${
                      active ? "bg-neutral-900 text-white font-medium" : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                    }`}>
                      <span className="text-[12px]">{item.icon}</span>
                      {item.label}
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-100">
          <div className="px-3 py-2 flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-neutral-900 flex items-center justify-center text-[10px] font-semibold text-white">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-[12px] font-medium text-neutral-700 truncate">{profile.name}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-3 py-1.5 rounded-lg text-[12px] text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
