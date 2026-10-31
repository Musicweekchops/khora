"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShieldCheck, X } from "lucide-react"

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      const consent = localStorage.getItem("khora_cookie_consent")
      if (!consent) {
        const timer = setTimeout(() => setVisible(true), 1000)
        return () => clearTimeout(timer)
      }
    } catch {
      // localStorage no disponible
    }
  }, [])

  function accept(type: "all" | "essential") {
    try {
      localStorage.setItem("khora_cookie_consent", type)
      localStorage.setItem("khora_cookie_consent_date", new Date().toISOString())
    } catch {
      // Noop
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside 
      aria-label="Consentimiento de cookies"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500"
    >
      <div className="bg-neutral-900/95 backdrop-blur-md text-white border border-neutral-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-violet-400" />
            <span>Privacidad y Cookies</span>
          </div>
          <button
            onClick={() => accept("essential")}
            className="text-neutral-400 hover:text-white transition-colors p-1"
            title="Cerrar y aceptar solo esenciales"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          Utilizamos cookies y almacenamiento local estrictamente necesarios para mantener tu sesión segura, gestionar tus reservas y procesar pagos. Puedes revisar nuestra{" "}
          <Link href="/privacidad" className="underline text-violet-300 hover:text-white font-medium">
            Política de Privacidad
          </Link>.
        </p>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => accept("all")}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs py-2 px-3 rounded-xl transition-all shadow-sm text-center"
          >
            Aceptar
          </button>
          <button
            onClick={() => accept("essential")}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs py-2 px-3 rounded-xl transition-all border border-neutral-700 text-center"
          >
            Solo esenciales
          </button>
        </div>
      </div>
    </aside>
  )
}

