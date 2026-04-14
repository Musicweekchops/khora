'use client'

import { X, User, Mail, Phone, Calendar, Clock, DollarSign, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'

interface ClassModalProps {
  classData: {
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
  onClose: () => void
  onUpdate: () => void
}

export default function ClassModal({ classData, onClose, onUpdate }: ClassModalProps) {
  const [loading, setLoading] = useState(false)

  const {
    date,
    startTime,
    endTime,
    studentName,
    studentEmail,
    studentPhone,
    isPublicBooking,
    isMonthlyPlan,
    classType,
    classTypeIcon,
    needsRenewalReminder,
    bookingId,
    studentId
  } = classData

  const formatDate = (date: Date) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
  }

  const handleApproveBooking = async () => {
    if (!bookingId) return
    
    setLoading(true)
    try {
      // TODO: Implementar API de aprobación
      alert('Función de aprobación próximamente')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error approving booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContactWhatsApp = () => {
    if (studentPhone) {
      const phone = studentPhone.replace(/\D/g, '')
      window.open(`https://wa.me/${phone}`, '_blank')
    }
  }

  const handleContactEmail = () => {
    if (studentEmail) {
      window.location.href = `mailto:${studentEmail}`
    }
  }

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-neutral-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                {classTypeIcon}
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900 leading-tight">
                  {studentName}
                </h2>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">{classType}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-neutral-900"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning: Public Booking */}
          {isPublicBooking && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
              <div>
                <p className="font-bold text-destructive text-sm">Booking Público Pendiente</p>
                <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
                  Este booking fue creado desde la página pública y aún no ha sido aprobado.
                  Requiere revisión manual antes de asignar al alumno.
                </p>
              </div>
            </div>
          )}

          {/* Renewal Reminder */}
          {needsRenewalReminder && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900 text-sm">Alerta de Renovación</p>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  Esta es la penúltima clase del plan actual. Es el momento ideal para coordinar el próximo pago.
                </p>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <Calendar className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase">Fecha</p>
                <p className="text-sm font-bold text-neutral-900">{formatDate(date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-xl border border-neutral-100">
              <Clock className="w-5 h-5 text-neutral-400" />
              <div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase">Horario</p>
                <p className="text-sm font-bold text-neutral-900">{startTime} - {endTime}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Contacto</h3>
            
            <div className="grid grid-cols-1 gap-2">
              {studentEmail && (
                <div 
                  onClick={handleContactEmail}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100 cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <Mail className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-900 font-medium">{studentEmail}</span>
                </div>
              )}
              
              {studentPhone && (
                <div 
                  onClick={handleContactWhatsApp}
                  className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-100 cursor-pointer hover:bg-neutral-100 transition-colors"
                >
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-900 font-medium">{studentPhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-neutral-50 border-t border-neutral-100 space-y-3">
          {/* Public Booking Actions */}
          {isPublicBooking && (
            <div className="flex gap-3">
              <button
                onClick={handleApproveBooking}
                disabled={loading}
                className="flex-1 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all font-bold text-sm shadow-sm"
              >
                ✓ Aprobar
              </button>
              
              <button
                disabled={loading}
                className="flex-1 py-3 bg-white text-destructive border border-destructive/20 rounded-xl hover:bg-destructive/5 transition-all font-bold text-sm"
              >
                ✕ Rechazar
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            {/* View Student Profile */}
            {studentId && (
              <Link 
                href={`/dashboard/alumnos/${studentId}`}
                className="col-span-2 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-bold text-sm shadow-sm text-center"
              >
                👤 Ver Ficha Maestro
              </Link>
            )}

            {/* Cancel/Reschedule */}
            <button className="py-3 bg-white border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition-all font-bold text-sm">
              Reagendar
            </button>
            <button className="py-3 bg-white border border-destructive/20 text-destructive rounded-xl hover:bg-destructive shadow-sm hover:text-white transition-all font-bold text-sm">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
