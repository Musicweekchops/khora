'use client'

import { useState } from 'react'
import { ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react'
import MonthlyPlanConflicts from './MonthlyPlanConflicts'

interface ClassType {
  id: string
  name: string
  description: string
  icon: string
  price: number
  currency: string
  duration: number
}

interface BookingFormProps {
  classType: ClassType
  date: Date
  slot: { startTime: string; endTime: string }
  monthlyPricing?: any
  onBack: () => void
  onComplete: (bookingData: any) => void
}

export default function BookingForm({ classType, date, slot, monthlyPricing, onBack, onComplete }: BookingFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [showingConflicts, setShowingConflicts] = useState(false)
  const [monthlyConflicts, setMonthlyConflicts] = useState<any[]>([])
  const [conflictResolutions, setConflictResolutions] = useState<any[]>([])

  const isMonthlyPlan = classType.name.toLowerCase().includes('mensual')
  const isTrial = classType.name.toLowerCase().includes('prueba')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isTrial) {
      const eligibilityCheck = await fetch('/api/public/validate-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, phone, classTypeId: classType.id })
      }).then(res => res.json())

      if (!eligibilityCheck.allowed) {
        setError(eligibilityCheck.reason)
        return
      }
    }

    // Para plan mensual, crear directamente
    // Ya validamos disponibilidad en el calendario
    await createBooking()
  }

  const createBooking = async () => {
    setLoading(true)
    setError('')

    try {
      // Formato local sin conversión UTC
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`

      const response = await fetch('/api/public/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, email, phone, message,
          classTypeId: classType.id,
          date: dateStr,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isMonthlyPlan,
          conflictResolutions,
          monthlyPricing // Enviar pricing calculado
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al crear la reserva')
      onComplete(data.booking)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleConflictsResolved = (resolutions: any[]) => {
    setConflictResolutions(resolutions)
    setShowingConflicts(false)
    createBooking()
  }

  const formatDate = (date: Date) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`
  }

  if (showingConflicts && isMonthlyPlan) {
    return (
      <MonthlyPlanConflicts
        conflicts={monthlyConflicts}
        originalDate={date}
        originalSlot={slot}
        onResolved={handleConflictsResolved}
        onBack={() => setShowingConflicts(false)}
      />
    )
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Cambiar horario</span>
          </button>
          <div className="text-right">
            <div className="text-white font-semibold">Paso 2 de 3</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <h1 className="text-2xl font-bold mb-1">Completa tu información</h1>
        <p className="text-gray-600 mb-6 text-sm">Solo nos faltan algunos datos</p>

        {/* Resumen compacto */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500 mb-1">Tipo de Clase</div>
              <div className="font-semibold">{classType.name}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Precio</div>
              <div className="font-semibold">
                ${(monthlyPricing?.pricing?.totalPrice || classType.price).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Fecha
              </div>
              <div className="font-semibold">{formatDate(date)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Hora
              </div>
              <div className="font-semibold">{slot.startTime}</div>
            </div>
          </div>
          {isMonthlyPlan && (
            <div className="mt-3 pt-3 border-t text-sm text-green-600 font-medium">
              + 3 clases más (mismo día y hora cada semana)
            </div>
          )}
        </div>

        {/* Formulario */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@example.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Teléfono (WhatsApp) *</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+56 9 1234 5678"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mensaje (Opcional)</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ej: Es mi primera clase de batería..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verificando...' : (isMonthlyPlan ? 'Agendar 4 Clases' : 'Agendar Clase')}
        </button>
      </form>
    </div>
  )
}
