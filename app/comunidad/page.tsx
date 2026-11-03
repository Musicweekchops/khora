"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Check, ArrowRight } from "lucide-react"

interface CommunityConfig {
  headerImageUrl: string
  badge: string
  title: string
  subtitle: string
  ctaText: string
}

const DEFAULT_CONFIG: CommunityConfig = {
  headerImageUrl: "",
  badge: "🥁 Comunidad de Batería",
  title: "Súmate a la comunidad de estudiantes",
  subtitle:
    "Recibe ejercicios de práctica, partituras, material de estudio y novedades directamente en tu correo.",
  ctaText: "Sumarme a la comunidad",
}

export default function ComunidadPage() {
  const [config, setConfig] = useState<CommunityConfig>(DEFAULT_CONFIG)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    async function loadConfig() {
      try {
        const supabaseUrl =
          process.env.NEXT_PUBLIC_SUPABASE_URL ||
          "https://ljazboprejtdrfsisfxu.supabase.co"
        const res = await fetch(
          `${supabaseUrl}/functions/v1/send-email?community_config=1`,
          { cache: "no-store" }
        )
        if (res.ok) {
          const data = await res.json()
          setConfig({
            headerImageUrl: data.headerImageUrl || "",
            badge: data.badge || DEFAULT_CONFIG.badge,
            title: data.title || DEFAULT_CONFIG.title,
            subtitle: data.subtitle || DEFAULT_CONFIG.subtitle,
            ctaText: data.ctaText || DEFAULT_CONFIG.ctaText,
          })
        }
      } catch (e) {
        console.warn("Usando configuración por defecto de comunidad:", e)
      }
    }
    loadConfig()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")
    if (!name.trim() || !email.trim()) return

    setSubmitting(true)
    try {
      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          action: "subscribe-community",
          name: name.trim(),
          email: email.trim().toLowerCase(),
        },
      })

      if (error || data?.error) {
        throw new Error(
          data?.error || error?.message || "No se pudo completar el registro."
        )
      }

      setSubmitted(true)
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error al suscribirte.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f3f2] text-stone-900 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white border border-stone-200/90 rounded-3xl shadow-xl overflow-hidden">
        {/* Editable Custom Banner Header */}
        {config.headerImageUrl ? (
          <div className="w-full bg-[#e3dad7] border-b border-stone-200/60 overflow-hidden">
            <img
              src={config.headerImageUrl}
              alt="Arnaldo Allende"
              className="w-full h-auto max-h-48 object-cover block mx-auto"
            />
          </div>
        ) : (
          <div className="bg-[#e3dad7] px-6 py-5 text-center border-b border-stone-200/60">
            <div className="inline-flex items-center gap-4">
              <span className="text-sm sm:text-base font-black tracking-[0.22em] text-white drop-shadow-sm uppercase">
                ARNALDO
              </span>
              <div className="w-11 h-11 rounded-full bg-stone-900 text-white flex items-center justify-center font-black text-xs border-2 border-white shadow">
                🥁
              </div>
              <span className="text-sm sm:text-base font-black tracking-[0.22em] text-white drop-shadow-sm uppercase">
                ALLENDE
              </span>
            </div>
          </div>
        )}

        {!submitted ? (
          <div className="p-6 sm:p-7 space-y-5">
            <div className="space-y-2 text-center">
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-violet-700 bg-violet-50 border border-violet-200/70 px-3 py-0.5 rounded-full">
                {config.badge}
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 pt-0.5 leading-snug">
                {config.title}
              </h1>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                {config.subtitle}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tu Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Martín González"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm font-medium focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/15 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Tu Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm font-medium focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-500/15 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{submitting ? "Sumándote..." : config.ctaText}</span>
                {!submitting && <ArrowRight className="w-4 h-4" />}
              </button>

              <p className="text-xs text-center text-stone-400">
                Acceso gratuito. Puedes darte de baja con un clic cuando quieras.
              </p>
            </form>
          </div>
        ) : (
          <div className="p-7 sm:p-8 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg sm:text-xl font-extrabold text-stone-900">
                ¡Bienvenido a la comunidad!
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Hola <strong>{name.split(" ")[0]}</strong>, ya eres parte de la
                comunidad de estudiantes. Muy pronto recibirás el próximo
                ejercicio y novedades directamente en{" "}
                <span className="font-semibold text-stone-700">{email}</span>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

