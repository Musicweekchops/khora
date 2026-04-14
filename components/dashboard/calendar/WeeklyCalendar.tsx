'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ClassBlock from './ClassBlock'
import ClassModal from './ClassModal'

interface ClassData {
  id: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  status: string
  studentName: string
  studentEmail?: string
  studentPhone?: string
  studentId?: string
  bookingId?: string
  isPublicBooking: boolean
  isMonthlyPlan: boolean
  classType: string
  classTypeIcon: string
  needsRenewalReminder: boolean
  expiresAt?: Date
}

interface WeeklyCalendarProps {
  initialWeek?: string
}

export default function WeeklyCalendar({ initialWeek }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(initialWeek || getCurrentWeek())
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [showModal, setShowModal] = useState(false)

  // Horarios del día (09:00 - 21:00)
  const timeSlots = generateTimeSlots('09:00', '22:00', 60) // Hasta 22:00 para incluir slot de 21:00
  
  // Días de la semana (Lunes - Sábado)
  const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

  useEffect(() => {
    fetchClasses()
  }, [currentWeek])

  const fetchClasses = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/dashboard/calendar?week=${currentWeek}`)
      const data = await res.json()
      
      if (data.success) {
        setClasses(data.classes.map((c: any) => ({
          ...c,
          date: new Date(c.date)
        })))
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousWeek = () => {
    const [year, week] = currentWeek.split('-W').map(Number)
    const newWeek = week - 1
    
    if (newWeek < 1) {
      setCurrentWeek(`${year - 1}-W52`)
    } else {
      setCurrentWeek(`${year}-W${String(newWeek).padStart(2, '0')}`)
    }
  }

  const handleNextWeek = () => {
    const [year, week] = currentWeek.split('-W').map(Number)
    const newWeek = week + 1
    
    if (newWeek > 52) {
      setCurrentWeek(`${year + 1}-W01`)
    } else {
      setCurrentWeek(`${year}-W${String(newWeek).padStart(2, '0')}`)
    }
  }

  const handleClassClick = (classData: ClassData) => {
    setSelectedClass(classData)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedClass(null)
  }

  const getWeekDates = () => {
    const [year, week] = currentWeek.split('-W').map(Number)
    const firstDayOfWeek = getDateOfISOWeek(week, year)
    
    return Array.from({ length: 6 }, (_, i) => {
      const date = new Date(firstDayOfWeek)
      date.setDate(firstDayOfWeek.getDate() + i)
      return date
    })
  }

  const weekDates = getWeekDates()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">Agenda Semanal</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePreviousWeek}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
                {formatWeekRange(weekDates)}
              </span>
              <button
                onClick={handleNextWeek}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setCurrentWeek(getCurrentWeek())}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="p-12 text-center text-gray-500">
          Cargando calendario...
        </div>
      ) : (
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
          <div className="inline-block min-w-full">
            {/* Grid Container */}
            <div className="grid grid-cols-[80px_repeat(6,1fr)] border-t border-gray-200 relative">
              {/* Time Column Header - STICKY TOP & LEFT */}
              <div className="sticky top-0 left-0 z-30 border-r border-b border-gray-200 bg-gray-50" style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.05)' }} />
              
              {/* Day Headers - STICKY TOP */}
              {weekDays.map((day, index) => {
                const date = weekDates[index]
                const isToday = date.getTime() === today.getTime()
                
                return (
                  <div
                    key={day}
                    className={`sticky top-0 z-20 p-4 border-r border-b border-gray-200 text-center ${
                      isToday ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                    style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
                  >
                    <div className="text-xs text-gray-600 uppercase mb-1">{day}</div>
                    <div className={`text-xl font-semibold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                      {date.getDate()}
                    </div>
                  </div>
                )
              })}

              {/* Time Slots */}
              {timeSlots.map(time => (
                <TimeSlotRow
                  key={time}
                  time={time}
                  weekDates={weekDates}
                  classes={classes}
                  onClassClick={handleClassClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Class Modal */}
      {showModal && selectedClass && (
        <ClassModal
          classData={selectedClass}
          onClose={handleCloseModal}
          onUpdate={fetchClasses}
        />
      )}
    </div>
  )
}

// Time Slot Row Component
function TimeSlotRow({
  time,
  weekDates,
  classes,
  onClassClick
}: {
  time: string
  weekDates: Date[]
  classes: ClassData[]
  onClassClick: (cls: ClassData) => void
}) {
  return (
    <>
      {/* Time Label - STICKY LEFT */}
      <div className="sticky left-0 z-10 p-4 border-r border-b border-gray-100 text-right text-sm text-gray-600 bg-gray-50">
        {time}
      </div>
      
      {/* Day Columns */}
      {weekDates.map((date, dayIndex) => {
        // Find classes for this day and time
        const dayClasses = classes.filter(cls => {
          const classDate = new Date(cls.date)
          classDate.setHours(0, 0, 0, 0)
          
          const targetDate = new Date(date)
          targetDate.setHours(0, 0, 0, 0)
          
          return classDate.getTime() === targetDate.getTime() && cls.startTime === time
        })
        
        return (
          <div
            key={`${date.toISOString()}-${time}`}
            className="relative border-r border-b border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
            style={{ minHeight: '80px' }}
          >
            {dayClasses.map(cls => (
              <ClassBlock
                key={cls.id}
                classData={cls}
                onClick={() => onClassClick(cls)}
              />
            ))}
          </div>
        )
      })}
    </>
  )
}

// Helper Functions
function getCurrentWeek(): string {
  const now = new Date()
  const year = now.getFullYear()
  const week = getISOWeek(now)
  return `${year}-W${String(week).padStart(2, '0')}`
}

function getISOWeek(date: Date): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + 4 - (d.getDay() || 7))
  const yearStart = new Date(d.getFullYear(), 0, 1)
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getDateOfISOWeek(week: number, year: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay()
  const ISOweekStart = new Date(simple)
  
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  }
  
  return ISOweekStart
}

function generateTimeSlots(start: string, end: string, intervalMinutes: number): string[] {
  const slots: string[] = []
  const [startHour, startMin] = start.split(':').map(Number)
  const [endHour, endMin] = end.split(':').map(Number)
  
  let currentHour = startHour
  let currentMin = startMin
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    slots.push(`${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`)
    
    currentMin += intervalMinutes
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60)
      currentMin = currentMin % 60
    }
  }
  
  return slots
}

function formatWeekRange(dates: Date[]): string {
  const first = dates[0]
  const last = dates[dates.length - 1]
  
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} - ${last.getDate()} ${months[first.getMonth()]} ${first.getFullYear()}`
  } else {
    return `${first.getDate()} ${months[first.getMonth()]} - ${last.getDate()} ${months[last.getMonth()]} ${first.getFullYear()}`
  }
}
