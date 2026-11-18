/**
 * Reglas de negocio de mensualidad por mes calendario, estados de pago y recuperaciones.
 * Todos los parámetros son configurables (por defecto o desde TeacherBillingConfig).
 * Zona horaria de referencia: America/Santiago (español de Chile).
 */

export interface BillingRulesConfig {
  billingDay: number // Día 1 de cada mes calendario por defecto
  graceDay: number // Hasta el día 5 inclusive por defecto
  justifiedAbsenceExpiryDays: number // 30 días para falta justificada del alumno
  defaultSummerPausedMonths: number[] // [1, 2] (enero y febrero configurables por alumno)
  bankDetails: string // Datos de transferencia del profesor
}

export const DEFAULT_BILLING_RULES: BillingRulesConfig = {
  billingDay: 1,
  graceDay: 5,
  justifiedAbsenceExpiryDays: 30,
  defaultSummerPausedMonths: [1, 2],
  bankDetails:
    "Banco: Por definir en Ajustes · Cuenta Vista / Corriente · Solicita los datos a tu profesor o cópialos aquí.",
}

export type MonthlyPaymentStatus =
  | "AL_DIA"
  | "PENDIENTE"
  | "ATRASADO"
  | "EN_PAUSA"
  | "SIN_ESTADO"

export type RecoveryOriginType =
  | "TEACHER_OR_HOLIDAY"
  | "STUDENT_JUSTIFIED"
  | "NO_SHOW"

export interface PaymentRecordInput {
  id?: string
  student_id?: string
  amount: number
  date: string // YYYY-MM-DD
  billing_month?: string | null // YYYY-MM
  method?: string | null
  notes?: string | null
}

const MONTH_NAMES_ES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
]

/**
 * Obtiene la fecha actual en zona horaria America/Santiago en formato YYYY-MM-DD
 */
export function getSantiagoTodayStr(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now)
  const y = parts.find((p) => p.type === "year")?.value ?? String(now.getFullYear())
  const m = parts.find((p) => p.type === "month")?.value ?? String(now.getMonth() + 1).padStart(2, "0")
  const d = parts.find((p) => p.type === "day")?.value ?? String(now.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/**
 * Devuelve el nombre del mes en español a partir de "YYYY-MM" o "YYYY-MM-DD"
 */
export function getMonthNameEs(monthOrDateStr: string, capitalize = true): string {
  if (!monthOrDateStr || monthOrDateStr.length < 7) return ""
  const monthNum = Number(monthOrDateStr.slice(5, 7))
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) return ""
  const name = MONTH_NAMES_ES[monthNum - 1]
  return capitalize ? name : name.toLowerCase()
}

/**
 * Devuelve "Noviembre 2026" a partir de "2026-11"
 */
export function getMonthYearLabelEs(monthKey: string): string {
  if (!monthKey || monthKey.length < 7) return monthKey
  const year = monthKey.slice(0, 4)
  const name = getMonthNameEs(monthKey, true)
  return name ? `${name} ${year}` : monthKey
}

/**
 * Dado "2026-11", devuelve "2026-12". Dado "2026-12", devuelve "2027-01".
 */
export function getNextMonthKey(monthKey: string): string {
  const [yStr, mStr] = monthKey.split("-")
  const y = Number(yStr)
  const m = Number(mStr)
  if (isNaN(y) || isNaN(m)) return monthKey
  if (m === 12) {
    return `${y + 1}-01`
  }
  return `${y}-${String(m + 1).padStart(2, "0")}`
}

/**
 * Determina a qué mes calendario (YYYY-MM) corresponde un pago.
 * Usa billing_month si está definido; si no, los primeros 7 caracteres de date.
 */
export function getPaymentBillingMonth(p: PaymentRecordInput): string {
  if (p.billing_month && /^\d{4}-\d{2}$/.test(p.billing_month.trim())) {
    return p.billing_month.trim()
  }
  if (p.date && p.date.length >= 7) {
    return p.date.slice(0, 7)
  }
  return ""
}

/**
 * Verifica si un alumno tiene pago registrado para el mes indicado (YYYY-MM).
 */
export function hasPaymentForMonth(
  payments: PaymentRecordInput[],
  monthKey: string
): boolean {
  return payments.some(
    (p) => getPaymentBillingMonth(p) === monthKey && Number(p.amount || 0) > 0
  )
}

/**
 * Calcula el estado de pago de un mes para un alumno.
 *
 * Reglas:
 * - Nunca depende de cuántas clases se han realizado.
 * - Si el mes está en pausedMonths -> "EN_PAUSA".
 * - Si existe pago registrado para ese mes -> "AL_DIA".
 * - Si es un mes pasado (monthKey < currentMonthKey) sin pago registrado -> "SIN_ESTADO" (no inventar deuda).
 * - Si es un mes futuro (monthKey > currentMonthKey) sin pago -> "SIN_ESTADO".
 * - Si es el mes en curso (monthKey === currentMonthKey):
 *     - hoy <= graceDay (día 5 por defecto) -> "PENDIENTE"
 *     - hoy > graceDay -> "ATRASADO"
 */
export function getMonthlyPaymentStatus(params: {
  monthKey: string // YYYY-MM a evaluar
  payments: PaymentRecordInput[]
  pausedMonths?: string[] | null
  todayStr?: string // YYYY-MM-DD (por defecto hoy en America/Santiago)
  config?: Partial<BillingRulesConfig>
}): MonthlyPaymentStatus {
  const {
    monthKey,
    payments,
    pausedMonths = [],
    todayStr = getSantiagoTodayStr(),
    config,
  } = params

  const rules = { ...DEFAULT_BILLING_RULES, ...config }

  if (pausedMonths && pausedMonths.includes(monthKey)) {
    return "EN_PAUSA"
  }

  if (hasPaymentForMonth(payments, monthKey)) {
    return "AL_DIA"
  }

  const currentMonthKey = todayStr.slice(0, 7)
  const currentDay = Number(todayStr.slice(8, 10))

  // Meses históricos ya vividos sin registro de pago: no inventar deuda
  if (monthKey < currentMonthKey) {
    return "SIN_ESTADO"
  }

  // Meses futuros aún no iniciados: sin estado hasta el día 1 de ese mes
  if (monthKey > currentMonthKey) {
    return "SIN_ESTADO"
  }

  // Mes actual en curso
  if (currentDay <= rules.graceDay) {
    return "PENDIENTE"
  }

  return "ATRASADO"
}

/**
 * Calcula la mensualidad proporcional para un alumno que entra a mitad de mes:
 * mensualidad ÷ sesiones totales del mes × sesiones restantes
 */
export function calculateProportionalFee(
  monthlyFee: number,
  totalSessionsInMonth: number,
  remainingSessionsInMonth: number
): number {
  if (monthlyFee <= 0 || totalSessionsInMonth <= 0) return 0
  if (remainingSessionsInMonth <= 0) return 0
  if (remainingSessionsInMonth >= totalSessionsInMonth) return monthlyFee
  return Math.round((monthlyFee / totalSessionsInMonth) * remainingSessionsInMonth)
}

/**
 * Calcula los campos de recuperación al marcar una inasistencia o suspensión.
 * - TEACHER_OR_HOLIDAY: Sesión pendiente que no vence (expiresAt = null)
 * - STUDENT_JUSTIFIED: Sesión pendiente con plazo de 30 días (expiresAt = classDate + 30 días)
 * - NO_SHOW: Se da por realizada, sin recuperación (isRecoveryPending = false, status = COMPLETED)
 */
export function resolveRecoveryPolicy(
  originType: RecoveryOriginType,
  classDateStr: string, // YYYY-MM-DD
  config?: Partial<BillingRulesConfig>
): {
  is_recovery_pending: boolean
  recovery_origin_type: RecoveryOriginType
  recovery_expires_at: string | null
  recovery_reason: string
  resulting_status?: "COMPLETED" | "CANCELLED"
} {
  const rules = { ...DEFAULT_BILLING_RULES, ...config }

  if (originType === "TEACHER_OR_HOLIDAY") {
    return {
      is_recovery_pending: true,
      recovery_origin_type: "TEACHER_OR_HOLIDAY",
      recovery_expires_at: null,
      recovery_reason: "Suspensión del profesor / feriado (sin vencimiento)",
      resulting_status: "CANCELLED",
    }
  }

  if (originType === "STUDENT_JUSTIFIED") {
    const [y, m, d] = classDateStr.split("-").map(Number)
    const baseDate = new Date(Date.UTC(y, (m || 1) - 1, d || 1))
    baseDate.setUTCDate(baseDate.getUTCDate() + rules.justifiedAbsenceExpiryDays)
    const expY = baseDate.getUTCFullYear()
    const expM = String(baseDate.getUTCMonth() + 1).padStart(2, "0")
    const expD = String(baseDate.getUTCDate()).padStart(2, "0")

    return {
      is_recovery_pending: true,
      recovery_origin_type: "STUDENT_JUSTIFIED",
      recovery_expires_at: `${expY}-${expM}-${expD}`,
      recovery_reason: `Falta justificada del alumno (plazo ${rules.justifiedAbsenceExpiryDays} días)`,
      resulting_status: "CANCELLED",
    }
  }

  // NO_SHOW: Falta sin aviso -> se da por realizada, sin recuperación
  return {
    is_recovery_pending: false,
    recovery_origin_type: "NO_SHOW",
    recovery_expires_at: null,
    recovery_reason: "Inasistencia sin aviso (dada por realizada)",
    resulting_status: "COMPLETED",
  }
}

/**
 * Formatea la fecha límite de pago del mes (ej: "5 de noviembre")
 */
export function formatDeadlineLabelEs(
  monthKey: string,
  graceDay = DEFAULT_BILLING_RULES.graceDay
): string {
  const monthLower = getMonthNameEs(monthKey, false)
  return `${graceDay} de ${monthLower}`
}

/**
 * Genera el asunto y el mensaje de recordatorio de mensualidad (WhatsApp y Correo).
 * Soporta tanto envío directo al alumno como envío al apoderado/contacto de pago.
 */
export function buildMonthlyReminderMessages(params: {
  studentName: string
  billingContactName?: string | null
  monthKey: string // YYYY-MM
  status: MonthlyPaymentStatus
  bankDetails?: string | null
  graceDay?: number
}): {
  subject: string
  body: string
  recipientName: string
  isGuardian: boolean
} {
  const {
    studentName,
    billingContactName,
    monthKey,
    status,
    bankDetails,
    graceDay = DEFAULT_BILLING_RULES.graceDay,
  } = params

  const firstStudentName = (studentName || "Alumno").trim().split(/\s+/)[0]
  const cleanGuardian = (billingContactName || "").trim()
  const isGuardian = cleanGuardian.length > 0
  const recipientFirstName = isGuardian
    ? cleanGuardian.split(/\s+/)[0]
    : firstStudentName

  const monthLower = getMonthNameEs(monthKey, false)
  const deadlineLabel = formatDeadlineLabelEs(monthKey, graceDay)
  const cleanBank = (bankDetails || DEFAULT_BILLING_RULES.bankDetails).trim()

  const subject = `Tu mensualidad de ${monthLower} · clases de batería`

  if (status === "ATRASADO") {
    const body = isGuardian
      ? `Hola ${recipientFirstName}, ¿cómo estás? Aún no veo registrada la mensualidad de ${monthLower} de ${firstStudentName} y el plazo era el ${deadlineLabel}. Si ya la pagaste, mándame el comprobante y lo dejo al día. Si necesitas ajustar algo, conversemos.`
      : `Hola ${recipientFirstName}, ¿cómo estás? Aún no veo registrada tu mensualidad de ${monthLower} y el plazo era el ${deadlineLabel}. Si ya la pagaste, mándame el comprobante y lo dejo al día. Si necesitas ajustar algo, conversemos.`

    return { subject, body, recipientName: recipientFirstName, isGuardian }
  }

  // Día 1 a 5 (PENDIENTE o recordatorio general de inicio de mes)
  const body = isGuardian
    ? `Hola ${recipientFirstName}, ¡partimos ${monthLower}! Estamos renovando los cupos del mes para las clases de ${firstStudentName}. Te dejo los datos para la mensualidad: ${cleanBank}. Puedes pagar hasta el ${deadlineLabel}. ¡Nos vemos en la clase de esta semana!`
    : `Hola ${recipientFirstName}, ¡partimos ${monthLower}! Estamos renovando los cupos del mes. Te dejo los datos para tu mensualidad: ${cleanBank}. Puedes pagar hasta el ${deadlineLabel}. ¡Nos vemos en la clase de esta semana!`

  return { subject, body, recipientName: recipientFirstName, isGuardian }
}

/**
 * Genera el mensaje para que un alumno (hijo/a) comparta los datos de pago con su papá/mamá/apoderado por WhatsApp.
 */
export function buildShareWithPayerMessage(params: {
  studentName: string
  monthKey: string
  monthlyFee?: number
  bankDetails?: string | null
  graceDay?: number
}): string {
  const monthLower = getMonthNameEs(params.monthKey, false)
  const deadlineLabel = formatDeadlineLabelEs(
    params.monthKey,
    params.graceDay ?? DEFAULT_BILLING_RULES.graceDay
  )
  const feeText =
    params.monthlyFee && params.monthlyFee > 0
      ? `$${Number(params.monthlyFee).toLocaleString("es-CL")} CLP`
      : ""
  const cleanBank = (
    params.bankDetails || DEFAULT_BILLING_RULES.bankDetails
  ).trim()

  return `Hola 👋 Te comparto los datos para la mensualidad de ${monthLower} de las clases de batería con Arnaldo${feeText ? ` (${feeText})` : ""}:\n\n${cleanBank}\n\nPlazo de renovación: hasta el ${deadlineLabel}.`
}
