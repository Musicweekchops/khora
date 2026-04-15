import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase, supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe vía Supabase
    const { data: existingUser } = await supabase
      .from('User')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear el usuario con supabaseAdmin
    const { data: user, error: userError } = await supabaseAdmin
      .from('User')
      .insert({
        email,
        name,
        password: hashedPassword,
        role: role || "STUDENT"
      })
      .select()
      .single()

    if (userError) throw userError

    // Si es profesor, crear el perfil de profesor
    if (user.role === "TEACHER") {
      const { error: profileError } = await supabaseAdmin
        .from('TeacherProfile')
        .insert({
          userId: user.id
          // Eliminamos campos opcionales no definidos en el nuevo SQL si es necesario
        })
      
      if (profileError) console.error("Error creating teacher profile:", profileError)
    }

    return NextResponse.json({ 
      message: "Usuario creado exitosamente",
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    }, { status: 201 })

  } catch (error) {
    console.error("Error en registro:", error)
    return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 })
  }
}
