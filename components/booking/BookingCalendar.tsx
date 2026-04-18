"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, ArrowLeft } from 'lucide-react'
import { supabase } from "@/lib/supabase"

interface Slot {
  startTime: string
  endTime: string
  duration: number
}

interface AvailabilityResponse {
  available: boolean
  date: string
  dayOfWeek: string
  slots: Slot[]
  totalSlots: number
  availableSlots: number
  reason?: string
}

interface ClassType {
  id: string
  name: string
  description: string
  icon: string
  price: number
  currency: string
  duration: number
}

interface BookingCalendarProps {
  classType: ClassType
  onDateTimeSelected: (date: Date, slot: { startTime: string; endTime: string }, monthlyPricing?: any) => void
  onBack: () => void
}

export default function BookingCalendar({ classType, onDateTimeSelected, onBack }: BookingCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState<Date[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [monthlyPricing, setMonthlyPricing] = useState<any>(null)

  const isMonthlyPlan = classType.name.toLowerCase().includes('mensual')

  useEffect(() => {
    const today = new Date()
    const week = generateWeek(today)
    setCurrentWeek(week)
  }, [])

  useEffect(() => {
    if (selectedDate) {
      loadAvailabilityAndPricing()
    }
  }, [selectedDate, isMonthlyPlan])

  const loadAvailabilityAndPricing = async () => {
    if (!selectedDate) return
    setLoading(true)

    try {
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      const dayOfWeek = selectedDate.getDay()

      // 1. Obtener disponibilidad del profesor
      const { data: teacher } = await supabase
        .from('User')
        .select('id, "TeacherProfile"(id)')
        .eq('role', 'TEACHER')
        .limit(1)
        .single()

      if (!teacher || !teacher.TeacherProfile) throw new Error('Profesor no encontrado')
      const teacherId = (teacher.TeacherProfile as any)[0]?.id || (teacher.TeacherProfile as any).id

      const { data: availConfig } = await supabase
        .from('Availability')
        .select('*')
        .match({ teacherId, dayOfWeek, isActive: true })
        .single()

      if (!availConfig) {
        setAvailability({ available: false, date: dateStr, dayOfWeek: getDayNameFull(dayOfWeek), slots: [], totalSlots: 0, availableSlots: 0, reason: 'No hay disponibilidad configurada' })
        setLoading(false)
        return
      }

      // 2. Verificar excepciones
      const { data: exception } = await supabase
        .from('AvailabilityException')
        .select('*')
        .match({ teacherId, date: dateStr })
        .maybeSingle()

      if (exception) {
        setAvailability({ available: false, date: dateStr, dayOfWeek: getDayNameFull(dayOfWeek), slots: [], totalSlots: 0, availableSlots: 0, reason: exception.reason || 'Fecha bloqueada' })
        setLoading(false)
        return
      }

      // 3. Generar y filtrar slots
      const slots = generateTimeSlotsInternal(availConfig.startTime, availConfig.endTime, classType.duration || availConfig.slotDuration)
      
      const { data: bookedClasses } = await supabase
        .from('Class')
        .select('startTime, endTime')
        .eq('date', dateStr)
        .not('status', 'eq', 'CANCELLED')

      const { data: existingBookings } = await supabase
        .from('Booking')
        .select('startTime, endTime')
        .eq('date', dateStr)
        .in('status', ['PENDING', 'CONFIRMED'])

      const availableSlots = slots.filter(slot => {
        const isBookedClass = (bookedClasses || []).some(bc => timesOverlap(slot.startTime, slot.endTime, bc.startTime, bc.endTime))
        const isBookedBooking = (existingBookings || []).some(eb => timesOverlap(slot.startTime, slot.endTime, eb.startTime, eb.endTime))
        return !isBookedClass && !isBookedBooking
      })

      setAvailability({
        available: true,
        date: dateStr,
        dayOfWeek: getDayNameFull(dayOfWeek),
        slots: availableSlots,
        totalSlots: slots.length,
        availableSlots: availableSlots.length
      })

      // 4. Calcular precio mensual si aplica
      if (isMonthlyPlan) {
        const pricing = calculateMonthlyPriceInternal(selectedDate, dayOfWeek)
        setMonthlyPricing(pricing)
      }

    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Funciones lógicas internas (portadas de las rutas API)
  const generateTimeSlotsInternal = (startTime: string, endTime: string, duration: number) => {
    const slots = []
    let current = startTime
    const t2m = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }
    const addMins = (t: string, m: number) => {
      const tot = t2m(t) + m
      return `${String(Math.floor(tot/60)).padStart(2,'0')}:${String(tot%60).padStart(2,'0')}`
    }

    while (t2m(current) < t2m(endTime)) {
      const slotEnd = addMins(current, duration)
      if (t2m(slotEnd) <= t2m(endTime)) {
        slots.push({ startTime: current, endTime: slotEnd, duration })
      }
      current = slotEnd
    }
    return slots
  }

  const timesOverlap = (s1: string, e1: string, s2: string, e2: string) => {
    const t2m = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }
    return t2m(s1) < t2m(e2) && t2m(s2) < t2m(e1)
  }

  const calculateMonthlyPriceInternal = (selectedDate: Date, dayOfWeek: number) => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    
    const countOccurrences = (y: number, m: number, dw: number) => {
      let count = 0
      const d = new Date(y, m, 1)
      while (d.getMonth() === m) {
        if (d.getDay() === dw) count++
        d.setDate(d.getDate() + 1)
      }
      return count
    }

    const countRemaining = (sd: Date, dw: number) => {
      let count = 0
      const m = sd.getMonth()
      const d = new Date(sd)
      while (d.getMonth() === m) {
        if (d.getDay() === dw && d >= sd) count++
        d.setDate(d.getDate() + 1)
      }
      return count
    }

    const genDates = (sd: Date, dw: number, tm: number, ty?: number) => {
      const dates: Date[] = []
      const y = ty || sd.getFullYear()
      const d = new Date(sd)
      while (d.getMonth() === tm && d.getFullYear() === y) {
        if (d.getDay() === dw && d >= sd) dates.push(new Date(d))
        d.setDate(d.getDate() + 1)
      }
      return dates
    }

    const totalWeeks = countOccurrences(year, month, dayOfWeek)
    const remainingWeeks = countRemaining(selectedDate, dayOfWeek)
    const currentMonthClasses = genDates(selectedDate, dayOfWeek, month)

    if (remainingWeeks <= 1) {
      const nextMonth = month + 1 > 11 ? 0 : month + 1
      const nextYear = month + 1 > 11 ? year + 1 : year
      const firstNext = new Date(nextYear, nextMonth, 1)
      while (firstNext.getDay() !== dayOfWeek) firstNext.setDate(firstNext.getDate() + 1)
      const nextMonthClasses = genDates(firstNext, dayOfWeek, nextMonth, nextYear)

      return {
        pricing: {
          type: 'special',
          totalPrice: 175000,
          currentMonthPrice: 35000,
          nextMonthPrice: 140000,
          breakdown: {
            currentMonth: { classes: currentMonthClasses.length, price: 35000 },
            nextMonth: { classes: nextMonthClasses.length, price: 140000 }
          }
        },
        classes: [...currentMonthClasses, ...nextMonthClasses]
      }
    } else {
      const price = Math.round((140000 * remainingWeeks) / totalWeeks)
      return {
        pricing: {
          type: 'proportional',
          totalPrice: price,
          breakdown: {
            currentMonth: { classes: currentMonthClasses.length, price, calculation: `$140k * (${remainingWeeks}/${totalWeeks})` }
          }
        },
        classes: currentMonthClasses
      }
    }
  }

  if (currentWeek.length === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
    setAvailability(null)
  }

  const handleSlotClick = (slot: Slot) => {
    if (selectedDate) {
      onDateTimeSelected(selectedDate, { startTime: slot.startTime, endTime: slot.endTime }, monthlyPricing)
    }
  }

  const goToPreviousWeek = () => {
    const newWeek = generateWeek(new Date(currentWeek[0].getTime() - 7 * 24 * 60 * 60 * 1000))
    setCurrentWeek(newWeek)
    setSelectedDate(null)
    setAvailability(null)
  }

  const goToNextWeek = () => {
    const newWeek = generateWeek(new Date(currentWeek[0].getTime() + 7 * 24 * 60 * 60 * 1000))
    setCurrentWeek(newWeek)
    setSelectedDate(null)
    setAvailability(null)
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header compacto */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Cambiar tipo</span>
          </button>
          <div className="text-right">
            <div className="text-white font-semibold">{classType.name}</div>
            <div className="text-slate-300 text-sm">${classType.price.toLocaleString()} • {classType.duration} min</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Info Plan Mensual - Compacta */}
        {isMonthlyPlan && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <strong>Plan Mensual:</strong> Se agendarán 4 clases semanales en el mismo día y hora.
              </div>
            </div>
          </div>
        )}

        {/* Calendario Semanal - Compacto */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {getMonthName(currentWeek[0])} {currentWeek[0].getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={goToPreviousWeek}
                className="w-9 h-9 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextWeek}
                className="w-9 h-9 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {currentWeek.map((date, index) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString()
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
              
              return (
                <button
                  key={index}
                  onClick={() => !isPast && handleDateClick(date)}
                  disabled={isPast}
                  className={`
                    p-3 rounded-lg border text-center transition-all
                    ${isPast ? 'opacity-40 cursor-not-allowed bg-gray-50 border-gray-200' : 'hover:border-blue-300 hover:bg-blue-50 cursor-pointer border-gray-200'}
                    ${isSelected ? 'border-blue-600 bg-blue-600 shadow-md' : ''}
                  `}
                >
                  <div className={`text-xs uppercase mb-1 ${isSelected ? 'text-blue-100' : 'opacity-70'}`}>
                    {getDayName(date.getDay()).substring(0, 3)}
                  </div>
                  <div className={`text-xl font-semibold ${isSelected ? 'text-white' : ''}`}>
                    {date.getDate()}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Slots - SIN división mañana/tarde */}
        {selectedDate && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Cargando horarios...</div>
            ) : availability && availability.available ? (
              <div>
                {/* Mostrar precio calculado para Plan Mensual */}
                {isMonthlyPlan && monthlyPricing && (
                  <div className="mb-6 p-4 bg-green-50 border-2 border-green-500 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-2xl text-green-900">
                          ${monthlyPricing.pricing.totalPrice.toLocaleString()} CLP
                        </div>
                        <div className="text-sm text-green-700 mt-1">
                          {monthlyPricing.pricing.type === 'special' ? (
                            <>
                              Incluye: {monthlyPricing.pricing.breakdown.currentMonth.classes} clase de {getMonthName(selectedDate)} 
                              + {monthlyPricing.pricing.breakdown.nextMonth.classes} clases del próximo mes
                            </>
                          ) : (
                            <>
                              {monthlyPricing.pricing.breakdown.currentMonth.classes} clases • {monthlyPricing.pricing.breakdown.currentMonth.calculation}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-green-600 bg-white px-3 py-1 rounded-full font-medium">
                        {monthlyPricing.classes.length} clases
                      </div>
                    </div>
                    {monthlyPricing.pricing.type === 'special' && (
                      <div className="text-xs text-green-700 border-t border-green-200 pt-2">
                        Desglose: ${monthlyPricing.pricing.currentMonthPrice.toLocaleString()} (este mes) 
                        + ${monthlyPricing.pricing.nextMonthPrice.toLocaleString()} (próximo mes)
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-700 mb-4">
                  <Clock className="w-5 h-5" />
                  <h3 className="font-semibold">
                    Horarios Disponibles - {getDayNameFull(selectedDate.getDay())}
                  </h3>
                </div>
                
                <div className="grid grid-cols-6 gap-2">
                  {availability.slots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlotClick(slot)}
                      className="px-3 py-2 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-blue-600 font-medium transition-all text-sm"
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              </div>
            ) : availability && !availability.available ? (
              <div className="text-center py-12 text-gray-500">
                {availability.reason || 'No hay disponibilidad'}
              </div>
            ) : null}
          </div>
        )}

        {!selectedDate && (
          <div className="text-center py-12 text-gray-400">
            Selecciona una fecha del calendario
          </div>
        )}
      </div>
    </div>
  )
}

// Helper functions
function generateWeek(date: Date): Date[] {
  const week: Date[] = []
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(date)
    d.setDate(diff + i)
    week.push(d)
  }
  
  return week
}

function getDayName(day: number): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return days[day]
}

function getDayNameFull(day: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[day]
}

function getMonthName(date: Date): string {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return months[date.getMonth()]
}
