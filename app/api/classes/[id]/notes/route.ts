import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// POST /api/classes/[id]/notes - Agregar nota a una clase
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "TEACHER") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { id: classId } = await params
    const body = await request.json()
    const { content, topics = [] } = body

    // Validaciones
    if (!content) {
      return NextResponse.json(
        { error: "El contenido de la nota es requerido" },
        { status: 400 }
      )
    }

    // Verificar que la clase existe y pertenece al profesor
    const existingClass = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        student: {
          include: {
            teacher: true
          }
        }
      }
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "Clase no encontrada" },
        { status: 404 }
      )
    }

    if (existingClass.student.teacher.userId !== session.user.id) {
      return NextResponse.json(
        { error: "No autorizado para agregar notas a esta clase" },
        { status: 403 }
      )
    }

    // Crear la nota
    const note = await prisma.classNote.create({
      data: {
        classId,
        studentId: existingClass.studentId,
        content,
        topics: JSON.stringify(topics)
      }
    })

    return NextResponse.json(
      {
        message: "Nota agregada exitosamente",
        note
      },
      { status: 201 }
    )

  } catch (error) {
    console.error("Error al agregar nota:", error)
    return NextResponse.json(
      { error: "Error al agregar nota" },
      { status: 500 }
    )
  }
}
