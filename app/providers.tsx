"use client"
import { useEffect } from "react"
import { AuthProvider } from "@/lib/context/AuthContext"
import { ToastProvider } from "@/components/ui/Toast"

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      if (hostname === "khora-static.onrender.com") {
        window.location.replace("https://khora.cl" + window.location.pathname + window.location.search)
      }
    }
  }, [])

  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  )
}
