"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import {
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  PauseCircle,
  RefreshCw,
  Share2,
  Upload,
  X,
} from "lucide-react"
import { toast } from "sonner"
import {
  buildShareWithPayerMessage,
  DEFAULT_BILLING_RULES,
  formatDeadlineLabelEs,
  getMonthNameEs,
  getNextMonthKey,
  MonthlyPaymentStatus,
} from "@/lib/billingRules"
import {
  formatSpanishShortDate,
  PendingRecoveryItem,
  StudentMonthSessionsSummary,
} from "@/lib/classCounter"
import ReceiptUploader, { ParsedReceiptData } from "@/components/ui/ReceiptUploader"

interface StudentMonthlyPlanCardProps {
  studentId: string
  teacherId: string | null
  studentName: string
  monthKey: string // YYYY-MM actual
  paymentStatus: MonthlyPaymentStatus
  monthlyFee: number
  bankDetails?: string | null
  billingDay?: number
  graceDay?: number
  summary: StudentMonthSessionsSummary
  gatewayEnabled?: boolean
  onPayGateway?: () => void
  payingGateway?: boolean
  onPaymentRegistered?: () => void
}

export default function StudentMonthlyPlanCard({
  studentId,
  teacherId,
  studentName,
  monthKey,
  paymentStatus,
  monthlyFee,
  bankDetails,
  billingDay = DEFAULT_BILLING_RULES.billingDay,
  graceDay = DEFAULT_BILLING_RULES.graceDay,
  summary,
  gatewayEnabled = false,
  onPayGateway,
  payingGateway = false,
  onPaymentRegistered,
}: StudentMonthlyPlanCardProps) {
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showReceiptForm, setShowReceiptForm] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [transferId, setTransferId] = useState<string | null>(null)
  const [paidAmount, setPaidAmount] = useState<string>(
    monthlyFee > 0 ? String(monthlyFee) : ""
  )
  const [paymentNotes, setPaymentNotes] = useState<string>("")
  const [submittingReceipt, setSubmittingReceipt] = useState(false)

  const monthNameCapitalized = getMonthNameEs(monthKey, true)
  const monthNameLower = getMonthNameEs(monthKey, false)
  const nextMonthKey = getNextMonthKey(monthKey)
  const nextMonthNameLower = getMonthNameEs(nextMonthKey, false)
  const deadlineThisMonth = formatDeadlineLabelEs(monthKey, graceDay)
  const deadlineNextMonth = formatDeadlineLabelEs(nextMonthKey, graceDay)

  const cleanBankDetails = (
    bankDetails || DEFAULT_BILLING_RULES.bankDetails
  ).trim()

  const handleCopyBankDetails = async () => {
    try {
      await navigator.clipboard.writeText(cleanBankDetails)
      toast.success("Datos de transferencia copiados al portapapeles")
    } catch {
      toast.error("No se pudo copiar automáticamente")
    }
  }

  const handleShareWithGuardian = () => {
    const text = buildShareWithPayerMessage({
      studentName,
      monthKey,
      monthlyFee,
      bankDetails: cleanBankDetails,
      graceDay,
    })
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleReceiptParsed = (data: ParsedReceiptData) => {
    if (data.receiptUrl) setReceiptUrl(data.receiptUrl)
    if (data.transferId) setTransferId(data.transferId)
    if (data.amount && data.amount > 0) setPaidAmount(String(data.amount))
    if (data.notes) setPaymentNotes(data.notes)
  }

  const handleSubmitReceiptPayment = async () => {
    if (!teacherId) {
      toast.error("No se encontró el profesor asignado")
      return
    }
    const numericAmount = Number(paidAmount) || monthlyFee || 0
    if (numericAmount <= 0) {
      toast.error("Ingresa el monto transferido")
      return
    }

    setSubmittingReceipt(true)
    try {
      const todayIso = new Date().toISOString().split("T")[0]
      const { error } = await supabase.from("Payment").insert({
        student_id: studentId,
        teacher_id: teacherId,
        amount: numericAmount,
        date: todayIso,
        billing_month: monthKey,
        method: "TRANSFER",
        notes:
          paymentNotes.trim() ||
          `Mensualidad ${monthNameCapitalized} (informado por alumno/apoderado)`,
        receipt_url: receiptUrl,
        transfer_id: transferId,
      })

      if (error) throw error

      toast.success(`¡Pago de ${monthNameLower} registrado! Gracias.`)
      setShowReceiptForm(false)
      setShowTransferModal(false)
      if (onPaymentRegistered) onPaymentRegistered()
    } catch (err: any) {
      toast.error(err?.message || "No se pudo registrar el comprobante")
    } finally {
      setSubmittingReceipt(false)
    }
  }

  const isPendingOrOverdue =
    paymentStatus === "PENDIENTE" || paymentStatus === "ATRASADO"

  // Agrupar meses de origen de las clases pendientes por recuperar
  const recoveryOriginMonths = Array.from(
    new Set(summary.pendingRecoveries.map((r) => r.originMonthName))
  ).join(", ")

  return (
    <div className="space-y-4">
      {/* TARJETA PRINCIPAL DE MENSUALIDAD Y SESIONES DEL MES */}
      <div className="bg-white rounded-3xl md:rounded-[36px] border border-neutral-100 p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Seguimiento Mensual
            </span>
            <h3 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight">
              Tu mensualidad: {summary.monthYearLabel}
            </h3>
          </div>

          {/* Estado discreto y amigable */}
          <div>
            {paymentStatus === "AL_DIA" && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Estado: Al día
              </span>
            )}
            {paymentStatus === "EN_PAUSA" && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-slate-100 text-slate-700 border border-slate-200">
                <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
                Estado: En pausa
              </span>
            )}
            {isPendingOrOverdue && (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Mensualidad de {monthNameLower}: pago pendiente
              </span>
            )}
          </div>
        </div>

        {/* Resumen de sesiones del mes calendario */}
        <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 md:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs md:text-sm font-bold text-neutral-800">
              Sesiones de {monthNameLower}:{" "}
              <span className="text-violet-700 font-black">
                {summary.completedCount}{" "}
                {summary.completedCount === 1 ? "realizada" : "realizadas"}
              </span>{" "}
              ·{" "}
              <span className="text-neutral-900 font-black">
                {summary.upcomingCount} por venir
              </span>
            </p>

            {/* Puntos visuales de progreso de sesiones del mes */}
            {summary.totalSessions > 0 && (
              <div className="flex items-center gap-1.5">
                {summary.sessions.map((s, idx) => {
                  const isDone = idx < summary.completedCount
                  return (
                    <span
                      key={s.item.id}
                      title={`${s.counterLabel} (${formatSpanishShortDate(s.item.date)})`}
                      className={`w-3 h-3 rounded-full transition-all ${
                        isDone
                          ? "bg-violet-600 shadow-sm shadow-violet-500/30"
                          : "bg-neutral-200 border border-neutral-300"
                      }`}
                    />
                  )
                })}
              </div>
            )}
          </div>

          {/* Lista compacta de las sesiones de este mes con su nueva etiqueta */}
          {summary.sessions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {summary.sessions.map((s, idx) => {
                const isDone = idx < summary.completedCount
                return (
                  <span
                    key={s.item.id}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center gap-1.5 ${
                      isDone
                        ? "bg-white text-neutral-700 border-neutral-200"
                        : "bg-violet-50/70 text-violet-900 border-violet-200"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isDone ? "bg-emerald-500" : "bg-violet-500"
                      }`}
                    />
                    <span>{s.counterLabel}</span>
                    <span className="text-neutral-400 font-medium">
                      ({new Date(s.item.date + "T12:00").toLocaleDateString("es-CL", { day: "numeric", month: "short" })})
                    </span>
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Pie de tarjeta: información de renovación y botón discreto para datos / apoderado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-neutral-100">
          <div className="text-xs text-neutral-500 font-medium">
            {paymentStatus === "EN_PAUSA" ? (
              <span>
                Mes configurado en pausa sin cobro. Tu cupo se retoma al finalizar la pausa.
              </span>
            ) : isPendingOrOverdue ? (
              <span>
                Mensualidad de <strong className="text-neutral-800">{monthNameLower}</strong>: pago pendiente · Plazo de pago hasta el{" "}
                <strong className="text-neutral-800">{deadlineThisMonth}</strong>.
              </span>
            ) : (
              <span>
                Renueva el <strong className="text-neutral-800">{billingDay} de {nextMonthNameLower}</strong> · plazo de pago hasta el{" "}
                <strong className="text-neutral-800">{deadlineNextMonth}</strong>.
              </span>
            )}
          </div>

          {paymentStatus !== "EN_PAUSA" && (
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowTransferModal(true)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  isPendingOrOverdue
                    ? "bg-neutral-900 text-white hover:bg-violet-600 shadow-sm"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Ver datos de transferencia</span>
              </button>

              {gatewayEnabled && isPendingOrOverdue && onPayGateway && (
                <button
                  type="button"
                  onClick={onPayGateway}
                  disabled={payingGateway}
                  className="px-4 py-2 rounded-xl text-xs font-black bg-violet-600 hover:bg-violet-700 text-white transition-all flex items-center gap-1.5"
                >
                  <span>{payingGateway ? "Conectando..." : "Pagar online"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CAJA APARTE: CLASES PENDIENTES POR COORDINAR (RECUPERACIONES) */}
      {summary.pendingRecoveries.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-5 md:p-6 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm md:text-base font-black text-amber-950">
                  Tienes {summary.pendingRecoveries.length}{" "}
                  {summary.pendingRecoveries.length === 1
                    ? "clase pendiente"
                    : "clases pendientes"}{" "}
                  por coordinar ({recoveryOriginMonths})
                </h4>
                <p className="text-xs text-amber-800/80 font-medium">
                  Estas sesiones son independientes de las clases regulares de tu mes actual.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-2 pt-1">
            {summary.pendingRecoveries.map((rec: PendingRecoveryItem) => (
              <div
                key={rec.item.id}
                className="bg-white/90 border border-amber-200/70 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 font-black">
                    Origen: {formatSpanishShortDate(rec.originDate)} ({rec.originMonthName})
                  </span>
                  <span className="font-semibold text-neutral-700">
                    {rec.reasonLabel}
                  </span>
                </div>

                <div className="text-[11px] font-bold text-amber-900">
                  {rec.expiresAt ? (
                    <span>Plazo para recuperar: hasta el {formatSpanishShortDate(rec.expiresAt)}</span>
                  ) : (
                    <span className="text-emerald-700">✓ Sin fecha de vencimiento</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL NO INVASIVO: DATOS DE TRANSFERENCIA / COMPARTIR CON APODERADO / SUBIR COMPROBANTE */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-7 shadow-2xl border border-neutral-100 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">
                  Mensualidad · {summary.monthYearLabel}
                </span>
                <h3 className="text-lg font-black text-neutral-900 mt-0.5">
                  Datos de transferencia
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowTransferModal(false)
                  setShowReceiptForm(false)
                }}
                className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!showReceiptForm ? (
              <>
                <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400">
                      Cuenta para transferencia
                    </span>
                    {monthlyFee > 0 && (
                      <span className="text-xs font-black text-neutral-900">
                        ${monthlyFee.toLocaleString("es-CL")} CLP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-800 whitespace-pre-line font-mono leading-relaxed">
                    {cleanBankDetails}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleCopyBankDetails}
                    className="w-full py-3 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black flex items-center justify-center gap-2 transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copiar datos bancarios</span>
                  </button>

                  {/* Pensado para alumnos cuyos padres/apoderados gestionan el pago */}
                  <button
                    type="button"
                    onClick={handleShareWithGuardian}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black flex items-center justify-center gap-2 transition-all"
                  >
                    <Share2 className="w-4 h-4 text-emerald-600" />
                    <span>Enviar datos a quien gestiona el pago (WhatsApp)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReceiptForm(true)}
                    className="w-full py-3 px-4 rounded-2xl bg-violet-50 hover:bg-violet-100 text-violet-800 border border-violet-200 text-xs font-black flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload className="w-4 h-4 text-violet-600" />
                    <span>Ya transferí · Subir comprobante</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <ReceiptUploader
                  onParsedData={handleReceiptParsed}
                  currentReceiptUrl={receiptUrl}
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-neutral-600">
                    Monto transferido (CLP)
                  </label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-900"
                    placeholder="Ej: 90000"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReceiptForm(false)}
                    className="flex-1 py-2.5 rounded-xl bg-neutral-100 text-neutral-700 text-xs font-bold"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmitReceiptPayment}
                    disabled={submittingReceipt}
                    className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-black disabled:opacity-50"
                  >
                    {submittingReceipt ? "Guardando..." : "Confirmar Comprobante"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
