import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/students - Obtener todos los alumnos del profesor
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

    // Obtener todos los alumnos del profesor
    const students = await prisma.studentProfile.findMany({
      where: {
        teacherId: teacherProfile.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true
          }
        },
        classes: {
          where: {
            status: "COMPLETED"
          },
          orderBy: {
            date: "desc"
          },
          take: 1
        },
        payments: {
          where: {
            status: "PENDING"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    // Formatear respuesta
    const formattedStudents = students.map(student => ({
      id: student.id,
      userId: student.user.id,
      name: student.user.name,
      email: student.user.email,
      phone: student.user.phone,
      status: student.status,
      leadSource: student.leadSource,
      modalidad: student.modalidad,
      preferredDay: student.preferredDay,
      preferredTime: student.preferredTime,
      totalClassesTaken: student.totalClassesTaken,
      lifetimeValue: student.lifetimeValue,
      lastClassDate: student.lastClassDate,
      hasPendingPayments: student.payments.length > 0,
      createdAt: student.createdAt
    }))

    return NextResponse.json(formattedStudents)

  } catch (error) {
    console.error("Error al obtener alumnos:", error)
    return NextResponse.json(
      { error: "Error al obtener alumnos" },
      { status: 500 }
    )
  }
}

// POST /api/students - Crear nuevo alumno
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
      name, 
      email, 
      phone,
      password,
      status = "PROSPECT",
      leadSource,
      modalidad = "online",
      preferredDay,
      preferredTime,
      emergencyContact,
      emergencyPhone
    } = body

    // Validaciones
    if (!name || !email) {
      return NextResponse.json(
        { error: "Nombre y email son requeridos" },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
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

    // Hashear contraseña (usar email si no se proporciona)
    const bcrypt = require("bcryptjs")
    const hashedPassword = await bcrypt.hash(
      password || email.split("@")[0] + "123", 
      10
    )

    // Crear usuario y perfil de estudiante en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear usuario
      const user = await tx.user.create({
        data: {
          email,
          name,
          phone,
          password: hashedPassword,
          role: "STUDENT"
        }
      })

      // Crear perfil de estudiante
      const studentProfile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          teacherId: teacherProfile.id,
          status,
          leadSource,
          modalidad,
          preferredDay,
          preferredTime,
          emergencyContact,
          emergencyPhone
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              phone: true
            }
          }
        }
      })

      return studentProfile
    })

    return NextResponse.json(
      { 
        message: "Alumno creado exitosamente",
        student: {
          id: result.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          status: result.status
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error al crear alumno:", error)
    return NextResponse.json(
      { error: "Error al crear alumno" },
      { status: 500 }
    )
  }
}
