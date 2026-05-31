"use client"

import React, { useEffect } from "react"
import { useAuth } from "@/lib/context/AuthContext"
import { supabase } from "@/lib/supabase"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

export default function OnboardingTour() {
  const { profile } = useAuth()

  const startTour = (force = false) => {
    if (!profile) return

    // 1. Verificar si ya se completó el onboarding (db o local)
    const isCompleted = profile.completed_onboarding || localStorage.getItem("khora_onboarding_completed") === "true"
    if (isCompleted && !force) return

    // 2. Definir los pasos según el rol
    const steps = profile.role === "TEACHER" 
      ? [
          {
            popover: {
              title: "🥁 ¡Te damos la bienvenida a Khora!",
              description: "Tu centro de control musical definitivo. Te guiaremos en 1 minuto por las herramientas clave para gestionar tu escuela de música de forma premium.",
            }
          },
          {
            element: 'a[href="/dashboard/alumnos"]',
            popover: {
              title: "👥 Directorio de Alumnos",
              description: "El corazón de tu academia. Aquí registras nuevos estudiantes, revisas sus fichas clínicas de avance, asignas tareas y controlas sus packs de clases.",
              side: "right",
              align: "start"
            }
          },
          {
            element: 'a[href="/dashboard/agenda"]',
            popover: {
              title: "📅 Tu Agenda Semanal",
              description: "Organiza tus horarios de clase, define tus días no laborables y visualiza las solicitudes de reprogramación de tus alumnos al instante.",
              side: "right",
              align: "start"
            }
          },
          {
            element: 'a[href="/dashboard/biblioteca"]',
            popover: {
              title: "📚 Biblioteca Global",
              description: "Sube partituras, tablaturas, backtracks y PDFs. Podrás organizarlos por etiquetas y asignárselos a tus alumnos de forma directa.",
              side: "right",
              align: "start"
            }
          },
          {
            element: 'a[href="/dashboard/financiero"]',
            popover: {
              title: "💰 Módulo Financiero",
              description: "Lleva tus cuentas de forma transparente. Registra pagos simples, packs mensuales, visualiza deudas y balances históricos en tiempo real.",
              side: "right",
              align: "start"
            }
          },
          {
            element: 'a[href="/dashboard/ajustes"]',
            popover: {
              title: "⚙️ Configuración Personal",
              description: "Edita tu especialidad, actualiza tu ubicación geográfica, cambia tu contraseña y personaliza tu escuela.",
              side: "right",
              align: "start"
            }
          }
        ]
      : [
          {
            popover: {
              title: `🎸 ¡Bienvenido a Khora, ${profile.name}!`,
              description: "Tu portal de estudio personal. Aquí encontrarás todo lo que necesitas para tu crecimiento instrumental. Vamos a dar una vuelta rápida.",
            }
          },
          {
            element: 'a[href="/dashboard/clases"]',
            popover: {
              title: "📅 Mis Clases",
              description: "Visualiza tus próximas sesiones de música programadas, el estado de tus horas y coordina con tu profesor.",
              side: "right",
              align: "start"
            }
          },
          {
            element: 'a[href="/dashboard/biblioteca"]',
            popover: {
              title: "📚 Mi Biblioteca Personal",
              description: "Accede directamente a los PDFs, partituras y ejercicios de calentamiento que tu profesor te ha compartido para tu práctica semanal.",
              side: "right",
              align: "start"
            }
          },
          {
            element: 'a[href="/dashboard/ajustes"]',
            popover: {
              title: "💳 Control y Ajustes",
              description: "Mantén tus datos actualizados y configura tu perfil personal de estudiante de forma directa.",
              side: "right",
              align: "start"
            }
          }
        ]

    // 3. Inicializar Driver.js
    const driverObj = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      progressText: "Paso {{current}} de {{total}}",
      nextBtnText: "Siguiente →",
      prevBtnText: "← Atrás",
      doneBtnText: "¡Entendido! 🎉",
      overlayColor: "rgba(15, 23, 42, 0.4)",
      stagePadding: 6,
      popoverClass: "khora-driver-popover",
      steps: steps.map(step => ({
        ...step,
        popover: {
          ...step.popover,
          onPrevClick: () => {
            driverObj.movePrevious()
          },
          onNextClick: () => {
            if (driverObj.isLastStep()) {
              handleOnboardingComplete()
              driverObj.destroy()
            } else {
              driverObj.moveNext()
            }
          }
        }
      })) as any,
      onDestroyed: () => {
        // Asegurar que si el usuario salta el tour también guardamos el estado
        handleOnboardingComplete()
      }
    })

    const handleOnboardingComplete = async () => {
      localStorage.setItem("khora_onboarding_completed", "true")
      try {
        await supabase
          .from("User")
          .update({ completed_onboarding: true })
          .eq("id", profile.id)
      } catch (err) {
        console.error("Error saving completed onboarding to DB:", err)
      }
    }

    // 4. Iniciar tour
    driverObj.drive()
  }

  useEffect(() => {
    // Escuchar disparador manual (ej. desde el botón en Sidebar)
    const handleManualTrigger = () => {
      startTour(true)
    }

    window.addEventListener("khora-trigger-onboarding", handleManualTrigger)

    // Lado automático en primer ingreso
    if (profile) {
      const timer = setTimeout(() => {
        startTour(false)
      }, 1000) // Delay de 1 segundo para transiciones iniciales agradables
      return () => clearTimeout(timer)
    }

    return () => {
      window.removeEventListener("khora-trigger-onboarding", handleManualTrigger)
    }
  }, [profile])

  return null // Renderizado puramente funcional mediante Driver.js overlays
}
