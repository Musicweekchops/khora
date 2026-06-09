"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatTime } from "@/lib/utils"
import { checkTeacherConflict } from "@/lib/availability"
import { toast } from "sonner"

interface CalendarClass {
  id: string
  date: string
  start_time: string
  end_time: string
  status: string
  modalidad: string
  student_name: string
  is_booking?: boolean
  is_recurring?: boolean
  is_trial?: boolean
}

interface TeacherOption {
  id: string
  name: string
}

interface Props {
  academyId: string
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

export default function AcademyCalendar({ academyId }: Props) {
  const [teachers, setTeachers] = useState<TeacherOption[]>([])
  const [selectedTeacherId, setSelectedTeacherId] = useState("")

  const [classes, setClasses] = useState<CalendarClass[]>([])
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()))
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null)
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTab, setFilterTab] = useState<"ALL" | "PENDING">("ALL")

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

  useEffect(() => {
    loadTeachers()
  }, [])

  useEffect(() => {
    if (selectedTeacherId) {
      loadClasses()
      loadStudents()
    } else {
      setClasses([])
      setStudents([])
    }
  }, [selectedTeacherId, weekStart])

  async function loadTeachers() {
    try {
      const { data: at, error } = await supabase
        .from("AcademyTeacher")
        .select(`
          TeacherProfile (
            id,
            User ( name )
          )
        `)
        .eq("academy_id", academyId)
        .eq("status", "ACTIVE")

      if (error) throw error

      const list: TeacherOption[] = (at ?? []).map((row: any) => {
        const tp = row.TeacherProfile
        const u = Array.isArray(tp?.User) ? tp.User[0] : tp?.User
        return {
          id: tp?.id ?? "",
          name: u?.name ?? "—",
        }
      })
      setTeachers(list)
      if (list.length > 0) {
        setSelectedTeacherId(list[0].id)
      }
    } catch (err) {
      console.error("Error loading teachers for calendar:", err)
    }
  }

  async function loadClasses() {
    if (!selectedTeacherId) return
    setLoading(true)
    try {
      const start = toDateStr(weekDays[0])
      const end = toDateStr(weekDays[6])

      // Load actual classes
      const { data: classData, error: classErr } = await supabase
        .from("Class")
        .select("id, date, start_time, end_time, status, modalidad, is_recurring, booking_id, StudentProfile ( status, User ( name ) )")
        .eq("teacher_id", selectedTeacherId)
        .gte("date", start)
        .lte("date", end)
        .neq("status", "CANCELLED")
        .order("start_time")

      if (classErr) throw classErr

      // Load pending bookings
      const { data: bookingData, error: bookErr } = await supabase
        .from("Booking")
        .select("id, date, start_time, end_time, status, name")
        .eq("teacher_id", selectedTeacherId)
        .eq("status", "PENDING")
        .gte("date", start)
        .lte("date", end)

      if (bookErr) throw bookErr

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
      console.error("Error loading calendar classes:", err)
    } finally {
      setLoading(false)
    }
  }

  async function loadStudents() {
    if (!selectedTeacherId) return
    const { data } = await supabase
      .from("StudentProfile")
      .select("id, User ( name )")
      .eq("teacher_id", selectedTeacherId)

    if (data) setStudents(data.map((s: any) => ({ id: s.id, name: s.User?.name ?? "—" })))
  }

  function prevWeek() { setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d }) }
  function nextWeek() { setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d }) }
  function goToday() { setWeekStart(getMonday(new Date())) }

  function handleSlotClick(date: Date, hour: number) {
    if (!selectedTeacherId) return
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
    if (!selectedSlot || !selectedTeacherId) return
    setSaving(true)

    // Validar traslape
    const hasConflict = await checkTeacherConflict(
      selectedTeacherId,
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
      teacher_id: selectedTeacherId,
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

  return (
    <div className="space-y-6">
      {/* Selector de Profesor & Navegación */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">Profesor:</label>
          <select
            value={selectedTeacherId}
            onChange={e => setSelectedTeacherId(e.target.value)}
            className="px-3 py-2 border border-neutral-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
          >
            {teachers.length === 0 && <option value="">Sin profesores activos</option>}
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors">
            Hoy
          </button>
          <div className="flex items-center gap-1">
            <button onClick={prevWeek} className="w-10 h-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors font-bold">
              ←
            </button>
            <button onClick={nextWeek} className="w-10 h-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors font-bold">
              →
            </button>
          </div>
          <span className="text-sm font-bold text-neutral-500 capitalize ml-2">{monthYear}</span>
        </div>
      </div>

      {/* Grid de Horarios */}
      {!selectedTeacherId ? (
        <div className="bg-white border border-neutral-100 rounded-2xl p-16 text-center shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Selecciona o añade un profesor activo para ver su agenda.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
          {/* Day Headers */}
          <div className="grid grid-cols-8 border-b border-neutral-100 bg-neutral-50/50">
            <div className="p-3 text-center text-xs font-bold text-neutral-400 uppercase">Hora</div>
            {weekDays.map((day, i) => {
              const isToday = toDateStr(day) === today
              return (
                <div key={i} className={`p-3 text-center border-l border-neutral-100 ${isToday ? "bg-emerald-50/30" : ""}`}>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{DAY_NAMES[day.getDay()]}</p>
                  <p className={`text-lg font-bold mt-0.5 ${isToday ? "text-emerald-600" : "text-neutral-900"}`}>{day.getDate()}</p>
                </div>
              )
            })}
          </div>

          {/* Time Grid */}
          <div className="max-h-[600px] overflow-y-auto scrollbar-thin">
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <span className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
              </div>
            ) : (
              HOURS.map(hour => (
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
                        className={`border-l border-neutral-50 relative cursor-pointer hover:bg-emerald-50/20 transition-colors group ${
                          isToday ? "bg-emerald-50/10" : ""
                        }`}
                      >
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center text-emerald-300 font-bold text-xl pb-2">+</div>

                        {slotClasses.map(cls => {
                          const startMins = parseInt(cls.start_time.split(":")[1] || "0")
                          const startHr = parseInt(cls.start_time.split(":")[0])
                          const endHr = parseInt(cls.end_time.split(":")[0])
                          const endMins = parseInt(cls.end_time.split(":")[1] || "0")
                          const durationMins = (endHr * 60 + endMins) - (startHr * 60 + startMins)
                          const heightPx = Math.max(durationMins, 25)

                          return (
                            <div
                              key={cls.id}
                              className="absolute z-10 block"
                              style={{
                                top: `${startMins}px`,
                                height: `${heightPx}px`,
                                left: '2px',
                                right: '2px'
                              }}
                              onClick={e => e.stopPropagation()}
                            >
                              <Link
                                href={cls.is_booking ? "#" : `/dashboard/clases/detalles?id=${cls.id}`}
                                className="block w-full h-full"
                              >
                                <div
                                  className={`h-full rounded-lg p-1.5 text-xs hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col justify-between border ${
                                    cls.status === "COMPLETED"
                                      ? "bg-emerald-50 border-emerald-200 border-l-4 border-l-emerald-500 text-emerald-700"
                                      : cls.is_booking
                                        ? "bg-amber-50 border-amber-200 border-l-4 border-l-amber-500 text-amber-700 border-dashed"
                                        : cls.is_trial
                                          ? "bg-orange-50 border-orange-200 border-l-4 border-l-orange-500 text-orange-700"
                                          : "bg-emerald-50/60 border-emerald-100 border-l-4 border-l-emerald-400 text-emerald-800"
                                  }`}
                                >
                                  <div className="flex items-start justify-between leading-tight font-semibold truncate">
                                    <span>{cls.student_name}</span>
                                    {cls.is_recurring && <span className="text-[9px] opacity-70">↻</span>}
                                  </div>
                                  <p className="opacity-75 text-[9px] font-medium mt-auto">{formatTime(cls.start_time)} - {formatTime(cls.end_time)}</p>
                                </div>
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Quick-Add Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/25 backdrop-blur-sm z-[80] flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-neutral-900">Crear Clase</h3>
                <p className="text-xs text-neutral-400 mt-0.5">{selectedSlot.date} a las {selectedSlot.hour}:00</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-7 h-7 rounded-full bg-neutral-100 flex items-center justify-center text-xs text-neutral-500">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Alumno</label>
                <select
                  value={quickForm.student_id}
                  onChange={e => setQuickForm(p => ({ ...p, student_id: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 bg-white"
                >
                  <option value="">Sin asignar</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Inicio</label>
                  <input
                    type="time" value={quickForm.start_time} onChange={e => setQuickForm(p => ({ ...p, start_time: e.target.value }))}
                    className="w-full text-sm px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Fin</label>
                  <input
                    type="time" value={quickForm.end_time} onChange={e => setQuickForm(p => ({ ...p, end_time: e.target.value }))}
                    className="w-full text-sm px-3 py-2 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 uppercase tracking-wide mb-1.5">Modalidad</label>
                <select
                  value={quickForm.modalidad} onChange={e => setQuickForm(p => ({ ...p, modalidad: e.target.value }))}
                  className="w-full text-sm px-3 py-2.5 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-white"
                >
                  <option value="online">📹 Virtual / Online</option>
                  <option value="presencial">🏠 Presencial</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-neutral-100 text-neutral-600 rounded-xl hover:bg-neutral-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleQuickCreate} disabled={saving}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {saving ? "Creando..." : "Guardar Clase"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
