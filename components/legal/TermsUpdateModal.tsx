"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { ShieldCheck, CheckCircle2 } from "lucide-react"

export default function TermsUpdateModal() {
  const { profile } = useAuth()
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile?.id) return

    // Comprobar si ya fue aceptado en esta sesión local para evitar flashes
    const localConsent = localStorage.getItem(`khora_terms_accepted_${profile.id}`)
    if (localConsent) return

    // Consultar el estado en la base de datos
    async function checkConsent() {
      try {
        const { data: userRow } = await supabase
          .from("User")
          .select("terms_accepted_at")
          .eq("id", profile!.id)
          .maybeSingle()

        if (userRow && !userRow.terms_accepted_at) {
          setShowModal(true)
        } else if (userRow?.terms_accepted_at) {
          localStorage.setItem(`khora_terms_accepted_${profile!.id}`, userRow.terms_accepted_at)
        }
      } catch (err) {
        console.error("Error comprobando términos:", err)
      }
    }

    checkConsent()
  }, [profile])

  async function handleAccept() {
    if (!profile?.id) return
    setSaving(true)

    const now = new Date().toISOString()
    try {
      await supabase
        .from("User")
        .update({
          terms_accepted_at: now,
          marketing_consent: true,
        })
        .eq("id", profile.id)

      localStorage.setItem(`khora_terms_accepted_${profile.id}`, now)
      setShowModal(false)
    } catch (err) {
      console.error("Error guardando aceptación de términos:", err)
      // Cerrar para no bloquear al usuario en caso de error transitorio
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  if (!showModal) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-2xl w-full max-w-md p-6 sm:p-8 flex flex-col gap-5 animate-in zoom-in-95 duration-200">
        <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Actualización de Privacidad y Términos
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            En Khora cuidamos la seguridad de tus datos. Hemos actualizado nuestras políticas para garantizar un manejo transparente de tu información, recordatorios de clase y comunicaciones operativas.
          </p>
        </div>

        <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-4 text-xs text-neutral-600 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Tus datos solo se usan para la gestión y coordinación de tus clases.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Khora no comparte ni vende información a terceros.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <span>Recibirás avisos oportunos sobre horarios, pagos y materiales de estudio.</span>
          </div>
        </div>

        <p className="text-[11px] text-center text-neutral-400">
          Al continuar, confirmas que aceptas nuestros{" "}
          <Link href="/terminos" target="_blank" className="text-violet-600 underline font-medium">
            Términos del Servicio
          </Link>{" "}
          y nuestra{" "}
          <Link href="/privacidad" target="_blank" className="text-violet-600 underline font-medium">
            Política de Privacidad
          </Link>.
        </p>

        <button
          onClick={handleAccept}
          disabled={saving}
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm py-3.5 px-4 rounded-2xl transition-all shadow-md text-center"
        >
          {saving ? "Guardando..." : "Aceptar y continuar"}
        </button>
      </div>
    </div>
  )
}

