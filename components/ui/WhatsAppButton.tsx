'use client'

interface WhatsAppButtonProps {
  phone: string
  context?: 'class' | 'generic'
  classDate?: string
  classTime?: string
  className?: string
}

export default function WhatsAppButton({ 
  phone, 
  context = 'generic',
  classDate,
  classTime,
  className = ''
}: WhatsAppButtonProps) {
  
  const getMessage = () => {
    if (context === 'class' && classDate && classTime) {
      // Formatear fecha
      const date = new Date(classDate)
      const isToday = isDateToday(date)
      const isTomorrow = isDateTomorrow(date)
      
      let dateText = ''
      if (isToday) {
        dateText = 'hoy'
      } else if (isTomorrow) {
        dateText = 'mañana'
      } else {
        dateText = formatDate(date)
      }
      
      return `Hola! Cómo estás, quería confirmar que esté todo ok para la clase de ${dateText} a las ${classTime}.`
    }
    
    return 'Hola! Me gustaría ponerme en contacto.'
  }

  const handleClick = () => {
    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(getMessage())
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  return (
    <button
      onClick={handleClick}
      className={className || 'flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium'}
    >
      <span>📱</span>
      <span>WhatsApp</span>
    </button>
  )
}

// Helper functions
function isDateToday(date: Date): boolean {
  const today = new Date()
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear()
}

function isDateTomorrow(date: Date): boolean {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return date.getDate() === tomorrow.getDate() &&
         date.getMonth() === tomorrow.getMonth() &&
         date.getFullYear() === tomorrow.getFullYear()
}

function formatDate(date: Date): string {
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  
  return `el ${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`
}
