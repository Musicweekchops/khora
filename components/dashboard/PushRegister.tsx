"use client"

import React, { useEffect, useState } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"

// Clave Pública VAPID generada para Khora
const VAPID_PUBLIC_KEY = "BC3N_V7TcV1Wo-u4IdieY9eJYuHfO-zC3ghLAho4Lj2BsLtQf2lgrQURxmq_I0vNigamO5lRB1C_AG-2jLm1Cm4"

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function PushRegister() {
  const { profile } = useAuth()
  const [showBanner, setShowBanner] = useState(false)
  const [loading, setLoading] = useState(false)

  // Función para registrar o sincronizar la suscripción de este dispositivo en Supabase
  const syncSubscription = async (userId: string) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      await navigator.serviceWorker.ready

      let subscription = await registration.pushManager.getSubscription()
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        })
      }

      const subJson = subscription.toJSON()
      if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
        await supabase
          .from("PushSubscription")
          .upsert({
            user_id: userId,
            endpoint: subJson.endpoint,
            p256dh: subJson.keys.p256dh,
            auth: subJson.keys.auth
          }, { onConflict: "endpoint" })
      }
    } catch (err) {
      console.debug("[PushRegister] Auto-sync info:", err)
    }
  }

  useEffect(() => {
    if (!profile) return

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        // Si el usuario ya dio permiso, nos aseguramos de que ESTE dispositivo esté registrado
        syncSubscription(profile.id)
        return
      }

      if (Notification.permission === "default") {
        const dismissed = localStorage.getItem("khora-push-dismissed")
        if (dismissed === "true") return

        // 1. Detectar si es iOS y si está corriendo en modo standalone (instalado como PWA)
        const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
        const isStandalone = window.matchMedia("(display-mode: standalone)").matches || 
                             (window.navigator as any).standalone === true

        // En iOS, el OS exige instalar la PWA para poder usar Web Push.
        if (isIOS && !isStandalone) return

        setShowBanner(true)
      }
    }
  }, [profile])

  const handleSubscribe = async () => {
    if (!profile || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return
    }

    setLoading(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        setShowBanner(false)
        return
      }

      await syncSubscription(profile.id)

      localStorage.setItem("khora-push-dismissed", "true")
      setShowBanner(false)
      
      new Notification("🔔 Alertas Activas", {
        body: "¡Felicitaciones! Recibirás avisos instantáneos de Khora en tu pantalla de bloqueo.",
        icon: "/icon-192.png"
      })

    } catch (err) {
      console.error("Error al registrar notificaciones push:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-white/95 backdrop-blur-md border border-violet-100 rounded-3xl p-5 shadow-[0_12px_40px_rgba(139,92,246,0.15)] max-w-md mx-auto">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 text-lg">
            ⚡
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-neutral-900 leading-tight">
              ¡Activa notificaciones al instante!
            </h4>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
              Recibe avisos inmediatos en tu celular cuando {profile?.role === "TEACHER" ? "un alumno confirme clases" : "tu profesor asigne tareas"} o reprogramaciones.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                disabled={loading}
                onClick={handleSubscribe}
                className="kh-btn-primary py-1.5 px-4 text-xs bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50"
              >
                {loading ? "Activando..." : "Activar Alertas 🔔"}
              </button>
              <button
                onClick={() => {
                  localStorage.setItem("khora-push-dismissed", "true")
                  setShowBanner(false)
                }}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-neutral-600 font-semibold"
              >
                Quizás más tarde
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
