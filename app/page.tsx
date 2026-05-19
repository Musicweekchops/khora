"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useAuth } from "@/lib/context/AuthContext"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push("/dashboard")
      } else {
        window.location.href = "https://khora.cl"
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-violet-500 border-t-transparent" />
    </div>
  )
}
