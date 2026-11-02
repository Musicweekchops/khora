"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { 
  Mail, 
  Plus, 
  Send, 
  Clock, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Trash2, 
  Edit3, 
  BookOpen, 
  Eye, 
  MousePointer, 
  ShieldAlert, 
  Check, 
  Play, 
  FileText, 
  X,
  HelpCircle,
  AlertCircle,
  Copy,
  RefreshCw,
  Image as ImageIcon,
  Upload
} from "lucide-react"

interface NurtureStep {
  id: string
  step_order: number
  subject: string
  content_html: string
  delay_days: number
  target_audiences: string[]
  library_content_id: string | null
  header_image_url?: string | null
  is_active: boolean
  created_at: string
  // Virtual joined fields
  library_content?: {
    id: string
    title: string
    type: string
  } | null
  stats?: {
    sent: number
    opened: number
    clicked: number
    converted: number
  }
}

interface ConvertedStudent {
  id: string
  name: string
  email: string
  converted_at: string
  details?: string
}

const AUDIENCE_OPTIONS = [
  { key: "PROSPECT", label: "Prospectos", desc: "Leads de landing o registros sin agendar", icon: "🎯", color: "text-amber-600 bg-amber-50 border-amber-200" },
  { key: "TRIAL", label: "Clase de Prueba", desc: "Realizaron prueba pero no contrataron", icon: "🧪", color: "text-sky-600 bg-sky-50 border-sky-200" },
  { key: "PAUSED", label: "Pausados", desc: "Alumnos regulares que congelaron", icon: "⏸️", color: "text-neutral-600 bg-neutral-100 border-neutral-300" },
  { key: "INACTIVE", label: "Ex-alumnos", desc: "Alumnos inactivos que dejaron de tomar clases", icon: "❌", color: "text-red-600 bg-red-50 border-red-200" },
  { key: "ACTIVE", label: "Activos", desc: "Alumnos vigentes (desmarcado por defecto)", icon: "✅", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
]

const SQL_MIGRATION_SNIPPET = `-- Migración 055: Tablas de Funnel de Alumnos
CREATE TABLE IF NOT EXISTS public."NurtureStep" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  subject TEXT NOT NULL,
  content_html TEXT NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 7,
  target_audiences TEXT[] NOT NULL DEFAULT ARRAY['PROSPECT', 'TRIAL', 'PAUSED', 'INACTIVE'],
  library_content_id UUID REFERENCES public."LibraryContent"(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."NurtureLog" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES public."TeacherProfile"(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES public."NurtureStep"(id) ON DELETE CASCADE,
  student_profile_id UUID REFERENCES public."StudentProfile"(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  conversion_details TEXT
);

ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS nurture_step INTEGER DEFAULT 0;
ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS nurture_last_sent_at TIMESTAMPTZ;
ALTER TABLE public."StudentProfile" ADD COLUMN IF NOT EXISTS converted_from_step_id UUID REFERENCES public."NurtureStep"(id) ON DELETE SET NULL;

ALTER TABLE public."NurtureStep" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."NurtureLog" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_manages_own_nurture_steps" ON public."NurtureStep";
CREATE POLICY "teacher_manages_own_nurture_steps" ON public."NurtureStep"
  FOR ALL USING (
    teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "teacher_manages_own_nurture_logs" ON public."NurtureLog";
CREATE POLICY "teacher_manages_own_nurture_logs" ON public."NurtureLog"
  FOR ALL USING (
    teacher_id IN (SELECT id FROM public."TeacherProfile" WHERE user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_nurture_step_teacher_order ON public."NurtureStep"(teacher_id, step_order);
CREATE INDEX IF NOT EXISTS idx_nurture_log_teacher_email ON public."NurtureLog"(teacher_id, email);`

export default function FunnelPage() {
  const { profile } = useAuth()
  const isArnaldo = profile?.email === "arnaldoallende@hotmail.com"

  const [steps, setSteps] = useState<NurtureStep[]>([])
  const [loading, setLoading] = useState(true)
  const [libraryMaterials, setLibraryMaterials] = useState<any[]>([])

  // Modal Crear / Editar
  const [showModal, setShowModal] = useState(false)
  const [editingStep, setEditingStep] = useState<NurtureStep | null>(null)
  const [saving, setSaving] = useState(false)

  // Form State
  const [formSubject, setFormSubject] = useState("")
  const [formContent, setFormContent] = useState("")
  const [formDelay, setFormDelay] = useState(7)
  const [formAudiences, setFormAudiences] = useState<string[]>(["PROSPECT", "TRIAL", "PAUSED", "INACTIVE"])
  const [formLibraryId, setFormLibraryId] = useState<string>("")
  const [formHeaderImageUrl, setFormHeaderImageUrl] = useState<string>("")
  const [uploadingHeader, setUploadingHeader] = useState(false)
  const [isDraggingHeader, setIsDraggingHeader] = useState(false)
  const [globalDefaultHeader, setGlobalDefaultHeader] = useState<string>("")
  const [applyHeaderToAll, setApplyHeaderToAll] = useState(true)
  const [formIsActive, setFormIsActive] = useState(true)
  const [editorTab, setEditorTab] = useState<"text" | "html" | "preview">("text")

  // Modal Ver Conversiones
  const [conversionModalOpen, setConversionModalOpen] = useState(false)
  const [selectedStepForConversions, setSelectedStepForConversions] = useState<NurtureStep | null>(null)
  const [convertedStudents, setConvertedStudents] = useState<ConvertedStudent[]>([])
  const [loadingConversions, setLoadingConversions] = useState(false)

  // Global KPIs
  const [kpiContactsCount, setKpiContactsCount] = useState(0)
  const [kpiConversionsTotal, setKpiConversionsTotal] = useState(0)
  const [testingSend, setTestingSend] = useState<string | null>(null)
  const [tableMissing, setTableMissing] = useState(false)
  const [copiedSql, setCopiedSql] = useState(false)

  useEffect(() => {
    if (isArnaldo && profile?.teacherProfileId) {
      loadFunnelData(profile.teacherProfileId)
      loadLibrary(profile.teacherProfileId)
    }
  }, [isArnaldo, profile?.teacherProfileId])

  async function loadLibrary(teacherId: string) {
    try {
      const { data } = await supabase
        .from("LibraryContent")
        .select("id, title, type")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false })
      if (data) setLibraryMaterials(data)
    } catch (e) {
      console.error("Error cargando biblioteca:", e)
    }
  }

  async function loadFunnelData(teacherId: string) {
    setLoading(true)
    try {
      // 1. Cargar Pasos
      const { data: stepsData, error: stepErr } = await supabase
        .from("NurtureStep")
        .select(`
          id,
          step_order,
          subject,
          content_html,
          delay_days,
          target_audiences,
          library_content_id,
          header_image_url,
          is_active,
          created_at,
          LibraryContent ( id, title, type )
        `)
        .eq("teacher_id", teacherId)
        .order("step_order", { ascending: true })

      if (stepErr) {
        console.error("Error cargando pasos:", stepErr)
        // PostgREST 404 o PGRST205 significa que la tabla aún no se ha creado
        if (
          stepErr.code === "PGRST205" || 
          stepErr.code === "42P01" || 
          stepErr.message?.includes("does not exist") || 
          (stepErr as any).status === 404
        ) {
          setTableMissing(true)
          setLoading(false)
          return
        }
      } else {
        setTableMissing(false)
      }

      // 2. Cargar Logs de reportería
      const { data: logsData } = await supabase
        .from("NurtureLog")
        .select("step_id, opened_at, clicked_at, converted_at")
        .eq("teacher_id", teacherId)

      const statsMap: Record<string, { sent: number; opened: number; clicked: number; converted: number }> = {}
      let totalConversions = 0

      for (const log of logsData || []) {
        if (!statsMap[log.step_id]) {
          statsMap[log.step_id] = { sent: 0, opened: 0, clicked: 0, converted: 0 }
        }
        statsMap[log.step_id].sent++
        if (log.opened_at) statsMap[log.step_id].opened++
        if (log.clicked_at) statsMap[log.step_id].clicked++
        if (log.converted_at) {
          statsMap[log.step_id].converted++
          totalConversions++
        }
      }

      setKpiConversionsTotal(totalConversions)

      // 3. Mapear pasos formateados
      const mapped = (stepsData || []).map((s: any) => ({
        ...s,
        library_content: s.LibraryContent,
        stats: statsMap[s.id] || { sent: 0, opened: 0, clicked: 0, converted: 0 }
      }))

      setSteps(mapped)

      // 4. Contar contactos elegibles en el embudo (no activos con marketing_consent)
      const { count } = await supabase
        .from("StudentProfile")
        .select("id", { count: "exact", head: true })
        .eq("teacher_id", teacherId)
        .neq("status", "ACTIVE")

      setKpiContactsCount(count || 0)

    } catch (err) {
      console.error("Error cargando funnel:", err)
    } finally {
      setLoading(false)
    }
  }

  function openCreateModal() {
    setEditingStep(null)
    setFormSubject("")
    setFormContent("")
    setFormDelay(7)
    setFormAudiences(["PROSPECT", "TRIAL", "PAUSED", "INACTIVE"])
    setFormLibraryId("")
    setFormHeaderImageUrl(globalDefaultHeader || "")
    setFormIsActive(true)
    setEditorTab("text")
    setShowModal(true)
  }

  function openEditModal(step: NurtureStep) {
    setEditingStep(step)
    setFormSubject(step.subject)
    setFormContent(step.content_html)
    setFormDelay(step.delay_days)
    setFormAudiences(step.target_audiences || ["PROSPECT", "TRIAL", "PAUSED", "INACTIVE"])
    setFormLibraryId(step.library_content_id || "")
    setFormHeaderImageUrl(step.header_image_url || globalDefaultHeader || "")
    setFormIsActive(step.is_active)
    setEditorTab("text")
    setShowModal(true)
  }

  async function fileToBase64(file: File): Promise<string> {
    // Método 1: arrayBuffer nativo por trozos (eficiente y sin límite de stack)
    try {
      const buffer = await file.arrayBuffer()
      const bytes = new Uint8Array(buffer)
      let binary = ""
      const chunkSize = 8192
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)))
      }
      return `data:${file.type || "image/png"};base64,${btoa(binary)}`
    } catch (err) {
      console.warn("arrayBuffer falló, intentando Canvas/ObjectURL:", err, (err as any)?.name, (err as any)?.message)
    }

    // Método 2: Decodificación nativa con Image + Canvas (inmune a bloqueos de sandbox y reduce peso)
    try {
      const blobUrl = URL.createObjectURL(file)
      const base64 = await new Promise<string>((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          try {
            const maxW = 1200
            const scale = img.width > maxW ? maxW / img.width : 1
            const canvas = document.createElement("canvas")
            canvas.width = Math.round(img.width * scale)
            canvas.height = Math.round(img.height * scale)
            const ctx = canvas.getContext("2d")
            if (!ctx) throw new Error("Canvas context null")
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            const dataUrl = canvas.toDataURL(file.type === "image/png" ? "image/png" : "image/jpeg", 0.9)
            URL.revokeObjectURL(blobUrl)
            resolve(dataUrl)
          } catch (canvasErr) {
            URL.revokeObjectURL(blobUrl)
            reject(canvasErr)
          }
        }
        img.onerror = () => {
          URL.revokeObjectURL(blobUrl)
          reject(new Error("No se pudo decodificar la imagen"))
        }
        img.src = blobUrl
      })
      if (base64) return base64
    } catch (canvasErr) {
      console.warn("Canvas falló, intentando FileReader:", canvasErr)
    }

    // Método 3: FileReader estándar
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => {
        reject(new Error(`No se pudo leer el archivo (${reader.error?.name || "?"}: ${reader.error?.message || "sin detalle"}) | nombre=${file.name} tipo=${file.type} tamaño=${file.size}`))
      }
      reader.readAsDataURL(file)
    })
  }

  async function processAndUploadHeaderFile(file: File) {
    if (!file) return
    setUploadingHeader(true)

    try {
      const rawExt = file.name ? (file.name.split(".").pop() || "png").toLowerCase() : "png"
      const ext = ["png", "jpg", "jpeg", "webp", "gif"].includes(rawExt) ? rawExt : "png"
      const storagePath = `headers/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`

      let finalUrl = ""

      // 1. Intentar primero subida directa a Supabase Storage con el objeto File nativo
      try {
        const { error: directErr } = await supabase.storage
          .from("landing")
          .upload(storagePath, file, { 
            upsert: true,
            contentType: file.type || "image/png"
          })

        if (!directErr) {
          const { data: stData } = supabase.storage.from("landing").getPublicUrl(storagePath)
          if (stData?.publicUrl) {
            finalUrl = stData.publicUrl
          }
        } else {
          console.warn("Subida directa a storage falló, usando Edge Function:", directErr)
        }
      } catch (directExc) {
        console.warn("Excepción en subida directa, usando Edge Function:", directExc)
      }

      // 2. Si la subida directa no completó, usar la Edge Function con Service Role
      if (!finalUrl) {
        const base64 = await fileToBase64(file)
        const { data, error: fnError } = await supabase.functions.invoke("send-email", {
          body: {
            action: "upload-header",
            base64,
            ext,
            contentType: file.type || "image/png"
          }
        })

        if (data?.publicUrl) {
          finalUrl = data.publicUrl
        } else {
          throw new Error(fnError?.message || data?.error || "No se pudo subir la imagen al servidor")
        }
      }

      if (finalUrl) {
        setFormHeaderImageUrl(finalUrl)
        setGlobalDefaultHeader(finalUrl)
        if (typeof window !== "undefined") {
          localStorage.setItem("khora_funnel_default_header", finalUrl)
        }

        // Actualizar en TeacherProfile para que sea el banner predeterminado
        if (profile?.teacherProfileId) {
          await supabase
            .from("TeacherProfile")
            .update({ funnel_header_image_url: finalUrl })
            .eq("id", profile.teacherProfileId)

          // Si la casilla está marcada, aplicar a todos los pasos existentes inmediatamente
          if (applyHeaderToAll) {
            await supabase
              .from("NurtureStep")
              .update({ header_image_url: finalUrl })
              .eq("teacher_id", profile.teacherProfileId)

            setSteps(prev => prev.map(s => ({ ...s, header_image_url: finalUrl })))
          }
        }
      } else {
        throw new Error("No se pudo obtener la URL de la cabecera")
      }
    } catch (err: any) {
      alert("Error al subir imagen de cabecera: " + (err.message || err))
    } finally {
      setUploadingHeader(false)
    }
  }

  async function handleUploadHeaderImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      await processAndUploadHeaderFile(file)
    }
    e.target.value = ""
  }

  function toggleAudience(key: string) {
    setFormAudiences(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  async function handleSaveStep(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.teacherProfileId) return
    setSaving(true)

    try {
      const nextOrder = editingStep ? editingStep.step_order : steps.length + 1

      const payload: any = {
        teacher_id: profile.teacherProfileId,
        step_order: nextOrder,
        subject: formSubject.trim(),
        content_html: formContent.trim(),
        delay_days: Number(formDelay) || 7,
        target_audiences: formAudiences,
        library_content_id: formLibraryId || null,
        header_image_url: formHeaderImageUrl.trim() || null,
        is_active: formIsActive,
        updated_at: new Date().toISOString()
      }

      if (editingStep) {
        const { error } = await supabase
          .from("NurtureStep")
          .update(payload)
          .eq("id", editingStep.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from("NurtureStep")
          .insert(payload)
        if (error) throw error
      }

      // Si la casilla está activa, actualizar también todos los pasos creados con esta cabecera
      if (applyHeaderToAll && formHeaderImageUrl.trim()) {
        await supabase
          .from("NurtureStep")
          .update({ header_image_url: formHeaderImageUrl.trim() })
          .eq("teacher_id", profile.teacherProfileId)
      }

      setShowModal(false)
      loadFunnelData(profile.teacherProfileId)
    } catch (err: any) {
      alert("Error guardando correo del funnel: " + err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteStep(id: string) {
    if (!confirm("¿Seguro que deseas eliminar este paso de la secuencia?")) return
    try {
      await supabase.from("NurtureStep").delete().eq("id", id)
      if (profile?.teacherProfileId) loadFunnelData(profile.teacherProfileId)
    } catch (err: any) {
      alert("Error al eliminar: " + err.message)
    }
  }

  async function handleToggleActive(step: NurtureStep) {
    try {
      await supabase
        .from("NurtureStep")
        .update({ is_active: !step.is_active })
        .eq("id", step.id)
      if (profile?.teacherProfileId) loadFunnelData(profile.teacherProfileId)
    } catch (err: any) {
      alert("Error al actualizar: " + err.message)
    }
  }

  function buildFunnelEmailHtml(step: NurtureStep, studentName: string) {
    const firstName = studentName.split(" ")[0] || "Alumno"
    const parsedSubject = step.subject.replace(/{{nombre}}/g, firstName)
    const parsedBody = step.content_html
      .replace(/{{nombre}}/g, firstName)
      .replace(/\n/g, "<br>")

    const headerImg = step.header_image_url || formHeaderImageUrl || globalDefaultHeader

    let headerHtml = `
      <div style="text-align: center; padding: 24px 0 16px 0; border-bottom: 1px solid #f1f5f9;">
        <h2 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          Arnaldo Allende
        </h2>
      </div>
    `
    if (headerImg) {
      headerHtml = `
        <div style="text-align: center; padding: 0; overflow: hidden; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;">
          <img src="${headerImg}" alt="Cabecera" style="width: 100%; max-width: 540px; height: auto; max-height: 220px; object-fit: cover; display: block; margin: 0 auto;" />
        </div>
      `
    }

    let libraryHtml = ""
    if (step.library_content) {
      const mat = step.library_content
      libraryHtml = `
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; margin: 24px 0; text-align: left;">
          <div style="font-size: 11px; font-weight: 800; color: #7c3aed; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">
            ${mat.type === "video" ? "📹 VIDEO DE PRÁCTICA" : "📄 PARTITURA / PDF"}
          </div>
          <h4 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 12px 0;">
            ${mat.title}
          </h4>
          <a href="https://khora.cl/login?ref=funnel_step_${step.step_order}" style="display: inline-block; background-color: #7c3aed; color: #ffffff !important; text-decoration: none; font-size: 13px; font-weight: 700; padding: 10px 22px; border-radius: 10px; box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);">
            Ver Material en Khora
          </a>
        </div>
      `
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${parsedSubject}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 36px 12px; width: 100%;">
          <tr>
            <td align="center">
              <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 540px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.04);">
                <tr>
                  <td>
                    <!-- HEADER -->
                    ${headerHtml}
                    
                    <!-- CONTENT -->
                    <div style="padding: 32px 32px 24px 32px; font-size: 15px; color: #334155; line-height: 1.65;">
                      <p style="font-size: 16px; color: #0f172a; font-weight: 700; margin: 0 0 16px 0;">
                        ¡Hola ${firstName}!
                      </p>
                      <div style="color: #334155; line-height: 1.7;">
                        ${parsedBody}
                      </div>
                      ${libraryHtml}
                      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 14px; color: #64748b;">
                        <p style="margin: 0;">Un abrazo,<br><strong style="color: #0f172a;">Arnaldo Allende</strong></p>
                      </div>
                    </div>
                    
                    <!-- FOOTER -->
                    <div style="padding: 24px 32px; text-align: center; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                      <p style="font-size: 11px; color: #64748b; margin: 0 0 8px 0; line-height: 1.5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        Recibes este correo porque eres alumno o tienes una cuenta en Khora.
                      </p>
                      <p style="font-size: 11px; color: #64748b; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        <a href="https://khora.cl/terminos" style="color: #7c3aed; text-decoration: underline;">Términos</a>
                        &nbsp;•&nbsp;
                        <a href="https://khora.cl/privacidad" style="color: #7c3aed; text-decoration: underline;">Privacidad</a>
                        &nbsp;•&nbsp;
                        <a href="mailto:hola@khora.cl" style="color: #7c3aed; text-decoration: underline;">Contacto</a>
                      </p>
                      <p style="font-size: 11px; color: #94a3b8; margin: 12px 0 0 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                        © 2026 Khora • Arnaldo Allende.
                      </p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  }

  async function handleSendTest(step: NurtureStep) {
    if (!profile?.email) return
    setTestingSend(step.id)
    try {
      const studentName = profile.name || "Arnaldo"
      const firstName = studentName.split(" ")[0] || "Arnaldo"
      const cleanSubject = `[PRUEBA FUNNEL PASO #${step.step_order}] ${step.subject.replace(/{{nombre}}/g, firstName)}`
      const fullWhiteHtml = buildFunnelEmailHtml(step, studentName)

      const { data, error } = await supabase.functions.invoke("send-email", {
        body: {
          to: profile.email,
          subject: cleanSubject,
          type: "NURTURE_STEP",
          customHtml: fullWhiteHtml,
          html: fullWhiteHtml,
          params: {
            studentName: firstName,
            teacherName: "Arnaldo Allende",
            headerImageUrl: step.header_image_url || formHeaderImageUrl || globalDefaultHeader,
            customMessage: `${step.content_html.replace(/{{nombre}}/g, firstName)}${
              step.library_content ? `\n\n[Material adjunto: ${step.library_content.title}]` : ''
            }`,
            libraryTitle: step.library_content?.title,
            libraryType: step.library_content?.type,
            content: step.content_html
          }
        }
      })

      if (error) {
        throw new Error(error.message || "Error al invocar send-email")
      }

      alert(`¡Correo de prueba enviado con éxito a ${profile.email}! Revisa tu bandeja de entrada 📬`)
    } catch (err: any) {
      alert("Error enviando prueba: " + err.message)
    } finally {
      setTestingSend(null)
    }
  }

  async function openConversionsModal(step: NurtureStep) {
    setSelectedStepForConversions(step)
    setConversionModalOpen(true)
    setLoadingConversions(true)

    try {
      const { data } = await supabase
        .from("NurtureLog")
        .select(`
          id,
          email,
          converted_at,
          conversion_details,
          StudentProfile ( User ( name, email ) )
        `)
        .eq("step_id", step.id)
        .not("converted_at", "is", null)
        .order("converted_at", { ascending: false })

      if (data) {
        setConvertedStudents(data.map((d: any) => ({
          id: d.id,
          name: d.StudentProfile?.User?.name || d.email,
          email: d.email,
          converted_at: d.converted_at,
          details: d.conversion_details || "Plan mensual contratado"
        })))
      } else {
        setConvertedStudents([])
      }
    } catch (e) {
      console.error("Error cargando conversiones:", e)
    } finally {
      setLoadingConversions(false)
    }
  }

  // Si no es Arnaldo Allende, no mostrar nada
  if (!isArnaldo) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-neutral-400" />
        <h2 className="text-lg font-bold text-neutral-900">Módulo No Disponible</h2>
        <p className="text-sm text-neutral-500 max-w-md">
          Este módulo de automatización avanzada está reservado exclusivamente para la administración principal de Khora.
        </p>
        <Link href="/dashboard" className="kh-btn-secondary py-2 px-4 text-xs">
          Volver al Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-16">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 text-violet-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Funnel
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-950 tracking-tight">
            Funnel de Alumnos
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Secuencia automática de ejercicios y valor para prospectos, pausados y ex-alumnos.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="kh-btn-primary py-3 px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-violet-500/10"
        >
          <Plus className="w-4 h-4" /> Agregar Siguiente Correo
        </button>
      </div>

      {/* MIGRATION NEEDED ALERT */}
      {tableMissing && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-6 text-amber-900 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-amber-950">
                Paso pendiente: Crear las tablas del Funnel en Supabase
              </h3>
              <p className="text-sm text-amber-800 leading-relaxed">
                El código del Funnel está listo, pero la base de datos de Supabase aún no tiene creadas las tablas <code>NurtureStep</code> y <code>NurtureLog</code> (por eso la consola muestra error 404).
              </p>
            </div>
          </div>

          <div className="bg-white/80 border border-amber-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-amber-900 font-mono">
              Script: <strong>migrations/055_nurture_funnel.sql</strong>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(SQL_MIGRATION_SNIPPET)
                  setCopiedSql(true)
                  setTimeout(() => setCopiedSql(false), 3000)
                }}
                className="kh-btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto font-medium"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> ¡SQL Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-neutral-500" /> Copiar SQL
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (profile?.teacherProfileId) loadFunnelData(profile.teacherProfileId)
                }}
                className="kh-btn-primary py-2 px-3 text-xs flex items-center justify-center gap-1.5 w-full sm:w-auto font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reintentar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI METRICS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Contactos en el Funnel</span>
            <Users className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900">{kpiContactsCount}</div>
          <p className="text-[11px] text-neutral-400">Prospectos y alumnos pausados recibiendo la secuencia</p>
        </div>

        <div className="bg-white border border-emerald-200/80 rounded-2xl p-5 shadow-sm space-y-1 bg-gradient-to-br from-emerald-50/40 to-white">
          <div className="flex items-center justify-between text-emerald-700 text-xs font-bold uppercase tracking-wider">
            <span>Alumnos Convertidos a Plan</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-950 flex items-center gap-2">
            <span>{kpiConversionsTotal}</span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">🎉 Ventas</span>
          </div>
          <p className="text-[11px] text-emerald-600/80">Alumnos que contrataron plan tras recibir correos del funnel</p>
        </div>

        <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold">
            <span>Pasos en la Secuencia</span>
            <Mail className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-neutral-900">{steps.length}</div>
          <p className="text-[11px] text-neutral-400">
            {steps.length > 0 ? `Cubre ${steps.reduce((acc, s) => acc + s.delay_days, 0)} días de seguimiento continuo` : "Sin correos aún"}
          </p>
        </div>
      </div>

      {/* TIMELINE / PIPELINE CONTAINER */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <span>Línea de Tiempo de la Secuencia</span>
            <span className="text-xs font-semibold text-neutral-400">({steps.length} correos)</span>
          </h2>
        </div>

        {loading ? (
          <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center text-neutral-400 text-sm font-semibold animate-pulse">
            Cargando secuencia de correos...
          </div>
        ) : steps.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-neutral-200 rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center mx-auto text-xl">
              ✉️
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-neutral-900">Tu funnel aún no tiene correos</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Crea tu primer correo (Paso 1) con un ejercicio o tip de tu biblioteca. Los alumnos nuevos y pausados empezarán a recibirlo automáticamente.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="kh-btn-primary py-2.5 px-4 text-xs font-bold"
            >
              Crear Paso #1
            </button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-violet-200/80 space-y-8 ml-2 sm:ml-4">
            {steps.map((step, idx) => {
              const conversionCount = step.stats?.converted || 0
              return (
                <div key={step.id} className="relative group">
                  {/* Bullet Marker on Timeline */}
                  <div className="absolute -left-[33px] sm:-left-[41px] top-6 w-6 h-6 rounded-full bg-white border-4 border-violet-600 shadow-sm flex items-center justify-center text-[10px] font-bold text-violet-800">
                    {idx + 1}
                  </div>

                  {/* Step Card */}
                  <div className={`bg-white border rounded-3xl p-5 sm:p-6 transition-all shadow-sm ${
                    step.is_active ? "border-neutral-200/80 hover:border-violet-300" : "border-neutral-200/50 opacity-60 bg-neutral-50"
                  }`}>
                    {/* Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-neutral-100 pb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black uppercase tracking-wider text-violet-700 bg-violet-50 px-3 py-1 rounded-full border border-violet-200/50">
                          Paso #{step.step_order}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                          Se envía {step.delay_days} días después del anterior
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(step)}
                          className={`text-xs font-bold px-3 py-1 rounded-xl transition-colors ${
                            step.is_active 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60" 
                              : "bg-neutral-100 text-neutral-500 border border-neutral-200"
                          }`}
                        >
                          {step.is_active ? "🟢 Activo" : "⏸️ Pausado"}
                        </button>
                        <button
                          onClick={() => handleSendTest(step)}
                          disabled={testingSend === step.id}
                          className="text-xs text-neutral-600 hover:text-neutral-900 border border-neutral-200 hover:bg-neutral-50 px-3 py-1 rounded-xl transition-colors font-medium flex items-center gap-1"
                          title="Enviarme una prueba a mi correo"
                        >
                          <Send className="w-3 h-3 text-neutral-400" />
                          {testingSend === step.id ? "Enviando..." : "Probar"}
                        </button>
                        <button
                          onClick={() => openEditModal(step)}
                          className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                          title="Editar correo"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStep(step.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar paso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Content Row */}
                    <div className="py-4 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">Asunto:</span>
                        <h3 className="text-base font-bold text-neutral-900">{step.subject}</h3>
                      </div>

                      {/* Content Preview */}
                      <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed bg-neutral-50 p-3 rounded-2xl border border-neutral-100 font-mono">
                        {step.content_html}
                      </p>

                      {/* Attached Library Material Badge */}
                      {step.library_content && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-50/70 border border-violet-200/60 rounded-xl text-xs text-violet-800 font-medium">
                          {step.library_content.type === "video" ? <Play className="w-3.5 h-3.5 text-violet-600" /> : <FileText className="w-3.5 h-3.5 text-violet-600" />}
                          <span>Material adjunto de Biblioteca: <strong>{step.library_content.title}</strong></span>
                        </div>
                      )}

                      {/* Custom Header Badge */}
                      {step.header_image_url && (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-lg text-[11px] font-medium text-neutral-600 border border-neutral-200/60">
                          <ImageIcon className="w-3 h-3 text-neutral-400" /> Cabecera personalizada cargada
                        </div>
                      )}

                      {/* Target Audiences Badges */}
                      <div className="pt-2 flex flex-wrap items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mr-1">Se envía a:</span>
                        {AUDIENCE_OPTIONS.map(opt => {
                          const isIncluded = (step.target_audiences || []).includes(opt.key)
                          if (!isIncluded) return null
                          return (
                            <span key={opt.key} className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${opt.color}`}>
                              <span>{opt.icon}</span> {opt.label}
                            </span>
                          )
                        })}
                      </div>
                    </div>

                    {/* Footer / Attribution Metrics */}
                    <div className="pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="flex items-center gap-1 font-semibold text-neutral-700">
                          <Send className="w-3.5 h-3.5 text-neutral-400" /> {step.stats?.sent || 0} enviados
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-neutral-700">
                          <Eye className="w-3.5 h-3.5 text-neutral-400" /> 
                          {step.stats?.sent ? Math.round(((step.stats?.opened || 0) / step.stats.sent) * 100) : 0}% apertura
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-neutral-700">
                          <MousePointer className="w-3.5 h-3.5 text-neutral-400" /> 
                          {step.stats?.sent ? Math.round(((step.stats?.clicked || 0) / step.stats.sent) * 100) : 0}% clics
                        </span>
                      </div>

                      {/* CONVERSION TAG BADGE */}
                      <button
                        onClick={() => openConversionsModal(step)}
                        className={`text-xs font-black px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all ${
                          conversionCount > 0 
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-sm"
                            : "bg-neutral-50 text-neutral-400 border-neutral-200"
                        }`}
                      >
                        <span>🎉 {conversionCount} {conversionCount === 1 ? "alumno se unió a plan" : "alumnos se unieron a plan"}</span>
                        {conversionCount > 0 && <span className="underline text-[10px] font-bold">Ver quiénes</span>}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Bottom Add Step Button in Timeline */}
            <div className="pt-4">
              <button
                onClick={openCreateModal}
                className="w-full py-4 border-2 border-dashed border-violet-300 hover:border-violet-500 rounded-3xl text-violet-700 hover:text-violet-900 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-violet-50/30 hover:bg-violet-50/70 transition-all"
              >
                <Plus className="w-4 h-4" /> Agregar Paso #{steps.length + 1} a la Secuencia
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR CORREO */}
      {showModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-neutral-900 text-lg">
                  {editingStep ? `Editar Paso #${editingStep.step_order}` : `Crear Paso #${steps.length + 1} del Funnel`}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Este correo se enviará en automático siguiendo el orden de la secuencia infinita.
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-neutral-400 hover:text-neutral-900 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveStep} className="p-6 overflow-y-auto space-y-5 flex-1">
              <div>
                <label className="kh-label block text-xs font-bold text-neutral-700 mb-1">
                  Asunto del Correo
                </label>
                <input
                  type="text"
                  required
                  value={formSubject}
                  onChange={e => setFormSubject(e.target.value)}
                  placeholder="Ej: Te desbloqueé este ejercicio de independencia 🥁"
                  className="kh-input w-full font-medium"
                />
                <p className="text-[10px] text-neutral-400 mt-1">
                  💡 Tip: Puedes usar <code className="bg-neutral-100 px-1 py-0.5 rounded font-bold">{"{{nombre}}"}</code> para insertar el nombre del alumno automáticamente.
                </p>
              </div>

              {/* CABECERA PERSONALIZADA (BANNER / LOGO) */}
              <div 
                className={`bg-neutral-50/80 border rounded-2xl p-4 space-y-3 transition-colors ${
                  isDraggingHeader ? "border-violet-500 bg-violet-50/50" : "border-neutral-200/80"
                }`}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDraggingHeader(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDraggingHeader(false)
                }}
                onDrop={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsDraggingHeader(false)
                  const droppedFile = e.dataTransfer.files?.[0]
                  if (droppedFile) {
                    await processAndUploadHeaderFile(droppedFile)
                  }
                }}
                onPaste={async (e) => {
                  const items = e.clipboardData?.items
                  if (items) {
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.startsWith("image/")) {
                        const pastedFile = items[i].getAsFile()
                        if (pastedFile) {
                          e.preventDefault()
                          await processAndUploadHeaderFile(pastedFile)
                          break
                        }
                      }
                    }
                  }
                }}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-800 flex items-center gap-1.5 uppercase tracking-wider">
                    <ImageIcon className="w-4 h-4 text-violet-600" /> Cabecera Personalizada (Banner / Logo)
                  </label>
                  {formHeaderImageUrl && (
                    <button
                      type="button"
                      onClick={() => setFormHeaderImageUrl("")}
                      className="text-[11px] text-red-600 hover:text-red-700 font-semibold"
                    >
                      ✕ Quitar cabecera
                    </button>
                  )}
                </div>

                {formHeaderImageUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-neutral-200 bg-white max-h-36 flex items-center justify-center shadow-sm">
                    <img 
                      src={formHeaderImageUrl} 
                      alt="Vista previa cabecera" 
                      className="w-full h-auto max-h-36 object-cover" 
                    />
                  </div>
                ) : (
                  <div className="p-4 bg-white rounded-xl border border-dashed border-neutral-300 text-center space-y-1">
                    <p className="text-xs text-neutral-600 font-semibold">
                      Arrastra y suelta tu imagen aquí, o pega con <kbd className="bg-neutral-100 px-1.5 py-0.5 rounded text-[10px] font-mono border">Cmd + V</kbd>
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      Sin imagen cargada, se mostrará únicamente tu nombre <strong>&quot;Arnaldo Allende&quot;</strong> (sin logotipo de Khora).
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <label className="cursor-pointer kh-btn-primary py-2.5 px-4 text-xs flex items-center justify-center gap-2 w-full sm:w-auto font-bold shadow-sm">
                    <Upload className="w-4 h-4" />
                    {uploadingHeader ? "Subiendo imagen..." : (formHeaderImageUrl ? "Cambiar Imagen de mi Computador" : "Seleccionar Imagen de mi Computador")}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadHeaderImage}
                      disabled={uploadingHeader}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-neutral-400 hidden sm:inline">
                    (PNG, JPG o WebP recomendado: 600x150 px)
                  </span>
                </div>

                <label className="flex items-center gap-2 pt-1 text-xs text-neutral-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={applyHeaderToAll}
                    onChange={e => setApplyHeaderToAll(e.target.checked)}
                    className="rounded text-violet-600 focus:ring-violet-500"
                  />
                  <span>Aplicar automáticamente esta cabecera a <strong>todos los pasos ya creados</strong> del Funnel</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="kh-label block text-xs font-bold text-neutral-700 mb-1">
                    Tiempo de Espera (Días)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    required
                    value={formDelay}
                    onChange={e => setFormDelay(parseInt(e.target.value) || 7)}
                    className="kh-input w-full font-bold"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Días a esperar tras el correo anterior (Recomendado: 7 días).
                  </p>
                </div>

                <div>
                  <label className="kh-label block text-xs font-bold text-neutral-700 mb-1">
                    Adjuntar de mi Biblioteca de Khora (Opcional)
                  </label>
                  <select
                    value={formLibraryId}
                    onChange={e => setFormLibraryId(e.target.value)}
                    className="kh-input w-full text-xs font-medium bg-white"
                  >
                    <option value="">Ninguno (Solo texto/enlaces)</option>
                    {libraryMaterials.map(mat => (
                      <option key={mat.id} value={mat.id}>
                        {mat.type === "video" ? "📹 Video: " : "📄 PDF: "} {mat.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AUDIENCE SELECTOR (CHECKBOXES) */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <label className="kh-label block text-xs font-bold text-neutral-700">
                  ¿A qué listas o audiencias enviar este correo?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AUDIENCE_OPTIONS.map(opt => {
                    const isChecked = formAudiences.includes(opt.key)
                    return (
                      <div
                        key={opt.key}
                        onClick={() => toggleAudience(opt.key)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                          isChecked 
                            ? "bg-violet-50/60 border-violet-300 text-neutral-900" 
                            : "bg-neutral-50/60 border-neutral-200 text-neutral-500 opacity-70"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by div
                          className="mt-1 rounded text-violet-600 focus:ring-violet-500"
                        />
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <span>{opt.icon}</span>
                            <span>{opt.label}</span>
                          </div>
                          <p className="text-[10px] text-neutral-400 leading-tight">{opt.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* CONTENT EDITOR TABS (TEXT / HTML / LIVE PREVIEW) */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <label className="kh-label block text-xs font-bold text-neutral-700">
                    Cuerpo del Mensaje
                  </label>
                  <div className="flex items-center p-0.5 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setEditorTab("text")}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        editorTab === "text" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      ✍️ Texto
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("html")}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        editorTab === "html" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      &lt;&gt; Código HTML
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("preview")}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        editorTab === "preview" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-900"
                      }`}
                    >
                      👁️ Vista Previa
                    </button>
                  </div>
                </div>

                {editorTab === "text" && (
                  <div>
                    <textarea
                      rows={8}
                      required
                      value={formContent}
                      onChange={e => setFormContent(e.target.value)}
                      placeholder="¡Hola {{nombre}}!&#10;&#10;Hoy quiero compartirte un ejercicio clave que suelo darle a mis alumnos para soltar las manos...&#10;&#10;Un abrazo,&#10;Arnaldo"
                      className="kh-input w-full text-xs font-sans leading-relaxed"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Los saltos de línea se formatearán automáticamente en párrafos HTML limpios al enviarse.
                    </p>
                  </div>
                )}

                {editorTab === "html" && (
                  <div>
                    <textarea
                      rows={10}
                      required
                      value={formContent}
                      onChange={e => setFormContent(e.target.value)}
                      placeholder="<p>¡Hola <strong>{{nombre}}</strong>!</p>&#10;<p>Aquí tienes el ejercicio exclusivo de esta semana...</p>"
                      className="w-full p-3 bg-neutral-950 text-emerald-400 font-mono text-xs rounded-2xl border border-neutral-800 outline-none focus:border-violet-500 leading-relaxed"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Puedes usar etiquetas HTML personalizadas: <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">&lt;p&gt;</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">&lt;strong&gt;</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">&lt;a href=&quot;...&quot;&gt;</code>, <code className="bg-neutral-100 px-1 py-0.5 rounded font-mono text-neutral-800">&lt;img&gt;</code>, botones con estilos inline, etc.
                    </p>
                  </div>
                )}

                {editorTab === "preview" && (
                  <div className="bg-neutral-100 p-4 sm:p-6 rounded-2xl border border-neutral-200/80 max-h-80 overflow-y-auto">
                    <div className="max-w-md mx-auto bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-md text-neutral-800">
                      {/* Email Header */}
                      {formHeaderImageUrl ? (
                        <div className="w-full bg-white border-b border-neutral-100 overflow-hidden">
                          <img 
                            src={formHeaderImageUrl} 
                            alt="Cabecera del correo" 
                            className="w-full max-h-36 object-cover object-center" 
                          />
                        </div>
                      ) : (
                        <div className="text-center py-4 border-b border-neutral-100 bg-white">
                          <span className="text-base font-extrabold text-neutral-900 tracking-tight">Arnaldo Allende</span>
                        </div>
                      )}
                      {/* Email Content Body */}
                      <div className="p-5 text-xs text-neutral-700 leading-relaxed space-y-3">
                        <p className="text-sm font-bold text-neutral-900">¡Hola Alumno!</p>
                        <div 
                          className="prose prose-xs max-w-none text-neutral-700 leading-relaxed"
                          dangerouslySetInnerHTML={{ 
                            __html: formContent.includes("<") ? formContent.replace(/{{nombre}}/g, "Alumno") : formContent.replace(/{{nombre}}/g, "Alumno").replace(/\n/g, "<br />") 
                          }}
                        />

                        {formLibraryId && (
                          <div className="p-3 bg-neutral-50 border border-neutral-200/80 rounded-xl text-left space-y-1 mt-3">
                            <span className="text-[10px] font-black text-violet-700 uppercase tracking-widest">
                              📁 Material Adjunto
                            </span>
                            <p className="font-bold text-neutral-900 text-xs">
                              {libraryMaterials.find(m => m.id === formLibraryId)?.title || "Ejercicio de la Biblioteca"}
                            </p>
                            <span className="inline-block bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-lg mt-1 shadow-sm">
                              Ver en Khora
                            </span>
                          </div>
                        )}

                        <div className="pt-3 border-t border-neutral-100 text-neutral-500 text-[11px]">
                          Un abrazo,<br /><strong className="text-neutral-900">Arnaldo Allende</strong>
                        </div>
                      </div>
                      {/* Email Footer */}
                      <div className="p-3 bg-neutral-50 text-center border-t border-neutral-100 text-[9px] text-neutral-400 space-y-1">
                        <p>Recibes este correo porque eres alumno o tienes una cuenta en Khora.</p>
                        <p className="text-violet-600 underline">Términos • Privacidad • Cancelar suscripción</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-neutral-700">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={e => setFormIsActive(e.target.checked)}
                    className="rounded text-violet-600 focus:ring-violet-500"
                  />
                  <span>Dejar este correo activo inmediatamente</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="kh-btn-secondary py-2.5 px-4 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="kh-btn-primary py-2.5 px-5 text-xs font-bold uppercase tracking-wider"
                >
                  {saving ? "Guardando..." : "Guardar Paso del Funnel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER ALUMNOS CONVERTIDOS */}
      {conversionModalOpen && selectedStepForConversions && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-neutral-900 flex items-center gap-2">
                  <span>🎉 Conversiones Atribuidas</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Paso #{selectedStepForConversions.step_order}: &quot;{selectedStepForConversions.subject}&quot;
                </p>
              </div>
              <button onClick={() => setConversionModalOpen(false)} className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingConversions ? (
              <div className="py-8 text-center text-xs text-neutral-400 font-semibold animate-pulse">
                Cargando alumnos convertidos...
              </div>
            ) : convertedStudents.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <p className="text-sm font-bold text-neutral-900">Aún no hay compras atribuidas a este correo</p>
                <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                  En cuanto un alumno que recibió este correo contrate un plan, aparecerá listado aquí automáticamente con su fecha de compra.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {convertedStudents.map(c => (
                  <div key={c.id} className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-neutral-900">{c.name}</h4>
                      <p className="text-[11px] text-neutral-500">{c.email}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        {c.details}
                      </span>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {new Date(c.converted_at).toLocaleDateString("es-CL", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => setConversionModalOpen(false)}
              className="w-full kh-btn-secondary py-2.5 text-xs font-bold mt-2"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

