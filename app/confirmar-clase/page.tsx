"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"

function ConfirmarClaseContent() {
  const searchParams = useSearchParams()
  const classId = searchParams.get("id")
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "not_found">("loading")
  const [errorMsg, setErrorMsg] = useState("")
  const [classDetails, setClassDetails] = useState<{
    date: string
    time: string
    teacherName: string
    studentName: string
  } | null>(null)

  useEffect(() => {
    if (classId) {
      processConfirmation()
    } else {
      setStatus("error")
      setErrorMsg("El enlace de confirmación no contiene un identificador válido.")
    }
  }, [classId])

  async function processConfirmation() {
    try {
      // 1. Obtener detalles de la clase, el alumno y el profesor
      const { data: cls, error: fetchErr } = await supabase
        .from("Class")
        .select(`
          id,
          date,
          start_time,
          status,
          StudentProfile (
            User ( name )
          ),
          TeacherProfile (
            User ( name, email )
          )
        `)
        .eq("id", classId)
        .maybeSingle()

      if (fetchErr) throw fetchErr
      if (!cls) {
        setStatus("not_found")
        return
      }

      // Si la clase ya estaba completada o cancelada, informar
      if (cls.status === "CANCELLED") {
        setStatus("error")
        setErrorMsg("Esta clase fue cancelada anteriormente. Ponte en contacto con tu profesor.")
        return
      }

      // Robustez absoluta de parsing: Postgrest puede retornar perfiles como objetos o arrays de 1 elemento
      const studentProfile = Array.isArray(cls.StudentProfile) ? cls.StudentProfile[0] : cls.StudentProfile
      const teacherProfile = Array.isArray(cls.TeacherProfile) ? cls.TeacherProfile[0] : cls.TeacherProfile

      const sUser = Array.isArray(studentProfile?.User) ? studentProfile?.User[0] : studentProfile?.User
      const tUser = Array.isArray(teacherProfile?.User) ? teacherProfile?.User[0] : teacherProfile?.User

      const studentName = sUser?.name || "Alumno"
      const teacherName = tUser?.name || "Profesor"
      const teacherEmail = tUser?.email

      const formattedTime = cls.start_time.slice(0, 5)

      setClassDetails({
        date: cls.date,
        time: formattedTime,
        studentName,
        teacherName
      })

      // 2. Si la clase ya estaba confirmada, no volvemos a enviar el correo al profesor, pero mostramos éxito
      if (cls.status === "CONFIRMED") {
        setStatus("success")
        return
      }

      // 3. Actualizar estado de la clase en la base de datos
      const { error: updateErr } = await supabase
        .from("Class")
        .update({ status: "CONFIRMED" })
        .eq("id", classId)

      if (updateErr) throw updateErr

      // 4. Si el profesor tiene correo, dispararle la notificación de forma asíncrona (NO bloqueante)
      // para evitar que el alumno se quede pegado en el spinner mientras se procesa la API de correos.
      if (teacherEmail) {
        supabase.functions.invoke("send-email", {
          body: {
            to: teacherEmail,
            type: "TEACHER_CLASS_CONFIRMED",
            subject: `La clase de ${studentName} está confirmada`,
            params: {
              studentName,
              teacherName,
              date: cls.date,
              time: formattedTime
            }
          }
        }).catch((mailErr) => {
          console.error("Error al enviar correo al profesor (no bloqueante):", mailErr)
        })
      }

      setStatus("success")
    } catch (err: any) {
      console.error("Error confirmación:", err)
      setStatus("error")
      setErrorMsg("Ocurrió un error inesperado al procesar la confirmación de tu clase.")
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#1a1a24] border border-[#2d2d3d] rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Diseños geométricos de fondo */}
        <div className="absolute top-[-30%] right-[-10%] w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[5%] w-48 h-48 bg-purple-500/5 blur-[80px] rounded-full" />

        <div className="relative z-10 text-center">
          <div className="mb-6 flex justify-center">
            <span className="text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Khora.</span>
          </div>

          {status === "loading" && (
            <div className="space-y-6 py-8">
              <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto" />
              <h2 className="text-xl font-bold tracking-tight">Confirmando tu clase...</h2>
              <p className="text-neutral-400 text-xs font-medium max-w-xs mx-auto">
                Estamos validando tu asistencia y programando las alertas en el sistema.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">¡Clase Confirmada!</h2>
                <p className="text-neutral-400 text-sm font-semibold">
                  Le hemos notificado por correo a tu profesor para que esté preparado.
                </p>
              </div>

              {classDetails && (
                <div className="bg-[#13131a] border border-[#2d2d3d] rounded-2xl p-5 text-left space-y-3">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-400">Profesor:</span>
                    <span className="text-white font-bold">{classDetails.teacherName}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-400">Fecha:</span>
                    <span className="text-white font-bold">{classDetails.date}</span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-neutral-400">Hora:</span>
                    <span className="text-white font-bold">{classDetails.time} hs</span>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <a 
                  href="https://khora.cl" 
                  className="w-full block py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-950/20 transition-all"
                >
                  Entrar a Khora
                </a>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Ocurrió un problema</h2>
                <p className="text-neutral-400 text-sm font-semibold">
                  {errorMsg}
                </p>
              </div>

              <div className="pt-4">
                <a 
                  href="https://khora.cl/login" 
                  className="w-full block py-3.5 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Ir al Portal
                </a>
              </div>
            </div>
          )}

          {status === "not_found" && (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black tracking-tight">Clase no encontrada</h2>
                <p className="text-neutral-400 text-sm font-semibold">
                  No logramos encontrar ninguna sesión activa programada con este identificador.
                </p>
              </div>

              <div className="pt-4">
                <a 
                  href="https://khora.cl/login" 
                  className="w-full block py-3.5 bg-neutral-800 text-neutral-300 hover:bg-neutral-700 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                >
                  Ir al Portal
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ConfirmarClasePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0f0f13] text-white flex items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
      </div>
    }>
      <ConfirmarClaseContent />
    </Suspense>
  )
}
