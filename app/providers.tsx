"use client"
import { AuthProvider } from "@/lib/context/AuthContext"
import { ToastProvider } from "@/components/ui/Toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
      </ToastProvider>
    </AuthProvider>
  )
}
