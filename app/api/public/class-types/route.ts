import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Obtener profesor
    const teacher = await prisma.user.findFirst({
      where: { role: 'TEACHER' },
      include: { teacherProfile: true }
    })

    if (!teacher || !teacher.teacherProfile) {
      return NextResponse.json(
        { error: 'Teacher not found' },
        { status: 404 }
      )
    }

    // Obtener tipos de clase activos
    const classTypes = await prisma.classType.findMany({
      where: {
        teacherId: teacher.teacherProfile.id,
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })

    return NextResponse.json({
      classTypes: classTypes.map(ct => ({
        id: ct.id,
        name: ct.name,
        description: ct.description,
        icon: ct.icon,
        price: ct.price,
        currency: ct.currency,
        duration: ct.duration
      }))
    })

  } catch (error) {
    console.error('Error getting class types:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
