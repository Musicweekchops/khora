import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/tasks - Obtener tareas (del profesor o filtradas por alumno)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("studentId")
    const completed = searchParams.get("completed")

    let where: any = {}

    if (session.user.role === "TEACHER") {
      // Profesor: obtener el perfil y filtrar por sus alumnos
      const teacherProfile = await prisma.teacherProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!teacherProfile) {
        return NextResponse.json(
          { error: "Perfil de profesor no encontrado" },
          { status: 404 }
        )
      }

      where.student = {
        teacherId: teacherProfile.id
      }

      if (studentId) {
        where.studentId = studentId
      }
    } else {
      // Alumno: solo ve sus propias tareas
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (!studentProfile) {
        return NextResponse.json(
          { error: "Perfil de alumno no encontrado" },
          { status: 404 }
        )
      }

      where.studentId = studentProfile.id
    }

    if (completed !== null) {
      where.completed = completed === "true"
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        class: {
          select: {
            id: true,
            scheduledDate: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(tasks)

  } catch (error) {
    console.error("Error al obtener tareas:", error)
    return NextResponse.json(
      { error: "Error al obtener tareas" },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Crear nueva tarea
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
      classId,
      title,
      description,
      dueDate
    } = body

    // Validaciones
    if (!studentId || !title) {
      return NextResponse.json(
        { error: "Alumno y título son requeridos" },
        { status: 400 }
      )
    }

    // Verificar que el alumno pertenece al profesor
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

    // Crear la tarea
    const task = await prisma.task.create({
      data: {
        studentId,
        classId: classId || null,
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(
      {
        message: "Tarea creada exitosamente",
        task
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error al crear tarea:", error)
    return NextResponse.json(
      { error: "Error al crear tarea" },
      { status: 500 }
    )
  }
}
