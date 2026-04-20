"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { formatTime } from "@/lib/utils"

interface CalendarClass {
  id: string; date: string; start_time: string; end_time: string
  status: string; modalidad: string; student_name: string
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
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null)
  const [students, setStudents] = useState<{ id: string; name: string }[]>([])

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
    if (profile?.teacherProfileId) {
      loadClasses()
      loadStudents()
    }
  }, [profile?.teacherProfileId, weekStart])

  async function loadClasses() {
    setLoading(true)
    const start = toDateStr(weekDays[0])
    const end = toDateStr(weekDays[6])

    const { data } = await supabase
      .from("Class")
      .select("id, date, start_time, end_time, status, modalidad, StudentProfile ( User ( name ) )")
      .eq("teacher_id", profile!.teacherProfileId!)
      .gte("date", start)
      .lte("date", end)
      .neq("status", "CANCELLED")
      .order("start_time")

    if (data) {
      setClasses(data.map((c: any) => ({
        id: c.id, date: c.date, start_time: c.start_time, end_time: c.end_time,
        status: c.status, modalidad: c.modalidad,
        student_name: c.StudentProfile?.User?.name ?? "Sin asignar",
      })))
    }
    setLoading(false)
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

    await supabase.from("Class").insert({
      teacher_id: profile.teacherProfileId,
      student_id: quickForm.student_id || null,
      date: selectedSlot.date,
      start_time: quickForm.start_time,
      end_time: quickForm.end_time,
      modalidad: quickForm.modalidad,
      status: "SCHEDULED",
    })

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Agenda</h1>
          <p className="text-neutral-500 font-medium mt-1 capitalize">{monthYear}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToday} className="px-4 py-2 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors">
            Hoy
          </button>
          <button onClick={prevWeek} className="w-10 h-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors font-bold">
            ←
          </button>
          <button onClick={nextWeek} className="w-10 h-10 bg-white border border-neutral-200 rounded-xl flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors font-bold">
            →
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-sm">
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
            <div key={hour} className="grid grid-cols-8 border-b border-neutral-50 min-h-[60px]">
              {/* Hour label */}
              <div className="p-2 text-right pr-4 flex items-start justify-end">
                <span className="text-xs font-bold text-neutral-300">{String(hour).padStart(2, "0")}:00</span>
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
                    className={`border-l border-neutral-50 p-1 relative cursor-pointer hover:bg-violet-50/30 transition-colors ${
                      isToday ? "bg-violet-50/20" : ""
                    }`}
                  >
                    {slotClasses.map(cls => (
                      <div
                        key={cls.id}
                        className={`rounded-lg p-2 text-xs mb-1 border-l-3 ${
                          cls.status === "COMPLETED"
                            ? "bg-emerald-50 border-l-emerald-400 text-emerald-700"
                            : "bg-violet-50 border-l-violet-400 text-violet-700"
                        }`}
                        style={{ borderLeftWidth: "3px" }}
                      >
                        <p className="font-black truncate">{cls.student_name}</p>
                        <p className="opacity-60">{formatTime(cls.start_time)}</p>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
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

      {/* Quick-Add Modal */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-neutral-900 mb-1">Nueva Clase</h3>
            <p className="text-sm text-neutral-500 mb-6">
              {new Date(selectedSlot.date + "T12:00").toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Alumno</label>
                <select
                  value={quickForm.student_id}
                  onChange={e => setQuickForm(p => ({ ...p, student_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:border-violet-400 text-sm font-bold"
                >
                  <option value="">Sin asignar</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Inicio</label>
                  <input type="time" value={quickForm.start_time} onChange={e => setQuickForm(p => ({ ...p, start_time: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:border-violet-400 text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-400 uppercase tracking-widest mb-2">Fin</label>
                  <input type="time" value={quickForm.end_time} onChange={e => setQuickForm(p => ({ ...p, end_time: e.target.value }))}
                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl outline-none focus:border-violet-400 text-sm font-bold" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 rounded-xl">
                {(["online", "presencial"] as const).map(m => (
                  <button key={m} type="button" onClick={() => setQuickForm(p => ({ ...p, modalidad: m }))}
                    className={`py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${quickForm.modalidad === m ? "bg-white text-violet-600 shadow-sm" : "text-neutral-400"}`}>
                    {m === "online" ? "📹 Virtual" : "🏠 Presencial"}
                  </button>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-neutral-100 text-neutral-600 rounded-xl text-sm font-bold">Cancelar</button>
                <button onClick={handleQuickCreate} disabled={saving} className="flex-1 py-3 bg-neutral-900 text-white rounded-xl text-sm font-bold hover:bg-violet-600 transition-colors disabled:opacity-50">
                  {saving ? "Creando..." : "✓ Crear"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
