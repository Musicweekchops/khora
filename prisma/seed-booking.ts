import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Obtener el profesor (asume que ya existe uno)
  const teacher = await prisma.user.findFirst({
    where: { role: 'TEACHER' },
    include: { teacherProfile: true }
  })

  if (!teacher || !teacher.teacherProfile) {
    console.log('❌ No se encontró un profesor. Crea un usuario profesor primero.')
    return
  }

  const teacherId = teacher.teacherProfile.id

  console.log(`✓ Profesor encontrado: ${teacher.name}`)

  // 1. CREAR HORARIOS DEFAULT
  console.log('\n📅 Creando horarios default...')

  const schedules = [
    { dayOfWeek: 3, startTime: '14:00', endTime: '20:00', name: 'Miércoles' },
    { dayOfWeek: 4, startTime: '14:00', endTime: '20:00', name: 'Jueves' },
    { dayOfWeek: 5, startTime: '14:00', endTime: '20:00', name: 'Viernes' },
    { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', name: 'Sábado' },
  ]

  for (const schedule of schedules) {
    const existing = await prisma.availability.findFirst({
      where: {
        teacherId,
        dayOfWeek: schedule.dayOfWeek
      }
    })

    if (existing) {
      console.log(`  - ${schedule.name}: Ya existe, actualizando...`)
      await prisma.availability.update({
        where: { id: existing.id },
        data: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          isActive: true
        }
      })
    } else {
      console.log(`  - ${schedule.name}: Creando...`)
      await prisma.availability.create({
        data: {
          teacherId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          slotDuration: 60,
          isActive: true
        }
      })
    }
  }

  // 2. CREAR TIPOS DE CLASE
  console.log('\n🎵 Creando tipos de clase...')

  const classTypes = [
    {
      name: 'Clase de Prueba',
      description: 'Primera clase sin compromiso. Conoce el método y decide si continúas.',
      icon: '🎵',
      price: 25000,
      duration: 60,
      sortOrder: 1
    },
    {
      name: 'Clase Unitaria',
      description: 'Clase individual para estudiantes que prefieren flexibilidad.',
      icon: '🥁',
      price: 40000,
      duration: 60,
      sortOrder: 2
    },
    {
      name: 'Plan Mensual (4 clases)',
      description: 'Paquete mensual con descuento. Incluye 4 clases de 60 minutos.',
      icon: '📦',
      price: 140000,
      duration: 60,
      sortOrder: 3
    }
  ]

  for (const ct of classTypes) {
    const existing = await prisma.classType.findFirst({
      where: {
        teacherId,
        name: ct.name
      }
    })

    if (existing) {
      console.log(`  - ${ct.name}: Ya existe`)
    } else {
      console.log(`  - ${ct.name}: Creando...`)
      await prisma.classType.create({
        data: {
          ...ct,
          teacherId,
          currency: 'CLP',
          isActive: true
        }
      })
    }
  }

  // 3. CREAR BLOQUEO DE EJEMPLO (Año Nuevo 2026)
  console.log('\n🚫 Creando bloqueo de ejemplo...')

  const newYear = new Date('2026-01-01T00:00:00Z')
  const existingException = await prisma.availabilityException.findFirst({
    where: {
      teacherId,
      date: newYear
    }
  })

  if (!existingException) {
    await prisma.availabilityException.create({
      data: {
        teacherId,
        date: newYear,
        reason: 'Año Nuevo'
      }
    })
    console.log('  - Año Nuevo 2026: Bloqueado')
  } else {
    console.log('  - Año Nuevo 2026: Ya estaba bloqueado')
  }

  console.log('\n✅ Seed completado!')
  console.log('\n📊 Resumen:')
  console.log(`  - Horarios: 4 días configurados`)
  console.log(`  - Tipos de clase: 3 opciones`)
  console.log(`  - Bloqueos: 1 fecha`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
