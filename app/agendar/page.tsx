'use client'

import { useState } from 'react'
import ClassTypeSelection from '@/components/booking/ClassTypeSelection'
import BookingCalendar from '@/components/booking/BookingCalendar'
import BookingForm from '@/components/booking/BookingForm'
import BookingConfirmation from '@/components/booking/BookingConfirmation'

interface ClassType {
  id: string
  name: string
  description: string
  icon: string
  price: number
  currency: string
  duration: number
}

export default function AgendarPage() {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null)
  const [monthlyPricing, setMonthlyPricing] = useState<any>(null)
  const [bookingData, setBookingData] = useState<any>(null)

  const handleClassTypeSelected = (classType: ClassType) => {
    setSelectedClassType(classType)
    setStep(1)
  }

  const handleDateTimeSelected = (date: Date, slot: { startTime: string; endTime: string }, pricing?: any) => {
    setSelectedDate(date)
    setSelectedSlot(slot)
    setMonthlyPricing(pricing || null)
    setStep(2)
  }

  const handleBookingComplete = (data: any) => {
    setBookingData(data)
    setStep(3)
  }

  const handleBackToClassTypes = () => {
    setStep(0)
    setSelectedClassType(null)
  }

  const handleBackToCalendar = () => {
    setStep(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {step === 0 && (
          <ClassTypeSelection onClassTypeSelected={handleClassTypeSelected} />
        )}
        
        {step === 1 && selectedClassType && (
          <BookingCalendar 
            classType={selectedClassType}
            onDateTimeSelected={handleDateTimeSelected}
            onBack={handleBackToClassTypes}
          />
        )}
        
        {step === 2 && selectedDate && selectedSlot && selectedClassType && (
          <BookingForm
            classType={selectedClassType}
            date={selectedDate}
            slot={selectedSlot}
            monthlyPricing={monthlyPricing}
            onBack={handleBackToCalendar}
            onComplete={handleBookingComplete}
          />
        )}
        
        {step === 3 && bookingData && selectedClassType && (
          <BookingConfirmation 
            bookingData={bookingData}
            classType={selectedClassType}
          />
        )}
      </div>
    </div>
  )
}
