"use client"

import React, { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Gauge, 
  MessageSquarePlus, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Trash2, 
  X, 
  Loader2, 
  Send,
  Sparkles,
  Video,
  Upload
} from "lucide-react"
import { toast } from "sonner"

export interface TimestampMarker {
  time: number
  note: string
}

export interface SubmissionData {
  id: string
  student_id: string
  teacher_id: string
  task_id?: string | null
  title: string
  video_url: string
  video_duration?: number | null
  student_notes?: string | null
  status: "PENDING" | "IN_REVIEW" | "APPROVED" | "NEEDS_WORK"
  teacher_feedback_text?: string | null
  teacher_feedback_audio_url?: string | null
  teacher_feedback_video_url?: string | null
  timestamp_markers?: TimestampMarker[] | null
  created_at: string
  student_name?: string
  teacher_name?: string
}

interface ExerciseFeedbackModalProps {
  submission: SubmissionData
  isTeacher: boolean
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

export default function ExerciseFeedbackModal({
  submission,
  isTeacher,
  isOpen,
  onClose,
  onUpdate,
}: ExerciseFeedbackModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState<number>(1)
  
  // Feedback editing states (for Teacher)
  const [markers, setMarkers] = useState<TimestampMarker[]>(submission.timestamp_markers || [])
  const [newMarkerNote, setNewMarkerNote] = useState("")
  const [newMarkerTime, setNewMarkerTime] = useState<number | null>(null)
  const [generalFeedback, setGeneralFeedback] = useState(submission.teacher_feedback_text || "")
  const [status, setStatus] = useState(submission.status)
  const [isSaving, setIsSaving] = useState(false)

  // Teacher Demonstration Video
  const [activeVideoTab, setActiveVideoTab] = useState<"student" | "teacher">("student")
  const [teacherVideoUrl, setTeacherVideoUrl] = useState<string | null>(submission.teacher_feedback_video_url || null)
  const [isUploadingTeacherVideo, setIsUploadingTeacherVideo] = useState(false)
  const teacherVideoInputRef = useRef<HTMLInputElement | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    setMarkers(submission.timestamp_markers || [])
    setGeneralFeedback(submission.teacher_feedback_text || "")
    setStatus(submission.status)
    setTeacherVideoUrl(submission.teacher_feedback_video_url || null)
    setActiveVideoTab("student")
  }, [submission])

  // Subir video de demostración del profesor
  const handleTeacherVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingTeacherVideo(true)
    try {
      const ext = file.name.split('.').pop() || 'mp4'
      const path = `teacher_demo/${submission.id}_${Date.now()}.${ext}`
      const { data, error } = await supabase.storage.from("submissions").upload(path, file, { contentType: file.type })
      if (error) throw error
      const { data: pubData } = supabase.storage.from("submissions").getPublicUrl(data.path)
      setTeacherVideoUrl(pubData.publicUrl)
      setActiveVideoTab("teacher")
      toast.success("Video de demostración subido exitosamente")
    } catch (err: any) {
      toast.error("Error al subir video: " + err.message)
    } finally {
      setIsUploadingTeacherVideo(false)
    }
  }

  // Manejo de reproducción
  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const seekTo = (sec: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = sec
      setCurrentTime(sec)
    }
  }

  const changeSpeed = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec < 10 ? "0" : ""}${sec}`
  }

  // Capturar timestamp actual para agregar nota
  const startAddingMarker = () => {
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
      setNewMarkerTime(videoRef.current.currentTime)
    }
  }

  const confirmAddMarker = () => {
    if (newMarkerTime === null || !newMarkerNote.trim()) return
    const newM: TimestampMarker = {
      time: Math.round(newMarkerTime * 10) / 10,
      note: newMarkerNote.trim(),
    }
    const updated = [...markers, newM].sort((a, b) => a.time - b.time)
    setMarkers(updated)
    setNewMarkerNote("")
    setNewMarkerTime(null)
  }

  const removeMarker = (index: number) => {
    setMarkers(prev => prev.filter((_, i) => i !== index))
  }

  // Guardar feedback del profesor en Supabase
  const handleSaveFeedback = async () => {
    setIsSaving(true)
    try {
      const { error: updateErr } = await supabase
        .from("ExerciseSubmission")
        .update({
          status,
          teacher_feedback_text: generalFeedback.trim() || null,
          teacher_feedback_video_url: teacherVideoUrl,
          timestamp_markers: markers,
          reviewed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", submission.id)

      if (updateErr) throw updateErr

      // Si la tarea fue APROBADA y está vinculada a un Task, marcar el Task como completado
      if (status === "APPROVED" && submission.task_id) {
        await supabase
          .from("Task")
          .update({ completed: true, progress: 100 })
          .eq("id", submission.task_id)
      }

      // Notificar al alumno por Web Push
      try {
        const { data: sProf } = await supabase
          .from("StudentProfile")
          .select("user_id")
          .eq("id", submission.student_id)
          .maybeSingle()

        if (sProf?.user_id) {
          await supabase.functions.invoke("notify-student-push", {
            body: {
              customParams: {
                studentUserId: sProf.user_id,
                date: new Date().toISOString().split("T")[0],
                time: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
                title: "🥁 Devolución de Ejercicio",
                message: `Tu profesor revisó tu video "${submission.title}" y dejó comentarios.`,
                url: `/dashboard`,
              },
            },
          })
        }
      } catch (pushErr) {
        console.warn("Push to student warning:", pushErr)
      }

      toast.success("Feedback guardado y notificado al alumno")
      if (onUpdate) onUpdate()
      onClose()
    } catch (err: any) {
      console.error("Error saving feedback:", err)
      toast.error("Error al guardar feedback: " + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-100">{submission.title}</h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                status === "APPROVED" 
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : status === "NEEDS_WORK"
                  ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                  : "bg-violet-500/20 text-violet-400 border border-violet-500/30"
              }`}>
                {status === "APPROVED" ? "Aprobado" : status === "NEEDS_WORK" ? "Requiere corrección" : "Pendiente de revisión"}
              </span>
            </div>
            {submission.student_name && (
              <span className="text-[11px] text-neutral-400">Alumno: {submission.student_name}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split view (Video Player on left, Feedback / Timestamps on right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-y-auto">
          
          {/* Left Column: Video & Technical Controls (7 cols) */}
          <div className="lg:col-span-7 bg-black flex flex-col justify-between p-3 sm:p-4 border-b lg:border-b-0 lg:border-r border-neutral-800">
            {teacherVideoUrl && (
              <div className="flex items-center justify-between mb-2">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setActiveVideoTab("student"); setIsPlaying(false) }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeVideoTab === "student"
                        ? "bg-violet-600 text-white shadow-sm"
                        : "bg-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    📹 Video del Alumno
                  </button>
                  <button
                    type="button"
                    onClick={() => { setActiveVideoTab("teacher"); setIsPlaying(false) }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activeVideoTab === "teacher"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    🥁 Demostración del Profesor
                  </button>
                </div>

                {activeVideoTab === "teacher" && isTeacher && (
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherVideoUrl(null)
                      setActiveVideoTab("student")
                      setIsPlaying(false)
                    }}
                    className="text-[11px] text-red-400 hover:underline px-2 py-1"
                  >
                    Quitar Video
                  </button>
                )}
              </div>
            )}

            <div className="relative flex-1 flex items-center justify-center min-h-[260px] sm:min-h-[340px]">
              <video
                ref={videoRef}
                key={activeVideoTab}
                src={activeVideoTab === "student" ? submission.video_url : (teacherVideoUrl || "")}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="w-full max-h-[420px] object-contain rounded-lg"
              />
            </div>

            {/* Custom Technical Controls */}
            <div className="mt-3 space-y-2.5 bg-neutral-900/90 backdrop-blur-md p-3 rounded-xl border border-neutral-800">
              
              {/* Timeline Seek Bar */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onChange={e => seekTo(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                />
                <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                  <span>{formatSec(currentTime)}</span>
                  <span>{formatSec(duration)}</span>
                </div>
              </div>

              {/* Action Buttons: Play/Pause, Rewind, Slow Motion */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-transform active:scale-95"
                    title={isPlaying ? "Pausar" : "Reproducir"}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <button
                    onClick={() => seekTo(Math.max(0, currentTime - 3))}
                    className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                    title="Retroceder 3 segundos"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Slow Motion Speeds (Crucial for drum technique analysis) */}
                <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 font-bold px-1.5 flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                  </span>
                  {[0.5, 0.75, 1].map(rate => (
                    <button
                      key={rate}
                      onClick={() => changeSpeed(rate)}
                      className={`px-2 py-0.5 text-xs font-bold rounded transition-colors ${
                        playbackRate === rate
                          ? "bg-violet-600 text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>

                {/* Teacher button to drop a pin at the current frame */}
                {isTeacher && (
                  <button
                    onClick={startAddingMarker}
                    className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Anotar en {formatSec(currentTime)}</span>
                  </button>
                )}
              </div>

            </div>

            {/* Student Note */}
            {submission.student_notes && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-neutral-800/60 border border-neutral-800 text-xs">
                <span className="text-[11px] font-bold text-neutral-400 block mb-0.5">Nota del alumno:</span>
                <p className="text-neutral-200 italic">"{submission.student_notes}"</p>
              </div>
            )}
          </div>

          {/* Right Column: Timestamps & Teacher Feedback (5 cols) */}
          <div className="lg:col-span-5 p-4 flex flex-col justify-between space-y-4 bg-neutral-900 overflow-y-auto">
            
            {/* Timestamp Markers List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-400" />
                  Correcciones por segundo ({markers.length})
                </h4>
                <span className="text-[10px] text-neutral-500">Haz clic para saltar al segundo</span>
              </div>

              {/* Input for new marker when teacher paused */}
              {isTeacher && newMarkerTime !== null && (
                <div className="p-3 bg-neutral-800 rounded-xl border border-violet-500/40 space-y-2 animate-in fade-in duration-150">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-violet-300">Nota en {formatSec(newMarkerTime)}:</span>
                    <button onClick={() => setNewMarkerTime(null)} className="text-neutral-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={newMarkerNote}
                    onChange={e => setNewMarkerNote(e.target.value)}
                    placeholder="Ej: Cuidado con el codo izquierdo aquí..."
                    autoFocus
                    className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    onKeyDown={e => { if (e.key === "Enter") confirmAddMarker() }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={confirmAddMarker}
                      className="px-3 py-1 rounded-md bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs"
                    >
                      Guardar nota
                    </button>
                  </div>
                </div>
              )}

              {/* Markers items */}
              {markers.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-neutral-800 rounded-xl text-neutral-500 text-xs">
                  Aún no hay marcadores temporales.
                  {isTeacher && " Pausa el video y toca 'Anotar' para señalar un detalle técnico exacto."}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                  {markers.map((m, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start justify-between gap-2 p-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
                      onClick={() => seekTo(m.time)}
                    >
                      <div className="flex items-start gap-2">
                        <span className="px-1.5 py-0.5 bg-violet-950 text-violet-300 border border-violet-800 rounded font-mono text-[10px] font-bold shrink-0">
                          {formatSec(m.time)}
                        </span>
                        <p className="text-xs text-neutral-200 leading-snug group-hover:text-white">
                          {m.note}
                        </p>
                      </div>
                      {isTeacher && (
                        <button
                          onClick={e => { e.stopPropagation(); removeMarker(idx) }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-neutral-500 transition-opacity"
                          title="Eliminar nota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* General Feedback Box */}
            <div className="space-y-1.5 pt-2 border-t border-neutral-800">
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">
                Devolución General del Profesor
              </label>

              {isTeacher ? (
                <textarea
                  value={generalFeedback}
                  onChange={e => setGeneralFeedback(e.target.value)}
                  placeholder="Comentario general sobre la postura, sonido, tempo y dinamismo..."
                  rows={3}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              ) : (
                <div className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-800 text-xs text-neutral-200">
                  {generalFeedback || "Tu profesor aún no ha dejado una devolución escrita general."}
                </div>
              )}

              {/* Adjuntar o cambiar video de demostración del profesor */}
              {isTeacher && (
                <div className="pt-2">
                  <input
                    ref={teacherVideoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleTeacherVideoUpload}
                  />
                  <button
                    type="button"
                    disabled={isUploadingTeacherVideo}
                    onClick={() => teacherVideoInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-98"
                  >
                    {isUploadingTeacherVideo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Subiendo tu video de demostración...</span>
                      </>
                    ) : (
                      <>
                        <Video className="w-3.5 h-3.5" />
                        <span>{teacherVideoUrl ? "✓ Cambiar Video de Demostración" : "📹 Adjuntar Video de Demostración (Técnica / Baquetas)"}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Teacher Actions Footer (Status Selection & Save) */}
            {isTeacher && (
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <div>
                  <span className="block text-[11px] font-semibold text-neutral-400 mb-1.5">
                    Calificación del Ejercicio:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus("APPROVED")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        status === "APPROVED"
                          ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Aprobar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus("NEEDS_WORK")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        status === "NEEDS_WORK"
                          ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                          : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Reintentar</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSaveFeedback}
                  disabled={isSaving}
                  className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition-transform active:scale-98 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Devolución al Alumno</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Student View Action Button */}
            {!isTeacher && (
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition-colors"
                >
                  Cerrar
                </button>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}
