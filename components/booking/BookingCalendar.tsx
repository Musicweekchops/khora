'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, ArrowLeft } from 'lucide-react'

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
      setLoading(true)
      // Formato local sin conversión UTC
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      // Cargar disponibilidad
      fetch(`/api/public/availability?date=${dateStr}`)
        .then(res => res.json())
        .then(data => {
          setAvailability(data)
          
          // Si es Plan Mensual, calcular precio dinámico
          if (isMonthlyPlan) {
            return fetch('/api/public/calculate-monthly-price', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                date: dateStr,
                dayOfWeek: selectedDate.getDay()
              })
            })
          }
          return null
        })
        .then(res => res ? res.json() : null)
        .then(pricingData => {
          if (pricingData) {
            setMonthlyPricing(pricingData)
          }
          setLoading(false)
        })
        .catch(err => {
          console.error('Error loading data:', err)
          setLoading(false)
        })
    }
  }, [selectedDate, isMonthlyPlan])

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
