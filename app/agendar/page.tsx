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
  X,
  Trash2,
  Plus,
  LogIn,
  ClipboardList
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
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center text-neutral-900">
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
  const [trialClassPrice, setTrialClassPrice] = useState(25000)

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

  // Unified flow states
  const [flowType, setFlowType] = useState<"regular" | "nuevo" | null>(null)
  
  // Login form states (Alumno Regular inline)
  const [loginEmailOrName, setLoginEmailOrName] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loggingIn, setLoggingIn] = useState(false)

  // Regular student actions and states
  const [regularAction, setRegularAction] = useState<"reagendar" | "recuperar" | "cancelar" | null>(null)
  const [activeClasses, setActiveClasses] = useState<any[]>([])
  const [loadingActiveClasses, setLoadingActiveClasses] = useState(false)
  
  // Reschedule actions
  const [classToReschedule, setClassToReschedule] = useState<any | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleSlot, setRescheduleSlot] = useState<string | null>(null)
  const [availableRescheduleSlots, setAvailableRescheduleSlots] = useState<string[]>([])
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false)
  
  // Cancellation actions
  const [classToCancel, setClassToCancel] = useState<any | null>(null)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)

  // New Student class categorization filter
  const [newClassCategory, setNewClassCategory] = useState<"mensual" | "prueba" | "unitaria" | null>(null)

  // Weekly availability immediate view
  const [weeklyAvailability, setWeeklyAvailability] = useState<Record<string, number>>({})
  const [loadingWeekly, setLoadingWeekly] = useState(false)

  // Alternative recommendations
  const [alternativeDateMsg, setAlternativeDateMsg] = useState<string | null>(null)
  const [alternativeDateStr, setAlternativeDateStr] = useState<string | null>(null)

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

  // Auto-route flow if user profile is loaded
  useEffect(() => {
    if (profile && profile.role === "STUDENT") {
      setFlowType("regular")
    }
  }, [profile])

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

  // Fetch teacher trial class price configuration
  useEffect(() => {
    if (selectedTeacher) {
      supabase
        .from("TeacherBillingConfig")
        .select("trial_class_price")
        .eq("teacher_id", selectedTeacher.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data && data.trial_class_price) {
            setTrialClassPrice(data.trial_class_price)
          }
        })
    }
  }, [selectedTeacher])

  // Fetch active classes when regular student wants to cancel or reschedule
  async function loadActiveClasses() {
    if (!profile?.studentProfileId) return
    setLoadingActiveClasses(true)
    try {
      const today = new Date().toLocaleDateString("sv-SE")
      const { data, error } = await supabase
        .from("Class")
        .select(`
          id, date, start_time, end_time, status, modalidad,
          ClassType ( name, duration ),
          TeacherProfile (
            id, user_id,
            User ( name, email, phone )
          )
        `)
        .eq("student_id", profile.studentProfileId)
        .neq("status", "CANCELLED")
        .neq("status", "CANCELLED_BY_STUDENT")
        .gte("date", today)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })

      if (error) throw error
      setActiveClasses(data || [])
    } catch (e) {
      console.error("Error loading active classes:", e)
    } finally {
      setLoadingActiveClasses(false)
    }
  }

  useEffect(() => {
    if (profile && (regularAction === "reagendar" || regularAction === "cancelar")) {
      loadActiveClasses()
    }
  }, [profile, regularAction])

  // Fetch weekly slots summary when teacher/class are set
  async function loadWeeklyAvailability(teacherId: string, duration: number) {
    setLoadingWeekly(true)
    const availabilityMap: Record<string, number> = {}
    const today = new Date()
    const promises = Array.from({ length: 7 }).map(async (_, idx) => {
      const d = new Date()
      d.setDate(today.getDate() + idx)
      const dateStr = d.toLocaleDateString("sv-SE")
      try {
        const slots = await getAvailableSlots(dateStr, teacherId, duration)
        availabilityMap[dateStr] = slots.length
      } catch (e) {
        availabilityMap[dateStr] = 0
      }
    })
    await Promise.all(promises)
    setWeeklyAvailability(availabilityMap)
    setLoadingWeekly(false)
  }

  useEffect(() => {
    const teacherId = selectedTeacher?.id
    const duration = selectedClass?.duration || classToReschedule?.ClassType?.duration
    if (teacherId && duration) {
      loadWeeklyAvailability(teacherId, duration)
    }
  }, [selectedTeacher, selectedClass, classToReschedule])

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
        .neq("status", "CANCELLED_BY_STUDENT")
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
            User ( name, email, phone )
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
          User: { name: u?.name ?? "—", email: u?.email, phone: u?.phone }
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
        .select("id, user_id, slug, instrumento, User ( name, email, phone )")
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
          email: (t.User as any)?.email,
          phone: (t.User as any)?.phone 
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
    setAlternativeDateMsg(null)
    setAlternativeDateStr(null)

    try {
      const slots = await getAvailableSlots(formData.date, selectedTeacher.id, selectedClass.duration)
      setAvailableSlots(slots)

      // Suggest alternative date if selected date is fully booked
      if (slots.length === 0) {
        const targetDate = new Date(formData.date + "T12:00")
        const dayOfWeek = targetDate.getDay() // 0-6
        const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
        const dayName = dayNames[dayOfWeek]

        let foundAlternative = false
        for (let offset = 1; offset <= 3; offset++) {
          const altDate = new Date(targetDate)
          altDate.setDate(targetDate.getDate() + (offset * 7))
          const altDateStr = altDate.toLocaleDateString("sv-SE")
          const altSlots = await getAvailableSlots(altDateStr, selectedTeacher.id, selectedClass.duration)
          if (altSlots.length > 0) {
            setAlternativeDateMsg(`Este ${dayName} está full, pero el ${dayName} ${altDate.toLocaleDateString("es-CL", { day: "numeric", month: "long" })} podría ser una buena opción.`)
            setAlternativeDateStr(altDateStr)
            foundAlternative = true
            break
          }
        }
      }

      if (profile?.role === "STUDENT" && profile.studentProfileId) {
        const { data: myClasses } = await supabase
          .from("Class")
          .select("start_time")
          .eq("teacher_id", selectedTeacher.id)
          .eq("student_id", profile.studentProfileId)
          .eq("date", formData.date)
          .neq("status", "CANCELLED")
          .neq("status", "CANCELLED_BY_STUDENT")

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

  // --- RESCHEDULING SLOTS ---
  async function loadRescheduleSlots() {
    if (!classToReschedule || !rescheduleDate || !selectedTeacher) return
    setLoadingRescheduleSlots(true)
    setRescheduleSlot(null)
    setAlternativeDateMsg(null)
    setAlternativeDateStr(null)

    try {
      const duration = classToReschedule.ClassType?.duration || 60
      const slots = await getAvailableSlots(rescheduleDate, selectedTeacher.id, duration)
      setAvailableRescheduleSlots(slots)

      // Suggest alternative date if selected date is fully booked
      if (slots.length === 0) {
        const targetDate = new Date(rescheduleDate + "T12:00")
        const dayOfWeek = targetDate.getDay() // 0-6
        const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
        const dayName = dayNames[dayOfWeek]

        let foundAlternative = false
        for (let offset = 1; offset <= 3; offset++) {
          const altDate = new Date(targetDate)
          altDate.setDate(targetDate.getDate() + (offset * 7))
          const altDateStr = altDate.toLocaleDateString("sv-SE")
          const altSlots = await getAvailableSlots(altDateStr, selectedTeacher.id, duration)
          if (altSlots.length > 0) {
            setAlternativeDateMsg(`Este ${dayName} está full, pero el ${dayName} ${altDate.toLocaleDateString("es-CL", { day: "numeric", month: "long" })} podría ser una buena opción.`)
            setAlternativeDateStr(altDateStr)
            foundAlternative = true
            break
          }
        }
      }
    } catch (err) {
      console.error("Error loading reschedule slots:", err)
      setAvailableRescheduleSlots([])
    } finally {
      setLoadingRescheduleSlots(false)
    }
  }

  useEffect(() => {
    if (rescheduleDate && classToReschedule && selectedTeacher) {
      loadRescheduleSlots()
    }
  }, [rescheduleDate, classToReschedule, selectedTeacher])

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
      .neq("status", "CANCELLED_BY_STUDENT")
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
      .neq("status", "CANCELLED_BY_STUDENT")
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

  // Handle inline login for regular students
  async function handleInlineLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoggingIn(true)

    let finalEmail = loginEmailOrName.trim()

    if (!finalEmail.includes("@")) {
      try {
        const { data: resolvedEmail, error: rpcErr } = await supabase.rpc("get_email_by_name", { 
          p_name: finalEmail 
        })
        
        if (rpcErr || !resolvedEmail) {
          setError("Nombre, email o contraseña incorrectos")
          setLoggingIn(false)
          return
        }
        finalEmail = resolvedEmail
      } catch (err) {
        setError("Error al resolver el nombre de usuario")
        setLoggingIn(false)
        return
      }
    }

    const { error: err } = await supabase.auth.signInWithPassword({ 
      email: finalEmail, 
      password: loginPassword 
    })

    if (err) {
      setError(err.message === "Invalid login credentials" ? "Nombre, email o contraseña incorrectos" : err.message)
      setLoggingIn(false)
    } else {
      setLoggingIn(false)
    }
  }

  // Handle Cancellation
  function isLessThan24Hours(dateStr: string, startTimeStr: string): boolean {
    const classStart = new Date(`${dateStr}T${startTimeStr.slice(0, 5)}:00`)
    const now = new Date()
    const diffMs = classStart.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours < 24
  }

  async function handleCancelClass(classObj: any) {
    setError("")
    setSubmitting(true)
    
    const isLate = isLessThan24Hours(classObj.date, classObj.start_time)
    const newStatus = isLate ? "CANCELLED_BY_STUDENT" : "CANCELLED"

    try {
      const { error: updateErr } = await supabase
        .from("Class")
        .update({ status: newStatus })
        .eq("id", classObj.id)

      if (updateErr) throw updateErr

      const friendlyDate = new Date(classObj.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
      const friendlyTime = classObj.start_time.slice(0, 5)
      const teacherName = classObj.TeacherProfile?.User?.name || "Tu profesor"
      const tEmail = classObj.TeacherProfile?.User?.email
      const tUserId = classObj.TeacherProfile?.user_id

      // Send cancel email
      if (profile?.email) {
        supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            type: "STUDENT_CLASS_CANCELLED",
            params: {
              studentName: profile.name,
              teacherName: teacherName,
              date: friendlyDate,
              time: friendlyTime,
              status: newStatus,
              classId: classObj.id,
              rawDate: classObj.date,
              rawStartTime: classObj.start_time,
              endTime: classObj.end_time
            }
          }
        }).catch(err => console.error("Error sending cancellation email:", err))
      }

      if (tUserId) {
        supabase.functions.invoke("notify-teacher-push", {
          body: {
            type: "CANCELLED",
            customParams: {
              teacherUserId: tUserId,
              studentName: profile?.name || "Alumno",
              date: friendlyDate,
              time: friendlyTime,
              classId: classObj.id
            }
          }
        }).catch(err => console.error("Error sending teacher push:", err))
      }

      setSuccess(true)
      setClassToCancel(null)
      setCancelModalOpen(false)
      loadActiveClasses()
    } catch (err: any) {
      setError(err.message || "Error al cancelar la clase")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Rescheduling
  async function handleRescheduleClass(e: React.FormEvent) {
    e.preventDefault()
    if (!classToReschedule || !rescheduleDate || !rescheduleSlot || !selectedTeacher) return
    setSubmitting(true)
    setError("")

    try {
      const startTime = rescheduleSlot
      const endTime = addMinutes(startTime, classToReschedule.ClassType?.duration || 60)

      // Overlap checks
      const { data: existingClasses } = await supabase
        .from("Class")
        .select("start_time, end_time")
        .eq("teacher_id", selectedTeacher.id)
        .eq("date", rescheduleDate)
        .neq("status", "CANCELLED")
        .neq("id", classToReschedule.id)

      const { data: existingBookings } = await supabase
        .from("Booking")
        .select("start_time, end_time")
        .eq("teacher_id", selectedTeacher.id)
        .eq("date", rescheduleDate)
        .eq("status", "PENDING")

      const allEvents = [...(existingClasses || []), ...(existingBookings || [])]
      const hasConflict = allEvents.some(evt => timesOverlap(startTime, endTime, evt.start_time, evt.end_time))

      if (hasConflict) {
        throw new Error("El profesor no tiene disponible ese bloque. Por favor selecciona otro.")
      }

      const originalDate = classToReschedule.date
      const originalStartTime = classToReschedule.start_time.slice(0, 5)

      // Update Class in DB
      const { error: updateErr } = await supabase
        .from("Class")
        .update({
          date: rescheduleDate,
          start_time: startTime,
          end_time: endTime
        })
        .eq("id", classToReschedule.id)

      if (updateErr) throw updateErr

      const friendlyOriginalDate = new Date(originalDate + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
      const friendlyNewDate = new Date(rescheduleDate + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
      const friendlyNewTime = rescheduleSlot.slice(0, 5)

      // Send emails
      if (profile?.email) {
        supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            type: "STUDENT_CLASS_RESCHEDULED",
            params: {
              studentName: profile.name,
              teacherName: selectedTeacher.User?.name,
              date: friendlyNewDate,
              time: friendlyNewTime,
              modalidad: classToReschedule.modalidad === "online" ? "Virtual" : "Presencial",
              classId: classToReschedule.id,
              rawDate: rescheduleDate,
              rawStartTime: rescheduleSlot,
              endTime: endTime,
              status: "SCHEDULED"
            }
          }
        }).catch(err => console.error("Error student reschedule email:", err))
      }

      if (selectedTeacher.User?.email) {
        supabase.functions.invoke("send-email", {
          body: {
            to: selectedTeacher.User.email,
            type: "TEACHER_CLASS_RESCHEDULED",
            params: {
              studentName: profile!.name,
              teacherName: selectedTeacher.User.name,
              originalDate: friendlyOriginalDate,
              originalTime: originalStartTime,
              newDate: friendlyNewDate,
              newTime: friendlyNewTime,
              modalidad: classToReschedule.modalidad === "online" ? "Virtual (📹)" : "Presencial (🏠)",
              classId: classToReschedule.id,
              rawDate: rescheduleDate,
              rawStartTime: rescheduleSlot,
              endTime: endTime
            }
          }
        }).catch(err => console.error("Error teacher reschedule email:", err))
      }

      setSuccess(true)
      setClassToReschedule(null)
      setRescheduleDate("")
      setRescheduleSlot(null)
      loadActiveClasses()
    } catch (err: any) {
      setError(err.message || "Error al reprogramar la clase")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle New Booking Submission (with inline registration at the end)
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

      // 2. Register account first if guest (inline registration)
      let studentUserId = null
      if (!profile) {
        if (!formData.name || !formData.email || !formData.phone || !loginPassword) {
          throw new Error("Por favor completa todos tus datos de contacto y crea una contraseña.")
        }
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        const cleanEmail = formData.email.trim().toLowerCase()
        const cleanPhone = formData.phone.trim()

        const createRes = await fetch(`${supabaseUrl}/functions/v1/create-student`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": anonKey || "",
            "Authorization": `Bearer ${anonKey}`
          },
          body: JSON.stringify({
            email: cleanEmail,
            password: loginPassword.trim(),
            name: formData.name.trim(),
            phone: cleanPhone,
            teacher_id: selectedTeacher.id
          })
        })

        const edgeData = await createRes.json()
        if (!createRes.ok || edgeData?.error) {
          throw new Error(edgeData?.error || "Error al crear la cuenta. Intenta con otro correo.")
        }

        studentUserId = edgeData.userId

        // Log in to gain credentials
        const loginRes = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: loginPassword.trim()
        })

        if (loginRes.error) throw loginRes.error

        // Update StudentProfile preferred settings
        const dayNames = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
        const dayOfWeekNum = new Date(formData.date + "T12:00").getDay()
        const prefDayStr = dayNames[dayOfWeekNum]

        await supabase
          .from("StudentProfile")
          .update({
            modalidad: formData.message || "online",
            preferred_day: prefDayStr,
            preferred_time: selectedSlot,
            status: "TRIAL",
            lead_source: "WEBSITE"
          })
          .eq("user_id", studentUserId)
      }

      // 3. Strict student limits check if logged in
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
        .neq("status", "CANCELLED_BY_STUDENT")

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

      // If it is a trial class, redirect to Mercado Pago instead of inserting booking directly
      if (newClassCategory === "prueba") {
        let targetStudentProfileId = profile?.studentProfileId
        if (!targetStudentProfileId && (studentUserId || profile?.id)) {
          const { data: spProfile } = await supabase
            .from("StudentProfile")
            .select("id")
            .eq("user_id", studentUserId || profile?.id)
            .maybeSingle()
          targetStudentProfileId = spProfile?.id
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        const checkoutRes = await fetch(`${supabaseUrl}/functions/v1/mercadopago-checkout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": anonKey || "",
            "Authorization": `Bearer ${anonKey}`
          },
          body: JSON.stringify({
            teacher_id: selectedTeacher.id,
            student_id: targetStudentProfileId || null,
            item_type: "TRIAL",
            prospect_name: formData.name,
            prospect_email: formData.email,
            prospect_phone: formData.phone,
            selected_date: formData.date,
            selected_slot: selectedSlot,
            modalidad: formData.message || "online"
          })
        })

        const checkoutData = await checkoutRes.json()
        if (!checkoutRes.ok || checkoutData?.error) {
          throw new Error(checkoutData?.error || "Error al conectar con la pasarela de pagos. Contacta soporte.")
        }

        // Save details in sessionStorage so success page displays correctly
        sessionStorage.setItem("khora-booking-success", JSON.stringify({
          teacherName: selectedTeacher.User?.name,
          teacherPhone: selectedTeacher.User?.phone || "56944291538",
          instrument: selectedClass.name,
          date: formData.date,
          time: selectedSlot.slice(0, 5)
        }))

        // Redirect to Mercado Pago checkout
        window.location.href = checkoutData.checkoutUrl
        return
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

      // Notify Student via Email with .ics file
      if (formData.email) {
        supabase.functions.invoke("send-email", {
          body: {
            to: formData.email,
            type: "STUDENT_BOOKING_REQUEST",
            params: {
              studentName: formData.name,
              teacherName: selectedTeacher.User?.name || "Tu profesor",
              date: friendlyDate,
              time: friendlyTime,
              classType: selectedClass.name,
              rawDate: formData.date,
              rawStartTime: startTime,
              endTime: endTime,
              status: "PENDING"
            }
          }
        }).catch(err => console.error("Error sending booking email to student:", err))
      }

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
      <div className="min-h-screen bg-[#fafafa] text-neutral-900 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-neutral-400 font-bold animate-pulse">Cargando disponibilidad...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-900 font-sans antialiased pb-safe relative">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

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
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">
                {academy.name}
              </h1>
              <p className="text-neutral-400 font-bold text-xs md:text-sm uppercase tracking-wider">
                {academy.description || "Agenda tus clases en línea"}
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-3xl flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-xl shadow-violet-950/40">
                {selectedTeacher?.User?.name.charAt(0).toUpperCase()}
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-neutral-900">
                Agenda con {selectedTeacher?.User?.name}
              </h1>
              <p className="text-neutral-400 font-bold text-xs md:text-sm uppercase tracking-wider">
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
              className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-red-800 text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-650 shrink-0" />
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
            className="bg-white border border-neutral-200 rounded-3xl p-8 md:p-12 text-center max-w-md mx-auto shadow-lg animate-in zoom-in duration-300"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 flex items-center justify-center text-3xl mx-auto mb-6 border border-emerald-500/20">
              ✓
            </div>
            <h2 className="text-2xl font-black text-neutral-900 mb-3">¡Proceso Exitoso!</h2>
            <p className="text-neutral-400 text-xs font-medium leading-relaxed mb-8">
              Tu solicitud ha sido procesada de manera correcta. Te enviaremos los detalles y confirmación por correo de inmediato.
            </p>
            <button 
              onClick={() => { 
                setSuccess(false)
                setSelectedClass(null)
                setClassToReschedule(null)
                setClassToCancel(null)
                setRescheduleDate("")
                setRescheduleSlot(null)
                setFormData({ name: "", email: "", phone: "", message: "", date: "" })
                setSelectedSlot(null)
              }} 
              className="w-full kh-btn-primary py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-black border border-violet-600"
            >
              Volver a mi Agenda
            </button>
          </motion.div>
        ) : (
          /* Main booking flows */
          <>
            {/* Step 1: Selection (Alumno Regular vs Alumno Nuevo) */}
            {flowType === null && (
              <div className="space-y-6 max-w-md mx-auto animate-in fade-in duration-300">
                <div className="bg-white border border-neutral-200 rounded-3xl p-8 text-center space-y-6 shadow-md">
                  <h2 className="text-xl font-black text-neutral-900">¿Ya eres alumno de Khora?</h2>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Si ya asistes a clases con nosotros, inicia sesión para gestionar tu agenda. Si es tu primera vez, selecciona "Alumno Nuevo".
                  </p>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setFlowType("regular")}
                      className="w-full py-4 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-violet-500 flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" /> Sí, soy alumno regular
                    </button>
                    <button
                      onClick={() => setFlowType("nuevo")}
                      className="w-full py-4 bg-white hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-neutral-200 flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" /> No, soy alumno nuevo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* FLOW: ALUMNO REGULAR */}
            {flowType === "regular" && (
              <div className="space-y-6">
                {/* Back button to flow selection (only if NOT logged in) */}
                {!profile && (
                  <button
                    onClick={() => { setFlowType(null); setError(""); }}
                    className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" /> Volver
                  </button>
                )}

                {/* Inline Login form for Regular Student */}
                {!profile ? (
                  <div className="max-w-md mx-auto bg-white border border-neutral-200 rounded-3xl p-8 shadow-md">
                    <div className="text-center">
                      <LogIn className="w-10 h-10 text-violet-400 mx-auto mb-3" />
                      <h2 className="text-lg font-black text-neutral-900 uppercase tracking-wider">Identifícate</h2>
                      <p className="text-xs text-neutral-500 mt-1">Nombre de usuario y contraseña solamente</p>
                    </div>

                    <form onSubmit={handleInlineLogin} className="space-y-4">
                      <div>
                        <label className="kh-label block text-[10px] text-neutral-400">Nombre</label>
                        <input
                          type="text"
                          required
                          value={loginEmailOrName}
                          onChange={e => setLoginEmailOrName(e.target.value)}
                          className="kh-input bg-white border-neutral-200 text-neutral-900"
                          placeholder="Nombre completo"
                        />
                      </div>
                      <div>
                        <label className="kh-label block text-[10px] text-neutral-400">Contraseña</label>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={e => setLoginPassword(e.target.value)}
                          className="kh-input bg-white border-neutral-200 text-neutral-900"
                          placeholder="••••••••"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loggingIn}
                        className="w-full py-3.5 bg-violet-600 hover:bg-violet-750 text-white rounded-xl text-xs font-black uppercase tracking-wider border border-violet-500 flex items-center justify-center gap-2"
                      >
                        {loggingIn ? (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Iniciar Sesión"}
                      </button>
                    </form>
                  </div>
                ) : (
                  // Logged-in regular student view
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between bg-white px-5 py-3 rounded-2xl border border-neutral-200 shadow-sm">
                      <p className="text-xs text-neutral-400">
                        Sesión: <strong className="text-neutral-900">{profile.name}</strong> (Alumno Regular)
                      </p>
                      <button
                        onClick={() => {
                          supabase.auth.signOut();
                          setFlowType(null);
                          setRegularAction(null);
                        }}
                        className="text-[10px] font-black text-neutral-500 hover:text-white uppercase tracking-wider"
                      >
                        Salir
                      </button>
                    </div>

                    {/* Class monthly counter card (glassmorphism) - Always visible to regular students */}
                    <div className="relative overflow-hidden rounded-3xl bg-white border border-neutral-200/80 p-5 shadow-sm">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest block">Consumo del Ciclo Mensual</span>
                          <h2 className="text-xl font-extrabold tracking-tight">Estado de clases mensuales</h2>
                          <p className="text-xs text-neutral-400">
                            Tu profesor: <strong className="text-neutral-900 font-bold">{selectedTeacher?.User?.name || "Tu profesor"}</strong>
                          </p>
                        </div>

                        {/* Progress Visual */}
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-3xl font-black tracking-tight text-neutral-900">{monthlyClassesCount}</span>
                            <span className="text-base text-neutral-500 font-bold"> / {monthlyLimit}</span>
                            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider leading-none mt-0.5">Clases Consumidas</p>
                          </div>
                          
                          {/* Bar Visual representation */}
                          <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500" 
                              style={{ width: `${Math.min(100, (monthlyClassesCount / monthlyLimit) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Edge Case Warning: cycle completed */}
                      {monthlyClassesCount >= monthlyLimit && (
                        <div className="mt-4 border-t border-neutral-850 pt-3 flex gap-2.5 text-amber-300 text-xs font-medium">
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                          <div>
                            <strong className="text-neutral-900 font-bold">¡Ciclo Mensual Completado!</strong> Hemos bloqueado las reservas para este mes. Cualquier nueva reserva se habilitará a partir del día 1 del próximo mes.
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SELECT ACTION HUB */}
                    {regularAction === null && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Selecciona una Acción</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          {/* Option: Reagendar */}
                          <button
                            onClick={() => setRegularAction("reagendar")}
                            className="group text-left p-6 bg-white border border-neutral-200 hover:border-violet-300 hover:bg-violet-50/30 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
                          >
                            <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all shadow-md">
                              <Clock className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-neutral-900 group-hover:text-violet-600 transition-colors uppercase tracking-wider">Re-agendar Clase</h3>
                              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                                Cambia la fecha u hora de alguna de tus próximas clases agendadas.
                              </p>
                            </div>
                            <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-neutral-600 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* Option: Recuperar */}
                          <button
                            onClick={() => setRegularAction("recuperar")}
                            className="group text-left p-6 bg-white border border-neutral-200 hover:border-amber-300 hover:bg-amber-50/20 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
                          >
                            <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all shadow-md">
                              <Plus className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-neutral-900 group-hover:text-amber-400 transition-colors uppercase tracking-wider">Recuperar Clase</h3>
                              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                                Programa una clase a favor por inasistencias o saldos justificables.
                              </p>
                            </div>
                            <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-neutral-600 group-hover:translate-x-1 transition-transform" />
                          </button>

                          {/* Option: Cancelar */}
                          <button
                            onClick={() => setRegularAction("cancelar")}
                            className="group text-left p-6 bg-white border border-neutral-200 hover:border-red-300 hover:bg-red-50/30 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
                          >
                            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-400 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-md">
                              <Trash2 className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-neutral-900 group-hover:text-red-400 transition-colors uppercase tracking-wider">Cancelar Clase</h3>
                              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                                Cancela tu asistencia a una clase. Aplica política de aviso de 24 horas.
                              </p>
                            </div>
                            <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-neutral-600 group-hover:translate-x-1 transition-transform" />
                          </button>

                        </div>
                      </div>
                    )}

                    {/* REGULAR ACTION VIEW: CANCELAR */}
                    {regularAction === "cancelar" && (
                      <div className="space-y-6">
                        <button
                          onClick={() => setRegularAction(null)}
                          className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" /> Volver a acciones
                        </button>
                        
                        <div className="space-y-4">
                          <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Selecciona la Clase a Cancelar</h3>
                          {loadingActiveClasses ? (
                            <div className="space-y-2">
                              <div className="kh-skeleton h-16 bg-neutral-250" />
                              <div className="kh-skeleton h-16 bg-neutral-250" />
                            </div>
                          ) : activeClasses.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center">
                              <p className="text-xs text-neutral-500 font-bold italic">No tienes clases próximas activas programadas.</p>
                            </div>
                          ) : (
                            <div className="grid gap-3">
                              {activeClasses.map(c => {
                                const isLate = isLessThan24Hours(c.date, c.start_time)
                                return (
                                  <div key={c.id} className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-neutral-300 transition-all shadow-sm">
                                    <div>
                                      <h4 className="text-sm font-black text-neutral-900 capitalize">
                                        {new Date(c.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                                      </h4>
                                      <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">
                                        ⏰ {c.start_time.slice(0, 5)} hs • {c.ClassType?.name} • {c.modalidad === "online" ? "Virtual" : "Presencial"}
                                      </p>
                                      {isLate && (
                                        <p className="text-[10px] text-amber-400 font-semibold mt-1">
                                          ⚠️ Cancelación Tardía (menos de 24 horas). Se descontará del saldo.
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setClassToCancel(c);
                                        setCancelModalOpen(true);
                                      }}
                                      className="py-2.5 px-5 bg-red-650/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* REGULAR ACTION VIEW: RECUPERAR */}
                    {regularAction === "recuperar" && (
                      <div className="space-y-6">
                        <button
                          onClick={() => setRegularAction(null)}
                          className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" /> Volver a acciones
                        </button>
                        
                        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-4 max-w-md mx-auto shadow-sm">
                          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
                          <h3 className="text-base font-black text-amber-300 uppercase tracking-wider">Límite de recuperaciones alcanzado</h3>
                          <p className="text-xs text-neutral-300 leading-relaxed font-medium">
                            Has alcanzado el límite de recuperaciones automáticas habilitadas en tu perfil de alumno. Por favor, contacta a tu profesor para que coordine tu agendamiento de forma manual.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* REGULAR ACTION VIEW: REAGENDAR */}
                    {regularAction === "reagendar" && (
                      <div className="space-y-6">
                        <button
                          onClick={() => {
                            if (classToReschedule) {
                              setClassToReschedule(null);
                              setRescheduleDate("");
                              setRescheduleSlot(null);
                            } else {
                              setRegularAction(null);
                            }
                          }}
                          className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" /> {classToReschedule ? "Volver a clases" : "Volver a acciones"}
                        </button>

                        {!classToReschedule ? (
                          <div className="space-y-4">
                            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Selecciona la Clase a Re-agendar</h3>
                            {loadingActiveClasses ? (
                              <div className="space-y-2">
                                <div className="kh-skeleton h-16 bg-neutral-250" />
                              </div>
                            ) : activeClasses.length === 0 ? (
                              <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center">
                                <p className="text-xs text-neutral-500 font-bold italic">No tienes clases próximas activas programadas.</p>
                              </div>
                            ) : (
                              <div className="grid gap-3">
                                {activeClasses.map(c => (
                                  <button
                                    key={c.id}
                                    onClick={() => {
                                      setClassToReschedule(c);
                                      if (c.TeacherProfile) {
                                        setSelectedTeacher({
                                          id: c.TeacherProfile.id,
                                          user_id: c.TeacherProfile.user_id,
                                          slug: "",
                                          instrumento: null,
                                          User: c.TeacherProfile.User
                                        });
                                      }
                                    }}
                                    className="text-left bg-white border border-neutral-200 hover:border-violet-350 rounded-2xl p-6 flex items-center justify-between gap-4 transition-all shadow-sm"
                                  >
                                    <div>
                                      <h4 className="text-sm font-black text-neutral-900 capitalize">
                                        {new Date(c.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                                      </h4>
                                      <p className="text-[10px] text-neutral-400 font-bold mt-1 uppercase tracking-wider">
                                        ⏰ {c.start_time.slice(0, 5)} hs • {c.ClassType?.name} • {c.modalidad === "online" ? "Virtual" : "Presencial"}
                                      </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          // Rescheduling Date and Time selection
                          <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-md">
                            <div className="bg-neutral-50 p-5 border-b border-neutral-200">
                              <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Re-agendando clase</p>
                              <h3 className="text-sm font-black text-neutral-900">
                                Original: {new Date(classToReschedule.date + "T12:00").toLocaleDateString("es-CL", { day: "numeric", month: "long" })} a las {classToReschedule.start_time.slice(0, 5)} hs
                              </h3>
                            </div>

                            <form onSubmit={handleRescheduleClass} className="p-6 space-y-6">
                              
                              {/* WEEKLY AVAILABILITY PREVIEW */}
                              <WeeklyAvailabilityView 
                                weeklyAvailability={weeklyAvailability} 
                                loadingWeekly={loadingWeekly} 
                                selectedDate={rescheduleDate}
                                onSelectDate={setRescheduleDate}
                              />

                              {/* Date select field */}
                              <div className="space-y-2">
                                <label className="kh-label block text-[10px] flex items-center gap-1.5 text-neutral-400">
                                  <CalendarIcon className="w-3.5 h-3.5 text-violet-400" /> Nueva Fecha de Clase
                                </label>
                                <input
                                  type="date"
                                  required
                                  value={rescheduleDate}
                                  onChange={e => {
                                    setRescheduleDate(e.target.value);
                                    const target = e.target;
                                    setTimeout(() => target.blur(), 50);
                                  }}
                                  className="kh-input bg-white border-neutral-200 text-neutral-900"
                                  min={new Date().toLocaleDateString("sv-SE")}
                                />
                              </div>

                              {/* Alternative Suggestion Banner */}
                              {alternativeDateMsg && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 text-amber-800 text-xs">
                                  <p className="font-semibold leading-relaxed">⚠️ {alternativeDateMsg}</p>
                                  <button
                                    type="button"
                                    onClick={() => setRescheduleDate(alternativeDateStr || "")}
                                    className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg uppercase text-[9px] tracking-wide transition-all"
                                  >
                                    Ver disponibilidad ese día
                                  </button>
                                </div>
                              )}

                              {/* Slots grid */}
                              {rescheduleDate && (
                                <div className="space-y-3">
                                  <label className="kh-label block text-[10px] flex items-center gap-1.5 text-neutral-400">
                                    <Clock className="w-3.5 h-3.5 text-violet-400" /> Horas disponibles ({new Date(rescheduleDate + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })})
                                  </label>

                                  {loadingRescheduleSlots ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      <div className="kh-skeleton h-12 bg-neutral-200" />
                                    </div>
                                  ) : availableRescheduleSlots.length === 0 ? (
                                    <p className="p-6 bg-white border border-neutral-200 rounded-2xl text-center text-xs font-bold text-neutral-500 italic">
                                      No hay bloques libres para el día seleccionado.
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      {availableRescheduleSlots.map(slot => (
                                        <button
                                          key={slot}
                                          type="button"
                                          onClick={() => setRescheduleSlot(slot)}
                                          className={`py-3.5 px-2 rounded-xl text-xs font-black transition-all ${
                                            rescheduleSlot === slot
                                              ? "bg-violet-600 text-white shadow-lg border border-violet-500"
                                              : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/80 shadow-sm"
                                          }`}
                                        >
                                          {formatTime(slot)}
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              <button
                                type="submit"
                                disabled={submitting || !rescheduleSlot}
                                className="w-full kh-btn-primary py-4 text-sm font-black uppercase tracking-wider bg-violet-600 hover:bg-violet-750 text-white border border-violet-500"
                              >
                                {submitting ? "Reprogramando..." : "Confirmar Cambio de Clase"}
                              </button>
                            </form>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* FLOW: ALUMNO NUEVO */}
            {flowType === "nuevo" && (
              <div className="space-y-6">
                {/* Back button to type selection */}
                <button
                  onClick={() => {
                    setFlowType(null);
                    setSelectedClass(null);
                    setNewClassCategory(null);
                    setError("");
                  }}
                  className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al inicio
                </button>

                {/* Step 2.N: Class Type Selection */}
                {newClassCategory === null && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Selecciona el tipo de clase</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      <button
                        onClick={() => setNewClassCategory("prueba")}
                        className="group text-left p-6 bg-white border border-neutral-200 hover:border-violet-300 hover:bg-violet-50/30 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
                      >
                        <span className="text-3xl">⭐</span>
                        <div>
                          <h3 className="text-sm font-black text-neutral-900 group-hover:text-violet-600 transition-colors uppercase tracking-wider">Clase de Prueba</h3>
                          <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                            Sesión de diagnóstico de 1 hora para conocernos.
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setNewClassCategory("mensual")}
                        className="group text-left p-6 bg-white border border-neutral-200 hover:border-violet-300 hover:bg-violet-50/30 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
                      >
                        <span className="text-3xl">📅</span>
                        <div>
                          <h3 className="text-sm font-black text-neutral-900 group-hover:text-violet-600 transition-colors uppercase tracking-wider">Plan Mensual</h3>
                          <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                            4 clases recurrentes al mes. Reserva tu horario permanente.
                          </p>
                        </div>
                      </button>

                      <button
                        onClick={() => setNewClassCategory("unitaria")}
                        className="group text-left p-6 bg-white border border-neutral-200 hover:border-violet-300 hover:bg-violet-50/30 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
                      >
                        <span className="text-3xl">🎵</span>
                        <div>
                          <h3 className="text-sm font-black text-neutral-900 group-hover:text-violet-600 transition-colors uppercase tracking-wider">Clase Unitaria</h3>
                          <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                            Bloques sueltos e individuales. Flexibilidad total sin planes fijos.
                          </p>
                        </div>
                      </button>

                    </div>
                  </div>
                )}

                {/* Step 3.N: Display services matching selected category */}
                {newClassCategory !== null && !selectedClass && (
                  <div className="space-y-6">
                    <button
                      onClick={() => setNewClassCategory(null)}
                      className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
                      type="button"
                    >
                      <ArrowLeft className="w-4 h-4" /> Cambiar tipo de clase
                    </button>
                    
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Selecciona el Servicio Específico</h3>
                      <div className="grid gap-3">
                        {(() => {
                          const filtered = classTypes.filter(ct => {
                            const nameLower = ct.name.toLowerCase()
                            if (newClassCategory === "prueba") {
                              return nameLower.includes("prueba") || nameLower.includes("diagnostico") || nameLower.includes("trial")
                            } else if (newClassCategory === "mensual") {
                              return nameLower.includes("mensual") || nameLower.includes("plan") || nameLower.includes("pack") || nameLower.includes("recurrente")
                            } else {
                              return !nameLower.includes("prueba") && !nameLower.includes("diagnostico") && !nameLower.includes("trial") &&
                                     !nameLower.includes("mensual") && !nameLower.includes("plan") && !nameLower.includes("pack") && !nameLower.includes("recurrente")
                            }
                          })

                          // Fallback to all classes if no matches found
                          const listToRender = filtered.length > 0 ? filtered : classTypes

                          const mappedList = listToRender.map(ct => {
                            let name = ct.name
                            let price = ct.price
                            let icon = ct.icon || "🎵"
                            
                            if (newClassCategory === "prueba") {
                              name = name.toLowerCase().includes("prueba") ? ct.name : `Clase de Prueba (${ct.name})`
                              price = trialClassPrice
                              icon = "⭐"
                            } else if (newClassCategory === "mensual") {
                              name = name.toLowerCase().includes("mensual") ? ct.name : `Plan Mensual (${ct.name})`
                              price = 90000
                              icon = "📅"
                            } else if (newClassCategory === "unitaria") {
                              name = name.toLowerCase().includes("unitaria") ? ct.name : `Clase Unitaria (${ct.name})`
                              price = 40000
                              icon = "🎵"
                            }
                            
                            return { ...ct, name, price, icon }
                          })

                          return mappedList.map(ct => (
                            <button
                              key={ct.id}
                              onClick={() => setSelectedClass(ct)}
                              className="group text-left p-0.5 block"
                            >
                              <div className="bg-white rounded-2xl border border-neutral-200 p-6 flex items-center justify-between gap-4 group-hover:border-violet-300 group-hover:bg-violet-50/20 transition-all">
                                <div className="flex items-center gap-4">
                                  <span className="text-3xl">{ct.icon}</span>
                                  <div>
                                    <h3 className="text-sm font-black text-neutral-900 group-hover:text-violet-600 transition-colors">{ct.name}</h3>
                                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mt-0.5">{ct.duration} minutos • ${ct.price.toLocaleString("es-CL")}</p>
                                  </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-neutral-600" />
                              </div>
                            </button>
                          ))
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4.N: Calendar slots & register form */}
                {selectedClass && (
                  <div className="space-y-6">
                    <button
                      onClick={() => {
                        setSelectedClass(null);
                        setSelectedSlot(null);
                        setFormData(p => ({ ...p, date: "" }));
                      }}
                      className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" /> Cambiar servicio
                    </button>

                    <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-md">
                      <div className="bg-neutral-50 p-5 flex items-center justify-between border-b border-neutral-200">
                        <div>
                          <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-0.5">Servicio seleccionado</p>
                          <h3 className="text-sm font-black text-neutral-900">{selectedClass.icon} {selectedClass.name}</h3>
                        </div>
                        <span className="text-[9px] font-black bg-neutral-100 border border-neutral-200 text-neutral-800 px-2.5 py-1 rounded-md uppercase tracking-wider">
                          {selectedClass.duration} MIN
                        </span>
                      </div>

                      <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        
                        {/* TEACHER PICKER */}
                        {academySlug && !selectedTeacher && (
                          <div className="space-y-4">
                            <label className="kh-label block text-[10px] text-neutral-400">Selecciona el Profesor</label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {matchingTeachers.map(t => (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => setSelectedTeacher(t)}
                                  className="flex items-center gap-4 p-4 border border-neutral-200 rounded-2xl hover:border-violet-500 hover:bg-violet-50/20 transition-all text-left bg-white shadow-sm"
                                >
                                  <div className="w-10 h-10 rounded-full bg-violet-600/10 text-violet-400 font-bold flex items-center justify-center text-xs">
                                    {t.User.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-bold text-neutral-900 text-xs">{t.User.name}</p>
                                    <p className="text-[10px] text-neutral-500">{t.instrumento || "Instructor"}</p>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {selectedTeacher && (
                          <>
                            {academySlug && (
                              <div className="flex items-center justify-between bg-neutral-50 px-4 py-3 rounded-2xl border border-neutral-200">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-7 h-7 rounded-full bg-violet-600/10 text-violet-400 font-bold flex items-center justify-center text-xs shrink-0">
                                    {selectedTeacher.User.name.charAt(0).toUpperCase()}
                                  </div>
                                  <p className="text-xs font-bold text-neutral-300 truncate">Profesor: {selectedTeacher.User.name}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedTeacher(null);
                                    setSelectedSlot(null);
                                    setFormData(p => ({ ...p, date: "" }));
                                  }}
                                  className="text-[9px] font-black text-neutral-500 hover:text-white uppercase tracking-wider"
                                >
                                  Cambiar
                                </button>
                              </div>
                            )}

                            {/* WEEKLY AVAILABILITY PREVIEW */}
                            <WeeklyAvailabilityView 
                              weeklyAvailability={weeklyAvailability} 
                              loadingWeekly={loadingWeekly} 
                              selectedDate={formData.date}
                              onSelectDate={d => setFormData(p => ({ ...p, date: d }))}
                            />

                            {/* Date select field */}
                            <div className="space-y-2">
                              <label className="kh-label block text-[10px] flex items-center gap-1.5 text-neutral-400">
                                <CalendarIcon className="w-3.5 h-3.5 text-violet-400" /> Fecha de Reserva
                              </label>
                              <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => {
                                  setFormData(p => ({ ...p, date: e.target.value }));
                                  const target = e.target;
                                  setTimeout(() => target.blur(), 50);
                                }}
                                className="kh-input bg-white border-neutral-200 text-neutral-900"
                                min={minBookingDate}
                              />
                            </div>

                            {/* Alternative Suggestion Banner */}
                            {alternativeDateMsg && (
                              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3 text-amber-800 text-xs">
                                <p className="font-semibold leading-relaxed">⚠️ {alternativeDateMsg}</p>
                                <button
                                  type="button"
                                  onClick={() => setFormData(p => ({ ...p, date: alternativeDateStr || "" }))}
                                  className="py-1.5 px-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-lg uppercase text-[9px] tracking-wide transition-all"
                                >
                                  Ver disponibilidad ese día
                                </button>
                              </div>
                            )}

                            {/* Time Slots grid */}
                            {formData.date && (
                              <div className="space-y-3">
                                <label className="kh-label block text-[10px] flex items-center gap-1.5 text-neutral-400">
                                  <Clock className="w-3.5 h-3.5 text-violet-400" /> Horas disponibles ({new Date(formData.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })})
                                </label>

                                {loadingSlots ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div className="kh-skeleton h-12 bg-neutral-200" />
                                  </div>
                                ) : availableSlots.length === 0 ? (
                                  <p className="p-6 bg-white border border-neutral-200 rounded-2xl text-center text-xs font-bold text-neutral-500 italic">
                                    No hay bloques libres para el día seleccionado.
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {availableSlots.map(slot => (
                                      <button
                                        key={slot}
                                        type="button"
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-3.5 px-2 rounded-xl text-xs font-black transition-all ${
                                          selectedSlot === slot
                                            ? "bg-violet-600 text-white shadow-lg border border-violet-500"
                                            : "bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200/80 shadow-sm"
                                        }`}
                                      >
                                        {formatTime(slot)}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* GUEST INPUT DATA & ACCOUNT REGISTRATION FORM (ONLY IF NOT LOGGED IN & SLOT IS SELECTED) */}
                            {selectedSlot && !profile && (
                              <div className="space-y-4 pt-4 border-t border-neutral-800 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="kh-label block text-[10px] text-neutral-400">Nombre completo</label>
                                    <input
                                      required
                                      value={formData.name}
                                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                      className="kh-input bg-white border-neutral-200 text-neutral-900"
                                      placeholder="Tu nombre completo"
                                    />
                                  </div>
                                  <div>
                                    <label className="kh-label block text-[10px] text-neutral-400">Correo electrónico</label>
                                    <input
                                      type="email"
                                      required
                                      value={formData.email}
                                      onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                                      className="kh-input bg-white border-neutral-200 text-neutral-900"
                                      placeholder="ejemplo@correo.com"
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="kh-label block text-[10px] text-neutral-400">WhatsApp / Teléfono</label>
                                    <input
                                      type="tel"
                                      required
                                      value={formData.phone}
                                      onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                                      className="kh-input bg-white border-neutral-200 text-neutral-900"
                                      placeholder="+56912345678"
                                    />
                                  </div>
                                  <div>
                                    <label className="kh-label block text-[10px] text-neutral-400">Crea tu contraseña (para tu cuenta de alumno)</label>
                                    <input
                                      type="password"
                                      required
                                      value={loginPassword}
                                      onChange={e => setLoginPassword(e.target.value)}
                                      className="kh-input bg-white border-neutral-200 text-neutral-900"
                                      placeholder="Mínimo 6 caracteres"
                                    />
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="kh-label block text-[10px] text-neutral-400">Modalidad de Clase</label>
                                  <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 border border-neutral-200 rounded-xl">
                                    {["presencial", "online"].map(m => (
                                      <button
                                        key={m}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, message: m }))}
                                        className={`py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                          formData.message === m ? "bg-white text-neutral-900 shadow-sm border border-neutral-200/50" : "text-neutral-500 hover:text-neutral-300"
                                        }`}
                                      >
                                        {m === "presencial" ? "🏠 Presencial" : "📹 Online"}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Submission Button */}
                            {(!profile ? selectedSlot : true) && (
                              <button
                                type="submit"
                                disabled={submitting || !selectedSlot}
                                className="w-full kh-btn-primary py-4 text-sm font-black uppercase tracking-wider bg-violet-600 hover:bg-violet-750 text-white border border-violet-500 shadow-lg"
                              >
                                {submitting ? "Procesando..." : "🎵 Confirmar y Solicitar Reserva"}
                              </button>
                            )}

                          </>
                        )}
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Cancellation Modal */}
      {cancelModalOpen && classToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 max-w-md w-full shadow-lg space-y-6 animate-in zoom-in duration-200">
            <div className="text-center">
              <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-black text-neutral-900 uppercase tracking-wider">Confirmar Cancelación</h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                ¿Estás seguro de que deseas cancelar tu clase del{" "}
                <strong className="text-neutral-900 capitalize">
                  {new Date(classToCancel.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                </strong>{" "}
                a las <strong className="text-neutral-900">{classToCancel.start_time.slice(0, 5)} hs</strong>?
              </p>
              {isLessThan24Hours(classToCancel.date, classToCancel.start_time) && (
                <div className="mt-4 bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-[11px] text-amber-900 font-semibold leading-relaxed text-left">
                  ⚠️ <strong>Cancelación Tardía (menos de 24h):</strong> La clase se marcará como cancelada por el alumno, se descontará de tu saldo y tu profesor evaluará si se puede recuperar manualmente.
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setCancelModalOpen(false);
                  setClassToCancel(null);
                }}
                className="flex-1 py-3 bg-white hover:bg-neutral-50 text-neutral-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-neutral-200"
              >
                No, mantener clase
              </button>
              <button
                type="button"
                onClick={() => handleCancelClass(classToCancel)}
                className="flex-1 py-3 bg-red-650 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-red-600"
              >
                Sí, cancelar clase
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

function WeeklyAvailabilityView({
  weeklyAvailability,
  loadingWeekly,
  selectedDate,
  onSelectDate
}: {
  weeklyAvailability: Record<string, number>
  loadingWeekly: boolean
  selectedDate: string
  onSelectDate: (date: string) => void
}) {
  if (loadingWeekly) {
    return (
      <div className="flex gap-2 justify-center py-4">
        {Array.from({ length: 7 }).map((_, idx) => (
          <div key={idx} className="w-12 h-14 bg-neutral-200 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  const today = new Date()
  const days = Array.from({ length: 7 }).map((_, idx) => {
    const d = new Date()
    d.setDate(today.getDate() + idx)
    const dateStr = d.toLocaleDateString("sv-SE")
    return {
      dateStr,
      label: d.toLocaleDateString("es-CL", { weekday: "short" }),
      num: d.getDate(),
      slotsCount: weeklyAvailability[dateStr] || 0
    }
  })

  return (
    <div className="space-y-2">
      <label className="kh-label block text-[10px] text-neutral-400 uppercase tracking-widest pl-1">
        Disponibilidad de la Semana
      </label>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map(d => {
          const isSelected = selectedDate === d.dateStr
          const hasSlots = d.slotsCount > 0
          return (
            <button
              key={d.dateStr}
              type="button"
              onClick={() => {
                if (hasSlots) {
                  onSelectDate(d.dateStr)
                }
              }}
              disabled={!hasSlots}
              className={`p-1.5 sm:p-2 rounded-xl flex flex-col items-center justify-center border transition-all ${
                isSelected
                  ? "bg-violet-600 text-white border-violet-500 shadow-md shadow-violet-950/40"
                  : hasSlots
                  ? "bg-white hover:bg-neutral-50 text-neutral-900 border-neutral-200 hover:border-neutral-300"
                  : "bg-neutral-100/50 text-neutral-400 border-neutral-200/50 cursor-not-allowed opacity-50"
              }`}
            >
              <span className="text-[8px] font-black uppercase tracking-wider leading-none mb-1">{d.label}</span>
              <span className="text-sm font-black leading-none">{d.num}</span>
              <span className={`text-[7px] font-bold mt-1 px-1 rounded-sm ${
                isSelected 
                  ? "bg-violet-500 text-white" 
                  : hasSlots 
                  ? "bg-violet-50 text-violet-600" 
                  : "bg-neutral-100 text-neutral-400"
              }`}>
                {hasSlots ? `${d.slotsCount}h` : "Full"}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
