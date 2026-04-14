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

  // Determinar color según tipo
  const getColorClass = () => {
    if (isPublicBooking) {
      return 'bg-gradient-to-br from-red-400 to-red-600 border-l-4 border-red-700'
    }
    
    if (classType.toLowerCase().includes('prueba')) {
      return 'bg-gradient-to-br from-yellow-300 to-yellow-500 border-l-4 border-yellow-600 text-gray-900'
    }
    
    if (isMonthlyPlan) {
      return 'bg-gradient-to-br from-green-400 to-green-600 border-l-4 border-green-700'
    }
    
    return 'bg-gradient-to-br from-blue-400 to-blue-600 border-l-4 border-blue-700'
  }

  return (
    <div
      onClick={onClick}
      className={`absolute left-1 right-1 top-1 rounded-lg p-2 cursor-pointer transition-all hover:scale-105 hover:shadow-lg ${getColorClass()} text-white shadow-md`}
      style={{ minHeight: '70px' }}
    >
      {/* Renewal Warning Badge */}
      {needsRenewalReminder && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-xs">
          🔔
        </div>
      )}
      
      {/* Public Booking Badge */}
      {isPublicBooking && (
        <div className="absolute -top-1 -left-1 w-6 h-6 bg-red-700 rounded-full flex items-center justify-center text-xs font-bold">
          !
        </div>
      )}
      
      <div className="flex flex-col h-full">
        <div className="font-semibold text-sm truncate">
          {classTypeIcon} {studentName}
        </div>
        <div className="text-xs opacity-90 mt-0.5">
          {startTime} - {endTime}
        </div>
        <div className="text-xs opacity-80 mt-auto">
          {classType}
        </div>
      </div>
    </div>
  )
}
