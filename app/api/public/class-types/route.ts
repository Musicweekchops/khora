import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Obtener profesor vía Supabase
    const { data: teacher } = await supabase
      .from('User')
      .select('id, teacherProfile:TeacherProfile(id)')
      .eq('role', 'TEACHER')
      .limit(1)
      .single()

    if (!teacher || !teacher.teacherProfile) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const teacherId = (teacher.teacherProfile as any).id

    // Obtener tipos de clase activos vía Supabase
    const { data: classTypes, error: ctError } = await supabase
      .from('ClassType')
      .select('*')
      .eq('teacherId', teacherId)
      .eq('isActive', true)
      .order('sortOrder', { ascending: true })

    if (ctError) throw ctError

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
