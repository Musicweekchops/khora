'use client'

import { CheckCircle2, Mail, MessageCircle, Calendar, Clock, Download } from 'lucide-react'

interface ClassType {
  id: string
  name: string
  description: string
  icon: string
  price: number
  currency: string
  duration: number
}

interface BookingData {
  id: string
  name: string
  email: string
  phone: string
  isMonthlyPlan?: boolean
  totalPrice?: number
  classes?: Array<{
    id: string
    date: Date | string
    startTime: string
    endTime: string
    weekNumber: number
  }>
  classType: {
    name: string
    price: number
    currency: string
    duration: number
  }
}

interface BookingConfirmationProps {
  bookingData: BookingData
  classType: ClassType
}

export default function BookingConfirmation({ bookingData, classType }: BookingConfirmationProps) {
  const isMonthlyPlan = bookingData.isMonthlyPlan || classType.name.toLowerCase().includes('mensual')

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
  }

  // Agrupar clases por mes
  const classesByMonth = bookingData.classes?.reduce((acc: any, cls: any) => {
    const monthKey = cls.monthName || getMonthName(typeof cls.date === 'string' ? new Date(cls.date) : cls.date)
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(cls)
    return acc
  }, {})

  const getMonthName = (date: Date) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return months[date.getMonth()]
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-center text-white">
        <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {isMonthlyPlan ? '¡4 Clases Agendadas!' : '¡Clase Agendada!'}
        </h1>
        <p className="text-green-100">
          Te enviamos confirmación a <strong>{bookingData.email}</strong>
        </p>
      </div>

      <div className="p-6">
        {/* Resumen de clases */}
        {isMonthlyPlan && bookingData.classes ? (
          <div className="mb-6">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Tu Plan Mensual
            </h3>
            
            {/* Agrupar por mes */}
            {Object.entries(classesByMonth).map(([monthName, monthClasses]: [string, any]) => (
              <div key={monthName} className="mb-4">
                <div className="text-sm font-medium text-gray-700 mb-2 px-2">{monthName}</div>
                <div className="grid grid-cols-2 gap-3">
                  {monthClasses.map((cls: any) => (
                    <div
                      key={cls.id}
                      className="p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {cls.weekNumber || '•'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{formatDate(cls.date)}</div>
                          <div className="text-green-700 text-sm flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {cls.startTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
              <strong>Precio total:</strong> ${(bookingData.totalPrice || classType.price).toLocaleString()} {classType.currency} 
              <span className="text-gray-500"> ({bookingData.classes.length} clases)</span>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="font-semibold mb-2">{classType.name}</div>
            <div className="text-sm text-gray-600 space-y-1">
              <div><strong>Precio:</strong> ${classType.price.toLocaleString()} {classType.currency}</div>
              <div><strong>Duración:</strong> {classType.duration} minutos</div>
            </div>
          </div>
        )}

        {/* Acciones principales - Compactas */}
        <div className="space-y-3 mb-6">
          <a
            href={`https://wa.me/56912345678?text=Hola! Acabo de agendar ${isMonthlyPlan ? 'un Plan Mensual' : 'una clase'} (ID: ${bookingData.id})`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Confirmar por WhatsApp
          </a>

          <button
            onClick={() => alert('Próximamente: Agregar a calendario')}
            className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            Agregar a mi Calendario
          </button>
        </div>

        {/* Info adicional - Compacta */}
        <div className="space-y-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2 text-sm text-blue-800">
              <Mail className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                Revisa tu correo. Si no lo ves, busca en spam.
              </div>
            </div>
          </div>

          {isMonthlyPlan && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="text-sm text-amber-800">
                <strong>Recuerda:</strong> Puedes reagendar hasta 2 clases al mes con 48hrs de anticipación.
              </div>
            </div>
          )}
        </div>

        {/* Link volver - Solo para NO Plan Mensual */}
        {!isMonthlyPlan && (
          <div className="mt-6 text-center">
            <a
              href="/agendar"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Agendar otra clase
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
