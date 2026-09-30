"use client"

import React, { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Video, Upload, X, Loader2, Send, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import VideoExerciseRecorder from "@/components/students/VideoExerciseRecorder"

interface TeacherSendVideoModalProps {
  studentId?: string
  teacherId: string
  studentName?: string
  studentUserId?: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function TeacherSendVideoModal({
  studentId: initialStudentId,
  teacherId,
  studentName: initialStudentName,
  studentUserId: initialStudentUserId,
  isOpen,
  onClose,
  onSuccess,
}: TeacherSendVideoModalProps) {
  const [selectedStudentId, setSelectedStudentId] = useState(initialStudentId || "")
  const [selectedStudentName, setSelectedStudentName] = useState(initialStudentName || "")
  const [selectedStudentUserId, setSelectedStudentUserId] = useState(initialStudentUserId || "")
  const [studentsList, setStudentsList] = useState<{ id: string; name: string; userId?: string }[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)

  const [title, setTitle] = useState("")
  const [instructions, setInstructions] = useState("")
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showLiveRecorder, setShowLiveRecorder] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  // Fetch students if not pre-provided or if empty
  React.useEffect(() => {
    if (!isOpen || !teacherId) return

    if (initialStudentId) {
      setSelectedStudentId(initialStudentId)
      setSelectedStudentName(initialStudentName || "")
      setSelectedStudentUserId(initialStudentUserId || "")
    }

    async function loadStudents() {
      setLoadingStudents(true)
      try {
        const { data, error } = await supabase
          .from("StudentProfile")
          .select("id, user_id, User ( id, name, email )")
          .eq("teacher_id", teacherId)

        if (error) throw error
        const mapped = (data || []).map((s: any) => ({
          id: s.id,
          name: s.User?.name || "Alumno sin nombre",
          userId: s.user_id,
        })).sort((a, b) => a.name.localeCompare(b.name))

        setStudentsList(mapped)

        // If no student was preselected, pick the first one
        if (!initialStudentId && mapped.length > 0) {
          setSelectedStudentId(mapped[0].id)
          setSelectedStudentName(mapped[0].name)
          setSelectedStudentUserId(mapped[0].userId || "")
        }
      } catch (err) {
        console.error("Error loading students for video modal:", err)
      } finally {
        setLoadingStudents(false)
      }
    }

    loadStudents()
  }, [isOpen, teacherId, initialStudentId, initialStudentName, initialStudentUserId])

  if (!isOpen) return null

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!selectedStudentId) {
      toast.error("Por favor selecciona un alumno primero")
      return
    }
    setIsUploading(true)
    try {
      const ext = file.name.split(".").pop() || "mp4"
      const fileName = `teacher_direct/${selectedStudentId}_${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from("submissions").upload(fileName, file, {
        contentType: file.type,
      })
      if (error) throw error

      const { data: pubData } = supabase.storage.from("submissions").getPublicUrl(data.path)
      setVideoUrl(pubData.publicUrl)
      toast.success("Video cargado correctamente")
    } catch (err: any) {
      console.error("Upload error:", err)
      toast.error("Error al cargar video: " + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      toast.error("Por favor selecciona un alumno")
      return
    }
    if (!videoUrl) {
      toast.error("Por favor graba o sube un video primero")
      return
    }

    setIsSubmitting(true)
    try {
      const finalTitle = title.trim() || `Ejercicio para ${selectedStudentName}`

      // 1. Guardar en ExerciseSubmission
      const { error: insertErr } = await supabase
        .from("ExerciseSubmission")
        .insert({
          student_id: selectedStudentId,
          teacher_id: teacherId,
          title: finalTitle,
          video_url: videoUrl,
          teacher_feedback_text: instructions.trim() || null,
          created_by: "TEACHER",
          status: "APPROVED", // Ya viene aprobado o listo para que el alumno lo estudie
        })

      if (insertErr) throw insertErr

      // 2. Notificar al alumno por Web Push
      if (selectedStudentUserId) {
        try {
          await supabase.functions.invoke("notify-student-push", {
            body: {
              customParams: {
                studentUserId: selectedStudentUserId,
                date: new Date().toISOString().split("T")[0],
                time: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
                title: "🥁 Nuevo Video de tu Profesor",
                message: `Tu profesor te envió el video "${finalTitle}". ¡Ábrelo para practicar!`,
                url: `/dashboard/videos`,
              },
            },
          })
        } catch (pushErr) {
          console.warn("Push error:", pushErr)
        }
      }

      toast.success(`Video enviado exitosamente a ${selectedStudentName}`)
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Send video error:", err)
      toast.error("Error al enviar video: " + err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-neutral-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
                <Video className="w-4 h-4 text-violet-400" />
                {selectedStudentName ? `Enviar Video a ${selectedStudentName}` : "Enviar Video a un Alumno"}
              </h3>
              <p className="text-[11px] text-neutral-400">Demostración técnica, ejercicio o indicación de práctica</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Student Selector (shown if not passed or multiple available) */}
            {(!initialStudentId || studentsList.length > 1) && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Alumno Destinatario
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => {
                    const stId = e.target.value
                    setSelectedStudentId(stId)
                    const st = studentsList.find(s => s.id === stId)
                    if (st) {
                      setSelectedStudentName(st.name)
                      setSelectedStudentUserId(st.userId || "")
                    }
                  }}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                >
                  <option value="">-- Selecciona un alumno --</option>
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Título del Ejercicio / Video
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Rudimento Paradiddle a 80 BPM"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Video Capture Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                Video a Enviar (720p HD · Audio sin Filtros)
              </label>

              {videoUrl ? (
                <div className="space-y-2">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-neutral-800">
                    <video src={videoUrl} controls playsInline className="w-full h-full object-contain" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLiveRecorder(true)}
                      className="flex-1 py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors"
                    >
                      Re-grabar Toma
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoUrl(null)}
                      className="py-2 px-3 rounded-xl bg-red-950/60 hover:bg-red-900/60 text-red-300 text-xs font-bold transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLiveRecorder(true)}
                    className="p-4 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white flex flex-col items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition-all active:scale-98"
                  >
                    <Video className="w-6 h-6" />
                    <span className="text-xs font-bold">Grabar con Cámara</span>
                    <span className="text-[10px] text-violet-200">En vivo desde la app</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-2xl bg-neutral-800 hover:bg-neutral-750 text-neutral-200 flex flex-col items-center justify-center gap-2 border border-neutral-700 transition-all active:scale-98"
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
                    ) : (
                      <Upload className="w-6 h-6 text-neutral-400" />
                    )}
                    <span className="text-xs font-bold">{isUploading ? "Subiendo..." : "Subir Archivo"}</span>
                    <span className="text-[10px] text-neutral-400">Desde tu galería o PC</span>
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                Indicaciones para el Alumno (opcional)
              </label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="Ej: Fíjate en cómo acentúo el tiempo 2 con la muñeca relajada. Practícalo con el metrónomo a 70 BPM..."
                rows={3}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-6 border-t border-neutral-800 bg-neutral-950 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={!videoUrl || isSubmitting}
              onClick={handleSubmit}
              className="flex-[2] py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition-all active:scale-98 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    {selectedStudentName
                      ? `Enviar Video a ${selectedStudentName.split(" ")[0]}`
                      : "Enviar Video"}
                  </span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Live Recorder para el Profesor */}
      {showLiveRecorder && selectedStudentId && (
        <VideoExerciseRecorder
          studentId={selectedStudentId}
          teacherId={teacherId}
          customTitle={`Grabar Video para ${selectedStudentName || "Alumno"}`}
          isOpen={showLiveRecorder}
          onClose={() => setShowLiveRecorder(false)}
          onRecorded={(url) => {
            setVideoUrl(url)
            toast.success("Demostración grabada")
          }}
        />
      )}
    </>
  )
}
