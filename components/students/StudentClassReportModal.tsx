"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { formatCurrency, formatDate } from "@/lib/utils"
import { calculateClassCounters, formatSpanishShortDate } from "@/lib/classCounter"
import { toast } from "sonner"
import { 
  X, 
  Printer, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CreditCard, 
  Calendar,
  FileText,
  RefreshCw,
  Sparkles
} from "lucide-react"

interface StudentClassReportModalProps {
  studentId: string
  isOpen: boolean
  onClose: () => void
}

export default function StudentClassReportModal({
  studentId,
  isOpen,
  onClose
}: StudentClassReportModalProps) {
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [enrichedClassesMap, setEnrichedClassesMap] = useState<Map<string, any>>(new Map())

  useEffect(() => {
    if (isOpen && studentId) {
      loadReportData()
    }
  }, [isOpen, studentId])

  async function loadReportData() {
    setLoading(true)
    try {
      // 1. Cargar Perfil de Alumno
      const { data: sp, error: spErr } = await supabase
        .from("StudentProfile")
        .select("*, User(name, email, phone)")
        .eq("id", studentId)
        .single()

      if (spErr) throw spErr
      setStudent(sp)

      // 2. Cargar Pagos
      const { data: py } = await supabase
        .from("Payment")
        .select("*")
        .eq("student_id", studentId)
        .order("date", { ascending: false })

      setPayments(py || [])

      // 3. Cargar Clases
      const { data: cl } = await supabase
        .from("Class")
        .select("*, ClassNote(content, created_at)")
        .eq("student_id", studentId)
        .order("date", { ascending: false })

      const rawClasses = cl || []
      setClasses(rawClasses)

      // 4. Calcular contadores Clase X/Z
      const countersMap = calculateClassCounters(rawClasses)
      setEnrichedClassesMap(countersMap)

    } catch (err: any) {
      console.error("[ReportModal] Error loading report data:", err)
      toast.error("Error al cargar los datos del reporte")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // Métricas financieras y de clases
  const totalPaidAmount = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0)
  const totalClassesPaid = payments.reduce((acc, p) => acc + Number(p.classes_included || 1), 0)
  
  const completedClasses = classes.filter(c => c.status === "COMPLETED")
  const scheduledClasses = classes.filter(c => c.status === "SCHEDULED" || c.status === "CONFIRMED")
  const recoveryPendingClasses = classes.filter(c => c.is_recovery_pending)
  const recoveryTakenClasses = classes.filter(c => c.is_recovery || c.original_class_date)

  const classesUsedCount = completedClasses.length + scheduledClasses.length
  const balanceClasses = totalClassesPaid - classesUsedCount

  const getBalanceStatus = () => {
    if (balanceClasses > 0) return { label: `${balanceClasses} clase(s) a favor`, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" }
    if (balanceClasses === 0) return { label: "Al día (0 clases pendientes)", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" }
    return { label: `Deuda de ${Math.abs(balanceClasses)} clase(s)`, color: "text-amber-400 bg-amber-500/10 border-amber-500/30" }
  }

  const balanceBadge = getBalanceStatus()

  // Generar texto para WhatsApp
  const handleCopyWhatsApp = () => {
    const today = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" })
    
    let text = `📊 *REPORTE DE CLASES Y PAGOS — KHORA ACADEMY*\n`
    text += `👤 *Alumno/a:* ${student?.User?.name || "Alumno"}\n`
    text += `📅 *Fecha:* ${today}\n\n`

    text += `💵 *RESUMEN DE ESTADO:*
• Total Abonado: ${formatCurrency(totalPaidAmount)} CLP
• Clases Contratadas/Pagadas: ${totalClassesPaid}
• Clases Realizadas: ${completedClasses.length}
• Clases Programadas: ${scheduledClasses.length}
• Clases Pendientes por Recuperar: ${recoveryPendingClasses.length}
📌 *BALANCE:* ${balanceBadge.label}\n\n`

    text += `💳 *DETALLE DE PAGOS (${payments.length}):*\n`
    if (payments.length === 0) {
      text += `• Sin pagos registrados a la fecha.\n`
    } else {
      payments.forEach((p, idx) => {
        const pDate = formatSpanishShortDate(p.date)
        text += `${idx + 1}. ${pDate} — ${formatCurrency(Number(p.amount))} (${p.classes_included || 1} clase/s) [${p.method || 'Transferencia'}]\n`
      })
    }
    text += `\n`

    text += `🎵 *DETALLE DE CLASES:* \n`
    if (classes.length === 0) {
      text += `• Sin clases registradas.\n`
    } else {
      // Ordenar cronológicamente para el reporte
      const sortedClasses = [...classes].sort((a, b) => a.date.localeCompare(b.date))
      sortedClasses.forEach((c) => {
        const enriched = enrichedClassesMap.get(c.id)
        const counter = enriched?.counterLabel || "Clase"
        const cDate = formatSpanishShortDate(c.date)
        const time = (c.start_time || "").slice(0, 5)
        let statusStr = c.status === "COMPLETED" ? "Realizada" : c.status === "CONFIRMED" ? "Confirmada" : c.status === "SCHEDULED" ? "Programada" : c.status

        let recoveryText = ""
        if (c.is_recovery || c.original_class_date) {
          recoveryText = ` 🔄 (Recuperación del día ${formatSpanishShortDate(c.original_class_date)})`
        } else if (c.is_recovery_pending) {
          recoveryText = ` ⚠️ (Pendiente por recuperar)`
        }

        text += `• ${counter} — ${cDate} ${time} [${statusStr}]${recoveryText}\n`
      })
    }

    text += `\n¡Cualquier duda sobre las fechas o el estado nos escribes directamente por aquí! 🎶`

    navigator.clipboard.writeText(text)
    toast.success("¡Reporte copiado al portapapeles para WhatsApp!")
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Header (Oculto al imprimir) */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Reporte Detallado de Clases vs. Pagos</h2>
              <p className="text-xs text-zinc-400">Historial completo, estado de recuperaciones y balance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyWhatsApp}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition"
              title="Copiar texto listo para enviar por WhatsApp"
            >
              <Copy className="w-4 h-4" />
              Copiar para WhatsApp
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition"
              title="Imprimir o guardar como PDF"
            >
              <Printer className="w-4 h-4" />
              Imprimir / PDF
            </button>

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Imprimible & Contenido Modal */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          
          {/* Membrete de impresión */}
          <div className="hidden print:block mb-6 border-b pb-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-black">Khora Music Academy</h1>
                <p className="text-sm text-gray-600">Reporte Control de Clases & Pagos por Alumno</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Fecha de emisión: {new Date().toLocaleDateString("es-CL")}</p>
              </div>
            </div>
          </div>

          {/* Ficha Alumno */}
          <div className="bg-zinc-800/40 print:bg-gray-50 border border-zinc-800 print:border-gray-300 rounded-xl p-4 flex flex-wrap justify-between items-center gap-4">
            <div>
              <span className="text-xs text-zinc-400 print:text-gray-500 uppercase tracking-wider font-semibold">Alumno/a</span>
              <h3 className="text-lg font-bold text-white print:text-black">{student?.User?.name || "Cargando..."}</h3>
              <p className="text-xs text-zinc-400 print:text-gray-600">{student?.User?.email} {student?.User?.phone ? `• ${student.User.phone}` : ""}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl border text-sm font-semibold ${balanceBadge.color} print:border-gray-400 print:text-black`}>
                {balanceBadge.label}
              </div>
            </div>
          </div>

          {/* Tarjetas Métricas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="bg-zinc-950/60 print:bg-gray-100 border border-zinc-800 print:border-gray-300 rounded-xl p-3">
              <div className="flex items-center justify-between text-zinc-400 print:text-gray-600 mb-1">
                <span className="text-xs font-medium">Abonado Total</span>
                <CreditCard className="w-4 h-4 text-purple-400 print:text-purple-700" />
              </div>
              <p className="text-lg font-bold text-white print:text-black">{formatCurrency(totalPaidAmount)}</p>
              <span className="text-[10px] text-zinc-500 print:text-gray-500">{totalClassesPaid} clases pagadas</span>
            </div>

            <div className="bg-zinc-950/60 print:bg-gray-100 border border-zinc-800 print:border-gray-300 rounded-xl p-3">
              <div className="flex items-center justify-between text-zinc-400 print:text-gray-600 mb-1">
                <span className="text-xs font-medium">Realizadas</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
              </div>
              <p className="text-lg font-bold text-emerald-400 print:text-emerald-700">{completedClasses.length}</p>
              <span className="text-[10px] text-zinc-500 print:text-gray-500">Clases impartidas</span>
            </div>

            <div className="bg-zinc-950/60 print:bg-gray-100 border border-zinc-800 print:border-gray-300 rounded-xl p-3">
              <div className="flex items-center justify-between text-zinc-400 print:text-gray-600 mb-1">
                <span className="text-xs font-medium">Programadas</span>
                <Clock className="w-4 h-4 text-blue-400 print:text-blue-700" />
              </div>
              <p className="text-lg font-bold text-blue-400 print:text-blue-700">{scheduledClasses.length}</p>
              <span className="text-[10px] text-zinc-500 print:text-gray-500">Horario agendado</span>
            </div>

            <div className="bg-zinc-950/60 print:bg-gray-100 border border-zinc-800 print:border-gray-300 rounded-xl p-3">
              <div className="flex items-center justify-between text-zinc-400 print:text-gray-600 mb-1">
                <span className="text-xs font-medium">Recuperaciones</span>
                <RefreshCw className="w-4 h-4 text-amber-400 print:text-amber-700" />
              </div>
              <p className="text-lg font-bold text-amber-400 print:text-amber-700">{recoveryTakenClasses.length}</p>
              <span className="text-[10px] text-amber-400/80 print:text-amber-800 font-medium">
                {recoveryPendingClasses.length > 0 ? `${recoveryPendingClasses.length} pend. recuperar` : "Al día"}
              </span>
            </div>
          </div>

          {/* Tabla de Pagos */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-purple-400 print:text-black" />
              <h4 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">Historial de Pagos Registrados</h4>
            </div>

            <div className="border border-zinc-800 print:border-gray-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 print:bg-gray-200 text-zinc-400 print:text-gray-700 font-semibold border-b border-zinc-800 print:border-gray-300">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Método</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Clases Incluidas</th>
                    <th className="p-3">Notas / Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 print:divide-gray-200 text-zinc-300 print:text-black">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-zinc-500">No hay pagos registrados.</td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.id} className="hover:bg-zinc-800/30 print:hover:bg-transparent">
                        <td className="p-3 font-medium">{formatSpanishShortDate(p.date)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/10 text-purple-300 print:bg-transparent print:text-black border border-purple-500/20 print:border-none font-medium">
                            {p.method || 'TRANSFER'}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-white print:text-black">{formatCurrency(Number(p.amount))}</td>
                        <td className="p-3">{p.classes_included || 1} clase(s)</td>
                        <td className="p-3 text-zinc-400 print:text-gray-600 truncate max-w-[200px]">{p.notes || p.transfer_id || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tabla de Clases */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-blue-400 print:text-black" />
              <h4 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">Historial de Clases y Recuperaciones</h4>
            </div>

            <div className="border border-zinc-800 print:border-gray-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950 print:bg-gray-200 text-zinc-400 print:text-gray-700 font-semibold border-b border-zinc-800 print:border-gray-300">
                  <tr>
                    <th className="p-3">Contador</th>
                    <th className="p-3">Fecha y Hora</th>
                    <th className="p-3">Estado</th>
                    <th className="p-3">Detalle / Recuperación</th>
                    <th className="p-3">Bitácora / Notas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 print:divide-gray-200 text-zinc-300 print:text-black">
                  {classes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-zinc-500">No hay clases registradas.</td>
                    </tr>
                  ) : (
                    classes.map((c) => {
                      const enriched = enrichedClassesMap.get(c.id)
                      const counter = enriched?.counterLabel || "Clase"
                      const isRecovery = c.is_recovery || Boolean(c.original_class_date)
                      const hasNotes = c.ClassNote && c.ClassNote.length > 0

                      return (
                        <tr key={c.id} className="hover:bg-zinc-800/30 print:hover:bg-transparent">
                          <td className="p-3 font-bold text-purple-400 print:text-black">{counter}</td>
                          <td className="p-3 font-medium">
                            {formatSpanishShortDate(c.date)} • {(c.start_time || "").slice(0, 5)}
                          </td>
                          <td className="p-3">
                            {c.status === "COMPLETED" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 print:bg-transparent print:text-black border border-emerald-500/20 print:border-none font-semibold">
                                Realizada
                              </span>
                            )}
                            {(c.status === "SCHEDULED" || c.status === "CONFIRMED") && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-400 print:bg-transparent print:text-black border border-blue-500/20 print:border-none font-semibold">
                                Programada
                              </span>
                            )}
                            {c.status === "CANCELLED" && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/10 text-red-400 print:bg-transparent print:text-black border border-red-500/20 print:border-none font-semibold">
                                Cancelada
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            {isRecovery ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-500/15 text-amber-300 print:bg-transparent print:text-black border border-amber-500/30 print:border-none">
                                <RefreshCw className="w-3 h-3 text-amber-400 print:text-black shrink-0" />
                                Recuperación del día {formatSpanishShortDate(c.original_class_date)}
                              </span>
                            ) : c.is_recovery_pending ? (
                              <span className="text-amber-400 text-[11px] font-medium">⚠️ Pendiente por recuperar</span>
                            ) : (
                              <span className="text-zinc-500 print:text-gray-500">Regular</span>
                            )}
                          </td>
                          <td className="p-3 text-zinc-400 print:text-gray-600 max-w-[220px]">
                            {hasNotes ? (
                              <div className="truncate text-[11px]" title={c.ClassNote[0].content}>
                                📝 {c.ClassNote[0].content}
                              </div>
                            ) : (
                              <span className="text-zinc-600 print:text-gray-400 italic">Sin notas</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pie de Reporte */}
          <div className="pt-4 border-t border-zinc-800/80 print:border-gray-300 text-center text-xs text-zinc-500 print:text-gray-600">
            <p>Reporte generado automáticamente por Khora Music Academy System.</p>
          </div>

        </div>
      </div>
    </div>
  )
}
