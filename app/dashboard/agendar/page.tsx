"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { getAvailableSlots, addMinutes, timesOverlap } from "@/lib/availability"
import { formatTime } from "@/lib/utils"
import { useAuth } from "@/lib/context/AuthContext"
import { Calendar, Clock, Sparkles, UserCheck } from "lucide-react"

interface ClassType {
  id: string
  name: string
  description: string
  icon: string
  price: number
  currency: string
  duration: number
  academy_id: string | null
}

interface Teacher {
  id: string
  user_id: string
  slug: string
  name: string
  email: string
}

export default function StudentBookingDashboardPage() {
  const { profile } = useAuth()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null)
  
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ date: "", message: "" })
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [ownSlots, setOwnSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (profile?.studentProfileId) {
      loadStudentAndTeacherFlow()
    }
  }, [profile?.studentProfileId])

  useEffect(() => {
    if (formData.date && selectedClass && teacher) {
      loadSlots()
    }
  }, [formData.date, selectedClass, teacher])

  async function loadStudentAndTeacherFlow() {
    setLoading(true)
    setError("")
    try {
      // 1. Fetch student profile to get assigned teacher
      const { data: spData, error: spErr } = await supabase
        .from("StudentProfile")
        .select(`
          id,
          teacher_id,
          TeacherProfile (
            id,
            user_id,
            slug,
            User (
              name,
              email
            )
          )
        `)
        .eq("id", profile!.studentProfileId!)
        .maybeSingle()

      if (spErr) throw spErr
      if (!spData || !spData.TeacherProfile) {
        throw new Error("No tienes un profesor asignado en este momento. Por favor contacta al administrador.")
      }

      const tp = Array.isArray(spData.TeacherProfile) ? spData.TeacherProfile[0] : spData.TeacherProfile
      const u = Array.isArray(tp?.User) ? tp?.User[0] : tp?.User

      if (!tp) {
        throw new Error("No se pudo obtener el perfil de tu profesor.")
      }

      const formattedTeacher: Teacher = {
        id: tp.id,
        user_id: tp.user_id,
        slug: tp.slug || "",
        name: u?.name || "Tu profesor",
        email: u?.email || ""
      }
      setTeacher(formattedTeacher)

      // 2. Fetch class types for the teacher
      const { data: ct, error: ctErr } = await supabase
        .from("ClassType")
        .select("*")
        .eq("teacher_id", tp.id)
        .order("price")

      if (ctErr) throw ctErr
      setClassTypes(ct || [])

    } catch (err: any) {
      setError(err.message || "Error al cargar la información de agendamiento.")
    } finally {
      setLoading(false)
    }
  }

  async function loadSlots() {
    if (!selectedClass || !formData.date || !teacher) return
    setLoadingSlots(true)
    setSelectedSlot(null)

    try {
      const slots = await getAvailableSlots(formData.date, teacher.id, selectedClass.duration)
      setAvailableSlots(slots)

      // Fetch own classes to check overlaps
      const { data: myClasses } = await supabase
        .from("Class")
        .select("start_time")
        .eq("teacher_id", teacher.id)
        .eq("student_id", profile!.studentProfileId!)
        .eq("date", formData.date)
        .neq("status", "CANCELLED")

      // Fetch own bookings
      const { data: myBookings } = await supabase
        .from("Booking")
        .select("start_time")
        .eq("teacher_id", teacher.id)
        .eq("email", profile!.email!)
        .eq("date", formData.date)
        .eq("status", "PENDING")

      const classTimes = (myClasses || []).map((c: any) => c.start_time)
      const bookingTimes = (myBookings || []).map((b: any) => b.start_time)

      const allOwn = Array.from(new Set([...classTimes, ...bookingTimes])).map((time: string) => {
        const parts = time.split(":")
        const h = parts[0].padStart(2, "0")
        const m = parts[1].padStart(2, "0")
        const s = (parts[2] || "00").padStart(2, "0")
        return `${h}:${m}:${s}`
      })
      setOwnSlots(allOwn)
    } catch (err) {
      console.error("Error loading slots:", err)
      setAvailableSlots([])
      setOwnSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClass || !selectedSlot || !teacher) return
    setSubmitting(true)
    setError("")

    try {
      const startTime = selectedSlot
      const endTime = addMinutes(startTime, selectedClass.duration)

      // Final overlap check
      const { data: existingClasses } = await supabase
        .from("Class")
        .select("start_time, end_time")
        .eq("teacher_id", teacher.id)
        .eq("date", formData.date)
        .neq("status", "CANCELLED")

      const { data: existingBookings } = await supabase
        .from("Booking")
        .select("start_time, end_time")
        .eq("teacher_id", teacher.id)
        .eq("date", formData.date)
        .eq("status", "PENDING")

      const allEvents = [...(existingClasses || []), ...(existingBookings || [])]
      const hasConflict = allEvents.some(evt => timesOverlap(startTime, endTime, evt.start_time, evt.end_time))

      if (hasConflict) {
        throw new Error("Este horario acaba de ser reservado. Por favor elige otro.")
      }

      // Insert booking request
      const { error: insertErr } = await supabase.from("Booking").insert({
        teacher_id: teacher.id,
        class_type_id: selectedClass.id,
        name: profile!.name || "Alumno",
        email: profile!.email || "",
        phone: profile!.phone || "",
        message: formData.message,
        date: formData.date,
        start_time: startTime,
        end_time: endTime,
        total_price: selectedClass.price,
        status: "PENDING",
      })

      if (insertErr) throw insertErr

      const friendlyDate = formatDate(formData.date)
      const friendlyTime = formatTime(startTime)

      // Notify teacher by Email
      if (teacher.email) {
        supabase.functions.invoke("send-email", {
          body: {
            to: teacher.email,
            type: "TEACHER_NEW_BOOKING",
            params: {
              teacherName: teacher.name,
              studentName: profile!.name,
              date: friendlyDate,
              time: friendlyTime,
              classType: selectedClass.name
            }
          }
        }).catch(err => console.error("Error invoking send-email for teacher booking:", err))
      }

      // Notify teacher by Push
      if (teacher.user_id) {
        supabase.functions.invoke("notify-teacher-push", {
          body: {
            type: "BOOKING_CREATED",
            customParams: {
              teacherUserId: teacher.user_id,
              studentName: profile!.name,
              date: friendlyDate,
              time: friendlyTime
            }
          }
        }).catch(err => console.error("Error invoking notify-teacher-push:", err))
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Error al agendar")
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
        <p className="text-neutral-400 font-bold animate-pulse">Cargando disponibilidad...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-100 p-8 text-center shadow-sm">
          <div className="text-5xl mb-4">🔍</div>
          <h2 className="text-xl font-black text-neutral-900 mb-2 font-sans">Agendamiento no disponible</h2>
          <p className="text-neutral-500 font-medium font-sans text-sm">{error}</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-neutral-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-6">✓</div>
          <h2 className="text-2xl font-black text-neutral-900 mb-3 font-sans">¡Solicitud Enviada!</h2>
          <p className="text-neutral-500 text-sm font-medium leading-relaxed font-sans mb-6">
            Tu solicitud para agendar clase con <b>{teacher?.name}</b> ha sido enviada con éxito. 
            Te notificaremos por correo y push cuando el profesor la apruebe o rechace.
          </p>
          <button onClick={() => setSuccess(false)} className="kh-btn-primary w-full py-3.5 font-sans">Agendar otra</button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Agendar Clase</h1>
        <p className="text-neutral-500 font-medium mt-1">Programa tus sesiones según el horario disponible de {teacher?.name}.</p>
      </div>

      {!selectedClass ? (
        <div className="space-y-4">
          <h2 className="text-sm font-black text-neutral-400 uppercase tracking-widest pl-1">Selecciona el Servicio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classTypes.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl border border-neutral-100 p-12 text-center shadow-sm">
                <p className="text-neutral-400 font-bold italic font-sans">El profesor no tiene servicios configurados en este momento.</p>
              </div>
            ) : (
              classTypes.map(ct => (
                <button key={ct.id} onClick={() => setSelectedClass(ct)} className="group text-left p-0.5">
                  <div className="bg-white rounded-3xl border border-neutral-100 p-6 flex items-center gap-4 group-hover:border-violet-500 group-hover:shadow-md transition-all relative overflow-hidden">
                    <span className="text-4xl">{ct.icon || "🎵"}</span>
                    <div className="flex-1">
                      <h3 className="text-base font-black text-neutral-900 font-sans">{ct.name}</h3>
                      <p className="text-neutral-400 font-bold mt-0.5 uppercase text-[9px] tracking-widest font-sans">{ct.duration} MINUTOS</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => setSelectedClass(null)}
            className="text-[10px] font-black text-violet-600 uppercase tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform ml-1 font-sans"
          >
            ← Volver a servicios
          </button>

          <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm">
            <div className="bg-neutral-950 p-6 text-white flex items-center justify-between">
              <div>
                <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1 font-sans">Servicio seleccionado</p>
                <h2 className="text-xl font-black font-sans">{selectedClass.icon} {selectedClass.name}</h2>
              </div>
              <span className="text-[10px] font-black bg-neutral-800 text-white px-3 py-1 rounded-full uppercase tracking-wider">{selectedClass.duration} MIN</span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              
              {/* Tus Datos Badge Section */}
              <div className="bg-neutral-50 border border-neutral-200/60 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-0.5">Tus datos de reserva</p>
                  <p className="text-sm font-black text-neutral-900 truncate">{profile!.name}</p>
                  <p className="text-xs text-neutral-500 font-medium truncate">{profile!.email} {profile!.phone ? `· ${profile!.phone}` : ""}</p>
                </div>
              </div>

              {/* Date Input */}
              <div className="space-y-2">
                <label className="kh-label block text-[10px] font-sans flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-neutral-400" /> Fecha de Reserva</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={e => {
                    setFormData(p => ({...p, date: e.target.value}))
                    const target = e.target
                    setTimeout(() => {
                      target.blur()
                    }, 50)
                  }}
                  className="kh-input font-sans"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Time Slots */}
              {formData.date && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
                  <label className="kh-label block text-[10px] font-sans flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-neutral-400" /> Horas disponibles ({formatDate(formData.date)})</label>
                  {loadingSlots ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <div className="kh-skeleton h-12"/><div className="kh-skeleton h-12"/><div className="kh-skeleton h-12"/><div className="kh-skeleton h-12"/>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(() => {
                        const combined = [
                          ...availableSlots.map(slot => ({ slot, isOwn: false })),
                          ...ownSlots.map(slot => ({ slot, isOwn: true }))
                        ].sort((a, b) => a.slot.localeCompare(b.slot))

                        if (combined.length === 0) {
                          return <p className="col-span-full p-8 bg-neutral-50 rounded-2xl text-center text-xs font-bold text-neutral-400 italic font-sans">No hay horarios para este día.</p>
                        }

                        return combined.map(({ slot, isOwn }) => {
                          if (isOwn) {
                            return (
                              <div
                                key={slot}
                                className="py-2.5 px-2 rounded-xl text-xs font-black text-center bg-violet-50 text-violet-700 border border-violet-100 font-sans flex flex-col items-center justify-center gap-1 select-none"
                              >
                                <span>{formatTime(slot)}</span>
                                <span className="text-[8px] bg-violet-600 text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider font-black leading-none scale-90">Tu clase</span>
                              </div>
                            )
                          }

                          return (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={`py-3.5 px-2 rounded-xl text-xs font-black transition-all tap-highlight-none font-sans ${
                                selectedSlot === slot ? "bg-violet-600 text-white shadow-md scale-95" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200"
                              }`}
                            >
                              {formatTime(slot)}
                            </button>
                          )
                        })
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Message / Notes */}
              <div className="space-y-2">
                <label className="kh-label block text-[10px] font-sans">Notas o comentarios para tu profesor (opcional)</label>
                <textarea
                  value={formData.message}
                  onChange={e => setFormData(p => ({...p, message: e.target.value}))}
                  className="kh-input min-h-[80px] py-3 resize-none"
                  placeholder="Ej: Me gustaría enfocarme en técnica esta clase..."
                />
              </div>

              {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold border border-red-200 font-sans">⚠️ {error}</div>}

              <button
                type="submit"
                disabled={submitting || !selectedSlot}
                className="w-full kh-btn-primary py-4 text-base shadow-lg active:scale-[0.98] transition-transform font-sans"
              >
                {submitting ? "Procesando..." : "🎵 Solicitar Reserva"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
