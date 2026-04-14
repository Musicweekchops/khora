"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BookOpen, 
  BarChart3, 
  DollarSign, 
  LogOut,
  Settings,
  Drum
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface SidebarProps {
  user: {
    name: string
    role: string
    image?: string | null
  }
}

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Alumnos", href: "/dashboard/alumnos", icon: Users },
  { name: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { name: "Clases", href: "/dashboard/clases", icon: BookOpen },
  { name: "CRM", href: "/dashboard/crm", icon: BarChart3 },
  { name: "Financiero", href: "/dashboard/financiero", icon: DollarSign },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-sidebar-background text-sidebar-foreground border-r border-white/10 w-64 fixed left-0 top-0 z-50 overflow-hidden">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
          <Drum size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Khora</h1>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">Drum School</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-4 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon size={20} className={cn(
                  "transition-colors",
                  isActive ? "text-white" : "group-hover:text-white"
                )} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 w-1 h-6 bg-white rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Bottom Profile */}
      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-sm font-bold text-white border border-white/10">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-neutral-400 hover:text-white hover:bg-white/5 justify-start gap-2 h-9 rounded-lg"
            >
              <Settings size={14} />
              <span className="text-xs">Ajustes</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full text-neutral-400 hover:text-destructive hover:bg-destructive/10 justify-start gap-2 h-9 rounded-lg"
            >
              <LogOut size={14} />
              <span className="text-xs">Salir</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
