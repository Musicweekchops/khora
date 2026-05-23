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

      // Registrar Service Worker de forma global para que los celulares (iOS/Android)
      // reconozcan Khora como una PWA legítima y persistan el localStorage / sesión.
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("/sw.js")
          .then((reg) => console.log("PWA: Service Worker registrado con éxito en el scope:", reg.scope))
          .catch((err) => console.error("PWA: Error registrando Service Worker:", err))
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
