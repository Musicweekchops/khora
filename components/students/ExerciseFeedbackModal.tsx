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
  Video,
  Upload,
  Sliders,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"
import VideoExerciseRecorder from "@/components/students/VideoExerciseRecorder"
import MicroReactionRecorder from "@/components/students/MicroReactionRecorder"
import MediaDeviceSettingsModal from "@/components/media/MediaDeviceSettingsModal"

export interface TimestampMarker {
  time: number
  note: string
  video_reaction_url?: string
  display_mode?: "bubble" | "fullscreen"
  video_duration?: number
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
  const [showTeacherRecorder, setShowTeacherRecorder] = useState(false)
  const [isUploadingTeacherVideo, setIsUploadingTeacherVideo] = useState(false)
  const teacherVideoInputRef = useRef<HTMLInputElement | null>(null)

  // Micro-reacciones en video (Opción C + Modo Pad/Batería)
  const [showReactionRecorder, setShowReactionRecorder] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [activeReaction, setActiveReaction] = useState<TimestampMarker | null>(null)
  const lastTriggeredMarkerTimeRef = useRef<number | null>(null)
  const reactionVideoRef = useRef<HTMLVideoElement | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    setMarkers(submission.timestamp_markers || [])
    setGeneralFeedback(submission.teacher_feedback_text || "")
    setStatus(submission.status)
    setTeacherVideoUrl(submission.teacher_feedback_video_url || null)
    setActiveVideoTab("student")
    setActiveReaction(null)
    lastTriggeredMarkerTimeRef.current = null
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
    if (activeReaction) setActiveReaction(null)
    if (videoRef.current.paused) {
      videoRef.current.play()
      setIsPlaying(true)
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const handleTimeUpdate = () => {
    if (!videoRef.current) return
    const cur = videoRef.current.currentTime
    setCurrentTime(cur)

    // Auto-pausa al llegar a una micro-reacción en video
    if (activeVideoTab === "student" && !activeReaction && !videoRef.current.paused) {
      const hit = markers.find(m =>
        Boolean(m.video_reaction_url) &&
        Math.abs(cur - m.time) < 0.35 &&
        lastTriggeredMarkerTimeRef.current !== m.time
      )
      if (hit) {
        videoRef.current.pause()
        setIsPlaying(false)
        setActiveReaction(hit)
        lastTriggeredMarkerTimeRef.current = hit.time
      }
    }
  }

  // Cerrar la reacción y continuar el video del alumno
  const continueAfterReaction = () => {
    setActiveReaction(null)
    if (videoRef.current) {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const replayReaction = () => {
    if (reactionVideoRef.current) {
      reactionVideoRef.current.currentTime = 0
      reactionVideoRef.current.play()
    }
  }

  const openReaction = (m: TimestampMarker) => {
    if (videoRef.current) {
      videoRef.current.pause()
      videoRef.current.currentTime = m.time
      setCurrentTime(m.time)
    }
    setIsPlaying(false)
    lastTriggeredMarkerTimeRef.current = m.time
    setActiveReaction(m)
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
      lastTriggeredMarkerTimeRef.current = null
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

  const handleSaveMicroReaction = (newMarker: TimestampMarker) => {
    setMarkers(prev => [...prev, newMarker].sort((a, b) => a.time - b.time))
    setShowReactionRecorder(false)
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

      // Notificar al alumno por Web Push y Correo Electrónico
      try {
        const { data: sProf } = await supabase
          .from("StudentProfile")
          .select("user_id, User(name, email)")
          .eq("id", submission.student_id)
          .maybeSingle()

        const sUser: any = Array.isArray(sProf?.User) ? sProf?.User[0] : sProf?.User
        const videoReactionsCount = markers.filter(m => Boolean(m.video_reaction_url)).length

        if (sProf?.user_id) {
          await supabase.functions.invoke("notify-student-push", {
            body: {
              type: "VIDEO_FEEDBACK",
              customParams: {
                studentUserId: sProf.user_id,
                teacherName: "Arnaldo Allende",
                date: new Date().toISOString().split("T")[0],
                time: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
                title: "🥁 ¡Arnaldo respondió a tu video!",
                message: videoReactionsCount > 0
                  ? `Revisó "${submission.title}" y te dejó ${videoReactionsCount} video-reacción${videoReactionsCount > 1 ? "es" : ""} técnica${videoReactionsCount > 1 ? "s" : ""}. ¡Toca para verlas!`
                  : `Revisó "${submission.title}" y te dejó correcciones técnicas. ¡Toca para verlas!`,
                url: `/dashboard/videos`,
              },
            },
          })
        }

        if (sUser?.email) {
          const studentFirstName = (sUser.name || submission.student_name || "Alumno").split(" ")[0]
          const statusLabel = status === "APPROVED" 
            ? "✅ ¡Aprobado!" 
            : status === "NEEDS_WORK" 
            ? "⚠️ Requiere ajuste de técnica" 
            : "⏳ Revisado"

          const statusColor = status === "APPROVED" ? "#10b981" : status === "NEEDS_WORK" ? "#f59e0b" : "#8b5cf6"

          const feedbackNoteHtml = generalFeedback.trim()
            ? `<div style="background-color: #27272a; border-radius: 14px; padding: 16px; margin: 20px 0; text-align: left;"><div style="font-size: 11px; font-weight: 800; color: #a78bfa; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Comentarios del profesor</div><p style="font-size: 13.5px; color: #e4e4e7; line-height: 1.6; margin: 0;">${generalFeedback.trim().replace(/\n/g, "<br>")}</p></div>`
            : ""

          const markersHtml = markers.length > 0
            ? `<div style="background-color: #1f1f23; border: 1px dashed #3f3f46; border-radius: 14px; padding: 14px; margin-bottom: 20px; text-align: left;"><div style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">⏱️ Notas al segundo exacto (${markers.length})</div><p style="font-size: 12px; color: #a1a1aa; margin: 0;">Tu profesor marcó momentos específicos en el video con indicaciones técnicas para que revises con slow-motion.</p></div>`
            : ""

          const reactionsHtml = videoReactionsCount > 0
            ? `<div style="background-color: #2e1065; border: 1px solid #7c3aed; border-radius: 14px; padding: 14px; margin-bottom: 20px; text-align: left;"><div style="font-size: 11px; font-weight: 800; color: #c4b5fd; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">🎥 ${videoReactionsCount} video-reacción${videoReactionsCount > 1 ? "es" : ""} de tu profesor</div><p style="font-size: 12px; color: #e9d5ff; margin: 0;">Al reproducir tu video, se pausará solo en los momentos exactos donde Arnaldo te explica o demuestra en el pad/batería cómo corregirlo.</p></div>`
            : ""

          const demoNoticeHtml = teacherVideoUrl
            ? `<div style="background-color: #2e1065; border: 1px solid #7c3aed; border-radius: 14px; padding: 14px; margin-bottom: 20px; text-align: left;"><div style="font-size: 11px; font-weight: 800; color: #c4b5fd; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">🥁 Demostración grabada por tu profesor</div><p style="font-size: 12px; color: #e9d5ff; margin: 0;">Arnaldo te grabó un video demostrativo para que veas la técnica correcta.</p></div>`
            : ""

          await supabase.functions.invoke("send-email", {
            body: {
              to: sUser.email,
              subject: `🥁 Arnaldo respondió a tu video: ${submission.title}`,
              customHtml: `
                <!DOCTYPE html>
                <html>
                <head><meta charset="utf-8"><title>Devolución técnica de ejercicio</title></head>
                <body style="margin: 0; padding: 0; background-color: #0f0f13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #ffffff;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding: 40px 12px;">
                    <tr>
                      <td align="center">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #18181b; border: 1px solid #27272a; border-radius: 24px; overflow: hidden;">
                          <tr>
                            <td style="padding: 32px 32px 28px 32px; text-align: center;">
                              <div style="font-size: 32px; margin-bottom: 12px;">🥁</div>
                              <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">¡Arnaldo respondió a tu video!</h2>
                              <p style="font-size: 14px; color: #a1a1aa; line-height: 1.6; margin: 0 0 16px 0;">
                                ¡Hola <strong>${studentFirstName}</strong>! Arnaldo acaba de revisar tu video:
                              </p>
                              <div style="background-color: #27272a; border: 1px solid #3f3f46; border-radius: 16px; padding: 16px; margin-bottom: 16px; text-align: left;">
                                <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-bottom: 6px;">📹 ${submission.title}</div>
                                <span style="display: inline-block; font-size: 11px; font-weight: 800; text-transform: uppercase; color: ${statusColor};">${statusLabel}</span>
                              </div>
                              ${feedbackNoteHtml}
                              ${markersHtml}
                              ${reactionsHtml}
                              ${demoNoticeHtml}
                              <a href="https://khora.cl/dashboard/videos" style="display: inline-block; background-color: #7c3aed; color: #ffffff !important; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 12px; margin-top: 10px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);">
                                Ver Corrección y Slow-Motion
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
              `,
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
          <div className="flex items-center gap-2">
            {isTeacher && (
              <button
                type="button"
                onClick={() => setShowSettingsModal(true)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="Ajustes de Estudio (Cámara Pro / Interfaz de Audio)"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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

            <div className="relative flex-1 flex items-center justify-center min-h-[260px] sm:min-h-[340px] overflow-hidden rounded-lg">
              <video
                ref={videoRef}
                key={activeVideoTab}
                src={activeVideoTab === "student" ? submission.video_url : (teacherVideoUrl || "")}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className={`w-full max-h-[420px] object-contain rounded-lg transition-opacity duration-300 ${
                  activeReaction?.display_mode === "bubble" ? "opacity-40" : "opacity-100"
                }`}
              />

              {/* Modo Pad / Batería: cámara del profesor como principal */}
              {activeReaction && activeReaction.display_mode === "fullscreen" && (
                <div className="absolute inset-0 z-30 bg-black flex flex-col animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between px-3 py-2 bg-neutral-950/90 border-b border-neutral-800">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      🥁 Demostración en Pad / Batería · {formatSec(activeReaction.time)}
                    </span>
                    <button onClick={() => setActiveReaction(null)} className="p-1 text-neutral-400 hover:text-white rounded">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative flex-1 bg-black flex items-center justify-center min-h-0">
                    <video
                      ref={reactionVideoRef}
                      src={activeReaction.video_reaction_url}
                      playsInline
                      autoPlay
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="p-2.5 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-neutral-300 italic truncate">"{activeReaction.note}"</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button type="button" onClick={replayReaction} className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" /> Repetir
                      </button>
                      <button type="button" onClick={continueAfterReaction} className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                        <Play className="w-3 h-3 fill-current" /> Continuar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Modo Comentario: burbuja PiP sobre el fotograma del alumno */}
              {activeReaction && activeReaction.display_mode !== "fullscreen" && (
                <div className="absolute bottom-3 right-3 z-30 w-52 sm:w-64 bg-neutral-900 border-2 border-violet-500 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-violet-950/90 border-b border-violet-800/80">
                    <span className="text-[11px] font-bold text-violet-300 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
                      Arnaldo · {formatSec(activeReaction.time)}
                    </span>
                    <button onClick={() => setActiveReaction(null)} className="text-violet-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="relative aspect-video bg-black">
                    <video
                      ref={reactionVideoRef}
                      src={activeReaction.video_reaction_url}
                      playsInline
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {activeReaction.note && (
                    <p className="px-2 pt-1.5 text-[10px] text-neutral-300 italic truncate">"{activeReaction.note}"</p>
                  )}
                  <div className="p-2 bg-neutral-950 flex items-center justify-between gap-1.5 text-[10px]">
                    <button type="button" onClick={replayReaction} className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded font-bold flex items-center gap-1">
                      <RotateCcw className="w-2.5 h-2.5" /> Repetir
                    </button>
                    <button type="button" onClick={continueAfterReaction} className="px-2.5 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded font-bold flex items-center gap-1">
                      <Play className="w-2.5 h-2.5 fill-current" /> Continuar
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Technical Controls */}
            <div className="mt-3 space-y-2.5 bg-neutral-900/90 backdrop-blur-md p-3 rounded-xl border border-neutral-800">
              
              {/* Timeline Seek Bar */}
              <div className="space-y-1">
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={e => seekTo(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  {/* Pines de correcciones sobre la línea de tiempo */}
                  {duration > 0 && activeVideoTab === "student" && markers.map((m, idx) => {
                    const pct = Math.min(100, Math.max(0, (m.time / duration) * 100))
                    const hasVideo = Boolean(m.video_reaction_url)
                    const isPad = m.display_mode === "fullscreen"
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => (hasVideo ? openReaction(m) : seekTo(m.time))}
                        style={{ left: `${pct}%` }}
                        title={`${formatSec(m.time)} · ${m.note}`}
                        className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-neutral-900 transition-transform hover:scale-150 z-10 ${
                          hasVideo ? (isPad ? "bg-emerald-400 shadow shadow-emerald-500/60" : "bg-violet-400 shadow shadow-violet-500/60") : "bg-amber-400"
                        }`}
                      />
                    )
                  })}
                </div>
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

                {/* Teacher buttons: video-reaction + written note at the current frame */}
                {isTeacher && activeVideoTab === "student" && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        if (videoRef.current) {
                          videoRef.current.pause()
                          setIsPlaying(false)
                        }
                        setShowReactionRecorder(true)
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Grabar video-reacción en este segundo"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Reaccionar en {formatSec(currentTime)}</span>
                    </button>
                    <button
                      onClick={startAddingMarker}
                      className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 transition-colors"
                      title={`Nota escrita en ${formatSec(currentTime)}`}
                    >
                      <MessageSquarePlus className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                  Aún no hay correcciones.
                  {isTeacher && " Pausa el video y toca 'Reaccionar' para grabar una corrección en video, o el ícono de nota para una escrita."}
                </div>
              ) : (
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                  {markers.map((m, idx) => {
                    const hasVideo = Boolean(m.video_reaction_url)
                    const isPad = m.display_mode === "fullscreen"
                    return (
                    <div
                      key={idx}
                      className={`group flex items-start justify-between gap-2 p-2 rounded-lg border transition-colors cursor-pointer ${
                        hasVideo
                          ? isPad
                            ? "bg-emerald-950/30 hover:bg-emerald-950/50 border-emerald-800/60"
                            : "bg-violet-950/30 hover:bg-violet-950/50 border-violet-800/60"
                          : "bg-neutral-800/80 hover:bg-neutral-800 border-neutral-800"
                      }`}
                      onClick={() => (hasVideo ? openReaction(m) : seekTo(m.time))}
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="px-1.5 py-0.5 bg-violet-950 text-violet-300 border border-violet-800 rounded font-mono text-[10px] font-bold shrink-0">
                          {formatSec(m.time)}
                        </span>
                        <div className="min-w-0">
                          {hasVideo && (
                            <span className={`block text-[10px] font-bold uppercase tracking-wider ${isPad ? "text-emerald-400" : "text-violet-400"}`}>
                              {isPad ? "🥁 Demostración Pad / Batería" : "🎥 Video-reacción"}
                              {m.video_duration ? ` · ${m.video_duration}s` : ""}
                            </span>
                          )}
                          <p className="text-xs text-neutral-200 leading-snug group-hover:text-white">
                            {m.note}
                          </p>
                        </div>
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
                    )
                  })}
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

              {/* Adjuntar o grabar video de demostración del profesor */}
              {isTeacher && (
                <div className="pt-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-emerald-400" />
                      Demostración Técnica del Profesor
                    </span>
                    {teacherVideoUrl && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                        ✓ Video Listo
                      </span>
                    )}
                  </div>

                  <input
                    ref={teacherVideoInputRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleTeacherVideoUpload}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isUploadingTeacherVideo}
                      onClick={() => setShowTeacherRecorder(true)}
                      className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 shadow-md shadow-emerald-900/20"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>{teacherVideoUrl ? "Re-grabar" : "Grabar Ahora"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUploadingTeacherVideo}
                      onClick={() => teacherVideoInputRef.current?.click()}
                      className="py-2.5 px-3 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-750 text-neutral-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98"
                    >
                      {isUploadingTeacherVideo ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Subiendo...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" />
                          <span>Subir Video</span>
                        </>
                      )}
                    </button>
                  </div>
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

      {/* Grabador en Vivo para el Profesor */}
      {showTeacherRecorder && (
        <VideoExerciseRecorder
          studentId={submission.student_id}
          teacherId={submission.teacher_id}
          customTitle="Grabar Demostración Técnica (Profesor)"
          isOpen={showTeacherRecorder}
          onClose={() => setShowTeacherRecorder(false)}
          onRecorded={(url) => {
            setTeacherVideoUrl(url)
            setActiveVideoTab("teacher")
            toast.success("Demostración grabada y lista para adjuntar")
          }}
        />
      )}

      {/* Grabador de micro-reacciones (Opción C + Modo Pad/Batería) */}
      {showReactionRecorder && (
        <MicroReactionRecorder
          isOpen={showReactionRecorder}
          onClose={() => setShowReactionRecorder(false)}
          currentTime={currentTime}
          submissionId={submission.id}
          onSaveReaction={handleSaveMicroReaction}
        />
      )}

      {/* Ajustes de estudio: cámara pro / interfaz de audio */}
      {showSettingsModal && (
        <MediaDeviceSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  )
}
