"use client"

import React, { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Video, Square, RefreshCw, Upload, Check, AlertCircle, Loader2, X, Camera, Mic, Volume2 } from "lucide-react"
import { toast } from "sonner"

interface VideoExerciseRecorderProps {
  studentId: string
  teacherId: string
  taskId?: string
  taskTitle?: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  onRecorded?: (videoUrl: string) => void
  customTitle?: string
}

export default function VideoExerciseRecorder({
  studentId,
  teacherId,
  taskId,
  taskTitle,
  isOpen,
  onClose,
  onSuccess,
  onRecorded,
  customTitle,
}: VideoExerciseRecorderProps) {
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user")
  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [studentNotes, setStudentNotes] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<number | null>(null)

  const MAX_SECONDS = 90 // 1 min 30 s máx para cuidar almacenamiento y mantener foco en el ejercicio

  // Inicializar o reiniciar la cámara con constraints optimizados para música
  const startCamera = async (mode: "user" | "environment") => {
    stopCamera()
    setErrorMsg(null)

    try {
      // Configuración especializada para percusión y música acústica
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,   // Conserva resonancia de tambores y platillos
          noiseSuppression: false,   // Evita atenuar golpes de baqueta como "ruido"
          autoGainControl: false,    // No aplasta las dinámicas
          sampleRate: 48000,
          channelCount: { ideal: 2 },
        },
        video: {
          facingMode: mode,
          width: { ideal: 720, max: 1280 },
          height: { ideal: 1280, max: 1280 },
          frameRate: { ideal: 30, max: 30 },
        },
      })

      mediaStreamRef.current = stream
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play()
      }
    } catch (err: any) {
      console.error("Error accessing camera/mic:", err)
      setErrorMsg(
        err.name === "NotAllowedError"
          ? "Permiso denegado para cámara/micrófono. Habilítalo en tu navegador."
          : "No se pudo acceder a la cámara o micrófono."
      )
    }
  }

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop())
      mediaStreamRef.current = null
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null
    }
  }

  // Al abrir el modal, activar la cámara
  useEffect(() => {
    if (isOpen) {
      startCamera(facingMode)
      setRecordedBlob(null)
      setRecordedUrl(null)
      setRecordingSeconds(0)
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [isOpen, facingMode])

  // Cambiar cámara frontal / trasera
  const toggleFacingMode = () => {
    const next = facingMode === "user" ? "environment" : "user"
    setFacingMode(next)
  }

  // Iniciar cuenta regresiva 3, 2, 1
  const startCountdownAndRecord = () => {
    setCountdown(3)
    const cdInterval = window.setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(cdInterval)
          startActualRecording()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  // Grabación real
  const startActualRecording = () => {
    if (!mediaStreamRef.current) return

    recordedChunksRef.current = []
    setRecordedBlob(null)
    setRecordedUrl(null)
    setRecordingSeconds(0)

    try {
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/mp4"

      const recorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType,
        videoBitsPerSecond: 1_200_000, // 1.2 Mbps (720p óptimo)
        audioBitsPerSecond: 160_000,   // 160 kbps (alta fidelidad de audio)
      })

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const finalBlob = new Blob(recordedChunksRef.current, { type: mimeType })
        setRecordedBlob(finalBlob)
        const url = URL.createObjectURL(finalBlob)
        setRecordedUrl(url)
        stopCamera()
      }

      recorder.start(1000) // cada 1 segundo emite chunk
      mediaRecorderRef.current = recorder
      setIsRecording(true)

      // Contador de segundos
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= MAX_SECONDS - 1) {
            stopRecording()
            return MAX_SECONDS
          }
          return prev + 1
        })
      }, 1000)
    } catch (err: any) {
      console.error("Error creating MediaRecorder:", err)
      setErrorMsg("No se pudo iniciar la grabación en este navegador.")
    }
  }

  // Detener grabación
  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  // Repetir toma
  const discardAndRetake = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl)
    setRecordedBlob(null)
    setRecordedUrl(null)
    setRecordingSeconds(0)
    startCamera(facingMode)
  }

  // Subir video a Supabase
  const handleUploadAndSubmit = async () => {
    if (!recordedBlob) return
    setIsUploading(true)
    setErrorMsg(null)

    try {
      const ext = recordedBlob.type.includes("mp4") ? "mp4" : "webm"
      const fileName = `${studentId}/${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`

      // 1. Subida al bucket 'submissions'
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from("submissions")
        .upload(fileName, recordedBlob, {
          contentType: recordedBlob.type,
          upsert: false,
        })

      if (uploadErr) throw uploadErr

      // Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from("submissions")
        .getPublicUrl(uploadData.path)

      const videoUrl = publicUrlData.publicUrl

      // Si se proporcionó callback personalizado (ej: grabación de demostración del profesor)
      if (onRecorded) {
        onRecorded(videoUrl)
        if (onSuccess) onSuccess()
        onClose()
        return
      }

      // 2. Insertar en tabla ExerciseSubmission
      const { data: submissionData, error: insertErr } = await supabase
        .from("ExerciseSubmission")
        .insert({
          student_id: studentId,
          teacher_id: teacherId,
          task_id: taskId || null,
          title: taskTitle || "Práctica de ejercicio",
          video_url: videoUrl,
          video_duration: recordingSeconds,
          student_notes: studentNotes.trim() || null,
          status: "PENDING",
        })
        .select("id")
        .single()

      if (insertErr) throw insertErr

      // 3. Notificar al profesor por Web Push
      try {
        // Obtener nombre del estudiante
        const { data: sProf } = await supabase
          .from("StudentProfile")
          .select("User(name)")
          .eq("id", studentId)
          .maybeSingle()

        // Obtener user_id del profesor
        const { data: tProf } = await supabase
          .from("TeacherProfile")
          .select("user_id")
          .eq("id", teacherId)
          .maybeSingle()

        const studentName = (sProf as any)?.User?.name || "Un alumno"
        const teacherUserId = tProf?.user_id

        if (teacherUserId) {
          await supabase.functions.invoke("notify-teacher-push", {
            body: {
              customParams: {
                teacherUserId,
                studentName,
                date: new Date().toISOString().split("T")[0],
                time: new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
                title: "🥁 Nuevo Video de Ejercicio",
                message: `${studentName} te envió un video de práctica: ${taskTitle || "Ejercicio"}`,
                url: `/dashboard/alumnos`,
              },
            },
          })
        }
      } catch (pushErr) {
        console.warn("Push notification warning:", pushErr)
      }

      toast.success("¡Video enviado exitosamente a tu profesor!")
      if (onSuccess) onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Submission error:", err)
      setErrorMsg("Ocurrió un error al subir el video: " + (err.message || "Intenta nuevamente"))
    } finally {
      setIsUploading(false)
    }
  }

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Video className="w-4 h-4 text-violet-400" />
              {customTitle || (taskTitle ? `Grabar: ${taskTitle}` : "Grabar Ejercicio")}
            </h3>
            <span className="text-[11px] text-neutral-400">720p HD · Audio sin compresión</span>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="p-3 bg-red-950/80 border-b border-red-800 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Video Viewport */}
        <div className="relative flex-1 bg-black min-h-[300px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
          
          {/* Live Preview */}
          {!recordedUrl && (
            <video
              ref={videoPreviewRef}
              muted
              playsInline
              className={`w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
            />
          )}

          {/* Recorded Playback */}
          {recordedUrl && (
            <video
              src={recordedUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          )}

          {/* Countdown Overlay */}
          {countdown !== null && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
              <span className="text-7xl font-black text-violet-400 animate-ping">
                {countdown}
              </span>
            </div>
          )}

          {/* Recording Timer Badge */}
          {isRecording && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 text-white font-mono text-xs font-bold shadow-lg animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-white" />
              <span>{formatTimer(recordingSeconds)} / {formatTimer(MAX_SECONDS)}</span>
            </div>
          )}

          {/* Switch Camera Button (Only in preview) */}
          {!recordedUrl && !isRecording && (
            <button
              onClick={toggleFacingMode}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-95"
              title="Cambiar Cámara"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls Footer */}
        <div className="p-4 bg-neutral-900 border-t border-neutral-800 space-y-3">
          
          {/* Pre-recording controls */}
          {!recordedUrl && !isRecording && (
            <div className="flex flex-col gap-2">
              <button
                onClick={startCountdownAndRecord}
                disabled={countdown !== null || !!errorMsg}
                className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition-transform active:scale-98 disabled:opacity-50"
              >
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span>Iniciar Grabación</span>
              </button>
              <p className="text-[11px] text-neutral-400 text-center">
                Máximo 90 segundos. El micrófono está configurado para no cortar los platillos ni tambores.
              </p>
            </div>
          )}

          {/* Recording active controls */}
          {isRecording && (
            <button
              onClick={stopRecording}
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-transform active:scale-98"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Finalizar Grabación ({formatTimer(recordingSeconds)})</span>
            </button>
          )}

          {/* Post-recording controls (Preview & Submit) */}
          {recordedUrl && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1">
                  Nota para tu profesor (opcional):
                </label>
                <textarea
                  value={studentNotes}
                  onChange={e => setStudentNotes(e.target.value)}
                  placeholder="Ej: Profe, en el segundo 20 me costó el doble golpe con la mano izquierda..."
                  rows={2}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-xl p-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={discardAndRetake}
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Repetir Toma</span>
                </button>

                <button
                  onClick={handleUploadAndSubmit}
                  disabled={isUploading}
                  className="flex-[2] py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition-transform active:scale-98 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Subiendo video...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Enviar a mi Profesor</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
