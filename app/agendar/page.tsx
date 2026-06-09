"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getAvailableSlots, addMinutes, timesOverlap } from "@/lib/availability"
import { formatTime } from "@/lib/utils"

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
  instrumento: string | null
  User: { name: string }
}

interface Academy {
  id: string
  name: string
  slug: string
  logo_url: string | null
  description: string | null
}

export default function AgendarPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-neutral-50"><p className="animate-pulse font-bold text-neutral-400">Cargando...</p></div>}>
      <PublicBookingPage />
    </Suspense>
  )
}

function PublicBookingPage() {
  const searchParams = useSearchParams()
  const teacherSlug = searchParams.get("p")
  const academySlug = searchParams.get("a")

  const [academy, setAcademy] = useState<Academy | null>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null)

  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "", date: "" })
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (academySlug) {
      loadAcademyFlow()
    } else if (teacherSlug) {
      loadTeacherFlow()
    } else {
      setError("Parámetro de agendamiento inválido.")
      setLoading(false)
    }
  }, [teacherSlug, academySlug])

  useEffect(() => {
    if (formData.date && selectedClass && selectedTeacher) {
      loadSlots()
    }
  }, [formData.date, selectedClass, selectedTeacher])

  // --- ACADEMY BOOKING FLOW ---
  async function loadAcademyFlow() {
    setLoading(true)
    setError("")
    try {
      // 1. Fetch academy by slug
      const { data: ac, error: acErr } = await supabase
        .from("AcademyProfile")
        .select("id, name, slug, logo_url, description")
        .eq("slug", academySlug!)
        .eq("is_active", true)
        .maybeSingle()

      if (acErr || !ac) {
        throw new Error("Academia no encontrada o inactiva.")
      }
      setAcademy(ac)

      // 2. Fetch academy class types
      const { data: ct, error: ctErr } = await supabase
        .from("ClassType")
        .select("*")
        .eq("academy_id", ac.id)
        .order("price")

      if (ctErr) throw ctErr
      setClassTypes(ct || [])

      // 3. Fetch all active teachers of this academy
      const { data: at, error: atErr } = await supabase
        .from("AcademyTeacher")
        .select(`
          status,
          TeacherProfile (
            id, user_id, slug, instrumento,
            User ( name )
          )
        `)
        .eq("academy_id", ac.id)
        .eq("status", "ACTIVE")

      if (atErr) throw atErr

      const list: Teacher[] = (at ?? []).map((row: any) => {
        const tp = row.TeacherProfile
        const u = Array.isArray(tp?.User) ? tp.User[0] : tp?.User
        return {
          id: tp?.id ?? "",
          user_id: tp?.user_id ?? "",
          slug: tp?.slug ?? "",
          instrumento: tp?.instrumento ?? null,
          User: { name: u?.name ?? "—" }
        }
      })
      setTeachers(list)
    } catch (err: any) {
      setError(err.message || "Error al cargar la academia")
    } finally {
      setLoading(false)
    }
  }

  // --- TEACHER BOOKING FLOW (Original) ---
  async function loadTeacherFlow() {
    setLoading(true)
    setError("")
    try {
      const { data: t, error: tErr } = await supabase
        .from("TeacherProfile")
        .select("id, user_id, slug, instrumento, User ( name )")
        .eq("slug", teacherSlug!)
        .maybeSingle()

      if (tErr || !t) {
        throw new Error("Profesor no encontrado")
      }

      const formattedTeacher: Teacher = {
        id: t.id,
        user_id: t.user_id,
        slug: t.slug,
        instrumento: t.instrumento,
        User: { name: (t.User as any)?.name ?? "—" }
      }
      setSelectedTeacher(formattedTeacher)

      const { data: ct } = await supabase
        .from("ClassType")
        .select("*")
        .eq("teacher_id", t.id)
        .order("price")

      if (ct) setClassTypes(ct)
    } catch (err: any) {
      setError(err.message || "Error al cargar el profesor")
    } finally {
      setLoading(false)
    }
  }

  async function loadSlots() {
    if (!selectedClass || !formData.date || !selectedTeacher) return
    setLoadingSlots(true)
    setSelectedSlot(null)

    const slots = await getAvailableSlots(formData.date, selectedTeacher.id, selectedClass.duration)
    setAvailableSlots(slots)
    setLoadingSlots(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClass || !selectedSlot || !selectedTeacher) return
    setSubmitting(true)
    setError("")

    try {
      const startTime = selectedSlot
      const endTime = addMinutes(startTime, selectedClass.duration)

      // FINAL CONFLICT CHECK
      const { data: existingClasses } = await supabase
        .from("Class")
        .select("start_time, end_time")
        .eq("teacher_id", selectedTeacher.id)
        .eq("date", formData.date)
        .neq("status", "CANCELLED")

      const { data: existingBookings } = await supabase
        .from("Booking")
        .select("start_time, end_time")
        .eq("teacher_id", selectedTeacher.id)
        .eq("date", formData.date)
        .eq("status", "PENDING")

      const allEvents = [...(existingClasses || []), ...(existingBookings || [])]
      const hasConflict = allEvents.some(evt => timesOverlap(startTime, endTime, evt.start_time, evt.end_time))

      if (hasConflict) {
        throw new Error("Este horario acaba de ser reservado. Por favor elige otro.")
      }

      const { error: insertErr } = await supabase.from("Booking").insert({
        teacher_id: selectedTeacher.id,
        academy_id: academy?.id || null,
        class_type_id: selectedClass.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        date: formData.date,
        start_time: startTime,
        end_time: endTime,
        total_price: selectedClass.price,
        status: "PENDING",
      })

      if (insertErr) throw insertErr
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Error al agendar")
    } finally {
      setSubmitting(false)
    }
  }

  // Filtrar profesores que enseñan el instrumento de la clase seleccionada
  const matchingTeachers = useMemo(() => {
    if (!selectedClass) return []
    // Si no hay profesores o es flujo individual, retornar solo el seleccionado
    if (!academySlug) return selectedTeacher ? [selectedTeacher] : []

    const serviceName = selectedClass.name.toLowerCase()
    const matched = teachers.filter(t => {
      if (!t.instrumento) return true // fallback
      const inst = t.instrumento.toLowerCase()
      return serviceName.includes(inst) || inst.includes(serviceName)
    })

    // Si no coincide ninguno, mostrar todos para evitar bloquear al alumno
    return matched.length > 0 ? matched : teachers
  }, [selectedClass, teachers, academySlug, selectedTeacher])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="kh-skeleton w-16 h-16 rounded-full mx-auto mb-4" />
          <p className="text-neutral-400 font-bold animate-pulse">Cargando...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-md w-full bg-white rounded-[40px] border border-neutral-100 p-12 text-center shadow-2xl">
          <div className="text-6xl mb-6 font-sans">🔍</div>
          <h2 className="text-2xl font-black text-neutral-900 mb-2 font-sans">Lo sentimos</h2>
          <p className="text-neutral-500 font-medium font-sans">{error}</p>
          <a href="/" className="mt-8 block kh-btn-secondary py-3 font-sans">Volver al inicio</a>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <div className="max-w-md w-full bg-white rounded-[40px] border border-neutral-100 p-12 text-center shadow-2xl">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 animate-bounce">✓</div>
          <h2 className="text-3xl font-black text-neutral-900 mb-3 font-sans">¡Reserva Enviada!</h2>
          <p className="text-neutral-500 font-medium leading-relaxed font-sans">
            Hemos recibido tu solicitud para agendar con <b>{selectedTeacher?.User?.name}</b>{academy ? ` en la academia ${academy.name}` : ""}. Te contactaremos pronto.
          </p>
          <button onClick={() => window.location.reload()} className="mt-10 kh-btn-primary w-full py-4 font-sans">Agendar otra</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8 md:py-16 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12">
          {academy ? (
            <>
              {academy.logo_url ? (
                <img src={academy.logo_url} alt={academy.name} className="w-20 h-20 rounded-3xl object-cover mx-auto mb-6 shadow-xl" />
              ) : (
                <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-600 text-white rounded-[20px] md:rounded-3xl flex items-center justify-center text-2xl md:text-3xl font-black mx-auto mb-6 shadow-xl shadow-emerald-600/20">
                  {academy.name.charAt(0)}
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-2 font-sans">{academy.name}</h1>
              <p className="text-neutral-500 font-bold text-sm md:text-base font-sans">{academy.description || "Agenda tus clases en línea"}</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 md:w-20 md:h-20 bg-violet-600 text-white rounded-[20px] md:rounded-3xl flex items-center justify-center text-2xl md:text-3xl font-black mx-auto mb-6 shadow-xl shadow-violet-600/20">
                {selectedTeacher?.User?.name.charAt(0)}
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight mb-2 font-sans">Agenda con {selectedTeacher?.User?.name}</h1>
              <p className="text-neutral-500 font-bold text-sm md:text-base font-sans">Selecciona el servicio para ver horarios</p>
            </>
          )}
        </div>

        {!selectedClass ? (
          <div className="grid gap-3 md:gap-4">
            {classTypes.length === 0 ? (
              <div className="kh-card p-12 md:p-20 text-center">
                <p className="text-neutral-400 font-bold italic font-sans">No hay servicios configurados todavía.</p>
              </div>
            ) : (
              classTypes.map(ct => (
                <button key={ct.id} onClick={() => setSelectedClass(ct)} className="group text-left p-0.5">
                  <div className="kh-card p-5 md:p-8 flex items-center gap-4 md:gap-6 group-hover:border-emerald-500 group-hover:shadow-xl transition-all relative overflow-hidden">
                    <span className="text-4xl md:text-5xl">{ct.icon || "🎵"}</span>
                    <div className="flex-1">
                      <h3 className="text-lg md:text-xl font-black text-neutral-900 font-sans">{ct.name}</h3>
                      <p className="text-neutral-400 font-bold mt-0.5 uppercase text-[10px] tracking-widest font-sans">{ct.duration} MINUTOS</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl md:text-2xl font-black text-neutral-900 font-sans">${ct.price.toLocaleString()}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          /* Step 2: Form & Slots */
          <div className="space-y-6">
            <button
              onClick={() => {
                setSelectedClass(null)
                setSelectedTeacher(academySlug ? null : selectedTeacher)
              }}
              className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 hover:translate-x-[-4px] transition-transform ml-2 font-sans"
            >
              ← Volver a servicios
            </button>

            <div className="kh-card p-0 overflow-hidden shadow-2xl border-none">
              <div className="bg-neutral-900 p-6 md:p-8 text-white flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest mb-1 font-sans">Servicio seleccionado</p>
                  <h2 className="text-xl md:text-2xl font-black font-sans">{selectedClass.icon} {selectedClass.name}</h2>
                </div>
                <div className="text-right">
                  <p className="text-xl md:text-2xl font-black font-sans">${selectedClass.price.toLocaleString()}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-8">
                {/* Selector de Profesor en Academia */}
                {academySlug && !selectedTeacher && (
                  <div className="space-y-6">
                    <h3 className="font-black text-neutral-900 flex items-center gap-2 text-sm md:text-base uppercase tracking-wider font-sans">
                      <span className="w-1.5 h-4 bg-emerald-500 rounded-full" /> Elige un Profesor
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {matchingTeachers.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTeacher(t)}
                          className="flex items-center gap-4 p-4 border border-neutral-200 rounded-2xl hover:border-emerald-500 hover:shadow-md transition-all text-left bg-white"
                        >
                          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm">
                            {t.User.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-900 font-sans">{t.User.name}</p>
                            <p className="text-xs text-neutral-400 font-sans">{t.instrumento || "Instructor"}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTeacher && (
                  <>
                    {academySlug && (
                      <div className="flex items-center justify-between bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs">
                            {selectedTeacher.User.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-sm font-bold text-neutral-700 font-sans">Profesor: {selectedTeacher.User.name}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTeacher(null)
                            setSelectedSlot(null)
                            setAvailableSlots([])
                          }}
                          className="text-[10px] font-bold text-neutral-400 hover:text-red-500 uppercase font-sans"
                        >
                          Cambiar
                        </button>
                      </div>
                    )}

                    <div className="space-y-6">
                      <h3 className="font-black text-neutral-900 flex items-center gap-2 text-sm md:text-base uppercase tracking-wider font-sans"><span className="w-1.5 h-4 bg-emerald-500 rounded-full" /> Tus Datos</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <input required value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} className="kh-input" placeholder="Nombre completo" />
                        <input type="email" required value={formData.email} onChange={e => setFormData(p => ({...p, email: e.target.value}))} className="kh-input" placeholder="Email" />
                      </div>
                      <input type="tel" required value={formData.phone} onChange={e => setFormData(p => ({...p, phone: e.target.value}))} className="kh-input" placeholder="WhatsApp / Teléfono" />
                    </div>

                    <div className="space-y-6 pt-4 border-t border-neutral-100">
                      <h3 className="font-black text-neutral-900 flex items-center gap-2 text-sm md:text-base uppercase tracking-wider font-sans"><span className="w-1.5 h-4 bg-emerald-500 rounded-full" /> Fecha y Hora</h3>
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

                      {formData.date && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="kh-label mb-3 block text-[10px] font-sans">Horas disponibles ({formatDate(formData.date)})</label>
                          {loadingSlots ? (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                               <div className="kh-skeleton h-12"/><div className="kh-skeleton h-12"/><div className="kh-skeleton h-12"/>
                            </div>
                          ) : availableSlots.length === 0 ? (
                            <p className="p-8 bg-neutral-50 rounded-2xl text-center text-xs font-bold text-neutral-400 italic font-sans">No hay horarios para este día.</p>
                          ) : (
                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                              {availableSlots.map(slot => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`py-3.5 px-2 rounded-xl text-xs font-black transition-all tap-highlight-none font-sans ${
                                    selectedSlot === slot ? "bg-emerald-600 text-white shadow-lg scale-95" : "bg-neutral-100 text-neutral-600 active:bg-neutral-200"
                                  }`}
                                >
                                  {formatTime(slot)}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {error && <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold border border-red-200 font-sans">⚠️ {error}</div>}

                    <button
                      type="submit"
                      disabled={submitting || !selectedSlot}
                      className="w-full kh-btn-primary py-5 text-lg shadow-2xl shadow-emerald-600/30 active:scale-[0.98] transition-transform font-sans"
                    >
                      {submitting ? "Procesando..." : "🎵 Solicitar Reserva"}
                    </button>
                  </>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
}
