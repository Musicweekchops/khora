import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/classes - Obtener todas las clases del profesor
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const studentId = searchParams.get("studentId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

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

    // Construir filtros
    const where: any = {
      student: {
        teacherId: teacherProfile.id
      },
      // Excluir clases eliminadas por defecto
      status: status || { not: "DELETED" }
    }

    // Si se especifica un status, usarlo (incluso si es DELETED)
    if (status) {
      where.status = status
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Obtener clases
    const classes = await prisma.class.findMany({
      where,
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
        notes: true,
        tasks: true
      },
      orderBy: {
        date: "desc"
      }
    })

    return NextResponse.json(classes)

  } catch (error) {
    console.error("Error al obtener clases:", error)
    return NextResponse.json(
      { error: "Error al obtener clases" },
      { status: 500 }
    )
  }
}

// POST /api/classes - Crear nueva clase
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      studentId,
      scheduledDate,
      duration = 60,
      modalidad,
      isTrialClass = false,
      classNumber,
      totalInPlan
    } = body

    // Validaciones
    if (!studentId || !scheduledDate || !modalidad) {
      return NextResponse.json(
        { error: "Alumno, fecha y modalidad son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el alumno existe y pertenece al profesor
    const teacherProfile = await prisma.teacherProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!teacherProfile) {
      return NextResponse.json(
        { error: "Perfil de profesor no encontrado" },
        { status: 404 }
      )
    }

    const student = await prisma.studentProfile.findFirst({
      where: {
        id: studentId,
        teacherId: teacherProfile.id
      }
    })

    if (!student) {
      return NextResponse.json(
        { error: "Alumno no encontrado" },
        { status: 404 }
      )
    }

    // Crear la clase
    const classDate = new Date(scheduledDate)
    
    const newClass = await prisma.class.create({
      data: {
        studentId,
        date: classDate, // Campo obligatorio
        startTime: classDate.getHours().toString().padStart(2, '0') + ':' + classDate.getMinutes().toString().padStart(2, '0'),
        endTime: new Date(classDate.getTime() + duration * 60000).getHours().toString().padStart(2, '0') + ':' + new Date(classDate.getTime() + duration * 60000).getMinutes().toString().padStart(2, '0'),
        duration,
        modalidad,
        isTrialClass,
        classNumber,
        totalInPlan,
        status: "SCHEDULED"
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      {
        message: "Clase creada exitosamente",
        class: newClass
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error al crear clase:", error)
    return NextResponse.json(
      { error: "Error al crear clase" },
      { status: 500 }
    )
  }
}
