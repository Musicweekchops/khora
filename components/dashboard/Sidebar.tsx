"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/context/AuthContext"

/* ── SVG Icon system (lightweight, no dependencies) ── */
const Icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  students: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  crm: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
    </svg>
  ),
  calendar: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  classes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M4 4.5A2.5 2.5 0 016.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15z" />
    </svg>
  ),
  financial: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  library: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 6 4 14" /><path d="M12 6v14" /><path d="M8 8v12" /><path d="M4 4v16" />
    </svg>
  ),
}

const TEACHER_NAV = [
  { name: "Dashboard", href: "/dashboard", icon: Icons.dashboard },
  { name: "Alumnos", href: "/dashboard/alumnos", icon: Icons.students },
  { name: "CRM", href: "/dashboard/crm", icon: Icons.crm },
  { name: "Agenda", href: "/dashboard/agenda", icon: Icons.calendar },
  { name: "Clases", href: "/dashboard/clases", icon: Icons.classes },
  { name: "Biblioteca", href: "/dashboard/biblioteca", icon: Icons.library },
  { name: "Financiero", href: "/dashboard/financiero", icon: Icons.financial },
]

const STUDENT_NAV = [
  { name: "Dashboard", href: "/dashboard", icon: Icons.dashboard },
  { name: "Mis Clases", href: "/dashboard/clases", icon: Icons.calendar },
  { name: "Mi Biblioteca", href: "/dashboard/biblioteca", icon: Icons.library },
]

interface SidebarProps {
  user: { name: string; role: string }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()

  return (
    <aside className="flex flex-col h-screen w-[240px] fixed left-0 top-0 z-50 bg-white border-r border-neutral-200/80">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-neutral-100">
        <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center">
          <span className="text-white text-sm font-bold">K</span>
        </div>
        <div>
          <h1 className="text-sm font-semibold text-neutral-900 tracking-tight leading-none">Khora</h1>
          <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Gestión de clases</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {(user.role === 'TEACHER' ? TEACHER_NAV : STUDENT_NAV).map(item => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
          return (
            <Link key={item.name} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                isActive
                  ? "bg-neutral-100 text-neutral-900"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              }`}>
                <span className={`transition-colors ${isActive ? "text-neutral-900" : "text-neutral-400"}`}>
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Profile */}
      <div className="p-3 border-t border-neutral-100">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-semibold text-neutral-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-neutral-900 truncate">{user.name}</p>
            <p className="text-[11px] text-neutral-400 capitalize">{user.role.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="w-full flex items-center gap-2 px-3 py-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-[13px] font-medium"
        >
          {Icons.logout}
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  )
}
