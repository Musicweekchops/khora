"use client"

import React, { useState, useRef, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useMediaDevices } from "@/lib/hooks/useMediaDevices"
import { 
  Video, 
  Square, 
  RefreshCw, 
  Check, 
  X, 
  Loader2, 
  Sparkles, 
  Radio, 
  Volume2, 
  Maximize2, 
  Minimize2, 
  Sliders,
  Play,
  Pause
} from "lucide-react"
import { toast } from "sonner"
import MediaDeviceSettingsModal from "@/components/media/MediaDeviceSettingsModal"

interface MicroReactionRecorderProps {
  isOpen: boolean
  onClose: () => void
  currentTime: number
  submissionId: string
  onSaveReaction: (marker: {
    time: number
    note: string
    video_reaction_url: string
    display_mode: "bubble" | "fullscreen"
    video_duration: number
  }) => void
}

export default function MicroReactionRecorder({
  isOpen,
  onClose,
  currentTime,
  submissionId,
  onSaveReaction,
}: MicroReactionRecorderProps) {
  const { getProMediaStream } = useMediaDevices()

  const [displayMode, setDisplayMode] = useState<"bubble" | "fullscreen">("bubble")
  const [isRecording, setIsRecording] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null)
  const [isPlayingReview, setIsPlayingReview] = useState(false)
  const [reactionNote, setReactionNote] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const videoReviewRef = useRef<HTMLVideoElement | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<Blob[]>([])
  const timerIntervalRef = useRef<number | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const MAX_SECONDS = 60 // 1 minuto máximo para micro-cápsula técnica

  // Iniciar cámara con hardware profesional
  const startCamera = async () => {
    stopCamera()

    try {
      const stream = await getProMediaStream()
      mediaStreamRef.current = stream

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play().catch(() => {})
      }

      // Medidor de Audio
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx && stream.getAudioTracks().length > 0) {
        const audioCtx = new AudioCtx()
        audioContextRef.current = audioCtx
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        analyserRef.current = analyser

        const source = audioCtx.createMediaStreamSource(stream)
        source.connect(analyser)

        const dataArray = new Uint8Array(analyser.frequencyBinCount)
        const updateMeter = () => {
          if (!analyserRef.current) return
          analyserRef.current.getByteFrequencyData(dataArray)
          let sum = 0
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i]
          const avg = sum / dataArray.length
          setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)))
          animFrameRef.current = requestAnimationFrame(updateMeter)
        }
        updateMeter()
      }
    } catch (err: any) {
      console.error("Error accessing camera in MicroReaction:", err)
      toast.error("No se pudo iniciar la cámara o micrófono: " + (err?.message || "Revisa permisos"))
    }
  }

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop())
      mediaStreamRef.current = null
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null
    }
    setAudioLevel(0)
  }

  useEffect(() => {
    if (isOpen && !recordedBlob) {
      startCamera()
    } else {
      stopCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, recordedBlob])

  // Iniciar conteo regresivo
  const triggerCountdown = () => {
    setCountdown(3)
    const countInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countInterval)
          startRecording()
          return null
        }
        return prev - 1
      })
    }, 1000)
  }

  const startRecording = () => {
    if (!mediaStreamRef.current) return

    recordedChunksRef.current = []
    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4",
    ]
    const supportedMime = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || ""

    try {
      const recorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: supportedMime,
        videoBitsPerSecond: 3_500_000, // 3.5 Mbps Full HD
      })

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: supportedMime || "video/webm" })
        setRecordedBlob(blob)
        setRecordedUrl(URL.createObjectURL(blob))
        setIsRecording(false)
        stopCamera()
      }

      mediaRecorderRef.current = recorder
      recorder.start(500) // Trozos de 500ms
      setIsRecording(true)
      setRecordingSeconds(0)

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
      toast.error("Error al iniciar grabación: " + err.message)
    }
  }

  const stopRecording = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
  }

  // Reiniciar para volver a grabar
  const handleRetake = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedBlob(null)
    setRecordedUrl(null)
    setRecordingSeconds(0)
    setIsRecording(false)
    startCamera()
  }

  // Subir video a Supabase Storage y guardar reacción
  const handleSave = async () => {
    if (!recordedBlob) return
    setIsUploading(true)

    try {
      const ext = recordedBlob.type.includes("mp4") ? "mp4" : "webm"
      const path = `reactions/${submissionId}_${Math.round(currentTime)}_${Date.now()}.${ext}`

      const { data, error } = await supabase.storage
        .from("submissions")
        .upload(path, recordedBlob, { contentType: recordedBlob.type })

      if (error) throw error

      const { data: pubData } = supabase.storage
        .from("submissions")
        .getPublicUrl(data.path)

      onSaveReaction({
        time: Math.round(currentTime * 10) / 10,
        note: reactionNote.trim() || (displayMode === "fullscreen" ? "Demostración en Pad / Batería" : "Corrección técnica"),
        video_reaction_url: pubData.publicUrl,
        display_mode: displayMode,
        video_duration: recordingSeconds,
      })

      toast.success("¡Video-reacción guardada exitosamente!")
      onClose()
    } catch (err: any) {
      console.error("Error saving reaction:", err)
      toast.error("Error al guardar video-reacción: " + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const formatSec = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec < 10 ? "0" : ""}${sec}`
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div>
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
              Grabar Video-Reacción en {formatSec(currentTime)}
            </h3>
            <p className="text-[11px] text-neutral-400">
              {displayMode === "fullscreen" 
                ? "Modo Pad / Batería: Se mostrará en pantalla principal para que el alumno aprecie el movimiento."
                : "Modo Comentario: Aparecerás en una burbuja sobre el fotograma del alumno."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!recordedBlob && !isRecording && (
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                title="Configuración de Cámara e Interfaz"
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

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4">
          
          {/* Selector de Modo: Burbuja vs Pad / Batería */}
          {!recordedBlob && !isRecording && (
            <div className="grid grid-cols-2 gap-2 bg-neutral-950 p-1.5 rounded-xl border border-neutral-800">
              <button
                type="button"
                onClick={() => setDisplayMode("bubble")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  displayMode === "bubble"
                    ? "bg-violet-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Burbuja Comentario (PiP)</span>
              </button>

              <button
                type="button"
                onClick={() => setDisplayMode("fullscreen")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  displayMode === "fullscreen"
                    ? "bg-emerald-600 text-white shadow-md"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-900"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>🥁 Modo Pad / Batería</span>
              </button>
            </div>
          )}

          {/* Area de Video (En vivo o Grabado) */}
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center shadow-inner">
            
            {!recordedUrl ? (
              <video
                ref={videoPreviewRef}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoReviewRef}
                src={recordedUrl}
                playsInline
                onPlay={() => setIsPlayingReview(true)}
                onPause={() => setIsPlayingReview(false)}
                onEnded={() => setIsPlayingReview(false)}
                className="w-full h-full object-cover"
              />
            )}

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in">
                <span className="text-7xl font-extrabold text-white animate-bounce font-mono">
                  {countdown}
                </span>
                <span className="text-xs text-neutral-300 font-bold uppercase tracking-widest mt-2">
                  ¡Prepárate!
                </span>
              </div>
            )}

            {/* Badges durante grabación */}
            {isRecording && (
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="flex items-center gap-1.5 bg-red-600/90 text-white px-2.5 py-1 rounded-md text-xs font-bold font-mono tracking-wider animate-pulse shadow-md">
                  <span className="h-2 w-2 rounded-full bg-white" />
                  REC {formatSec(recordingSeconds)} / {formatSec(MAX_SECONDS)}
                </span>
                <span className="bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold text-neutral-300 border border-neutral-700">
                  {displayMode === "fullscreen" ? "Modo Batería" : "Modo Burbuja"}
                </span>
              </div>
            )}

            {/* Medidor VU en vivo */}
            {!recordedBlob && (
              <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-800 flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-75 rounded-full"
                    style={{ width: `${audioLevel}%` }}
                  />
                </div>
              </div>
            )}

            {/* Botón Play/Pausa en la revisión */}
            {recordedUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors">
                <button
                  type="button"
                  onClick={() => {
                    if (!videoReviewRef.current) return
                    if (videoReviewRef.current.paused) {
                      videoReviewRef.current.play()
                    } else {
                      videoReviewRef.current.pause()
                    }
                  }}
                  className="p-4 rounded-full bg-violet-600/90 hover:bg-violet-600 text-white shadow-xl transition-transform active:scale-95"
                >
                  {isPlayingReview ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Input de descripción corta / nota del profesor */}
          {recordedBlob && (
            <div className="space-y-1.5 animate-in fade-in">
              <label className="text-xs font-bold text-neutral-300">
                Título o indicación rápida para el alumno:
              </label>
              <input
                type="text"
                value={reactionNote}
                onChange={e => setReactionNote(e.target.value)}
                placeholder={displayMode === "fullscreen" ? "Ej: Fíjate en el rebote de la mano izquierda..." : "Ej: Ajusta la inclinación de la baqueta..."}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>
          )}

          {/* Barra de Acciones */}
          <div className="flex items-center justify-between pt-2">
            {!recordedBlob ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isRecording}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>

                {!isRecording ? (
                  <button
                    type="button"
                    onClick={triggerCountdown}
                    disabled={countdown !== null}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition-all shadow-lg shadow-red-600/30 active:scale-95 flex items-center gap-2"
                  >
                    <Video className="w-4 h-4 fill-current" />
                    Grabar Video-Reacción
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-white text-neutral-950 transition-all shadow-lg active:scale-95 flex items-center gap-2 font-mono"
                  >
                    <Square className="w-4 h-4 fill-current text-red-600" />
                    Detener ({formatSec(recordingSeconds)})
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Volver a Grabar
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUploading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-lg shadow-emerald-600/30 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Subiendo cápsula...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Guardar Reacción ({formatSec(recordingSeconds)})
                    </>
                  )}
                </button>
              </>
            )}
          </div>

        </div>

      </div>

      {/* Modal de Ajustes de Cámara e Interfaz */}
      <MediaDeviceSettingsModal
        isOpen={showSettings}
        onClose={() => {
          setShowSettings(false)
          startCamera()
        }}
        onDevicesChanged={() => startCamera()}
      />
    </div>
  )
}

