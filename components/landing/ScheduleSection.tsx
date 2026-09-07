"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { getAvailableSlots } from "@/lib/availability"

interface Slot {
  date: string
  slots: string[]
}

interface ScheduleSectionProps {
  slug: string
}

const DAY_NAMES: Record<string, string> = {
  "0": "Dom", "1": "Lun", "2": "Mar", "3": "Mié", "4": "Jue", "5": "Vie", "6": "Sáb",
}
const MONTH_NAMES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"]

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T12:00")
  const dayName = DAY_NAMES[String(d.getDay())]
  const dayNum = d.getDate()
  const month = MONTH_NAMES[d.getMonth()]
  return { dayName, dayNum, month, full: `${dayName} ${dayNum} ${month}` }
}

function formatTime(t: string) {
  return t.slice(0, 5)
}

export default function ScheduleSection({ slug }: ScheduleSectionProps) {
  const [availability, setAvailability] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
        let teacherQuery = supabase.from("TeacherProfile").select("id")
        if (isUuid) {
          teacherQuery = teacherQuery.or(`slug.eq.${slug},id.eq.${slug}`)
        } else {
          teacherQuery = teacherQuery.eq("slug", slug)
        }
        
        const { data: teacher, error } = await teacherQuery.maybeSingle()
        if (error || !teacher) return

        const teacherId = teacher.id
        const today = new Date()
        const results: { date: string; slots: string[] }[] = []

        for (let i = 0; i < 14; i++) {
          const d = new Date(today)
          d.setDate(today.getDate() + i)
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

          const slots = await getAvailableSlots(dateStr, teacherId, 60)

          if (slots.length > 0) {
            results.push({ date: dateStr, slots })
          }
        }

        if (results.length > 0) {
          setAvailability(results)
          setSelectedDate(results[0].date)
        }
      } catch (err) {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  const currentSlots =
    availability.find((a) => a.date === selectedDate)?.slots ?? []

  const bookingUrl =
    selectedDate && selectedTime
      ? `/agendar?teacher=${slug}&date=${selectedDate}&time=${selectedTime}`
      : `/agendar?teacher=${slug}`

  return (
    <section
      id="horarios"
      className="py-20 px-6"
      style={{ background: "#0c0c10" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-3"
            style={{ color: "#f97316" }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "#22c55e" }}
            />
            Disponibilidad en Tiempo Real
          </div>
          <h2
            className="text-4xl font-black text-white mb-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            ¿Cuándo Quieres tu Clase?
          </h2>
          <p className="text-neutral-400 font-medium">
            Elige un horario libre y reserva tu clase de prueba al instante.
          </p>
        </div>

        {/* Main card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "#141418",
            border: "1px solid rgba(124,58,237,0.2)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.4)",
          }}
        >
          {loading ? (
            <div className="p-10 flex flex-col items-center gap-4">
              <div
                className="w-10 h-10 rounded-full border-4 border-t-transparent animate-spin"
                style={{ borderColor: "rgba(124,58,237,0.3)", borderTopColor: "#7c3aed" }}
              />
              <p className="text-neutral-500 text-sm font-medium">Cargando horarios...</p>
            </div>
          ) : availability.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-4xl mb-3">📅</div>
              <p className="text-neutral-400 font-medium">
                No hay horarios disponibles en los próximos días.
              </p>
              <a
                href={`https://wa.me/56944291538?text=Hola! Quisiera saber sobre horarios disponibles`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-6 py-3 rounded-xl text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #7c3aed, #f97316)" }}
              >
                Consultar por WhatsApp
              </a>
            </div>
          ) : (
            <>
              {/* Day selector */}
              <div
                className="flex gap-2 p-4 overflow-x-auto"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
              >
                {availability.map(({ date }) => {
                  const { dayName, dayNum, month } = formatDate(date)
                  const isSelected = date === selectedDate
                  return (
                    <button
                      key={date}
                      onClick={() => {
                        setSelectedDate(date)
                        setSelectedTime(null)
                      }}
                      className="flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl transition-all font-bold"
                      style={{
                        minWidth: 64,
                        background: isSelected
                          ? "linear-gradient(135deg, #7c3aed, #f97316)"
                          : "rgba(255,255,255,0.04)",
                        border: isSelected
                          ? "1px solid transparent"
                          : "1px solid rgba(255,255,255,0.07)",
                        color: isSelected ? "white" : "#9ca3af",
                        boxShadow: isSelected
                          ? "0 4px 20px rgba(124,58,237,0.3)"
                          : "none",
                      }}
                    >
                      <span className="text-[10px] uppercase tracking-widest opacity-80">
                        {dayName}
                      </span>
                      <span className="text-xl font-black">{dayNum}</span>
                      <span className="text-[10px] opacity-70">{month}</span>
                    </button>
                  )
                })}
              </div>

              {/* Time slots */}
              <div className="p-6">
                {currentSlots.length === 0 ? (
                  <p className="text-neutral-500 text-sm text-center py-4">
                    Sin horarios disponibles este día
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {currentSlots.map((slot) => {
                      const isSelected = slot === selectedTime
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(isSelected ? null : slot)}
                          className="py-3 px-2 rounded-xl text-sm font-black transition-all"
                          style={{
                            background: isSelected
                              ? "linear-gradient(135deg, #7c3aed, #f97316)"
                              : "rgba(249,115,22,0.07)",
                            border: isSelected
                              ? "1px solid transparent"
                              : "1px solid rgba(249,115,22,0.3)",
                            color: isSelected ? "white" : "#fb923c",
                            boxShadow: isSelected
                              ? "0 4px 16px rgba(249,115,22,0.3)"
                              : "none",
                          }}
                        >
                          {formatTime(slot)} ✓
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* CTA */}
              <div
                className="p-6 pt-0 flex flex-col sm:flex-row items-center gap-3"
              >
                <a
                  href={bookingUrl}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-4 px-8 rounded-2xl text-sm font-black uppercase tracking-wider text-white transition-all hover:scale-[1.02] hover:shadow-xl"
                  style={{
                    background:
                      selectedTime
                        ? "linear-gradient(135deg, #7c3aed, #f97316)"
                        : "rgba(255,255,255,0.06)",
                    border: selectedTime
                      ? "none"
                      : "1px solid rgba(255,255,255,0.1)",
                    color: selectedTime ? "white" : "#6b7280",
                    cursor: selectedTime ? "pointer" : "default",
                    boxShadow: selectedTime
                      ? "0 8px 32px rgba(124,58,237,0.35)"
                      : "none",
                    pointerEvents: selectedTime ? "auto" : "none",
                  }}
                >
                  {selectedTime
                    ? `Reservar ${formatDate(selectedDate!).full} · ${formatTime(selectedTime)} →`
                    : "Selecciona un horario para continuar"}
                </a>
                <p className="text-[11px] text-neutral-600 font-medium flex-shrink-0">
                  ⚡ Actualizado en tiempo real
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
