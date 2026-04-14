import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    // Validaciones básicas
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      )
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 400 }
      )
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el usuario
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || "STUDENT"
      }
    })

    // Si es profesor, crear el perfil de profesor
    if (user.role === "TEACHER") {
      await prisma.teacherProfile.create({
        data: {
          userId: user.id,
          timezone: "America/Santiago",
          currency: "CLP"
        }
      })
    }

    return NextResponse.json(
      { 
        message: "Usuario creado exitosamente",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error al crear el usuario" },
      { status: 500 }
    )
  }
}
