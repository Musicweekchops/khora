"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Mail,
  MessageCircle,
  PauseCircle,
  PlayCircle,
  Send,
  Settings,
  UserCheck,
  X,
} from "lucide-react"
import {
  buildMonthlyReminderMessages,
  DEFAULT_BILLING_RULES,
  getMonthlyPaymentStatus,
  getMonthNameEs,
  getMonthYearLabelEs,
  getSantiagoTodayStr,
  MonthlyPaymentStatus,
  PaymentRecordInput,
} from "@/lib/billingRules"
import { formatCurrency } from "@/lib/utils"

export interface MonthlyTrackerStudent {
  id: string
  name: string
  email: string
  phone?: string | null
  modalidad?: string | null
  monthly_fee: number
  paused_months?: string[] | null
  billing_contact_name?: string | null
  billing_contact_phone?: string | null
  billing_contact_email?: string | null
  emergency_contact?: string | null
  emergency_phone?: string | null
}

interface MonthlyBillingTrackerProps {
  teacherId: string
  students: MonthlyTrackerStudent[]
  payments: PaymentRecordInput[]
  initialBankDetails?: string | null
  initialBillingDay?: number
  initialGraceDay?: number
  onRefresh: () => void
}

interface ReminderPreviewState {
  student: MonthlyTrackerStudent
  status: MonthlyPaymentStatus
  channel: "WHATSAPP" | "EMAIL"
  recipientName: string
  recipientPhone: string
  recipientEmail: string
  isGuardian: boolean
  subject: string
  body: string
}

const STATUS_PRIORITY: Record<MonthlyPaymentStatus, number> = {
  ATRASADO: 0,
  PENDIENTE: 1,
  AL_DIA: 2,
  EN_PAUSA: 3,
  SIN_ESTADO: 4,
}

export default function MonthlyBillingTracker({
  teacherId,
  students,
  payments,
  initialBankDetails,
  initialBillingDay = DEFAULT_BILLING_RULES.billingDay,
  initialGraceDay = DEFAULT_BILLING_RULES.graceDay,
  onRefresh,
}: MonthlyBillingTrackerProps) {
  const todayStr = getSantiagoTodayStr()
  const currentMonthKey = todayStr.slice(0, 7)

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey)
  const [markingId, setMarkingId] = useState<string | null>(null)
  const [togglingPauseId, setTogglingPauseId] = useState<string | null>(null)
  const [preview, setPreview] = useState<ReminderPreviewState | null>(null)
  const [sendingEmail, setSendingEmail] = useState(false)

  // Configuración de reglas y datos bancarios
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [bankDetails, setBankDetails] = useState<string>(
    initialBankDetails || DEFAULT_BILLING_RULES.bankDetails
  )
  const [billingDay, setBillingDay] = useState<number>(initialBillingDay)
  const [graceDay, setGraceDay] = useState<number>(initialGraceDay)
  const [savingConfig, setSavingConfig] = useState(false)

  // Generar opciones de meses cercanos (2 meses atrás hasta 3 meses adelante, incluyendo enero/febrero)
  const monthOptions = useMemo(() => {
    const [y, m] = currentMonthKey.split("-").map(Number)
    const list: { key: string; label: string }[] = []
    for (let offset = -2; offset <= 3; offset++) {
      const d = new Date(y, m - 1 + offset, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      list.push({ key, label: getMonthYearLabelEs(key) })
    }
    return list
  }, [currentMonthKey])

  // Calcular estado de cada alumno en el mes seleccionado y ordenar: Atrasado y Pendiente arriba
  const enrichedRows = useMemo(() => {
    return students
      .map((s) => {
        const studentPayments = payments.filter((p) => p.student_id === s.id)
        const status = getMonthlyPaymentStatus({
          monthKey: selectedMonth,
          payments: studentPayments,
          pausedMonths: s.paused_months || [],
          todayStr,
          config: { billingDay, graceDay },
        })

        const guardianName = s.billing_contact_name || s.emergency_contact || null
        const guardianPhone = s.billing_contact_phone || s.emergency_phone || null
        const guardianEmail = s.billing_contact_email || null

        return {
          student: s,
          status,
          guardianName,
          guardianPhone,
          guardianEmail,
        }
      })
      .sort((a, b) => {
        const diff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]
        if (diff !== 0) return diff
        return a.student.name.localeCompare(b.student.name)
      })
  }, [students, payments, selectedMonth, todayStr, billingDay, graceDay])

  const counts = useMemo(() => {
    return enrichedRows.reduce(
      (acc, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1
        return acc
      },
      {
        ATRASADO: 0,
        PENDIENTE: 0,
        AL_DIA: 0,
        EN_PAUSA: 0,
        SIN_ESTADO: 0,
      } as Record<MonthlyPaymentStatus, number>
    )
  }, [enrichedRows])

  // Marcar pagado de 1 clic (guarda fecha de hoy, monto y billing_month)
  const handleQuickMarkPaid = async (s: MonthlyTrackerStudent) => {
    setMarkingId(s.id)
    try {
      const amountToSave = s.monthly_fee > 0 ? s.monthly_fee : 90000
      const monthNameCap = getMonthNameEs(selectedMonth, true)

      const { error } = await supabase.from("Payment").insert({
        student_id: s.id,
        teacher_id: teacherId,
        amount: amountToSave,
        date: todayStr,
        billing_month: selectedMonth,
        method: "TRANSFER",
        notes: `Mensualidad ${monthNameCap}`,
      })

      if (error) throw error

      toast.success(
        `${s.name} marcado Al día en ${getMonthYearLabelEs(selectedMonth)} (${formatCurrency(amountToSave)})`
      )
      onRefresh()
    } catch (err: any) {
      toast.error(err?.message || "No se pudo registrar el pago")
    } finally {
      setMarkingId(null)
    }
  }

  // Alternar estado "En pausa" para ese mes en el alumno (ej. enero / febrero)
  const handleTogglePauseMonth = async (s: MonthlyTrackerStudent) => {
    setTogglingPauseId(s.id)
    try {
      const currentPaused = Array.isArray(s.paused_months) ? s.paused_months : []
      const isPaused = currentPaused.includes(selectedMonth)
      const nextPaused = isPaused
        ? currentPaused.filter((m) => m !== selectedMonth)
        : [...currentPaused, selectedMonth]

      const { error } = await supabase
        .from("StudentProfile")
        .update({ paused_months: nextPaused })
        .eq("id", s.id)

      if (error) throw error

      toast.success(
        isPaused
          ? `Se reactivó ${getMonthNameEs(selectedMonth)} para ${s.name}`
          : `${s.name} quedó En pausa durante ${getMonthNameEs(selectedMonth)}`
      )
      onRefresh()
    } catch (err: any) {
      toast.error(err?.message || "No se pudo actualizar el mes en pausa")
    } finally {
      setTogglingPauseId(null)
    }
  }

  // Abrir vista previa de recordatorio (WhatsApp o Correo) para que el profesor revise y confirme
  const openReminderPreview = (
    row: (typeof enrichedRows)[number],
    channel: "WHATSAPP" | "EMAIL"
  ) => {
    const { student, status, guardianName, guardianPhone, guardianEmail } = row
    const msg = buildMonthlyReminderMessages({
      studentName: student.name,
      billingContactName: guardianName,
      monthKey: selectedMonth,
      status,
      bankDetails,
      graceDay,
    })

    const targetPhone = (guardianPhone || student.phone || "").replace(/\D/g, "")
    const targetEmail = guardianEmail || student.email || ""

    setPreview({
      student,
      status,
      channel,
      recipientName: msg.recipientName,
      recipientPhone: targetPhone,
      recipientEmail: targetEmail,
      isGuardian: msg.isGuardian,
      subject: msg.subject,
      body: msg.body,
    })
  }

  const handleConfirmSendWhatsApp = () => {
    if (!preview) return
    const cleanPhone = preview.recipientPhone.replace(/\D/g, "")
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(preview.body)}`
      : `https://wa.me/?text=${encodeURIComponent(preview.body)}`
    window.open(waUrl, "_blank", "noopener,noreferrer")
    setPreview(null)
  }

  const handleConfirmSendEmail = async () => {
    if (!preview) return
    if (!preview.recipientEmail || !preview.recipientEmail.includes("@")) {
      toast.error("El destinatario no tiene un correo válido configurado")
      return
    }
    setSendingEmail(true)
    try {
      const htmlBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 20px; color: #171717;">
          <p style="font-size: 15px; line-height: 1.6; white-space: pre-line; margin: 0;">${preview.body}</p>
          <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 24px 0;" />
          <p style="font-size: 12px; color: #737373; margin: 0;">Clases de Batería · Khora</p>
        </div>
      `
      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: preview.recipientEmail,
          subject: preview.subject,
          customHtml: htmlBody,
        },
      })
      if (error) throw error
      toast.success(`Correo enviado a ${preview.recipientEmail}`)
      setPreview(null)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo enviar el correo")
    } finally {
      setSendingEmail(false)
    }
  }

  const handleSaveRulesConfig = async () => {
    setSavingConfig(true)
    try {
      const { error } = await supabase.from("TeacherBillingConfig").upsert(
        {
          teacher_id: teacherId,
          bank_details: bankDetails.trim(),
          billing_day: Number(billingDay) || 1,
          grace_day: Number(graceDay) || 5,
        },
        { onConflict: "teacher_id" }
      )
      if (error) throw error
      toast.success("Configuración de mensualidad y datos bancarios guardada")
      setShowConfigModal(false)
      onRefresh()
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar configuración")
    } finally {
      setSavingConfig(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
      {/* Cabecera del seguimiento de inicio de mes */}
      <div className="p-6 border-b border-neutral-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-violet-50/50 via-white to-amber-50/30">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-5 bg-violet-600 rounded-full" />
            <h3 className="font-black text-neutral-900 text-lg">
              Estado de Mensualidades · {getMonthYearLabelEs(selectedMonth)}
            </h3>
            <span className="text-[11px] font-bold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full">
              Cobro día {billingDay} · Plazo hasta el día {graceDay}
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-medium mt-1">
            Atrasados y pendientes aparecen primero. Marca pagado en 1 clic o revisa el recordatorio antes de enviar.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-white text-xs font-black text-neutral-800 outline-none focus:border-violet-500"
          >
            {monthOptions.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="px-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-neutral-500" />
            <span>Datos bancarios y plazos</span>
          </button>
        </div>
      </div>

      {/* Resumen rápido de estados del mes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-neutral-100 divide-x divide-neutral-100 bg-neutral-50/50 text-center">
        <div className="p-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">
            Atrasados (&gt; día {graceDay})
          </span>
          <span className="text-lg font-black text-red-700">{counts.ATRASADO}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 block">
            Pendientes (día 1–{graceDay})
          </span>
          <span className="text-lg font-black text-amber-700">{counts.PENDIENTE}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">
            Al día
          </span>
          <span className="text-lg font-black text-emerald-700">{counts.AL_DIA}</span>
        </div>
        <div className="p-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            En pausa
          </span>
          <span className="text-lg font-black text-slate-700">{counts.EN_PAUSA}</span>
        </div>
      </div>

      {/* Lista de alumnos */}
      {enrichedRows.length === 0 ? (
        <div className="p-10 text-center text-sm text-neutral-400 font-bold">
          No hay alumnos activos registrados.
        </div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {enrichedRows.map((row) => {
            const { student, status, guardianName } = row
            const isMarking = markingId === student.id
            const isTogglingPause = togglingPauseId === student.id

            return (
              <div
                key={student.id}
                className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/60 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 ${
                      status === "ATRASADO"
                        ? "bg-red-100 text-red-700"
                        : status === "PENDIENTE"
                        ? "bg-amber-100 text-amber-800"
                        : status === "AL_DIA"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {student.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/dashboard/alumnos/detalles?id=${student.id}`}
                        className="font-bold text-neutral-900 hover:text-violet-600 transition-colors text-sm truncate"
                      >
                        {student.name}
                      </Link>

                      {/* Badge de Estado */}
                      {status === "ATRASADO" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-200 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Atrasado
                        </span>
                      )}
                      {status === "PENDIENTE" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                      {status === "AL_DIA" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Al día
                        </span>
                      )}
                      {status === "EN_PAUSA" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          <PauseCircle className="w-3 h-3" /> En pausa
                        </span>
                      )}
                      {status === "SIN_ESTADO" && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-500">
                          Sin estado
                        </span>
                      )}

                      {guardianName && (
                        <span
                          title={`Responsable de pago: ${guardianName}`}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-1"
                        >
                          <UserCheck className="w-3 h-3" /> Paga: {guardianName}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
                      <span>
                        Mensualidad:{" "}
                        <strong className="text-neutral-700">
                          {student.monthly_fee > 0
                            ? formatCurrency(student.monthly_fee)
                            : "$90.000"}
                        </strong>
                      </span>
                      <span>·</span>
                      <span>
                        {student.modalidad === "online" ? "💻 Virtual" : "🏠 Presencial"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción del profesor */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {status !== "AL_DIA" && status !== "EN_PAUSA" && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleQuickMarkPaid(student)}
                        disabled={isMarking}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{isMarking ? "Guardando..." : "Marcar pagado"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openReminderPreview(row, "WHATSAPP")}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Revisar y enviar recordatorio por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openReminderPreview(row, "EMAIL")}
                        className="px-3 py-2 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-xs font-bold transition-all flex items-center gap-1.5"
                        title="Revisar y enviar recordatorio por correo"
                      >
                        <Mail className="w-3.5 h-3.5 text-violet-600" />
                        <span>Correo</span>
                      </button>
                    </>
                  )}

                  {/* Botón para pausar o reactivar el mes (ej. enero / febrero) */}
                  <button
                    type="button"
                    onClick={() => handleTogglePauseMonth(student)}
                    disabled={isTogglingPause}
                    className="px-2.5 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-600 text-[11px] font-bold transition-colors flex items-center gap-1"
                    title={
                      status === "EN_PAUSA"
                        ? "Reactivar cobro en este mes"
                        : "Marcar mes en pausa (sin cobro)"
                    }
                  >
                    {status === "EN_PAUSA" ? (
                      <>
                        <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reactivar mes</span>
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Pausar mes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL DE CONFIRMACIÓN Y REVISIÓN DE RECORDATORIO ANTES DE ENVIAR */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-7 shadow-2xl border border-neutral-100 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">
                  {preview.status === "ATRASADO"
                    ? "Recordatorio día 6+ (Atrasado)"
                    : "Recordatorio inicio de mes (Día 1–5)"}
                </span>
                <h3 className="text-lg font-black text-neutral-900 mt-0.5">
                  Revisar mensaje para {preview.recipientName}
                  {preview.isGuardian ? ` (Apoderado de ${preview.student.name})` : ""}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {preview.channel === "EMAIL" && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-neutral-500">
                  Para: {preview.recipientEmail || "Sin correo"} · Asunto:
                </label>
                <input
                  type="text"
                  value={preview.subject}
                  onChange={(e) =>
                    setPreview({ ...preview, subject: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-900"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-500">
                Mensaje (puedes editarlo antes de enviar):
              </label>
              <textarea
                rows={6}
                value={preview.body}
                onChange={(e) => setPreview({ ...preview, body: e.target.value })}
                className="w-full p-3.5 rounded-2xl border border-neutral-200 text-xs text-neutral-800 leading-relaxed focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="flex-1 py-3 rounded-2xl bg-neutral-100 text-neutral-700 text-xs font-bold"
              >
                Cancelar
              </button>

              {preview.channel === "WHATSAPP" ? (
                <button
                  type="button"
                  onClick={handleConfirmSendWhatsApp}
                  className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Abrir WhatsApp y Enviar</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmSendEmail}
                  disabled={sendingEmail}
                  className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{sendingEmail ? "Enviando..." : "Confirmar y Enviar Correo"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE AJUSTES DE REGLAS Y DATOS BANCARIOS */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-7 shadow-2xl border border-neutral-100 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-neutral-900">
                Reglas de Mensualidad y Datos Bancarios
              </h3>
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                  Día de inicio de cobro
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={billingDay}
                  onChange={(e) => setBillingDay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                  Plazo de pago (día límite)
                </label>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={graceDay}
                  onChange={(e) => setGraceDay(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-neutral-600 block mb-1">
                Datos de transferencia bancaria (se incluyen en recordatorios y panel del alumno)
              </label>
              <textarea
                rows={4}
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder="Ej: Banco de Chile · Cuenta Corriente 12-345-678 · RUT 12.345.678-9 · Nombre · correo@ejemplo.cl"
                className="w-full p-3 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-800"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRulesConfig}
                disabled={savingConfig}
                className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-violet-600 text-white text-xs font-black"
              >
                {savingConfig ? "Guardando..." : "Guardar Ajustes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
