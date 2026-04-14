'use client'

import { X, User, Mail, Phone, Calendar, Clock, DollarSign, AlertCircle } from 'lucide-react'
import { useState } from 'react'

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                {classTypeIcon} {studentName}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{classType}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning: Public Booking */}
          {isPublicBooking && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Booking Público Pendiente</p>
                <p className="text-sm text-red-700 mt-1">
                  Este booking fue creado desde la página pública y aún no ha sido aprobado.
                  No tiene estudiante asignado.
                </p>
              </div>
            </div>
          )}

          {/* Renewal Reminder */}
          {needsRenewalReminder && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-900">Recordatorio de Renovación</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Esta es la penúltima clase del plan. Recuerda coordinar la renovación.
                </p>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Fecha</p>
                <p className="font-medium text-gray-900">{formatDate(date)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-600">Horario</p>
                <p className="font-medium text-gray-900">{startTime} - {endTime}</p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Información de Contacto</h3>
            
            {studentEmail && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-900">{studentEmail}</span>
              </div>
            )}
            
            {studentPhone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-900">{studentPhone}</span>
              </div>
            )}
          </div>

          {/* Plan Info */}
          {isMonthlyPlan && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <p className="font-medium text-green-900">Plan Mensual</p>
              </div>
              <p className="text-sm text-green-700 mt-1">
                $140,000 CLP • Múltiples clases programadas
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-3">
          {/* Public Booking Actions */}
          {isPublicBooking && (
            <>
              <button
                onClick={handleApproveBooking}
                disabled={loading}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                ✅ Aprobar y Crear Estudiante
              </button>
              
              <button
                disabled={loading}
                className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                ❌ Rechazar Booking
              </button>
            </>
          )}
          
          {/* Contact Actions */}
          <div className="grid grid-cols-2 gap-3">
            {studentPhone && (
              <button
                onClick={handleContactWhatsApp}
                className="py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                📱 WhatsApp
              </button>
            )}
            
            {studentEmail && (
              <button
                onClick={handleContactEmail}
                className="py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
              >
                ✉️ Email
              </button>
            )}
          </div>

          {/* View Student Profile */}
          {studentId && (
            <button className="w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
              👤 Ver Perfil del Alumno
            </button>
          )}

          {/* Cancel/Reschedule */}
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              📅 Reagendar
            </button>
            <button className="py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium">
              🗑️ Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
