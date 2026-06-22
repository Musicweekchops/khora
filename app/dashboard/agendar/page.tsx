"use client"

import { useEffect, useState, useMemo } from "react"
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
  Trash2, 
  Edit3, 
  ChevronRight, 
  Plus, 
  ArrowLeft, 
  CheckCircle,
  HelpCircle,
  Video,
  MapPin,
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
  name: string
  email: string
}

interface ScheduledClass {
  id: string
  date: string
  start_time: string
  end_time: string
  status: string
  modalidad: string
  duration: number
  teacher_id: string
  TeacherProfile: {
    id: string
    user_id: string
    User: {
      name: string
      email: string
    }
  } | null
}

export default function StudentBookingDashboardPage() {
  const { profile } = useAuth()
  const [view, setView] = useState<"hub" | "agendar" | "cambiar" | "cancelar">("hub")
  
  // Base State
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [classTypes, setClassTypes] = useState<ClassType[]>([])
  const [classes, setClasses] = useState<ScheduledClass[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Monthly Counter Stats
  const [monthlyClassesCount, setMonthlyClassesCount] = useState(0)
  const [monthlyLimit, setMonthlyLimit] = useState(4)

  // Booking Form State
  const [selectedClass, setSelectedClass] = useState<ClassType | null>(null)
  const [bookingDate, setBookingDate] = useState("")
  const [bookingMessage, setBookingMessage] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [ownSlots, setOwnSlots] = useState<string[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Rescheduling Form State
  const [rescheduleClass, setRescheduleClass] = useState<ScheduledClass | null>(null)
  const [rescheduleDate, setRescheduleDate] = useState("")
  const [rescheduleSlot, setRescheduleSlot] = useState<string | null>(null)
  const [rescheduleModalidad, setRescheduleModalidad] = useState("online")
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false)
  const [rescheduleSlots, setRescheduleSlots] = useState<string[]>([])
  const [submittingReschedule, setSubmittingReschedule] = useState(false)

  // Cancellation Modal State
  const [cancellingClass, setCancellingClass] = useState<ScheduledClass | null>(null)
  const [showCancellationModal, setShowCancellationModal] = useState(false)

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

  function isLessThan24Hours(dateStr: string, startTimeStr: string): boolean {
    const classStart = new Date(`${dateStr}T${startTimeStr.slice(0, 5)}:00`)
    const now = new Date()
    const diffMs = classStart.getTime() - now.getTime()
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours < 24
  }

  // Load Base Data
  useEffect(() => {
    if (profile?.studentProfileId) {
      loadAllData()
    }
  }, [profile?.studentProfileId])

  // Load slots when booking date/class changes
  useEffect(() => {
    if (bookingDate && selectedClass && teacher) {
      loadBookingSlots()
    }
  }, [bookingDate, selectedClass, teacher])

  // Load slots when rescheduling date changes
  useEffect(() => {
    if (rescheduleDate && rescheduleClass) {
      loadRescheduleSlots()
    }
  }, [rescheduleDate, rescheduleClass])

  async function loadAllData() {
    setLoading(true)
    setError("")
    try {
      // 1. Fetch student profile details (teacher, preferred day/time)
      const { data: studentProfile, error: spErr } = await supabase
        .from("StudentProfile")
        .select(`
          id,
          teacher_id,
          preferred_day,
          preferred_time,
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
      if (!studentProfile || !studentProfile.TeacherProfile) {
        throw new Error("No tienes un profesor asignado en este momento. Por favor contacta al administrador.")
      }

      const tp = Array.isArray(studentProfile.TeacherProfile) ? studentProfile.TeacherProfile[0] : studentProfile.TeacherProfile
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

      // 2. Fetch class types for booking
      const { data: ct, error: ctErr } = await supabase
        .from("ClassType")
        .select("*")
        .eq("teacher_id", tp.id)
        .order("price")

      if (ctErr) throw ctErr
      setClassTypes(ct || [])

      // 3. Fetch future scheduled classes (for cancel & reschedule views)
      const todayStr = new Date().toLocaleDateString('sv-SE')
      const { data: classesData, error: classesErr } = await supabase
        .from("Class")
        .select(`
          id,
          date,
          start_time,
          end_time,
          status,
          modalidad,
          duration,
          teacher_id,
          TeacherProfile (
            id,
            user_id,
            User (
              name,
              email
            )
          )
        `)
        .eq("student_id", profile!.studentProfileId!)
        .in("status", ["SCHEDULED", "CONFIRMED", "PENDING_AUTHORIZATION"])
        .gte("date", todayStr)
        .order("date", { ascending: true })

      if (classesErr) throw classesErr
      setClasses(classesData as any || [])

      // 4. Calculate monthly counter (numerator and denominator)
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth() // 0-indexed
      const startOfMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`
      const endOfMonthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(new Date(currentYear, currentMonth + 1, 0).getDate()).padStart(2, '0')}`

      // Fetch all classes of this month (non-cancelled)
      const { data: monthlyClasses, error: monthlyErr } = await supabase
        .from("Class")
        .select("id")
        .eq("student_id", profile!.studentProfileId!)
        .neq("status", "CANCELLED")
        .gte("date", startOfMonthStr)
        .lte("date", endOfMonthStr)

      if (monthlyErr) throw monthlyErr
      setMonthlyClassesCount(monthlyClasses?.length || 0)

      // Determine monthly limit based on preferred day
      const dayOfWeekNum = getPreferredDayOfWeek(studentProfile.preferred_day)
      const calculatedLimit = dayOfWeekNum !== null 
        ? countDaysInMonth(currentYear, currentMonth, dayOfWeekNum)
        : 4
      setMonthlyLimit(calculatedLimit)

    } catch (err: any) {
      setError(err.message || "Error al cargar la información del portal.")
    } finally {
      setLoading(false)
    }
  }

  // Load slots for new booking
  async function loadBookingSlots() {
    if (!selectedClass || !bookingDate || !teacher) return
    setLoadingSlots(true)
    setSelectedSlot(null)

    try {
      const slots = await getAvailableSlots(bookingDate, teacher.id, selectedClass.duration)
      setAvailableSlots(slots)

      // Fetch own classes to check overlaps on that day
      const { data: myClasses } = await supabase
        .from("Class")
        .select("start_time")
        .eq("teacher_id", teacher.id)
        .eq("student_id", profile!.studentProfileId!)
        .eq("date", bookingDate)
        .neq("status", "CANCELLED")

      // Fetch own bookings
      const { data: myBookings } = await supabase
        .from("Booking")
        .select("start_time")
        .eq("teacher_id", teacher.id)
        .eq("email", profile!.email!)
        .eq("date", bookingDate)
        .eq("status", "PENDING")

      const classTimes = (myClasses || []).map((c: any) => c.start_time)
      const bookingTimes = (myBookings || []).map((b: any) => b.start_time)

      const allOwn = Array.from(new Set([...classTimes, ...bookingTimes])).map((time: string) => {
        const parts = time.split(":")
        return `${parts[0].padStart(2, "0")}:${parts[1].padStart(2, "0")}:00`
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

  // Load slots for rescheduling
  async function loadRescheduleSlots() {
    if (!rescheduleDate || !rescheduleClass) return
    setLoadingRescheduleSlots(true)
    setRescheduleSlot(null)

    try {
      const slots = await getAvailableSlots(rescheduleDate, rescheduleClass.teacher_id, rescheduleClass.duration)
      
      // If we are rescheduling to the original date, ensure original slot is shown
      if (rescheduleDate === rescheduleClass.date) {
        const origSlot = rescheduleClass.start_time.slice(0, 5)
        if (!slots.includes(origSlot)) {
          slots.push(origSlot)
          slots.sort()
        }
      }

      setRescheduleSlots(slots)
    } catch (err) {
      console.error("Error loading slots for reschedule:", err)
      setRescheduleSlots([])
    } finally {
      setLoadingRescheduleSlots(false)
    }
  }

  // Check limits helper
  async function checkLimitsForDate(targetDate: string, excludeClassId?: string) {
    const targetDateObj = new Date(targetDate + "T12:00")
    const targetYear = targetDateObj.getFullYear()
    const targetMonth = targetDateObj.getMonth()

    // 1. Calculate monthly limit for that month based on preferred day
    const studentProfile = await supabase
      .from("StudentProfile")
      .select("preferred_day")
      .eq("id", profile!.studentProfileId!)
      .maybeSingle()

    const pDay = studentProfile.data?.preferred_day
    const preferredDayNum = getPreferredDayOfWeek(pDay)
    const calculatedMonthlyLimit = preferredDayNum !== null 
      ? countDaysInMonth(targetYear, targetMonth, preferredDayNum)
      : 4

    // 2. Count monthly classes
    const startOfMonth = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-01`
    const endOfMonth = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(new Date(targetYear, targetMonth + 1, 0).getDate()).padStart(2, '0')}`

    let query = supabase
      .from("Class")
      .select("id", { count: "exact" })
      .eq("student_id", profile!.studentProfileId!)
      .neq("status", "CANCELLED")
      .gte("date", startOfMonth)
      .lte("date", endOfMonth)

    if (excludeClassId) {
      query = query.neq("id", excludeClassId)
    }

    const { count: mCount, error: mErr } = await query
    if (mErr) throw mErr

    if (mCount !== null && mCount >= calculatedMonthlyLimit) {
      return {
        allowed: false,
        reason: `Has alcanzado el límite mensual de ${calculatedMonthlyLimit} clases para el mes de ${targetDateObj.toLocaleDateString("es-CL", { month: "long" })}.`
      }
    }

    // 3. Count weekly classes (limit of 1 class per week)
    const { startOfWeek, endOfWeek } = getWeekRange(targetDate)
    let weekQuery = supabase
      .from("Class")
      .select("id", { count: "exact" })
      .eq("student_id", profile!.studentProfileId!)
      .neq("status", "CANCELLED")
      .gte("date", startOfWeek)
      .lte("date", endOfWeek)

    if (excludeClassId) {
      weekQuery = weekQuery.neq("id", excludeClassId)
    }

    const { count: wCount, error: wErr } = await weekQuery
    if (wErr) throw wErr

    if (wCount !== null && wCount >= 1) {
      return {
        allowed: false,
        reason: "Ya tienes una clase activa programada para esa semana (límite de 1 clase por semana)."
      }
    }

    return { allowed: true }
  }

  // Handle New Booking Submission
  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedClass || !selectedSlot || !teacher) return
    setSubmitting(true)
    setError("")

    try {
      // 1. Duration validation
      if (selectedClass.duration > 120) {
        throw new Error("La duración de la clase no puede superar las 2 horas (120 minutos).")
      }

      // 2. Limits validation (weekly & monthly)
      const limitCheck = await checkLimitsForDate(bookingDate)
      if (!limitCheck.allowed) {
        throw new Error(limitCheck.reason)
      }

      const startTime = selectedSlot
      const endTime = addMinutes(startTime, selectedClass.duration)

      // Double-check overlaps in backend prior to inserting
      const { data: existingClasses } = await supabase
        .from("Class")
        .select("start_time, end_time")
        .eq("teacher_id", teacher.id)
        .eq("date", bookingDate)
        .neq("status", "CANCELLED")

      const { data: existingBookings } = await supabase
        .from("Booking")
        .select("start_time, end_time")
        .eq("teacher_id", teacher.id)
        .eq("date", bookingDate)
        .eq("status", "PENDING")

      const allEvents = [...(existingClasses || []), ...(existingBookings || [])]
      const hasConflict = allEvents.some(evt => timesOverlap(startTime, endTime, evt.start_time, evt.end_time))

      if (hasConflict) {
        throw new Error("Este horario acaba de ser reservado por otro usuario. Por favor elige otro slot.")
      }

      // 3. Insert pending booking request
      const { error: insertErr } = await supabase.from("Booking").insert({
        teacher_id: teacher.id,
        class_type_id: selectedClass.id,
        name: profile!.name || "Alumno",
        email: profile!.email || "",
        phone: profile!.phone || "",
        message: bookingMessage,
        date: bookingDate,
        start_time: startTime,
        end_time: endTime,
        total_price: selectedClass.price,
        status: "PENDING",
      })

      if (insertErr) throw insertErr

      // Format dates for notification templates
      const friendlyDate = new Date(bookingDate + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
      const friendlyTime = formatTime(startTime)

      // Invoke Email Deno Edge function
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
        }).catch(err => console.error("Error invoking send-email for teacher:", err))
      }

      // Notify Student via Email with .ics file
      if (profile?.email) {
        supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            type: "STUDENT_BOOKING_REQUEST",
            params: {
              studentName: profile.name,
              teacherName: teacher.name,
              date: friendlyDate,
              time: friendlyTime,
              classType: selectedClass.name,
              rawDate: bookingDate,
              rawStartTime: startTime,
              endTime: endTime,
              status: "PENDING"
            }
          }
        }).catch(err => console.error("Error invoking send-email for student booking request:", err))
      }

      // Invoke Teacher Push Notification
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
        }).catch(err => console.error("Error invoking teacher push:", err))
      }

      setSuccessMsg(`Tu solicitud de reserva para el ${friendlyDate} a las ${friendlyTime} hs ha sido enviada.`)
      setView("hub")
      loadAllData()

      // Reset Form
      setSelectedClass(null)
      setBookingDate("")
      setBookingMessage("")
      setSelectedSlot(null)
    } catch (err: any) {
      setError(err.message || "Error al agendar")
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Rescheduling Submission
  async function handleRescheduleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!rescheduleClass || !rescheduleSlot || !teacher) return
    setSubmittingReschedule(true)
    setError("")

    try {
      // 1. Limits validation (excluding the current class)
      const limitCheck = await checkLimitsForDate(rescheduleDate, rescheduleClass.id)
      if (!limitCheck.allowed) {
        throw new Error(limitCheck.reason)
      }

      const startTime = rescheduleSlot
      const endTime = addMinutes(startTime, rescheduleClass.duration)

      // Double-check teacher availability / overlaps
      const { data: existingClasses } = await supabase
        .from("Class")
        .select("start_time, end_time")
        .eq("teacher_id", teacher.id)
        .eq("date", rescheduleDate)
        .neq("status", "CANCELLED")
        .neq("id", rescheduleClass.id)

      const { data: existingBookings } = await supabase
        .from("Booking")
        .select("start_time, end_time")
        .eq("teacher_id", teacher.id)
        .eq("date", rescheduleDate)
        .eq("status", "PENDING")

      const allEvents = [...(existingClasses || []), ...(existingBookings || [])]
      const hasConflict = allEvents.some(evt => timesOverlap(startTime, endTime, evt.start_time, evt.end_time))

      if (hasConflict) {
        throw new Error("El profesor no tiene disponible ese bloque. Por favor selecciona otro.")
      }

      const originalDate = rescheduleClass.date
      const originalStartTime = rescheduleClass.start_time.slice(0, 5)

      // 2. Update Class in DB (keeping current status or setting back to SCHEDULED if it was scheduled/confirmed)
      const { error: updateErr } = await supabase
        .from("Class")
        .update({
          date: rescheduleDate,
          start_time: startTime,
          end_time: endTime,
          modalidad: rescheduleRescheduleModalidad()
        })
        .eq("id", rescheduleClass.id)

      if (updateErr) throw updateErr

      function rescheduleRescheduleModalidad() {
        return rescheduleModalidad
      }

      const friendlyOriginalDate = new Date(originalDate + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
      const friendlyNewDate = new Date(rescheduleDate + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
      const friendlyNewTime = rescheduleSlot.slice(0, 5)

      // 3. Send notification emails (to Student & Teacher)
      // Student Confirmation Email with attachment .ics
      if (profile?.email) {
        supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            type: "STUDENT_CLASS_RESCHEDULED",
            params: {
              studentName: profile.name,
              teacherName: teacher.name,
              date: friendlyNewDate,
              time: friendlyNewTime,
              modalidad: rescheduleModalidad === "online" ? "Virtual" : "Presencial",
              classId: rescheduleClass.id,
              rawDate: rescheduleDate,
              rawStartTime: rescheduleSlot,
              endTime: endTime,
              status: "SCHEDULED"
            }
          }
        }).catch(err => console.error("Error invoking student reschedule email:", err))
      }

      // Teacher Reschedule Notification Email
      if (teacher.email) {
        supabase.functions.invoke("send-email", {
          body: {
            to: teacher.email,
            type: "TEACHER_CLASS_RESCHEDULED",
            params: {
              studentName: profile!.name,
              teacherName: teacher.name,
              originalDate: friendlyOriginalDate,
              originalTime: originalStartTime,
              newDate: friendlyNewDate,
              newTime: friendlyNewTime,
              modalidad: rescheduleModalidad === "online" ? "Virtual (📹)" : "Presencial (🏠)",
              classId: rescheduleClass.id,
              rawDate: rescheduleDate,
              rawStartTime: rescheduleSlot,
              endTime: endTime
            }
          }
        }).catch(err => console.error("Error invoking teacher reschedule email:", err))
      }

      // 4. Send Push Notifications
      supabase.functions.invoke("notify-teacher-push", {
        body: {
          classId: rescheduleClass.id,
          type: "RESCHEDULED",
          originalDate,
          originalStartTime,
          newDate: rescheduleDate,
          newStartTime: rescheduleSlot
        }
      }).catch(err => console.error("Error sending push notification to teacher:", err))

      setSuccessMsg(`Tu clase ha sido reprogramada con éxito para el ${friendlyNewDate} a las ${friendlyNewTime} hs.`)
      setView("hub")
      loadAllData()

      // Reset
      setRescheduleClass(null)
      setRescheduleDate("")
      setRescheduleSlot(null)
    } catch (err: any) {
      setError(err.message || "Error al reprogramar la clase")
    } finally {
      setSubmittingReschedule(false)
    }
  }

  // Handle Class Cancellation (Applying 24h Rule)
  async function executeClassCancellation() {
    if (!cancellingClass) return
    setError("")
    
    const isLateCancellation = isLessThan24Hours(cancellingClass.date, cancellingClass.start_time)
    const newStatus = isLateCancellation ? "PENDING_AUTHORIZATION" : "CANCELLED"

    try {
      // 1. Update in DB
      const { error: cancelErr } = await supabase
        .from("Class")
        .update({ status: newStatus })
        .eq("id", cancellingClass.id)

      if (cancelErr) throw cancelErr

      const friendlyDate = new Date(cancellingClass.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })
      const friendlyTime = cancellingClass.start_time.slice(0, 5)
      const tName = cancellingClass.TeacherProfile?.User?.name || teacher?.name || "Tu profesor"
      const tEmail = cancellingClass.TeacherProfile?.User?.email
      const tUserId = cancellingClass.TeacherProfile?.user_id

      // 2. Notify Student via Email (incorporating .ics cancel)
      if (profile?.email) {
        supabase.functions.invoke("send-email", {
          body: {
            to: profile.email,
            type: "STUDENT_CLASS_CANCELLED",
            params: {
              studentName: profile.name,
              teacherName: tName,
              date: friendlyDate,
              time: friendlyTime,
              status: newStatus,
              classId: cancellingClass.id,
              rawDate: cancellingClass.date,
              rawStartTime: cancellingClass.start_time,
              endTime: cancellingClass.end_time
            }
          }
        }).catch(err => console.error("Error sending cancellation email:", err))
      }

      // 3. Notify Teacher via push / notifications
      if (tUserId) {
        supabase.functions.invoke("notify-teacher-push", {
          body: {
            type: "CANCELLED",
            customParams: {
              teacherUserId: tUserId,
              studentName: profile?.name || "Alumno",
              date: friendlyDate,
              time: friendlyTime,
              classId: cancellingClass.id
            }
          }
        }).catch(err => console.error("Error sending teacher cancel push:", err))
      }

      setSuccessMsg(
        isLateCancellation
          ? "Tu solicitud de cancelación tardía ha sido enviada y quedó en estado 'Pendiente de Autorización'. El cupo permanece bloqueado."
          : "Tu clase ha sido cancelada exitosamente y el cupo ha sido liberado."
      )

      setShowCancellationModal(false)
      setCancellingClass(null)
      setView("hub")
      loadAllData()
    } catch (err: any) {
      setError(err.message || "Error al cancelar la clase")
    }
  }

  // Calculate calendar MIN date for booking
  const minBookingDate = useMemo(() => {
    if (monthlyClassesCount >= monthlyLimit) {
      // Current month limit complete, lock calendar to 1st day of next month
      const now = new Date()
      return new Date(now.getFullYear(), now.getMonth() + 1, 1).toLocaleDateString('sv-SE')
    }
    // Limit not reached, standard today
    return new Date().toLocaleDateString('sv-SE')
  }, [monthlyClassesCount, monthlyLimit])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-12 h-12 border-4 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
        <p className="text-neutral-400 font-bold animate-pulse">Cargando tu portal Khora...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans antialiased pb-safe">
      
      {/* Visual background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10 space-y-8">
        
        {/* Header / Brand */}
        <div className="flex items-center justify-between border-b border-neutral-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-violet-950/40">
              K
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Khora Autogestión</h1>
              <p className="text-xs text-neutral-500 font-medium">Panel del Alumno · {profile?.name}</p>
            </div>
          </div>
          
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white px-4 py-2 rounded-xl transition-all border border-neutral-800"
          >
            Cerrar Sesión
          </button>
        </div>

        {/* Global Toast / Success Message Banner */}
        <AnimatePresence>
          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-3 text-emerald-300 text-xs font-semibold"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{successMsg}</span>
              </div>
              <button onClick={() => setSuccessMsg("")} className="text-emerald-400 hover:text-emerald-200">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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

        {/* Class monthly counter card (glassmorphism) - Always visible */}
        <div className="relative overflow-hidden rounded-3xl bg-neutral-900/60 border border-neutral-800 p-5 shadow-xl backdrop-blur-xl animate-in fade-in duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest block">Consumo del Ciclo Mensual</span>
              <h2 className="text-xl font-extrabold tracking-tight">Estado de clases mensuales</h2>
              <p className="text-xs text-neutral-400">
                Tu profesor: <strong className="text-white font-bold">{teacher?.name}</strong>
              </p>
            </div>

            {/* Progress Visual */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-3xl font-black tracking-tight text-white">{monthlyClassesCount}</span>
                <span className="text-base text-neutral-500 font-bold"> / {monthlyLimit}</span>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider leading-none mt-0.5">Clases Consumidas</p>
              </div>
              
              {/* Bar Visual representation */}
              <div className="w-16 h-2 bg-neutral-800 rounded-full overflow-hidden">
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
                <strong className="text-white font-bold">¡Ciclo Mensual Completado!</strong> Hemos bloqueado las reservas para este mes. Cualquier nueva reserva se habilitará a partir del día 1 del próximo mes.
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* VIEW: HUB / HOME                                                          */}
        {/* ========================================================================= */}
        {view === "hub" && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >

            {/* Core Action Hub Menu */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Option 1: Agendar */}
              <button 
                onClick={() => setView("agendar")}
                className="group text-left p-6 bg-neutral-900/40 border border-neutral-800 hover:border-violet-500/50 hover:bg-violet-950/10 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all shadow-md">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-violet-400 transition-colors uppercase tracking-wider">Agendar Clase</h3>
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium leading-relaxed">
                    Reserva un nuevo bloque. Si tu cupo mensual está lleno, podrás agendar para el siguiente mes.
                  </p>
                </div>
                <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-neutral-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 2: Cambiar */}
              <button 
                onClick={() => setView("cambiar")}
                className="group text-left p-6 bg-neutral-900/40 border border-neutral-800 hover:border-violet-500/50 hover:bg-violet-950/10 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-all shadow-md">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-violet-400 transition-colors uppercase tracking-wider">Cambiar Horario</h3>
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium leading-relaxed">
                    Reagenda cualquiera de tus próximas clases a otro bloque libre según disponibilidad.
                  </p>
                </div>
                <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-neutral-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Option 3: Cancelar */}
              <button 
                onClick={() => setView("cancelar")}
                className="group text-left p-6 bg-neutral-900/40 border border-neutral-800 hover:border-red-500/50 hover:bg-red-950/10 rounded-2xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-400 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all shadow-md">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-red-400 transition-colors uppercase tracking-wider">Cancelar Clase</h3>
                  <p className="text-[11px] text-neutral-500 mt-1 font-medium leading-relaxed">
                    Cancela una clase programada. Recuerda la regla de 24h para no perder el cupo.
                  </p>
                </div>
                <ChevronRight className="absolute bottom-5 right-5 w-4 h-4 text-neutral-600 group-hover:translate-x-1 transition-transform" />
              </button>

            </div>

            {/* List of upcoming classes */}
            <div className="space-y-4 pt-4">
              <h2 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1 flex items-center gap-2">
                <span>🗓️</span> Tus Próximas Clases Agendadas
              </h2>

              {classes.length === 0 ? (
                <div className="bg-neutral-900/30 rounded-2xl border border-neutral-800/80 p-8 text-center">
                  <p className="text-xs text-neutral-500 font-bold italic">No tienes próximas clases agendadas en este momento.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {classes.map(c => {
                    const classDate = new Date(c.date + "T12:00")
                    const isPending = c.status === "PENDING_AUTHORIZATION"
                    
                    return (
                      <div 
                        key={c.id} 
                        className={`p-4 bg-neutral-900/30 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                          isPending ? "border-amber-500/20 bg-amber-950/5" : "border-neutral-800"
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-sm ${
                            isPending ? "bg-amber-500/10 text-amber-400" : "bg-neutral-800 text-white"
                          }`}>
                            {c.modalidad === "online" ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                          </div>
                          
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-white capitalize">
                              {classDate.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                            </h4>
                            <p className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wide flex items-center gap-1.5">
                              <span>⏰ {c.start_time.slice(0, 5)} - {c.end_time.slice(0, 5)} hs</span>
                              <span>•</span>
                              <span>{c.modalidad === "online" ? "Virtual" : "Presencial"}</span>
                            </p>
                          </div>
                        </div>

                        {/* Status tag */}
                        <div>
                          {isPending ? (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-md border border-amber-500/20 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                              Pendiente Autorización
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md border border-emerald-500/20">
                              Confirmada
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: AGENDAR CLASE                                                       */}
        {/* ========================================================================= */}
        {view === "agendar" && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header back button */}
            <button 
              onClick={() => { setSelectedClass(null); setView("hub") }} 
              className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </button>

            <div>
              <h2 className="text-2xl font-black tracking-tight">Agendar Nueva Clase</h2>
              <p className="text-xs text-neutral-500 mt-1">Selecciona el tipo de sesión y luego escoge un horario disponible.</p>
            </div>

            {/* Step 1: Select Service / Class Type */}
            {!selectedClass ? (
              <div className="space-y-4">
                <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest pl-1">Selecciona el Servicio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {classTypes.length === 0 ? (
                    <div className="col-span-full bg-neutral-900/30 rounded-2xl border border-neutral-800 p-8 text-center">
                      <p className="text-xs text-neutral-500 font-bold italic">El profesor no tiene servicios configurados en este momento.</p>
                    </div>
                  ) : (
                    classTypes.map(ct => (
                      <button 
                        key={ct.id} 
                        onClick={() => setSelectedClass(ct)} 
                        className="group text-left p-0.5"
                      >
                        <div className="bg-neutral-900/40 rounded-2xl border border-neutral-800 p-6 flex items-center gap-4 group-hover:border-violet-500 group-hover:bg-violet-950/5 transition-all relative overflow-hidden">
                          <span className="text-3xl">{ct.icon || "🎵"}</span>
                          <div className="flex-1">
                            <h3 className="text-sm font-black text-white group-hover:text-violet-400 transition-colors">{ct.name}</h3>
                            <p className="text-neutral-500 font-bold mt-0.5 uppercase text-[9px] tracking-widest">{ct.duration} MINUTOS</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Step 2: Date and Slot selection */
              <div className="space-y-6">
                <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
                  {/* Selected service summary banner */}
                  <div className="bg-neutral-900 p-5 flex items-center justify-between border-b border-neutral-800/80">
                    <div>
                      <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-0.5">Servicio seleccionado</p>
                      <h3 className="text-base font-black text-white">{selectedClass.icon} {selectedClass.name}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-black bg-neutral-800 border border-neutral-700 text-white px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {selectedClass.duration} MIN
                      </span>
                      <button 
                        onClick={() => setSelectedClass(null)} 
                        className="text-xs text-neutral-400 hover:text-white hover:underline font-bold"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>

                  {/* Booking form */}
                  <form onSubmit={handleBookingSubmit} className="p-6 space-y-6">
                    
                    {/* Visual notice if monthly limit has been completed */}
                    {monthlyClassesCount >= monthlyLimit && (
                      <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 flex gap-3 text-amber-300 text-xs leading-relaxed">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        <div>
                          <strong className="text-white font-bold">Reserva redirigida al próximo mes:</strong> Debido a que has completado tus clases mensuales (${monthlyClassesCount}/${monthlyLimit}), tu reserva se habilitará para el siguiente mes de calendario. El selector de fechas se ha configurado de forma automática a partir del día 1 del próximo mes.
                        </div>
                      </div>
                    )}

                    {/* Date select field */}
                    <div className="space-y-2">
                      <label className="kh-label block text-[10px] flex items-center gap-1.5 text-neutral-400">
                        <CalendarIcon className="w-3.5 h-3.5 text-violet-400" /> Fecha de Reserva
                      </label>
                      <input 
                        type="date"
                        required
                        value={bookingDate}
                        onChange={e => {
                          setBookingDate(e.target.value)
                          const target = e.target
                          setTimeout(() => target.blur(), 50)
                        }}
                        className="kh-input bg-neutral-950 border-neutral-800 text-white"
                        min={minBookingDate}
                      />
                    </div>

                    {/* Slot Picker Grid */}
                    {bookingDate && (
                      <div className="space-y-3 animate-in fade-in duration-300">
                        <label className="kh-label block text-[10px] flex items-center gap-1.5 text-neutral-400">
                          <Clock className="w-3.5 h-3.5 text-violet-400" /> Horas disponibles para el {new Date(bookingDate + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                        </label>

                        {loadingSlots ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="kh-skeleton h-12 bg-neutral-900"/><div className="kh-skeleton h-12 bg-neutral-900"/>
                            <div className="kh-skeleton h-12 bg-neutral-900"/><div className="kh-skeleton h-12 bg-neutral-900"/>
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
                                      <span className="text-[8px] bg-violet-600 text-white px-1 py-0.5 rounded uppercase font-black tracking-wider leading-none">Clase Agendada</span>
                                    </div>
                                  )
                                }

                                return (
                                  <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`py-3 px-2 rounded-xl text-xs font-black transition-all ${
                                      selectedSlot === slot 
                                        ? "bg-violet-600 text-white shadow-md shadow-violet-900/20 border border-violet-500" 
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

                    {/* Booking message notes */}
                    <div className="space-y-2">
                      <label className="kh-label block text-[10px] text-neutral-400">Notas o comentarios para tu profesor (opcional)</label>
                      <textarea 
                        value={bookingMessage}
                        onChange={e => setBookingMessage(e.target.value)}
                        className="kh-input bg-neutral-950 border-neutral-800 text-white min-h-[80px] py-3 resize-none"
                        placeholder="Ej: Hola, me gustaría repasar los ritmos de la clase anterior..."
                      />
                    </div>

                    {/* Submit Button */}
                    <button 
                      type="submit"
                      disabled={submitting || !selectedSlot}
                      className="w-full kh-btn-primary py-4 text-sm font-black uppercase tracking-wider bg-violet-600 hover:bg-violet-700 text-white border border-violet-500 shadow-lg shadow-violet-950/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Procesando reserva...
                        </span>
                      ) : "Confirmar y Solicitar Reserva"}
                    </button>

                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: CAMBIAR HORARIO (RESCHEDULE)                                         */}
        {/* ========================================================================= */}
        {view === "cambiar" && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header back button */}
            <button 
              onClick={() => { setRescheduleClass(null); setView("hub") }} 
              className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </button>

            <div>
              <h2 className="text-2xl font-black tracking-tight">Cambiar Horario</h2>
              <p className="text-xs text-neutral-500 mt-1">Escoge una clase de la lista para reprogramar la fecha o modalidad.</p>
            </div>

            {/* List of reschedule candidates */}
            {!rescheduleClass ? (
              <div className="space-y-3">
                {classes.length === 0 ? (
                  <div className="bg-neutral-900/30 rounded-2xl border border-neutral-800 p-8 text-center">
                    <p className="text-xs text-neutral-500 font-bold italic">No tienes próximas clases programadas que puedas cambiar.</p>
                  </div>
                ) : (
                  classes.map(c => {
                    const cDate = new Date(c.date + "T12:00")
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          setRescheduleClass(c)
                          setRescheduleDate(c.date)
                          setRescheduleModalidad(c.modalidad)
                        }}
                        className="w-full text-left group p-0.5 block"
                      >
                        <div className="p-4 bg-neutral-900/40 rounded-2xl border border-neutral-800 group-hover:border-violet-500/50 group-hover:bg-violet-950/5 flex items-center justify-between gap-4 transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-300 flex items-center justify-center group-hover:bg-violet-600/15 group-hover:text-violet-400 transition-colors">
                              {c.modalidad === "online" ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-white capitalize group-hover:text-violet-400 transition-colors">
                                {cDate.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                              </h4>
                              <p className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wide">
                                ⏰ {c.start_time.slice(0, 5)} hs · Modalidad: {c.modalidad === "online" ? "Virtual" : "Presencial"}
                              </p>
                            </div>
                          </div>
                          
                          <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            ) : (
              /* Reschedule picking form */
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="bg-neutral-900 p-5 flex items-center justify-between border-b border-neutral-800/80">
                  <div>
                    <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest mb-0.5">Clase a Reprogramar</p>
                    <h3 className="text-sm font-black text-white capitalize">
                      {new Date(rescheduleClass.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })} a las {rescheduleClass.start_time.slice(0, 5)} hs
                    </h3>
                  </div>
                  <button 
                    onClick={() => setRescheduleClass(null)} 
                    className="text-xs text-neutral-400 hover:text-white font-bold"
                  >
                    Cambiar
                  </button>
                </div>

                <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-6">
                  
                  {/* Select Modality */}
                  <div className="space-y-2">
                    <label className="kh-label block text-[10px] text-neutral-400">Modalidad</label>
                    <div className="grid grid-cols-2 gap-3 p-1 bg-neutral-950 border border-neutral-850 rounded-2xl">
                      {(["online", "presencial"] as const).map(mod => (
                        <button
                          key={mod}
                          type="button"
                          onClick={() => setRescheduleModalidad(mod)}
                          className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            rescheduleModalidad === mod 
                              ? "bg-violet-600 text-white shadow-md border border-violet-500" 
                              : "text-neutral-400 hover:text-neutral-200"
                          }`}
                        >
                          {mod === "online" ? "📹 Virtual" : "🏠 Presencial"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reschedule Date */}
                  <div className="space-y-2">
                    <label className="kh-label block text-[10px] flex items-center gap-1.5 text-neutral-400">
                      <CalendarIcon className="w-3.5 h-3.5 text-violet-400" /> Nueva Fecha
                    </label>
                    <input 
                      type="date"
                      required
                      value={rescheduleDate}
                      onChange={e => {
                        setRescheduleDate(e.target.value)
                        const target = e.target
                        setTimeout(() => target.blur(), 50)
                      }}
                      className="kh-input bg-neutral-950 border-neutral-800 text-white"
                      min={new Date().toLocaleDateString('sv-SE')}
                    />
                  </div>

                  {/* Reschedule Time Slots Grid */}
                  {rescheduleDate && (
                    <div className="space-y-3 animate-in fade-in duration-300">
                      <label className="kh-label block text-[10px] flex items-center gap-1.5 text-neutral-400">
                        <Clock className="w-3.5 h-3.5 text-violet-400" /> Horas disponibles ({new Date(rescheduleDate + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })})
                      </label>

                      {loadingRescheduleSlots ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="kh-skeleton h-12 bg-neutral-900"/><div className="kh-skeleton h-12 bg-neutral-900"/>
                          <div className="kh-skeleton h-12 bg-neutral-900"/><div className="kh-skeleton h-12 bg-neutral-900"/>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {rescheduleSlots.length === 0 ? (
                            <p className="col-span-full p-6 bg-neutral-950 border border-neutral-900 rounded-2xl text-center text-xs font-bold text-neutral-500 italic">
                              No hay bloques disponibles para ese día.
                            </p>
                          ) : (
                            rescheduleSlots.map(slot => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setRescheduleSlot(slot)}
                                className={`py-3 px-2 rounded-xl text-xs font-black transition-all ${
                                  rescheduleSlot === slot 
                                    ? "bg-violet-600 text-white shadow-md border border-violet-500" 
                                    : "bg-neutral-950 hover:bg-neutral-900 text-neutral-350 border border-neutral-800"
                                }`}
                              >
                                {formatTime(slot)}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit Reschedule */}
                  <button 
                    type="submit"
                    disabled={submittingReschedule || !rescheduleSlot}
                    className="w-full kh-btn-primary py-4 text-sm font-black uppercase tracking-wider bg-violet-600 hover:bg-violet-700 text-white border border-violet-500 shadow-lg disabled:opacity-50 transition-all"
                  >
                    {submittingReschedule ? "Procesando reprogramación..." : "Confirmar y Cambiar Horario"}
                  </button>

                </form>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* VIEW: CANCELAR CLASE                                                      */}
        {/* ========================================================================= */}
        {view === "cancelar" && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Header back button */}
            <button 
              onClick={() => { setCancellingClass(null); setView("hub") }} 
              className="inline-flex items-center gap-2 text-xs font-black text-neutral-400 hover:text-white uppercase tracking-wider transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al inicio
            </button>

            <div>
              <h2 className="text-2xl font-black tracking-tight">Cancelar Clase</h2>
              <p className="text-xs text-neutral-500 mt-1">Escoge una clase de la lista para cancelar. Las cancelaciones con menos de 24h quedan pendientes de autorización.</p>
            </div>

            {/* List of scheduled classes */}
            <div className="space-y-3">
              {classes.length === 0 ? (
                <div className="bg-neutral-900/30 rounded-2xl border border-neutral-800 p-8 text-center">
                  <p className="text-xs text-neutral-500 font-bold italic">No tienes próximas clases programadas que puedas cancelar.</p>
                </div>
              ) : (
                classes.map(c => {
                  const cDate = new Date(c.date + "T12:00")
                  const isLate = isLessThan24Hours(c.date, c.start_time)
                  const isPending = c.status === "PENDING_AUTHORIZATION"
                  
                  return (
                    <div 
                      key={c.id} 
                      className={`p-4 bg-neutral-900/40 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                        isPending ? "border-amber-500/20 bg-amber-950/5" : "border-neutral-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                          isPending ? "bg-amber-500/10 text-amber-400" : "bg-neutral-800 text-neutral-350"
                        }`}>
                          {c.modalidad === "online" ? <Video className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white capitalize">
                            {cDate.toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
                          </h4>
                          <p className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wide flex flex-wrap items-center gap-2">
                            <span>⏰ {c.start_time.slice(0, 5)} hs</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              {isLate ? (
                                <span className="text-amber-400 flex items-center gap-0.5">
                                  <AlertTriangle className="w-3 h-3" /> &lt; 24h (Tardía)
                                </span>
                              ) : (
                                <span className="text-neutral-500">&gt; 24h (Temprana)</span>
                              )}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Cancel Action Button */}
                      <div>
                        {isPending ? (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-md border border-amber-500/20 block text-center">
                            Pendiente Autorización
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setCancellingClass(c)
                              setShowCancellationModal(true)
                            }}
                            className="w-full sm:w-auto px-4 py-2 bg-red-950/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-900/30 hover:border-red-500 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                          >
                            Cancelar clase
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* CANCELLATION DIALOG MODAL (ACCORDING TO 24H RULE)                         */}
      {/* ========================================================================= */}
      {showCancellationModal && cancellingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-6">
            
            {/* Warning Icon depending on late vs standard cancel */}
            {isLessThan24Hours(cancellingClass.date, cancellingClass.start_time) ? (
              <div className="w-12 h-12 rounded-full bg-amber-600/10 text-amber-400 flex items-center justify-center text-xl mx-auto shadow-sm">
                <AlertTriangle className="w-6 h-6" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-red-600/10 text-red-400 flex items-center justify-center text-xl mx-auto shadow-sm">
                <Trash2 className="w-6 h-6" />
              </div>
            )}

            {/* Modal Title and Warning Description */}
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black tracking-tight text-white">
                {isLessThan24Hours(cancellingClass.date, cancellingClass.start_time) 
                  ? "Advertencia de Cancelación Tardía" 
                  : "Confirmar Cancelación de Clase"}
              </h3>
              
              <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                {isLessThan24Hours(cancellingClass.date, cancellingClass.start_time) ? (
                  <>
                    Esta clase comienza el <strong className="text-white capitalize">{new Date(cancellingClass.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</strong> a las <strong className="text-white">{cancellingClass.start_time.slice(0, 5)} hs</strong> (en menos de 24 horas). 
                    <br /><br />
                    <span className="text-amber-400 font-semibold bg-amber-950/20 px-2 py-1 rounded border border-amber-500/20 block text-left mt-2">
                      ⚠️ De acuerdo a las políticas de cancelación de Khora, el cupo no se liberará automáticamente y quedará en estado <strong>'Pendiente de Autorización'</strong>. El slot permanecerá bloqueado.
                    </span>
                  </>
                ) : (
                  <>
                    ¿Estás seguro de que deseas cancelar tu clase del <strong className="text-white capitalize">{new Date(cancellingClass.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}</strong> a las <strong className="text-white">{cancellingClass.start_time.slice(0, 5)} hs</strong>?
                    <br /><br />
                    Tu cupo será liberado de forma automática e inmediata, permitiéndote agendar otro bloque.
                  </>
                )}
              </p>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCancellationModal(false)
                  setCancellingClass(null)
                }}
                className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-750 text-neutral-300 hover:text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors border border-neutral-700"
              >
                No, mantener clase
              </button>
              
              <button
                type="button"
                onClick={executeClassCancellation}
                className={`flex-1 py-3 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  isLessThan24Hours(cancellingClass.date, cancellingClass.start_time)
                    ? "bg-amber-600 hover:bg-amber-700 border-amber-500 shadow-lg shadow-amber-950/40"
                    : "bg-red-600 hover:bg-red-700 border-red-500 shadow-lg shadow-red-950/40"
                }`}
              >
                {isLessThan24Hours(cancellingClass.date, cancellingClass.start_time) 
                  ? "Confirmar Cancelación Tardía" 
                  : "Sí, cancelar clase"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
