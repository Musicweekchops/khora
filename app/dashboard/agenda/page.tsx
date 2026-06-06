"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatTime } from "@/lib/utils"
import AvailabilitySettings from "@/components/agenda/AvailabilitySettings"
import { checkTeacherConflict } from "@/lib/availability"
import { toast } from "sonner"

interface CalendarClass {
  id: string; date: string; start_time: string; end_time: string
  status: string; modalidad: string; student_name: string
  is_booking?: boolean; is_recurring?: boolean; is_trial?: boolean;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7) // 7am to 20pm
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
const DAY_NAMES_FULL = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

function getMonday(d: Date) {
  const date = new Date(d)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
}

export default function AgendaPage() {
  const { profile } = useAuth()
  const [classes, setClasses] = useState<CalendarClass[]>([])
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showAvailModal, setShowAvailModal] = useState(false)

  // Lock body scroll when modals are active to prevent background scroll drifting
  useEffect(() => {
    if (showModal || showAvailModal) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [showModal, showAvailModal])

  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null)
  const [mobileSelectedDate, setMobileSelectedDate] = useState(() => new Date())
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL")

  // Quick-add form state
  const [quickForm, setQuickForm] = useState({ student_id: "", start_time: "10:00", end_time: "11:00", modalidad: "online" })
  const [saving, setSaving] = useState(false)

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  const monthDays = useMemo(() => {
    const year = currentMonthDate.getFullYear()
    const month = currentMonthDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const startDayOfWeek = firstDay.getDay()
    const paddingDays = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1
    const start = new Date(firstDay)
    start.setDate(start.getDate() - paddingDays)
    
    const days = []
    for (let i = 0; i < 35; i++) {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      days.push(d)
    }
    if (days[34].getMonth() === month && new Date(year, month + 1, 0).getDate() > days[34].getDate()) {
      for (let i = 35; i < 42; i++) {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        days.push(d)
      }
    }
    return days
  }, [currentMonthDate])

  useEffect(() => {
    console.log("[Agenda] Profile state:", { 
      hasProfile: !!profile, 
      teacherId: profile?.teacherProfileId 
    })
    
    if (profile?.teacherProfileId) {
      loadClasses()
      loadStudents()
    }
  }, [profile, weekStart, currentMonthDate])

  async function loadClasses() {
    setLoading(true)
    try {
      const rangeStart = weekDays[0] < monthDays[0] ? weekDays[0] : monthDays[0]
      const rangeEnd = weekDays[6] > monthDays[monthDays.length - 1] ? weekDays[6] : monthDays[monthDays.length - 1]

      const start = toDateStr(rangeStart)
      const end = toDateStr(rangeEnd)

      // Load actual classes
      const { data: classData, error: classErr } = await supabase
        .from("Class")
        .select("id, date, start_time, end_time, status, modalidad, is_recurring, booking_id, StudentProfile ( status, User ( name ) )")
        .eq("teacher_id", profile!.teacherProfileId!)
        .gte("date", start)
        .lte("date", end)
        .neq("status", "CANCELLED")
        .order("start_time")

      if (classErr) console.error("[Agenda] Error classes:", classErr)

      // Load pending bookings
      const { data: bookingData, error: bookErr } = await supabase
        .from("Booking")
        .select("id, date, start_time, end_time, status, name")
        .eq("teacher_id", profile!.teacherProfileId!)
        .eq("status", "PENDING")
        .gte("date", start)
        .lte("date", end)

      if (bookErr) console.error("[Agenda] Error bookings:", bookErr)

      const formattedClasses = (classData || []).map((c: any) => ({
        id: c.id, date: c.date, start_time: c.start_time, end_time: c.end_time,
        status: c.status, modalidad: c.modalidad, is_recurring: !!c.is_recurring,
        student_name: c.StudentProfile?.User?.name ?? "Sin asignar",
        is_booking: false,
        is_trial: !!c.booking_id || c.StudentProfile?.status === "TRIAL"
      }))

      const formattedBookings = (bookingData || []).map((b: any) => ({
        id: b.id, date: b.date, start_time: b.start_time, end_time: b.end_time,
        status: "PENDING", modalidad: "N/A", is_recurring: false,
        student_name: `SOLICITUD: ${b.name}`,
        is_booking: true
      }))

      setClasses([...formattedClasses, ...formattedBookings])
    } catch (err) {
      console.error("[Agenda] Fetch fatal error:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteBooking(bookingId: string) {
    if (!confirm("¿Seguro que deseas eliminar esta solicitud de reserva? Esto liberará el horario de inmediato.")) return
    try {
      const { error } = await supabase
        .from("Booking")
        .delete()
        .eq("id", bookingId)

      if (error) {
        alert("Error al eliminar la reserva: " + error.message)
      } else {
        await loadClasses()
      }
    } catch (err: any) {
      alert("Error excepcional: " + err.message)
    }
  }

  async function loadStudents() {
    const { data } = await supabase
      .from("StudentProfile")
      .select("id, User ( name )")
      .eq("teacher_id", profile!.teacherProfileId!)

    if (data) setStudents(data.map((s: any) => ({ id: s.id, name: s.User?.name ?? "—" })))
  }

  function prevWeek() { setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d }) }
  function nextWeek() { setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d }) }
  function goToday() { setWeekStart(getMonday(new Date())) }

  function handleSlotClick(date: Date, hour: number) {
    setSelectedSlot({ date: toDateStr(date), hour })
    setQuickForm({
      student_id: "",
      start_time: `${String(hour).padStart(2, "0")}:00`,
      end_time: `${String(hour + 1).padStart(2, "0")}:00`,
      modalidad: "online",
    })
    setShowModal(true)
  }

  async function handleQuickCreate() {
    if (!selectedSlot || !profile?.teacherProfileId) return
    setSaving(true)

    // Validar traslape
    const hasConflict = await checkTeacherConflict(
      profile.teacherProfileId,
      selectedSlot.date,
      quickForm.start_time,
      quickForm.end_time
    )

    if (hasConflict) {
      toast.error("El profesor ya tiene una clase o reserva programada en ese horario.")
      setSaving(false)
      return
    }

    const { error: insertErr } = await supabase.from("Class").insert({
      teacher_id: profile.teacherProfileId,
      student_id: quickForm.student_id || null,
      date: selectedSlot.date,
      start_time: quickForm.start_time,
      end_time: quickForm.end_time,
      modalidad: quickForm.modalidad,
      status: "SCHEDULED",
    })

    if (insertErr) {
      toast.error("Error al crear la clase: " + insertErr.message)
    } else {
      toast.success("Clase agendada con éxito")
    }

    setSaving(false)
    setShowModal(false)
    loadClasses()
  }

  function getClassesForSlot(dayStr: string, hour: number) {
    return classes.filter(c => {
      if (c.date !== dayStr) return false
      const startHr = parseInt(c.start_time.split(":")[0])
      return startHr === hour
    })
  }

  const today = toDateStr(new Date())
  const monthYear = weekDays[3].toLocaleDateString("es-CL", { month: "long", year: "numeric" })

  const hasClassesOnDay = (dayStr: string) => {
    return classes.some(c => c.date === dayStr)
  }

  const filteredClassesForDay = useMemo(() => {
    const dayStr = toDateStr(mobileSelectedDate)
    return classes.filter(c => {
      if (c.date !== dayStr) return false
      
      // Filter by Search term
      if (searchTerm.trim() && !c.student_name.toLowerCase().includes(searchTerm.toLowerCase())) return false
      
      // Filter by Tab
      if (filterTab === "PENDING") return c.is_booking
      if (filterTab === "COMPLETED") return c.status === "COMPLETED"
      if (filterTab === "ALL") return !c.is_booking // classes tab
      
      return true
    })
  }, [classes, mobileSelectedDate, searchTerm, filterTab])

  if (loading && classes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin" />
        <p className="text-neutral-400 font-bold animate-pulse">Cargando tu agenda...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Agenda</h1>
            <p className="hidden md:block text-neutral-500 font-medium mt-1 capitalize">{monthYear}</p>
          </div>
          {/* Mobile Arrows */}
          <div className="flex items-center gap-2 md:hidden">
            <button onClick={prevWeek} className="w-10 h-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors font-bold">
              ←
            </button>
            <button onClick={nextWeek} className="w-10 h-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors font-bold">
              →
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={() => setShowAvailModal(true)} className="flex-1 md:flex-none kh-btn-secondary px-4 py-2 border border-violet-200 text-violet-600 flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            <span className="hidden sm:inline">Disponibilidad</span>
            <span className="sm:hidden">Ajustes</span>
          </button>
          <button onClick={goToday} className="flex-[0.5] md:flex-none px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors text-center">
            Hoy
          </button>
          <div className="hidden md:flex items-center gap-2">
            <button onClick={prevWeek} className="w-10 h-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors font-bold">
              ←
            </button>
            <button onClick={nextWeek} className="w-10 h-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors font-bold">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid - Desktop */}
      <div className="hidden md:block bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm">
        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b border-neutral-100">
          <div className="p-3 text-center text-xs font-bold text-neutral-300 uppercase">Hora</div>
          {weekDays.map((day, i) => {
            const isToday = toDateStr(day) === today
            return (
              <div key={i} className={`p-3 text-center border-l border-neutral-100 ${isToday ? "bg-violet-50" : ""}`}>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{DAY_NAMES[day.getDay()]}</p>
                <p className={`text-xl font-black mt-0.5 ${isToday ? "text-violet-600" : "text-neutral-900"}`}>{day.getDate()}</p>
              </div>
            )
          })}
        </div>

        {/* Time Grid */}
        <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
          {HOURS.map(hour => (
            <div key={hour} className="grid grid-cols-8 border-b border-neutral-50 h-[60px]">
              {/* Hour label */}
              <div className="p-2 text-right pr-4 flex items-start justify-end pointer-events-none">
                <span className="text-xs font-bold text-neutral-300 -translate-y-3 bg-white px-1">{String(hour).padStart(2, "0")}:00</span>
              </div>

              {/* Day cells */}
              {weekDays.map((day, dayIdx) => {
                const dayStr = toDateStr(day)
                const isToday = dayStr === today
                const slotClasses = getClassesForSlot(dayStr, hour)

                return (
                  <div
                    key={dayIdx}
                    onClick={() => slotClasses.length === 0 && handleSlotClick(day, hour)}
                    className={`border-l border-neutral-50 relative cursor-pointer hover:bg-violet-50/30 transition-colors group ${
                      isToday ? "bg-violet-50/20" : ""
                    }`}
                  >
                    {/* Hover indicator for creating classes */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-violet-300 font-black text-2xl pb-2">+</div>

                    {slotClasses.map(cls => {
                      const startHr = parseInt(cls.start_time.split(":")[0])
                      const startMins = parseInt(cls.start_time.split(":")[1] || "0")
                      const endHr = parseInt(cls.end_time.split(":")[0])
                      const endMins = parseInt(cls.end_time.split(":")[1] || "0")
                      
                      const durationMins = (endHr * 60 + endMins) - (startHr * 60 + startMins)
                      const heightPx = Math.max(durationMins, 25) // 1 min = 1px, min 25px
                      const topPx = startMins

                      return (
                        <div
                          key={cls.id}
                          className="absolute z-10 block group"
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                            left: '2px',
                            right: '2px'
                          }}
                          onClick={e => e.stopPropagation()}
                        >
                          <Link 
                            href={cls.is_booking ? `/dashboard/crm` : `/dashboard/clases/detalles?id=${cls.id}`}
                            className="block w-full h-full"
                          >
                            <div
                              className={`h-full rounded-md p-1.5 text-xs hover:shadow-lg hover:z-20 transition-all cursor-pointer overflow-hidden flex flex-col shadow-sm border ${
                                cls.status === "COMPLETED"
                                  ? "bg-emerald-50/95 border-emerald-200 border-l-4 border-l-emerald-400 text-emerald-700"
                                  : cls.is_booking 
                                    ? "bg-amber-50/95 border-amber-200 border-l-4 border-l-amber-400 text-amber-700 border-dashed"
                                    : cls.is_trial
                                      ? "bg-orange-50/95 border-orange-200 border-l-4 border-l-orange-400 text-orange-700"
                                      : "bg-violet-50/95 border-violet-200 border-l-4 border-l-violet-400 text-violet-700"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1 leading-tight">
                                <p className="font-black truncate pr-4">{cls.student_name}</p>
                                {cls.is_recurring && <span className="text-[9px] opacity-70 flex-shrink-0" title="Clase recurrente">↻</span>}
                                {cls.is_booking && <span className="text-[9px] animate-pulse flex-shrink-0">🔔</span>}
                              </div>
                              <p className="opacity-70 text-[9px] font-medium mt-auto truncate">{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</p>
                            </div>
                          </Link>

                          {cls.is_booking && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDeleteBooking(cls.id)
                              }}
                              title="Eliminar Solicitud de Reserva"
                              className="absolute top-1 right-1 w-5 h-5 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 flex items-center justify-center transition-all shadow-sm opacity-0 group-hover:opacity-100 z-30 text-[10px]"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid - Mobile (iCal Style) */}
      <div className="md:hidden space-y-5">
        {/* Search bar */}
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">🔍</span>
          <input 
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por alumno..."
            className="w-full pl-11 pr-4 py-3.5 bg-neutral-100 border border-neutral-200/60 rounded-2xl text-sm font-bold text-neutral-900 placeholder:text-neutral-400 outline-none focus:bg-white focus:border-violet-500 transition-all shadow-inner"
          />
        </div>

        {/* Compact Monthly Grid Calendar */}
        <div className="bg-white p-5 rounded-[32px] border border-neutral-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-black text-neutral-900 capitalize">
              {currentMonthDate.toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
            </span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => {
                  const d = new Date(currentMonthDate)
                  d.setMonth(d.getMonth() - 1)
                  setCurrentMonthDate(d)
                }}
                className="w-8 h-8 rounded-xl bg-neutral-50 border border-neutral-200/50 flex items-center justify-center text-xs font-black text-neutral-600 hover:bg-neutral-100 transition-all"
              >
                ←
              </button>
              <button 
                onClick={() => {
                  const d = new Date(currentMonthDate)
                  d.setMonth(d.getMonth() + 1)
                  setCurrentMonthDate(d)
                }}
                className="w-8 h-8 rounded-xl bg-neutral-50 border border-neutral-200/50 flex items-center justify-center text-xs font-black text-neutral-600 hover:bg-neutral-100 transition-all"
              >
                →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"].map(day => (
              <span key={day} className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">{day}</span>
            ))}
            {monthDays.map((day, idx) => {
              const dayStr = toDateStr(day)
              const isSelected = dayStr === toDateStr(mobileSelectedDate)
              const isToday = dayStr === today
              const hasEvents = hasClassesOnDay(dayStr)
              const isCurrentMonth = day.getMonth() === currentMonthDate.getMonth()

              return (
                <div 
                  key={idx}
                  onClick={() => {
                    setMobileSelectedDate(day)
                    if (day.getMonth() !== currentMonthDate.getMonth()) {
                      setCurrentMonthDate(new Date(day))
                    }
                  }}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative cursor-pointer transition-all ${
                    isSelected 
                      ? "bg-neutral-900 text-white shadow-md scale-105" 
                      : isCurrentMonth 
                        ? "hover:bg-neutral-50 text-neutral-800" 
                        : "text-neutral-300 hover:bg-neutral-50/50"
                  }`}
                >
                  <span className="text-sm font-black">{day.getDate()}</span>
                  {hasEvents && (
                    <span className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${isSelected ? "bg-white" : isToday ? "bg-violet-600" : "bg-neutral-400"}`} />
                  )}
                  {isToday && !isSelected && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-violet-600" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Dynamic Filter Tabs */}
        <div className="flex border-b border-neutral-200/60 pb-1 gap-4 overflow-x-auto scrollbar-none">
          {(["ALL", "PENDING", "COMPLETED"] as const).map(tab => {
            const label = tab === "ALL" ? "Clases" : tab === "PENDING" ? "Solicitudes" : "Completadas"
            const count = tab === "ALL" 
              ? classes.filter(c => c.date === toDateStr(mobileSelectedDate) && !c.is_booking).length
              : tab === "PENDING"
                ? classes.filter(c => c.date === toDateStr(mobileSelectedDate) && c.is_booking).length
                : classes.filter(c => c.date === toDateStr(mobileSelectedDate) && c.status === "COMPLETED").length
            
            const isSelected = filterTab === tab

            return (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`pb-2 text-xs font-black transition-all relative whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected ? "text-neutral-900 font-black" : "text-neutral-400 font-bold"
                }`}
              >
                <span>{label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isSelected ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"}`}>
                  {count}
                </span>
                {isSelected && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Daily Timeline without empty gaps */}
        <div className="space-y-4 relative pl-4 pb-36">
          {filteredClassesForDay.length > 0 && (
            <div className="absolute left-[34px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-neutral-200 pointer-events-none" />
          )}

          {filteredClassesForDay.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-neutral-100 p-10 text-center shadow-sm">
              <span className="text-3xl block mb-2">📅</span>
              <p className="text-sm font-black text-neutral-900">Sin sesiones programadas</p>
              <p className="text-xs text-neutral-400 font-medium mt-1">Presiona el botón flotante de abajo para agendar una clase.</p>
              
              <button
                onClick={() => {
                  setSelectedSlot({ date: toDateStr(mobileSelectedDate), hour: 10 })
                  setQuickForm({
                    student_id: "",
                    start_time: "10:00",
                    end_time: "11:00",
                    modalidad: "online",
                  })
                  setShowModal(true)
                }}
                className="mt-4 px-6 py-2.5 bg-neutral-900 text-white rounded-full text-xs font-black uppercase tracking-wider hover:bg-violet-600 transition-all shadow-sm"
              >
                + Agendar Sesión
              </button>
            </div>
          ) : (
            filteredClassesForDay.map((cls) => {
              let cardBg = "bg-violet-50/90 border-violet-100 hover:border-violet-200 text-violet-900 animate-in fade-in zoom-in duration-200"
              let bulletColor = "bg-violet-500"
              if (cls.status === "COMPLETED") {
                cardBg = "bg-emerald-50/90 border-emerald-100 hover:border-emerald-200 text-emerald-900 animate-in fade-in zoom-in duration-200"
                bulletColor = "bg-emerald-500"
              } else if (cls.is_booking) {
                cardBg = "bg-amber-50/90 border-amber-100 hover:border-amber-200 text-amber-900 border-dashed animate-in fade-in zoom-in duration-200"
                bulletColor = "bg-amber-500"
              } else if (cls.is_trial) {
                cardBg = "bg-orange-50/90 border-orange-100 hover:border-orange-200 text-orange-900 animate-in fade-in zoom-in duration-200"
                bulletColor = "bg-orange-500"
              }

              return (
                <div key={cls.id} className="flex gap-4 items-start relative group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex flex-col items-center w-10 flex-shrink-0 pt-3">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tight">{cls.start_time.split(":")[0]} Hr</span>
                    <div className={`w-3.5 h-3.5 rounded-full ${bulletColor} border-4 border-white shadow-sm mt-1 z-10`} />
                  </div>

                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <Link
                      href={cls.is_booking ? `/dashboard/crm` : `/dashboard/clases/detalles?id=${cls.id}`}
                      className="flex-1 min-w-0"
                    >
                      <div className={`rounded-[24px] border p-4 shadow-sm transition-all flex items-center justify-between gap-4 cursor-pointer hover:shadow-md ${cardBg}`}>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-black text-sm md:text-base truncate">{cls.student_name}</h4>
                          <p className="text-[10px] font-bold opacity-75 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                            <span>🕒 {formatTime(cls.start_time)} - {formatTime(cls.end_time)}</span>
                            <span>•</span>
                            <span>{cls.modalidad === "online" ? "📹 Virtual" : "🏠 Presencial"}</span>
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-neutral-500 hover:text-neutral-900 font-bold transition-all shadow-sm flex-shrink-0">
                          →
                        </div>
                      </div>
                    </Link>

                    {cls.is_booking && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDeleteBooking(cls.id)
                        }}
                        title="Eliminar Solicitud de Reserva"
                        className="w-12 h-12 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white border border-red-100 flex items-center justify-center transition-all shadow-sm flex-shrink-0 text-sm hover:scale-105 active:scale-95"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Sticky FAB button */}
        <div 
          className="fixed right-6 z-40"
          style={{ bottom: 'calc(env(safe-area-inset-bottom, 16px) + 88px)' }}
        >
          <button
            onClick={() => {
              setSelectedSlot({ date: toDateStr(mobileSelectedDate), hour: new Date().getHours() })
              setQuickForm({
                student_id: "",
                start_time: "10:00",
                end_time: "11:00",
                modalidad: "online",
              })
              setShowModal(true)
            }}
            className="w-14 h-14 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all text-2xl font-black shadow-neutral-900/40"
          >
            +
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="hidden md:grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-violet-600 uppercase tracking-widest">Esta Semana</p>
          <p className="text-3xl font-black text-violet-700 mt-1">{classes.length}</p>
          <p className="text-xs text-violet-500 mt-1">clases programadas</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Completadas</p>
          <p className="text-3xl font-black text-emerald-700 mt-1">{classes.filter(c => c.status === "COMPLETED").length}</p>
          <p className="text-xs text-emerald-500 mt-1">esta semana</p>
        </div>
        <div className="bg-gradient-to-br from-sky-500/10 to-sky-500/5 border border-sky-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-sky-600 uppercase tracking-widest">Alumnos Únicos</p>
          <p className="text-3xl font-black text-sky-700 mt-1">{new Set(classes.map(c => c.student_name)).size}</p>
          <p className="text-xs text-sky-500 mt-1">esta semana</p>
        </div>
      </div>

      {/* Quick-Add Modal / Bottom Drawer on Mobile */}
      {showModal && selectedSlot && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200" 
          onClick={() => setShowModal(false)}
        >
          <div 
            onClick={e => e.stopPropagation()} 
            className="bg-white w-full md:max-w-md rounded-t-[40px] md:rounded-[32px] p-6 md:p-8 shadow-2xl flex flex-col max-h-[90vh] md:max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom md:slide-in-from-bottom-0 duration-300"
          >
            {/* Grab handle for drawer on mobile */}
            <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-4 md:hidden flex-shrink-0" />
            
            <div className="flex items-center justify-between mb-5 flex-shrink-0">
              <div>
                <h3 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">Crear sesión</h3>
                <p className="text-xs text-neutral-400 font-medium mt-0.5">Asigna una nueva sesión a tu alumno</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Date selection calendar inside modal */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Fecha de la sesión</label>
                <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-neutral-700 capitalize">
                      {new Date(selectedSlot.date + "T12:00").toLocaleDateString("es-CL", { month: "long", year: "numeric" })}
                    </span>
                    <div className="flex gap-1">
                      <button 
                        type="button" 
                        onClick={() => {
                          const d = new Date(selectedSlot.date + "T12:00")
                          d.setDate(d.getDate() - 1)
                          setSelectedSlot(p => p ? { ...p, date: toDateStr(d) } : null)
                        }}
                        className="w-6 h-6 bg-white border border-neutral-200 rounded-lg flex items-center justify-center text-[10px] hover:bg-neutral-50 font-bold"
                      >
                        ←
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          const d = new Date(selectedSlot.date + "T12:00")
                          d.setDate(d.getDate() + 1)
                          setSelectedSlot(p => p ? { ...p, date: toDateStr(d) } : null)
                        }}
                        className="w-6 h-6 bg-white border border-neutral-200 rounded-lg flex items-center justify-center text-[10px] hover:bg-neutral-50 font-bold"
                      >
                        →
                      </button>
                    </div>
                  </div>
                  
                  {/* Visual day grid for current week in modal */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {DAY_NAMES.map(n => <span key={n} className="text-[9px] font-bold text-neutral-400 uppercase">{n.charAt(0)}</span>)}
                    {(() => {
                      const activeDate = new Date(selectedSlot.date + "T12:00")
                      const startOfWeek = new Date(activeDate)
                      startOfWeek.setDate(activeDate.getDate() - activeDate.getDay())
                      
                      return Array.from({ length: 7 }).map((_, idx) => {
                        const d = new Date(startOfWeek)
                        d.setDate(startOfWeek.getDate() + idx)
                        const isSelected = toDateStr(d) === selectedSlot.date
                        const isToday = toDateStr(d) === today
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedSlot(p => p ? { ...p, date: toDateStr(d) } : null)}
                            className={`aspect-square rounded-xl text-xs font-black flex flex-col items-center justify-center transition-all ${
                              isSelected 
                                ? "bg-neutral-900 text-white shadow-sm" 
                                : "hover:bg-neutral-200/50 text-neutral-700"
                            }`}
                          >
                            <span>{d.getDate()}</span>
                            {isToday && !isSelected && <div className="w-1 h-1 bg-violet-600 rounded-full mt-0.5" />}
                          </button>
                        )
                      })
                    })()}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Alumno</label>
                <select
                  value={quickForm.student_id}
                  onChange={e => setQuickForm(p => ({ ...p, student_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-violet-400 text-sm font-bold text-neutral-700 appearance-none bg-no-repeat bg-[right_1rem_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundSize: '1.25rem' }}
                >
                  <option value="">Sin asignar</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Inicio</label>
                  <input type="time" value={quickForm.start_time} onChange={e => setQuickForm(p => ({ ...p, start_time: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-violet-400 text-sm font-bold text-neutral-700" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2 ml-1">Fin</label>
                  <input type="time" value={quickForm.end_time} onChange={e => setQuickForm(p => ({ ...p, end_time: e.target.value }))}
                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl outline-none focus:border-violet-400 text-sm font-bold text-neutral-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1.5 bg-neutral-100 rounded-2xl">
                {(["online", "presencial"] as const).map(m => (
                  <button key={m} type="button" onClick={() => setQuickForm(p => ({ ...p, modalidad: m }))}
                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${quickForm.modalidad === m ? "bg-white text-violet-600 shadow-sm" : "text-neutral-400"}`}>
                    {m === "online" ? "📹 Virtual" : "🏠 Presencial"}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-black uppercase tracking-wider transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleQuickCreate} 
                  disabled={saving} 
                  className="flex-1 py-3.5 bg-neutral-900 hover:bg-violet-600 text-white rounded-full text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50 shadow-md shadow-neutral-900/10"
                >
                  {saving ? "Creando..." : "Agendar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Availability Settings Modal */}
      {showAvailModal && profile?.teacherProfileId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] p-10 w-full max-w-4xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowAvailModal(false)}
              className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center bg-neutral-100 rounded-full hover:bg-neutral-200 transition-colors text-neutral-500 font-bold"
            >
              ✕
            </button>
            <AvailabilitySettings teacherId={profile.teacherProfileId} />
          </div>
        </div>
      )}
    </div>
  )
}
