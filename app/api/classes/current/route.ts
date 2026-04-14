import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/classes/current - Obtener clase actual o próxima del día
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Obtener el perfil del profesor
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Perfil de profesor no encontrado" },
        { status: 404 }
      )
    }

    // Obtener fecha/hora actual
    const now = new Date()
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    // Obtener todas las clases de hoy
    const todayClasses = await prisma.class.findMany({
      where: {
        student: {
          teacherId: teacherProfile.id
        },
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          notIn: ["CANCELLED"]
        }
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            }
          }
        },
        notes: {
          orderBy: {
            createdAt: "desc"
          },
          take: 1
        },
        tasks: {
          where: {
            completed: false
          },
          take: 3
        }
      },
      orderBy: {
        date: "asc"
      }
    })

    if (todayClasses.length === 0) {
      return NextResponse.json({
        currentClass: null,
        nextClass: null,
        isInProgress: false
      })
    }

    // Buscar clase en curso o próxima
    let currentClass = null
    let nextClass = null
    let isInProgress = false

    for (const cls of todayClasses) {
      const classStart = new Date(cls.date || cls.scheduledDate) // Soportar ambos campos
      const classEnd = new Date(classStart.getTime() + cls.duration * 60000)

      // Verificar si la clase está en curso (ahora está entre inicio y fin)
      if (now >= classStart && now <= classEnd) {
        currentClass = cls
        isInProgress = true
        break
      }

      // Si no está en curso, buscar la próxima
      if (now < classStart && !nextClass) {
        nextClass = cls
      }
    }

    // Si hay clase en curso, devolverla como current
    if (currentClass) {
      return NextResponse.json({
        currentClass,
        nextClass: null,
        isInProgress: true
      })
    }

    // Si no hay clase en curso, devolver la próxima
    return NextResponse.json({
      currentClass: nextClass,
      nextClass: null,
      isInProgress: false
    })

  } catch (error) {
    console.error("Error al obtener clase actual:", error)
    return NextResponse.json(
      { error: "Error al obtener clase actual" },
      { status: 500 }
    )
  }
}
