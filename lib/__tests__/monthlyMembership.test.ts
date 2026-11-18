import assert from "node:assert/strict"
import {
  buildMonthlyReminderMessages,
  calculateProportionalFee,
  getMonthlyPaymentStatus,
  PaymentRecordInput,
  resolveRecoveryPolicy,
} from "../billingRules"
import {
  calculateClassCounters,
  ClassCounterItem,
  getStudentMonthSessionsSummary,
} from "../classCounter"

function runTests() {
  console.log("Ejecutando pruebas de aceptación: Mensualidad de mes calendario y conteo de sesiones...\n")

  // 1. Alumno con 4 clases en noviembre y pago registrado:
  // etiquetas "Sesión 1 a 4 · Noviembre", estado Al día, y la clase 4 no cambia el estado.
  {
    const classesNov: ClassCounterItem[] = [
      { id: "c1", student_id: "s1", date: "2026-11-05", start_time: "18:00", status: "COMPLETED" },
      { id: "c2", student_id: "s1", date: "2026-11-12", start_time: "18:00", status: "COMPLETED" },
      { id: "c3", student_id: "s1", date: "2026-11-19", start_time: "18:00", status: "COMPLETED" },
      { id: "c4", student_id: "s1", date: "2026-11-26", start_time: "18:00", status: "COMPLETED" },
    ]
    const paymentsNov: PaymentRecordInput[] = [
      { id: "p1", student_id: "s1", amount: 90000, date: "2026-11-02", billing_month: "2026-11" },
    ]

    const counters = calculateClassCounters(classesNov)
    assert.equal(counters.get("c1")?.counterLabel, "Sesión 1 · Noviembre")
    assert.equal(counters.get("c2")?.counterLabel, "Sesión 2 · Noviembre")
    assert.equal(counters.get("c3")?.counterLabel, "Sesión 3 · Noviembre")
    assert.equal(counters.get("c4")?.counterLabel, "Sesión 4 · Noviembre")
    assert.ok(!counters.get("c4")?.counterLabel.includes("/4"))

    const statusBeforeClass4 = getMonthlyPaymentStatus({
      monthKey: "2026-11",
      payments: paymentsNov,
      todayStr: "2026-11-20",
    })
    const statusAfterClass4 = getMonthlyPaymentStatus({
      monthKey: "2026-11",
      payments: paymentsNov,
      todayStr: "2026-11-27",
    })
    assert.equal(statusBeforeClass4, "AL_DIA")
    assert.equal(statusAfterClass4, "AL_DIA")
    console.log("✓ Caso 1 OK: 4 clases en noviembre ('Sesión 1..4 · Noviembre'), estado Al día invariable tras la 4ta clase.")
  }

  // 2. Mes con 5 clases: aparece "Sesión 5 · Mayo", sin error ni "5/4".
  {
    const classesMay: ClassCounterItem[] = [
      { id: "m1", student_id: "s1", date: "2026-05-01", start_time: "18:00", status: "COMPLETED" },
      { id: "m2", student_id: "s1", date: "2026-05-08", start_time: "18:00", status: "COMPLETED" },
      { id: "m3", student_id: "s1", date: "2026-05-15", start_time: "18:00", status: "COMPLETED" },
      { id: "m4", student_id: "s1", date: "2026-05-22", start_time: "18:00", status: "COMPLETED" },
      { id: "m5", student_id: "s1", date: "2026-05-29", start_time: "18:00", status: "SCHEDULED" },
    ]
    const counters = calculateClassCounters(classesMay)
    assert.equal(counters.get("m5")?.counterLabel, "Sesión 5 · Mayo")
    assert.ok(!counters.get("m5")?.counterLabel.includes("/4"))
    console.log("✓ Caso 2 OK: Mes con 5 clases muestra 'Sesión 5 · Mayo' sin '5/4'.")
  }

  // 3. Primera clase de diciembre: etiqueta "Sesión 1 · Diciembre" y estado Pendiente hasta que haya pago.
  {
    const classesNovDec: ClassCounterItem[] = [
      { id: "n4", student_id: "s1", date: "2026-11-26", start_time: "18:00", status: "COMPLETED" },
      { id: "d1", student_id: "s1", date: "2026-12-03", start_time: "18:00", status: "SCHEDULED" },
    ]
    const payments: PaymentRecordInput[] = [
      { id: "p_nov", student_id: "s1", amount: 90000, date: "2026-11-02", billing_month: "2026-11" },
    ]
    const counters = calculateClassCounters(classesNovDec)
    assert.equal(counters.get("d1")?.counterLabel, "Sesión 1 · Diciembre")

    const decStatus = getMonthlyPaymentStatus({
      monthKey: "2026-12",
      payments,
      todayStr: "2026-12-01",
    })
    assert.equal(decStatus, "PENDIENTE")
    console.log("✓ Caso 3 OK: Primera clase de diciembre etiquetada 'Sesión 1 · Diciembre' y estado Pendiente.")
  }

  // 4. Del día 1 al 5 sin pago: Pendiente. Desde el día 6: Atrasado.
  {
    const payments: PaymentRecordInput[] = []
    for (const day of ["01", "02", "03", "04", "05"]) {
      const st = getMonthlyPaymentStatus({
        monthKey: "2026-11",
        payments,
        todayStr: `2026-11-${day}`,
      })
      assert.equal(st, "PENDIENTE")
    }
    const stDay6 = getMonthlyPaymentStatus({
      monthKey: "2026-11",
      payments,
      todayStr: "2026-11-06",
    })
    assert.equal(stDay6, "ATRASADO")

    const msgDay6 = buildMonthlyReminderMessages({
      studentName: "Matías Pérez",
      monthKey: "2026-11",
      status: stDay6,
    })
    assert.ok(msgDay6.body.includes("Aún no veo registrada tu mensualidad de noviembre"))
    assert.equal(msgDay6.subject, "Tu mensualidad de noviembre · clases de batería")
    console.log("✓ Caso 4 OK: Días 1-5 'PENDIENTE', desde el día 6 'ATRASADO' con plantilla de atraso.")
  }

  // 5. "Marcar pagado" estando Atrasado: pasa a Al día y guarda fecha y monto.
  {
    const paymentsBefore: PaymentRecordInput[] = []
    assert.equal(
      getMonthlyPaymentStatus({
        monthKey: "2026-11",
        payments: paymentsBefore,
        todayStr: "2026-11-10",
      }),
      "ATRASADO"
    )

    const paymentsAfter: PaymentRecordInput[] = [
      { id: "p_late", student_id: "s1", amount: 90000, date: "2026-11-10", billing_month: "2026-11" },
    ]
    assert.equal(
      getMonthlyPaymentStatus({
        monthKey: "2026-11",
        payments: paymentsAfter,
        todayStr: "2026-11-10",
      }),
      "AL_DIA"
    )
    console.log("✓ Caso 5 OK: Marcar pagado estando Atrasado pasa inmediatamente a 'AL_DIA'.")
  }

  // 6. Feriado o cancelación del profesor: sesión pendiente sin vencimiento y el estado de pago no cambia.
  {
    const policy = resolveRecoveryPolicy("TEACHER_OR_HOLIDAY", "2026-10-15")
    assert.equal(policy.is_recovery_pending, true)
    assert.equal(policy.recovery_expires_at, null)

    const classes: ClassCounterItem[] = [
      {
        id: "rec_holiday",
        student_id: "s1",
        date: "2026-10-15",
        start_time: "18:00",
        status: "CANCELLED",
        ...policy,
      },
    ]
    const summary = getStudentMonthSessionsSummary({
      classes,
      monthKey: "2026-11",
      studentId: "s1",
      todayStr: "2026-11-10",
    })
    assert.equal(summary.pendingRecoveries.length, 1)
    assert.equal(summary.pendingRecoveries[0].expiresAt, null)
    console.log("✓ Caso 6 OK: Feriado / cancelación del profesor genera sesión pendiente sin vencimiento.")
  }

  // 7. Falta justificada: sesión pendiente con vencimiento a 30 días.
  {
    const policy = resolveRecoveryPolicy("STUDENT_JUSTIFIED", "2026-11-01")
    assert.equal(policy.is_recovery_pending, true)
    assert.equal(policy.recovery_expires_at, "2026-12-01")
    console.log("✓ Caso 7 OK: Falta justificada calcula vencimiento exacto a 30 días (2026-12-01).")
  }

  // 8. Alumno con clase pendiente y sin pago: el estado depende solo de la fecha; la caja de pendientes se muestra aparte.
  {
    const policy = resolveRecoveryPolicy("TEACHER_OR_HOLIDAY", "2026-10-20")
    const classes: ClassCounterItem[] = [
      {
        id: "oct_pend",
        student_id: "s1",
        date: "2026-10-20",
        start_time: "18:00",
        status: "CANCELLED",
        ...policy,
      },
      {
        id: "nov_1",
        student_id: "s1",
        date: "2026-11-05",
        start_time: "18:00",
        status: "SCHEDULED",
      },
    ]
    const stDay3 = getMonthlyPaymentStatus({
      monthKey: "2026-11",
      payments: [],
      todayStr: "2026-11-03",
    })
    assert.equal(stDay3, "PENDIENTE")

    const summary = getStudentMonthSessionsSummary({
      classes,
      monthKey: "2026-11",
      studentId: "s1",
      todayStr: "2026-11-03",
    })
    assert.equal(summary.upcomingCount, 1)
    assert.equal(summary.pendingRecoveries.length, 1)
    assert.equal(summary.pendingRecoveries[0].originMonthName, "Octubre")
    console.log("✓ Caso 8 OK: Clase pendiente se muestra en caja aparte y no altera el estado de pago ni las sesiones del mes.")
  }

  // 9. Enero en pausa: estado En pausa, sin cobro ni recordatorios.
  {
    const statusJan = getMonthlyPaymentStatus({
      monthKey: "2027-01",
      payments: [],
      pausedMonths: ["2027-01", "2027-02"],
      todayStr: "2027-01-15",
    })
    assert.equal(statusJan, "EN_PAUSA")
    console.log("✓ Caso 9 OK: Mes de enero configurado en pausa devuelve estado 'EN_PAUSA' incluso el día 15 sin pago.")
  }

  // 10. Datos históricos: clases asignadas a su mes por fecha, sin deudas inventadas.
  {
    const historicClasses: ClassCounterItem[] = [
      { id: "h1", student_id: "s1", date: "2026-08-06", start_time: "18:00", status: "COMPLETED" },
      { id: "h2", student_id: "s1", date: "2026-08-13", start_time: "18:00", status: "COMPLETED" },
    ]
    const counters = calculateClassCounters(historicClasses)
    assert.equal(counters.get("h1")?.counterLabel, "Sesión 1 · Agosto")
    assert.equal(counters.get("h2")?.counterLabel, "Sesión 2 · Agosto")

    const statusPastMonthWithoutPayment = getMonthlyPaymentStatus({
      monthKey: "2026-08",
      payments: [],
      todayStr: "2026-11-17",
    })
    assert.equal(statusPastMonthWithoutPayment, "SIN_ESTADO")
    console.log("✓ Caso 10 OK: Meses históricos asignan 'Sesión X · Agosto' y quedan 'SIN_ESTADO' sin inventar deuda.")
  }

  // Extra: Cálculo proporcional para alumno que entra a mitad de mes y mensaje dirigido al apoderado
  {
    assert.equal(calculateProportionalFee(90000, 4, 2), 45000)
    const guardianMsg = buildMonthlyReminderMessages({
      studentName: "Tomás Rojas",
      billingContactName: "Roberto Rojas",
      monthKey: "2026-11",
      status: "PENDIENTE",
    })
    assert.equal(guardianMsg.isGuardian, true)
    assert.ok(guardianMsg.body.startsWith("Hola Roberto, ¡partimos noviembre!"))
    assert.ok(guardianMsg.body.includes("Tomás"))
    console.log("✓ Extra OK: Cálculo proporcional mitad de mes y mensaje personalizado para Apoderado/Papá.")
  }

  console.log("\n🎉 ¡Todas las pruebas automáticas (10/10 + extras) pasaron exitosamente!")
}

runTests()
