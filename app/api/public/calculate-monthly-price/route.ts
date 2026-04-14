import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { date, dayOfWeek } = await request.json()

    if (!date || dayOfWeek === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Parse fecha correctamente sin problemas de zona horaria
    const [yearStr, monthStr, dayStr] = date.split('-')
    const selectedDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr))
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()

    // Contar cuántos días de esa semana hay en el mes
    const totalWeeksInMonth = countDayOccurrencesInMonth(year, month, dayOfWeek)
    
    // Contar cuántos quedan desde la fecha seleccionada
    const remainingWeeks = countRemainingWeeks(selectedDate, dayOfWeek)

    // DEBUG - Remover después
    console.log('DEBUG calculate-monthly-price:')
    console.log('- Input date:', date)
    console.log('- Selected date:', selectedDate)
    console.log('- Year:', year, 'Month:', month, '(0-indexed)')
    console.log('- Day of week:', dayOfWeek)
    console.log('- Total weeks in month:', totalWeeksInMonth)
    console.log('- Remaining weeks:', remainingWeeks)

    // Calcular clases del mes actual
    const currentMonthClasses = generateClassDates(selectedDate, dayOfWeek, month)
    
    console.log('- Current month classes:', currentMonthClasses.length, currentMonthClasses.map(d => d.toISOString().split('T')[0]))

    let pricing: any = {}
    let allClasses: any[] = []

    // REGLA: Si queda ≤ 1 semana en mes actual
    console.log('- Applying rule:', remainingWeeks <= 1 ? 'SPECIAL (≤1 week)' : 'PROPORTIONAL (>1 week)')
    
    if (remainingWeeks <= 1) {
      // Cobrar clase individual + mes siguiente completo
      const nextMonthStart = new Date(year, month + 1, 1)
      const nextMonth = month + 1 > 11 ? 0 : month + 1
      const nextYear = month + 1 > 11 ? year + 1 : year
      
      // Encontrar primer día del mes siguiente que coincida
      const firstDayNextMonth = findFirstDayOfWeekInMonth(nextYear, nextMonth, dayOfWeek)
      const nextMonthClasses = generateClassDates(firstDayNextMonth, dayOfWeek, nextMonth, nextYear)

      pricing = {
        type: 'special', // Regla especial (≤1 semana)
        currentMonthPrice: 35000, // $35k por la clase del mes actual
        nextMonthPrice: 140000,   // $140k por el mes siguiente completo
        totalPrice: 175000,
        breakdown: {
          currentMonth: {
            classes: currentMonthClasses.length,
            price: 35000
          },
          nextMonth: {
            classes: nextMonthClasses.length,
            price: 140000
          }
        }
      }

      allClasses = [...currentMonthClasses, ...nextMonthClasses]
    } else {
      // REGLA: Proporcional (más de 1 semana)
      const proportionalPrice = Math.round((140000 * remainingWeeks) / totalWeeksInMonth)

      pricing = {
        type: 'proportional',
        totalPrice: proportionalPrice,
        breakdown: {
          currentMonth: {
            classes: currentMonthClasses.length,
            price: proportionalPrice,
            calculation: `$140,000 × (${remainingWeeks}/${totalWeeksInMonth})`
          }
        }
      }

      allClasses = currentMonthClasses
    }

    return NextResponse.json({
      success: true,
      selectedDate: date,
      dayOfWeek: getDayName(dayOfWeek),
      totalWeeksInMonth,
      remainingWeeks,
      pricing,
      classes: allClasses.map(d => ({
        date: d.toISOString().split('T')[0],
        month: d.getMonth() + 1,
        monthName: getMonthName(d)
      }))
    })

  } catch (error) {
    console.error('Error calculating monthly price:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function countDayOccurrencesInMonth(year: number, month: number, dayOfWeek: number): number {
  let count = 0
  const date = new Date(year, month, 1)
  
  while (date.getMonth() === month) {
    if (date.getDay() === dayOfWeek) {
      count++
    }
    date.setDate(date.getDate() + 1)
  }
  
  return count
}

function countRemainingWeeks(fromDate: Date, dayOfWeek: number): number {
  let count = 0
  const month = fromDate.getMonth()
  const date = new Date(fromDate)
  
  while (date.getMonth() === month) {
    if (date.getDay() === dayOfWeek && date >= fromDate) {
      count++
    }
    date.setDate(date.getDate() + 1)
  }
  
  return count
}

function generateClassDates(startDate: Date, dayOfWeek: number, targetMonth: number, targetYear?: number): Date[] {
  const classes: Date[] = []
  const year = targetYear || startDate.getFullYear()
  const date = new Date(startDate)
  
  while (date.getMonth() === targetMonth && date.getFullYear() === year) {
    if (date.getDay() === dayOfWeek && date >= startDate) {
      classes.push(new Date(date))
    }
    date.setDate(date.getDate() + 1)
  }
  
  return classes
}

function findFirstDayOfWeekInMonth(year: number, month: number, dayOfWeek: number): Date {
  const date = new Date(year, month, 1)
  
  while (date.getMonth() === month) {
    if (date.getDay() === dayOfWeek) {
      return new Date(date)
    }
    date.setDate(date.getDate() + 1)
  }
  
  return date
}

function getDayName(dayOfWeek: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[dayOfWeek]
}

function getMonthName(date: Date): string {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return months[date.getMonth()]
}
