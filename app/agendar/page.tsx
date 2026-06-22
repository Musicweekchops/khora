"use client"

import { useEffect, useState, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getAvailableSlots, addMinutes, timesOverlap } from "@/lib/availability"
import { formatTime } from "@/lib/utils"
import { useAuth } from "@/lib/context/AuthContext"
import { motion, AnimatePresence } from "framer-motion"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sparkles, 
  UserCheck, 
  AlertTriangle, 
  ChevronRight, 
  ArrowLeft,
  Video,
  MapPin,
  CheckCircle,
  X
} from "lucide-react"

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
  User: { name: string; email?: string }
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
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        <p className="animate-pulse font-bold text-neutral-400">Cargando...</p>
      </div>
    }>
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
  const { profile } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "", date: "" })
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [ownSlots, setOwnSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Student specific limit verification
  const [monthlyClassesCount, setMonthlyClassesCount] = useState(0)
  const [monthlyLimit, setMonthlyLimit] = useState(4)

  // Preferred Day Helper Maps
  const dayMap: Record<string, number> = {
    domingo: 0, sunday: 0,
    lunes: 1, monday: 1,
    martes: 2, tuesday: 2,
    miercoles: 3, wednesday: 3,
    jueves: 4, thursday: 4,
    viernes: 5, friday: 5,
    sabado: 6, saturday: 6
  }

  function getPreferredDayOfWeek(dayStr: string | null | undefined): number | null {
    if (!dayStr) return null
    const normalized = dayStr.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return normalized in dayMap ? dayMap[normalized] : null
  }

  function countDaysInMonth(year: number, month: number, dayOfWeek: number): number {
    let count = 0
    const date = new Date(year, month, 1)
    while (date.getMonth() === month) {
      if (date.getDay() === dayOfWeek) {
        count++
      }
      date.setDate(date.getDate() + 1)
    }
    return count
  }

  function getWeekRange(dateStr: string) {
    const date = new Date(dateStr + "T12:00")
    const day = date.getDay()
    const diffToMonday = day === 0 ? -6 : 1 - day
    const monday = new Date(date)
    monday.setDate(date.getDate() + diffToMonday)
    
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    
    return {
      startOfWeek: monday.toISOString().split("T")[0],
      endOfWeek: sunday.toISOString().split("T")[0]
    }
  }

  // Prefill form if logged in as student
  useEffect(() => {
    if (profile && profile.role === "STUDENT") {
      setFormData(prev => ({
        ...prev,
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
      }))
      loadStudentLimits()
    }
  }, [profile])

  async function loadStudentLimits() {
    if (!profile?.studentProfileId) return
    try {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      const startOfMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
      const endOfMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(new Date(currentYear, currentMonth + 1, 0).getDate()).padStart(2, '0')}`

      // Fetch taken classes this month
      const { data: monthlyClasses } = await supabase
        .from("Class")
        .select("id")
        .eq("student_id", profile.studentProfileId)
        .neq("status", "CANCELLED")
        .gte("date", startOfMonthStr)
        .lte("date", endOfMonthStr)

      setMonthlyClassesCount(monthlyClasses?.length || 0)

      // Fetch preferred day to calculate limit denominator
      const { data: sp } = await supabase
        .from("StudentProfile")
        .select("preferred_day")
        .eq("id", profile.studentProfileId)
        .maybeSingle()

      const dayOfWeekNum = getPreferredDayOfWeek(sp?.preferred_day)
      const calculatedLimit = dayOfWeekNum !== null 
        ? countDaysInMonth(currentYear, currentMonth, dayOfWeekNum)
        : 4
      setMonthlyLimit(calculatedLimit)
    } catch (e) {
      console.error("Error loading student limits:", e)
    }
  }

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

      const { data: ct, error: ctErr } = await supabase
        .from("ClassType")
        .select("*")
        .eq("academy_id", ac.id)
        .order("price")

      if (ctErr) throw ctErr
      setClassTypes(ct || [])

      const { data: at, error: atErr } = await supabase
        .from("AcademyTeacher")
        .select(`
          status,
          TeacherProfile (
            id, user_id, slug, instrumento,
            User ( name, email )
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
          User: { name: u?.name ?? "—", email: u?.email }
        }
      })
      setTeachers(list)
    } catch (err: any) {
      setError(err.message || "Error al cargar la academia")
    } finally {
      setLoading(false)
    }
  }

  // --- TEACHER BOOKING FLOW ---
  async function loadTeacherFlow() {
    setLoading(true)
    setError("")
    try {
      const { data: t, error: tErr } = await supabase
        .from("TeacherProfile")
        .select("id, user_id, slug, instrumento, User ( name, email )")
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
        User: { 
          name: (t.User as any)?.name ?? "—", 
          email: (t.User as any)?.email 
        }
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

    try {
      const slots = await getAvailableSlots(formData.date, selectedTeacher.id, selectedClass.duration)
      setAvailableSlots(slots)

      if (profile?.role === "STUDENT" && profile.studentProfileId) {
        const { data: myClasses } = await supabase
          .from("Class")
          .select("start_time")
          .eq("teacher_id", selectedTeacher.id)
          .eq("student_id", profile.studentProfileId)
          .eq("date", formData.date)
          .neq("status", "CANCELLED")

        const { data: myBookings } = await supabase
          .from("Booking")
          .select("start_time")
          .eq("teacher_id", selectedTeacher.id)
          .eq("email", profile.email)
          .eq("date", formData.date)
          .eq("status", "PENDING")

        const classTimes = (myClasses || []).map((c: any) => c.start_time)
        const bookingTimes = (myBookings || []).map((b: any) => b.start_time)

        const allOwn = Array.from(new Set([...classTimes, ...bookingTimes])).map((time: string) => {
          const parts = time.split(":")
          return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`
        })
        setOwnSlots(allOwn)
      } else {
        setOwnSlots([])
      }
    } catch (err) {
      console.error("Error loading slots:", err)
      setAvailableSlots([])
      setOwnSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  // Student specific limits checker prior to booking
  async function checkStudentLimits(targetDate: string) {
    if (!profile?.studentProfileId) return { allowed: true }

    const targetDateObj = new Date(targetDate + "T12:00")
    const targetYear = targetDateObj.getFullYear()
    const targetMonth = targetDateObj.getMonth()

    // 1. Calculate monthly limit based on preferred day
    const { data: sp } = await supabase
      .from("StudentProfile")
      .select("preferred_day")
      .eq("id", profile.studentProfileId)
      .maybeSingle()

    const dayOfWeekNum = getPreferredDayOfWeek(sp?.preferred_day)
    const calculatedMonthlyLimit = dayOfWeekNum !== null 
      ? countDaysInMonth(targetYear, targetMonth, dayOfWeekNum)
      : 4

    // 2. Count monthly classes
    const startOfMonth = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`
    const endOfMonth = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(new Date(targetYear, targetMonth + 1, 0).getDate()).padStart(2, '0')}`

    const { count: mCount, error: mErr } = await supabase
      .from("Class")
      .select("id", { count: "exact" })
      .eq("student_id", profile.studentProfileId)
      .neq("status", "CANCELLED")
      .gte("date", startOfMonth)
      .lte("date", endOfMonth)

    if (mErr) throw mErr

    if (mCount !== null && mCount >= calculatedMonthlyLimit) {
      return {
        allowed: false,
        reason: `Has alcanzado el límite mensual de ${calculatedMonthlyLimit} clases para el mes de ${targetDateObj.toLocaleDateString("es-CL", { month: "long" })}.`
      }
    }

    // 3. Count weekly classes (limit of 1 class per week)
    const { startOfWeek, endOfWeek } = getWeekRange(targetDate)
    const { count: wCount, error: wErr } = await supabase
      .from("Class")
      .select("id", { count: "exact" })
      .eq("student_id", profile.studentProfileId)
      .neq("status", "CANCELLED")
      .gte("date", startOfWeek)
      .lte("date", endOfWeek)

    if (wErr) throw wErr

    if (wCount !== null && wCount >= 1) {
      return {
        allowed: false,
        reason: "Ya tienes una clase activa programada para esa semana (límite de 1 clase por semana)."
      }
    }

    return { allowed: true }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClass || !selectedSlot || !selectedTeacher) return
    setSubmitting(true)
    setError("")

    try {
      // 1. Duration check
      if (selectedClass.duration > 120) {
        throw new Error("La duración máxima de la clase es de 120 minutos.")
      }

      // 2. Strict student limits check if logged in
      if (profile && profile.role === "STUDENT") {
        const limitCheck = await checkStudentLimits(formData.date)
        if (!limitCheck.allowed) {
          throw new Error(limitCheck.reason)
        }
      }

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

      // Insert booking request
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

      // Format friendly dates for transactional emails
      const friendlyDate = new Date(formData.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
      const friendlyTime = formatTime(startTime)

      // Invoke Email trigger
      const tEmail = selectedTeacher.User?.email || selectedTeacher.slug + "@khora.cl"
      supabase.functions.invoke("send-email", {
        body: {
          to: tEmail,
          type: "TEACHER_NEW_BOOKING",
          params: {
            teacherName: selectedTeacher.User.name,
            studentName: formData.name,
            date: friendlyDate,
            time: friendlyTime,
            classType: selectedClass.name
          }
        }
      }).catch(err => console.error("Error sending booking email to teacher:", err))

      // Invoke Teacher Push Notification
      if (selectedTeacher.user_id) {
        supabase.functions.invoke("notify-teacher-push", {
          body: {
            type: "BOOKING_CREATED",
            customParams: {
              teacherUserId: selectedTeacher.user_id,
              studentName: formData.name,
              date: friendlyDate,
              time: friendlyTime
            }
          }
        }).catch(err => console.error("Error sending push notification to teacher:", err))
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Error al agendar")
    } finally {
      setSubmitting(false)
    }
  }

  // Filter teachers that teach the selected class instrument
  const matchingTeachers = useMemo(() => {
    if (!selectedClass) return []
    if (!academySlug) return selectedTeacher ? [selectedTeacher] : []

    const serviceName = selectedClass.name.toLowerCase()
    const matched = teachers.filter(t => {
      if (!t.instrumento) return true
      const inst = t.instrumento.toLowerCase()
      return serviceName.includes(inst) || inst.includes(serviceName)
    })

    return matched.length > 0 ? matched : teachers
  }, [selectedClass, teachers, academySlug, selectedTeacher])

  // Calculate min booking date based on student limits
  const minBookingDate = useMemo(() => {
    if (profile && profile.role === "STUDENT" && monthlyClassesCount >= monthlyLimit) {
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('sv-SE')
    }
    return new Date().toLocaleDateString('sv-SE')
  }, [profile, monthlyClassesCount, monthlyLimit])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-neutral-400 font-bold animate-pulse">Cargando disponibilidad...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans antialiased pb-safe relative">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 py-12 relative z-10 space-y-10">
        
        {/* Header Block */}
        <div className="text-center space-y-4">
          {academy ? (
            <>
              {academy.logo_url ? (
                <img src={academy.logo_url} alt={academy.name} className="w-20 h-20 rounded-3xl object-cover mx-auto mb-4 shadow-2xl border border-neutral-800" />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-3xl flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-xl shadow-violet-950/40">
                  {academy.name.charAt(0).toUpperCase()}
                </div>
              )}
              <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                {academy.name}
              </h1>
              <p className="text-neutral-500 font-bold text-xs md:text-sm uppercase tracking-wider">
                {academy.description || "Agenda tus clases en línea"}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-3xl flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-xl shadow-violet-950/40">
                {selectedTeacher?.User?.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
                Agenda con {selectedTeacher?.User?.name}
              </h1>
              <p className="text-neutral-500 font-bold text-xs md:text-sm uppercase tracking-wider">
                Selecciona el servicio para ver la disponibilidad
              </p>
            </>
          )}
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-red-300 text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
              <button onClick={() => setError("")} className="text-red-400 hover:text-red-200">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success view */}
        {success ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-900/60 border border-neutral-800 rounded-3xl p-8 md:p-12 text-center max-w-md mx-auto shadow-2xl backdrop-blur-xl"
          >
            <div className="w-16 h-16 bg-emerald-600/10 text-emerald-400 rounded-full flex items-center justify-center text-3xl mx-auto mb-6 border border-emerald-500/20">
              ✓
            </div>
            <h2 className="text-2xl font-black text-white mb-3">¡Reserva Solicitada!</h2>
            <p className="text-neutral-400 text-xs font-medium leading-relaxed mb-8">
              Hemos recibido tu solicitud para agendar con <strong>{selectedTeacher?.User?.name}</strong>{academy ? ` en la academia ${academy.name}` : ""}. Te notificaremos por correo una vez confirmada.
            </p>
            <button 
              onClick={() => { setSuccess(false); setSelectedClass(null) }} 
              className="w-full kh-btn-primary py-3.5 bg-violet-600 hover:bg-violet-750 text-white font-black border border-violet-500"
            >
              Agendar otra clase
            </button>
          </motion.div>
        ) : (
          /* Main booking flows */
          <>
            {!selectedClass ? (
              /* Step 1: Select Service */
              <div className="space-y-4">
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Selecciona el Servicio</h3>
                <div className="grid gap-3">
                  {classTypes.length === 0 ? (
                    <div className="bg-neutral-900/30 rounded-2xl border border-neutral-800 p-12 text-center">
                      <p className="text-xs text-neutral-500 font-bold italic">No hay servicios configurados todavía.</p>
                    </div>
                  ) : (
                    classTypes.map(ct => (
                      <button 
                        key={ct.id} 
                        onClick={() => setSelectedClass(ct)} 
                        className="group text-left p-0.5 block"
                      >
                        <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800 p-6 flex items-center justify-between gap-4 group-hover:border-violet-500 group-hover:bg-violet-950/5 transition-all">
                          <div className="flex items-center gap-4">
                            <span className="text-3xl">{ct.icon || "🎵"}</span>
                            <div>
                              <h3 className="text-sm font-black text-white group-hover:text-violet-400 transition-colors">{ct.name}</h3>
                              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{ct.duration} minutos</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Step 2: Fill Details & Picker */
              <div className="space-y-6">
                <button
                  onClick={() => {
                    setSelectedClass(null)
                    setSelectedTeacher(academySlug ? null : selectedTeacher)
                    setSelectedSlot(null)
                  }}
                  className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver a servicios
                </button>

                <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl backdrop-blur-xl">
                  <div className="bg-neutral-900 p-5 flex items-center justify-between border-b border-neutral-800/80">
                    <div>
                      <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-0.5">Servicio seleccionado</p>
                      <h3 className="text-sm font-black text-white">{selectedClass.icon} {selectedClass.name}</h3>
                    </div>
                    <span className="text-[9px] font-black bg-neutral-800 border border-neutral-700 text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {selectedClass.duration} MIN
                    </span>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    {/* Academy teacher picker */}
                    {academySlug && !selectedTeacher && (
                      <div className="space-y-4">
                        <label className="kh-label block text-[10px] text-neutral-400">Selecciona el Profesor</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {matchingTeachers.map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setSelectedTeacher(t)}
                              className="flex items-center gap-4 p-4 border border-neutral-800 rounded-2xl hover:border-violet-500 hover:bg-neutral-950/10 transition-all text-left bg-neutral-950"
                            >
                              <div className="w-10 h-10 rounded-full bg-violet-600/10 text-violet-400 font-bold flex items-center justify-center text-xs">
                                {t.User.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">{t.User.name}</p>
                                <p className="text-[10px] text-neutral-500">{t.instrumento || "Instructor"}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedTeacher && (
                      <>
                        {/* Change selected teacher in academy */}
                        {academySlug && (
                          <div className="flex items-center justify-between bg-neutral-950 px-4 py-3 rounded-2xl border border-neutral-800/60">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-violet-600/10 text-violet-400 font-bold flex items-center justify-center text-xs shrink-0">
                                {selectedTeacher.User.name.charAt(0).toUpperCase()}
                              </div>
                              <p className="text-xs font-bold text-neutral-300 truncate">Profesor: {selectedTeacher.User.name}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTeacher(null)
                                setSelectedSlot(null)
                                setAvailableSlots([])
                              }}
                              className="text-[9px] font-black text-neutral-500 hover:text-white uppercase tracking-wider shrink-0"
                            >
                              Cambiar
                            </button>
                          </div>
                        )}

                        {/* Student statistics notice if logged in */}
                        {profile && profile.role === "STUDENT" && (
                          <div className="bg-neutral-950 border border-neutral-805 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-violet-600/10 text-violet-400 flex items-center justify-center">
                                <UserCheck className="w-4 h-4" />
                              </div>
                              <div>
                                <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest leading-none">Alumno Identificado</p>
                                <p className="text-xs font-bold text-white mt-1 leading-none">{profile.name}</p>
                              </div>
                            </div>
                            
                            <div className="text-left sm:text-right">
                              <span className="text-xs font-black text-white">{monthlyClassesCount}</span>
                              <span className="text-[10px] text-neutral-500 font-bold"> / {monthlyLimit} clases</span>
                              <p className="text-[9px] text-neutral-500 uppercase tracking-wide">Consumidas este mes</p>
                            </div>
                          </div>
                        )}

                        {/* Visual block if monthly limit completed for student */}
                        {profile && profile.role === "STUDENT" && monthlyClassesCount >= monthlyLimit && (
                          <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-300 text-xs leading-relaxed">
                            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                              <strong className="text-white font-bold">Límite mensual completado:</strong> Al haber completado tus clases mensuales (${monthlyClassesCount}/${monthlyLimit}), tu reserva será reubicada de forma automática a partir de las fechas del próximo mes (día 1 en adelante).
                            </div>
                          </div>
                        )}

                        {/* Guest input data (Only shown if NOT logged in) */}
                        {!profile && (
                          <div className="space-y-4">
                            <label className="kh-label block text-[10px] text-neutral-400">Tus Datos de Contacto</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <input 
                                required 
                                value={formData.name} 
                                onChange={e => setFormData(p => ({...p, name: e.target.value}))} 
                                className="kh-input bg-neutral-950 border-neutral-800 text-white" 
                                placeholder="Nombre completo" 
                              />
                              <input 
                                type="email" 
                                required 
                                value={formData.email} 
                                onChange={e => setFormData(p => ({...p, email: e.target.value}))} 
                                className="kh-input bg-neutral-950 border-neutral-800 text-white" 
                                placeholder="Correo electrónico" 
                              />
                            </div>
                            <input 
                              type="tel" 
                              required 
                              value={formData.phone} 
                              onChange={e => setFormData(p => ({...p, phone: e.target.value}))} 
                              className="kh-input bg-neutral-950 border-neutral-800 text-white" 
                              placeholder="WhatsApp / Teléfono de contacto" 
                            />
                          </div>
                        )}

                        {/* Date Picker Input */}
                        <div className="space-y-2">
                          <label className="kh-label block text-[10px] flex items-center gap-1.5 text-neutral-400">
                            <CalendarIcon className="w-3.5 h-3.5 text-violet-400" /> Fecha de Reserva
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={e => {
                              setFormData(p => ({...p, date: e.target.value}))
                              const target = e.target
                              setTimeout(() => target.blur(), 50)
                            }}
                            className="kh-input bg-neutral-950 border-neutral-800 text-white"
                            min={minBookingDate}
                          />
                        </div>

                        {/* Available Slots Picker Grid */}
                        {formData.date && (
                          <div className="space-y-3 animate-in fade-in duration-300">
                            <label className="kh-label block text-[10px] flex items-center gap-1.5 text-neutral-400">
                              <Clock className="w-3.5 h-3.5 text-violet-400" /> Horas disponibles ({new Date(formData.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })})
                            </label>

                            {loadingSlots ? (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <div className="kh-skeleton h-12 bg-neutral-950"/><div className="kh-skeleton h-12 bg-neutral-900"/>
                                <div className="kh-skeleton h-12 bg-neutral-950"/><div className="kh-skeleton h-12 bg-neutral-900"/>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {(() => {
                                  const combined = [
                                    ...availableSlots.map(slot => ({ slot, isOwn: false })),
                                    ...ownSlots.map(slot => ({ slot, isOwn: true }))
                                  ].sort((a, b) => a.slot.localeCompare(b.slot))

                                  if (combined.length === 0) {
                                    return (
                                      <p className="col-span-full p-6 bg-neutral-950 border border-neutral-900 rounded-2xl text-center text-xs font-bold text-neutral-500 italic">
                                        No hay bloques disponibles para el día seleccionado.
                                      </p>
                                    )
                                  }

                                  return combined.map(({ slot, isOwn }) => {
                                    if (isOwn) {
                                      return (
                                        <div
                                          key={slot}
                                          className="py-2.5 px-2 rounded-xl text-xs font-black text-center bg-violet-950/20 text-violet-400 border border-violet-500/20 flex flex-col items-center justify-center gap-0.5"
                                        >
                                          <span>{formatTime(slot)}</span>
                                          <span className="text-[8px] bg-violet-600 text-white px-1.5 py-0.5 rounded font-black uppercase tracking-wider leading-none">Mi Clase</span>
                                        </div>
                                      )
                                    }

                                    return (
                                      <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-3.5 px-2 rounded-xl text-xs font-black transition-all ${
                                          selectedSlot === slot 
                                            ? "bg-violet-600 text-white shadow-lg border border-violet-500" 
                                            : "bg-neutral-950 hover:bg-neutral-900 text-neutral-300 border border-neutral-800"
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

                        {/* Optional notes area */}
                        <div className="space-y-2">
                          <label className="kh-label block text-[10px] text-neutral-400">Notas o comentarios para tu profesor (opcional)</label>
                          <textarea
                            value={formData.message}
                            onChange={e => setFormData(p => ({...p, message: e.target.value}))}
                            className="kh-input bg-neutral-950 border-neutral-800 text-white min-h-[80px] py-3 resize-none"
                            placeholder="Ej: Hola, me gustaría enfocarme en rudimentos de redoblante..."
                          />
                        </div>

                        {/* Booking Request Submission Button */}
                        <button
                          type="submit"
                          disabled={submitting || !selectedSlot}
                          className="w-full kh-btn-primary py-4 text-sm font-black uppercase tracking-wider bg-violet-600 hover:bg-violet-700 text-white border border-violet-500 shadow-lg shadow-violet-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {submitting ? (
                            <span className="flex items-center justify-center gap-2">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Enviando solicitud...
                            </span>
                          ) : "🎵 Confirmar y Solicitar Reserva"}
                        </button>
                      </>
                    )}

                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
