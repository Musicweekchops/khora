import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  await prisma.automationLog.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.pricingPlan.deleteMany()
  await prisma.task.deleteMany()
  await prisma.classNote.deleteMany()
  await prisma.class.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.teacherProfile.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ Datos antiguos eliminados')

  // Crear profesor (Arnaldo)
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const arnaldo = await prisma.user.create({
    data: {
      email: 'arnaldo@drumschool.com',
      name: 'Arnaldo Allende',
      password: hashedPassword,
      role: 'TEACHER',
      phone: '+56912345678',
    },
  })

  console.log('✅ Usuario profesor creado:', arnaldo.email)

  // Crear perfil de profesor
  const teacherProfile = await prisma.teacherProfile.create({
    data: {
      userId: arnaldo.id,
      timezone: 'America/Santiago',
      currency: 'CLP',
      monthlyStudentGoal: 20,
      breakEvenPoint: 500000,
      targetMonthlyRevenue: 1000000,
    },
  })

  console.log('✅ Perfil de profesor creado')

  // Crear planes de precios
  const trialPlan = await prisma.pricingPlan.create({
    data: {
      teacherId: teacherProfile.id,
      name: 'Clase de Prueba',
      description: 'Una clase de prueba para nuevos alumnos',
      price: 25000,
      currency: 'CLP',
      classesIncluded: 1,
      validityDays: 7,
      isTrialPlan: true,
      isActive: true,
    },
  })

  const monthlyPlan = await prisma.pricingPlan.create({
    data: {
      teacherId: teacherProfile.id,
      name: 'Mensualidad',
      description: 'Una clase semanal durante el mes',
      price: 80000,
      currency: 'CLP',
      classesIncluded: 4,
      validityDays: 30,
      isTrialPlan: false,
      isActive: true,
    },
  })

  console.log('✅ Planes de precio creados')

  // Crear disponibilidad (Lunes a Viernes, 9am - 6pm)
  for (let day = 1; day <= 5; day++) {
    await prisma.availability.create({
      data: {
        teacherId: teacherProfile.id,
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '18:00',
        slotDuration: 60,
        isActive: true,
      },
    })
  }

  console.log('✅ Disponibilidad configurada (Lunes-Viernes 9am-6pm)')

  // Crear alumno de ejemplo
  const studentUser = await prisma.user.create({
    data: {
      email: 'juan@example.com',
      name: 'Juan Pérez',
      password: hashedPassword,
      role: 'STUDENT',
      phone: '+56987654321',
    },
  })

  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      teacherId: teacherProfile.id,
      status: 'ACTIVE',
      leadSource: 'INSTAGRAM',
      preferredDay: 'Wednesday',
      preferredTime: '10:00',
      modalidad: 'online',
      totalClassesTaken: 0,
      totalMonthsActive: 1,
      lifetimeValue: 0,
    },
  })

  console.log('✅ Alumno de ejemplo creado:', studentUser.email)

  // Crear suscripción activa
  const startDate = new Date('2026-01-01')
  const endDate = new Date('2026-01-31')

  await prisma.subscription.create({
    data: {
      studentId: studentProfile.id,
      planId: monthlyPlan.id,
      startDate,
      endDate,
      classesUsed: 0,
      classesTotal: 4,
      isActive: true,
      autoRenew: true,
    },
  })

  console.log('✅ Suscripción activa creada')

  // Crear clase de ejemplo
  await prisma.class.create({
    data: {
      studentId: studentProfile.id,
      scheduledDate: new Date('2026-01-25T10:00:00'),
      duration: 60,
      status: 'SCHEDULED',
      modalidad: 'online',
      isTrialClass: false,
      classNumber: 1,
      totalInPlan: 4,
    },
  })

  console.log('✅ Clase de ejemplo creada')

  // Crear leads de ejemplo
  await prisma.lead.createMany({
    data: [
      {
        name: 'María González',
        email: 'maria@example.com',
        phone: '+56911111111',
        source: 'FACEBOOK',
        status: 'new',
        notes: 'Interesada en clases online',
      },
      {
        name: 'Pedro Silva',
        email: 'pedro@example.com',
        phone: '+56922222222',
        source: 'GOOGLE',
        status: 'contacted',
        notes: 'Llamó para consultar precios',
        lastContactDate: new Date(),
      },
    ],
  })

  console.log('✅ Leads de ejemplo creados')

  console.log('\n🎉 Seed completado exitosamente!\n')
  console.log('📧 Credenciales de prueba:')
  console.log('   Profesor: arnaldo@drumschool.com / password123')
  console.log('   Alumno: juan@example.com / password123')
  console.log('\n🚀 Ejecuta "npm run dev" para iniciar el servidor')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
