'use client'

import { useState } from 'react'
import { AlertTriangle, Calendar, Check, ArrowLeft } from 'lucide-react'

interface Alternative {
  date: Date | string
  dayOfWeek: string
  startTime: string
  endTime: string
}

interface WeekConflict {
  weekNumber: number
  date: Date | string
  available: boolean
  reason: string | null
  isHoliday: boolean
  alternatives: Alternative[]
}

interface MonthlyPlanConflictsProps {
  conflicts: WeekConflict[]
  originalDate: Date
  originalSlot: { startTime: string; endTime: string }
  onResolved: (resolutions: any[]) => void
  onBack: () => void
}

export default function MonthlyPlanConflicts({ 
  conflicts, 
  originalDate, 
  originalSlot, 
  onResolved, 
  onBack 
}: MonthlyPlanConflictsProps) {
  const [resolutions, setResolutions] = useState<Map<number, Alternative>>(new Map())

  const conflictWeeks = conflicts.filter(w => !w.available)
  const allResolved = conflictWeeks.every(week => resolutions.has(week.weekNumber))

  const handleSelectAlternative = (weekNumber: number, alternative: Alternative) => {
    const newResolutions = new Map(resolutions)
    newResolutions.set(weekNumber, alternative)
    setResolutions(newResolutions)
  }

  const handleConfirm = () => {
    const resolutionArray = Array.from(resolutions.entries()).map(([weekNumber, alt]) => ({
      weekNumber,
      date: typeof alt.date === 'string' ? alt.date : alt.date.toISOString(),
      startTime: alt.startTime,
      endTime: alt.endTime
    }))
    onResolved(resolutionArray)
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-6 py-4 text-white">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6" />
          <div>
            <h2 className="text-xl font-bold">Ajusta tu Plan Mensual</h2>
            <p className="text-orange-100 text-sm">Algunas semanas requieren días alternativos</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Resumen 4 semanas - Compacto */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Tus 4 Clases
          </h3>
          
          <div className="space-y-2">
            {conflicts.map((week) => {
              const resolution = resolutions.get(week.weekNumber)
              const displayDate = resolution ? resolution.date : week.date
              const displayTime = resolution ? `${resolution.startTime}` : originalSlot.startTime

              return (
                <div
                  key={week.weekNumber}
                  className={`
                    p-3 rounded-lg border flex items-center justify-between
                    ${week.available ? 'bg-green-50 border-green-300' : ''}
                    ${!week.available && !resolution ? 'bg-orange-50 border-orange-300' : ''}
                    ${resolution ? 'bg-blue-50 border-blue-300' : ''}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center font-bold text-sm">
                      {week.weekNumber}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{formatDate(displayDate)}</div>
                      <div className="text-xs text-gray-600">{displayTime}</div>
                    </div>
                  </div>

                  {week.available ? (
                    <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      OK
                    </span>
                  ) : resolution ? (
                    <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium">
                      Alternativo
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-orange-600 text-white rounded text-xs font-medium">
                      {week.isHoliday ? 'Feriado' : 'Ocupado'}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Selección alternativas - Compacto */}
        {conflictWeeks.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 text-sm text-gray-700">Selecciona Días Alternativos</h3>

            {conflictWeeks.map((week) => (
              <div key={week.weekNumber} className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">Semana {week.weekNumber}</span>
                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                      {week.reason || 'No disponible'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Original: {formatDate(week.date)} • {originalSlot.startTime}
                  </div>
                </div>

                {week.alternatives.length > 0 ? (
                  <div className="space-y-2">
                    {week.alternatives.map((alt, index) => {
                      const isSelected = resolutions.get(week.weekNumber) === alt
                      const altDate = typeof alt.date === 'string' ? new Date(alt.date) : alt.date
                      
                      return (
                        <button
                          key={index}
                          onClick={() => handleSelectAlternative(week.weekNumber, alt)}
                          className={`
                            w-full p-3 rounded-lg border text-left transition-all
                            ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
                          `}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`
                                w-5 h-5 rounded-full border-2 flex items-center justify-center
                                ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}
                              `}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{alt.dayOfWeek} {altDate.getDate()}</div>
                                <div className="text-xs text-gray-600">{alt.startTime}</div>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    No hay alternativas. Contáctanos por WhatsApp.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Botones */}
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2.5 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cambiar Horario
          </button>
          <button
            onClick={handleConfirm}
            disabled={!allResolved}
            className="flex-1 px-6 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {allResolved ? 'Confirmar y Agendar' : 'Selecciona alternativas'}
          </button>
        </div>
      </div>
    </div>
  )
}
