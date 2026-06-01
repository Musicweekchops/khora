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
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  roadmap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
}

const TEACHER_NAV = [
  { name: "Dashboard", href: "/dashboard", icon: Icons.dashboard },
  { name: "Alumnos", href: "/dashboard/alumnos", icon: Icons.students },
  { name: "CRM", href: "/dashboard/crm", icon: Icons.crm },
  { name: "Agenda", href: "/dashboard/agenda", icon: Icons.calendar },
  { name: "Roadmap LMS", href: "/dashboard/roadmap", icon: Icons.roadmap },
  { name: "Clases", href: "/dashboard/clases", icon: Icons.classes },
  { name: "Biblioteca", href: "/dashboard/biblioteca", icon: Icons.library },
  { name: "Financiero", href: "/dashboard/financiero", icon: Icons.financial },
  { name: "Ajustes", href: "/dashboard/ajustes", icon: Icons.settings },
]

const STUDENT_NAV = [
  { name: "Dashboard", href: "/dashboard", icon: Icons.dashboard },
  { name: "Mi Roadmap", href: "/dashboard/roadmap", icon: Icons.roadmap },
  { name: "Mis Clases", href: "/dashboard/clases", icon: Icons.calendar },
  { name: "Mi Biblioteca", href: "/dashboard/biblioteca", icon: Icons.library },
  { name: "Ajustes", href: "/dashboard/ajustes", icon: Icons.settings },
]

interface SidebarProps {
  user: { name: string; role: string; is_admin?: boolean }
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const { profile, signOut } = useAuth()
  
  let navItems = user.role === 'TEACHER' ? [...TEACHER_NAV] : [...STUDENT_NAV]
  
  const isArnaldo = profile?.email === 'arnaldoallende@hotmail.com'
  if (isArnaldo && user.role === 'TEACHER') {
    const crmIndex = navItems.findIndex(item => item.href === "/dashboard/crm")
    if (crmIndex !== -1) {
      navItems.splice(crmIndex + 1, 0, {
        name: "Lista de Espera",
        href: "/dashboard/espera",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )
      })
      
      navItems.splice(crmIndex + 2, 0, {
        name: "Productos",
        href: "/dashboard/productos",
        icon: (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        )
      })
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen w-[240px] fixed left-0 top-0 z-50 bg-white border-r border-neutral-200/80">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-neutral-100">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${user.role === 'TEACHER' ? 'bg-violet-600 shadow-sm shadow-violet-200' : 'bg-neutral-900'}`}>
            <span className="text-white text-sm font-bold">K</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-neutral-900 tracking-tight leading-none">Khora</h1>
            <p className="text-[10px] text-neutral-400 font-medium mt-0.5">Gestión de clases</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
          {navItems.map(item => {
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
          {user.is_admin && (
            <>
              <div className="my-2 mx-1 border-t border-neutral-100" />
              <Link href="/dashboard/admin">
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
                  pathname?.startsWith('/dashboard/admin') ? "bg-rose-50 text-rose-600" : "text-neutral-500 hover:text-rose-600 hover:bg-rose-50"
                }`}>
                  <span className={pathname?.startsWith('/dashboard/admin') ? "text-rose-600" : "text-neutral-400"}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </span>
                  <span>Super Admin</span>
                </div>
              </Link>
            </>
          )}
        </nav>

        {/* Profile */}
        <div className="p-3 border-t border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${user.role === 'TEACHER' ? 'bg-violet-100 text-violet-700' : 'bg-neutral-200 text-neutral-700'}`}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-neutral-900 truncate leading-tight">{user.name}</p>
              {user.role === 'TEACHER' ? (
                <p className="text-[9px] font-black uppercase tracking-widest text-violet-600 mt-0.5 px-1.5 py-0.5 bg-violet-100/50 rounded inline-block">Profesor</p>
              ) : (
                <p className="text-[11px] text-neutral-400 capitalize mt-0.5">{user.role.toLowerCase()}</p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("khora-trigger-onboarding"))}
            className="w-full flex items-center gap-2 px-3 py-2 text-neutral-500 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors text-[13px] font-medium mb-1"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>Guía Rápida</span>
          </button>

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors text-[13px] font-medium"
          >
            {Icons.logout}
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="lg:hidden fixed left-4 right-4 z-50 bg-white/95 backdrop-blur-md border border-neutral-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] py-3 px-2 rounded-2xl animate-in slide-in-from-bottom duration-300"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 16px) + 12px)' }}
      >
        <div className="flex items-center justify-around">
          {navItems.slice(0, 3).map(item => { // Limit to 3 items on mobile for space when Help button is added
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href))
            return (
              <Link key={item.name} href={item.href} className="flex-1">
                <div className={`flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                  isActive ? "text-violet-600 scale-110" : "text-neutral-400"
                }`}>
                  <span className="mb-0.5">{item.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
                </div>
              </Link>
            )
          })}
          
          {/* Mobile Onboarding Trigger */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent("khora-trigger-onboarding"))}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-neutral-400"
          >
            <span className="mb-0.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Ayuda</span>
          </button>

          {/* Mobile Profile/Menu Trigger */}
          <Link href="/dashboard/ajustes" className="flex-1">
             <div className={`flex flex-col items-center justify-center gap-1 ${pathname === '/dashboard/ajustes' ? "text-violet-600" : "text-neutral-400"}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${pathname === '/dashboard/ajustes' ? "border-violet-600 bg-violet-50" : "border-neutral-300"}`}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter">Perfil</span>
             </div>
          </Link>
        </div>
      </nav>
    </>
  )
}
