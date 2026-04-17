"use client"

import { useState } from 'react'
import { ArrowLeft, Calendar, Clock, AlertCircle } from 'lucide-react'
import { supabase } from "@/lib/supabase"
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
      setLoading(true)
      try {
        const { data: existingTrial } = await supabase
          .from('Booking')
          .select('id')
          .or(`email.eq.${email},phone.eq.${phone}`)
          .ilike('classTypeId', `%${classType.id}%`) // Nota: simplificación, idealmente validar por nombre
          .in('status', ['CONFIRMED', 'COMPLETED'])
          .maybeSingle()

        if (existingTrial) {
          setError("Ya has tomado una clase de prueba anteriormente.")
          setLoading(false)
          return
        }
      } catch (err) {
        console.error("Error validando elegibilidad:", err)
      } finally {
        setLoading(false)
      }
    }

    await createBooking()
  }

  const createBooking = async () => {
    setLoading(true)
    setError('')

    try {
      const year = date.getFullYear()
      const monthStr = String(date.getMonth() + 1).padStart(2, '0')
      const dayStr = String(date.getDate()).padStart(2, '0')
      const dateStr = `${year}-${monthStr}-${dayStr}`

      if (isMonthlyPlan) {
        // LÓGICA PLAN MENSUAL
        if (!monthlyPricing || !monthlyPricing.classes) {
          throw new Error('Datos de precios mensuales no encontrados')
        }

        const lastDate = new Date(monthlyPricing.classes[monthlyPricing.classes.length - 1].date)
        const expirationDate = new Date(lastDate)
        expirationDate.setMonth(expirationDate.getMonth() + 2)

        const firstDate = new Date(monthlyPricing.classes[0].date)

        const { data: parentBooking, error: bError } = await supabase
          .from('Booking')
          .insert({
            name, email, phone,
            message: message || '',
            classTypeId: classType.id,
            date: firstDate.toISOString(),
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: 'CONFIRMED',
            isParent: true,
            isMonthlyPlan: true,
            totalPrice: monthlyPricing.pricing.totalPrice
          })
          .select()
          .single()

        if (bError) throw bError

        const classRecords = monthlyPricing.classes.map((cd: any, index: number) => ({
          bookingId: parentBooking.id,
          date: cd.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          duration: classType.duration,
          status: 'SCHEDULED',
          needsRenewalReminder: index === monthlyPricing.classes.length - 2,
          expiresAt: expirationDate.toISOString()
        }))

        const { data: createdClasses, error: cError } = await supabase
          .from('Class')
          .insert(classRecords)
          .select()

        if (cError) throw cError

        onComplete({
          ...parentBooking,
          classes: createdClasses
        })

      } else {
        // LÓGICA CLASE ÚNICA
        const { data: booking, error: bError } = await supabase
          .from('Booking')
          .insert({
            name, email, phone,
            message: message || '',
            classTypeId: classType.id,
            date: date.toISOString(),
            startTime: slot.startTime,
            endTime: slot.endTime,
            status: 'CONFIRMED',
            totalPrice: classType.price
          })
          .select()
          .single()

        if (bError) throw bError

        const { data: classRecord, error: cError } = await supabase
          .from('Class')
          .insert({
            bookingId: booking.id,
            date: dateStr,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: classType.duration,
            status: 'SCHEDULED'
          })
          .select()
          .single()

        if (cError) throw cError

        onComplete({
          ...booking,
          classes: [classRecord]
        })
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
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
