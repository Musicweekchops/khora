'use client'

interface ClassBlockProps {
  classData: {
    id: string
    startTime: string
    endTime: string
    studentName: string
    classType: string
    classTypeIcon: string
    isPublicBooking: boolean
    isMonthlyPlan: boolean
    needsRenewalReminder: boolean
  }
  onClick: () => void
}

export default function ClassBlock({ classData, onClick }: ClassBlockProps) {
  const { startTime, endTime, studentName, classType, classTypeIcon, isPublicBooking, isMonthlyPlan, needsRenewalReminder } = classData

  const getColorStyles = () => {
    if (isPublicBooking) {
      return 'bg-destructive/10 border-l-4 border-destructive text-destructive'
    }
    
    if (classType.toLowerCase().includes('prueba')) {
      return 'bg-amber-50 border-l-4 border-amber-400 text-amber-800 shadow-sm'
    }
    
    if (isMonthlyPlan) {
      return 'bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800'
    }
    
    return 'bg-primary/10 border-l-4 border-primary text-primary-foreground'
  }

  const getTextColor = () => {
    if (isPublicBooking) return 'text-destructive'
    if (classType.toLowerCase().includes('prueba')) return 'text-amber-900'
    if (isMonthlyPlan) return 'text-emerald-900'
    return 'text-primary'
  }

  return (
    <div
      onClick={onClick}
      className={`absolute left-1 right-1 top-1 rounded-lg p-2.5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md border border-white/20 select-none ${getColorStyles()}`}
      style={{ minHeight: '75px' }}
    >
      {/* Renewal Warning Badge */}
      {needsRenewalReminder && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-[10px] shadow-sm animate-bounce">
          🔔
        </div>
      )}
      
      {/* Public Booking Badge */}
      {isPublicBooking && (
        <div className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-destructive rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm ring-2 ring-white">
          !
        </div>
      )}
      
      <div className="flex flex-col h-full gap-0.5">
        <div className={`font-bold text-xs truncate ${getTextColor()}`}>
          {studentName}
        </div>
        <div className="text-[10px] font-bold opacity-70 flex items-center gap-1">
          <span>{classTypeIcon}</span>
          <span>{startTime} - {endTime}</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-wider opacity-60 mt-auto truncate">
          {classType}
        </div>
      </div>
    </div>
  )
}
