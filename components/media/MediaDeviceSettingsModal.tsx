"use client"

import React, { useEffect, useRef, useState } from "react"
import { useMediaDevices } from "@/lib/hooks/useMediaDevices"
import { 
  Camera, 
  Mic, 
  Sliders, 
  X, 
  Check, 
  Volume2, 
  Sparkles, 
  Radio, 
  RotateCw, 
  AlertCircle 
} from "lucide-react"

interface MediaDeviceSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onDevicesChanged?: () => void
}

export default function MediaDeviceSettingsModal({
  isOpen,
  onClose,
  onDevicesChanged,
}: MediaDeviceSettingsModalProps) {
  const {
    videoDevices,
    audioDevices,
    selectedCameraId,
    selectedMicId,
    studioAudioMode,
    isLoading,
    selectCamera,
    selectMic,
    setStudioAudio,
    refreshDevices,
    getProMediaStream,
  } = useMediaDevices()

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null)
  const currentStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)

  const [audioLevel, setAudioLevel] = useState<number>(0)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  // Iniciar preview de cámara y medidor de audio
  const startPreview = async (camId: string, micId: string, studio: boolean) => {
    stopPreview()
    setIsInitializing(true)
    setPreviewError(null)

    try {
      const stream = await getProMediaStream(camId, micId, studio)
      currentStreamRef.current = stream

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream
        videoPreviewRef.current.play().catch(() => {})
      }

      // Medidor de VU / Nivel de Audio con Web Audio API
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
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i]
          }
          const avg = sum / dataArray.length
          const level = Math.min(100, Math.round((avg / 128) * 100))
          setAudioLevel(level)
          animFrameRef.current = requestAnimationFrame(updateMeter)
        }
        updateMeter()
      }
    } catch (err: any) {
      console.error("Error starting media preview:", err)
      setPreviewError(err?.message || "No se pudo acceder al dispositivo seleccionado.")
    } finally {
      setIsInitializing(false)
    }
  }

  const stopPreview = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close().catch(() => {})
      audioContextRef.current = null
    }
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(t => t.stop())
      currentStreamRef.current = null
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null
    }
    setAudioLevel(0)
  }

  useEffect(() => {
    if (isOpen) {
      startPreview(selectedCameraId, selectedMicId, studioAudioMode)
    } else {
      stopPreview()
    }
    return () => {
      stopPreview()
    }
  }, [isOpen, selectedCameraId, selectedMicId, studioAudioMode])

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value
    selectCamera(newId)
    if (onDevicesChanged) onDevicesChanged()
  }

  const handleMicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newId = e.target.value
    selectMic(newId)
    if (onDevicesChanged) onDevicesChanged()
  }

  const handleStudioAudioToggle = () => {
    const newVal = !studioAudioMode
    setStudioAudio(newVal)
    if (onDevicesChanged) onDevicesChanged()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-neutral-900 text-white rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-600/20 text-violet-400 rounded-xl border border-violet-500/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-1.5">
                Configuración de Audio y Video
                <span className="text-[10px] font-bold bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/30">
                  Estudio Pro
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Selecciona tu cámara profesional (Cam Link / OBS) e interfaz de audio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          
          {/* Live Video Preview Box */}
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center group shadow-inner">
            <video
              ref={videoPreviewRef}
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {isInitializing && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-xs text-neutral-400 gap-2">
                <RotateCw className="w-4 h-4 animate-spin text-violet-400" />
                Conectando señal de video...
              </div>
            )}

            {previewError && (
              <div className="absolute inset-0 bg-black/80 p-4 flex flex-col items-center justify-center text-center text-red-400 text-xs">
                <AlertCircle className="w-6 h-6 mb-1 text-red-400" />
                <span>{previewError}</span>
              </div>
            )}

            {/* Badges de estado en el preview */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
              <span className="flex items-center gap-1 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                EN VIVO
              </span>
              <span className="bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-neutral-300 border border-neutral-700">
                1080p HD
              </span>
            </div>

            {/* Medidor VU de Audio sobre el video */}
            <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg border border-neutral-700/80 flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-75 rounded-full"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-neutral-400 w-8 text-right">
                {audioLevel}%
              </span>
            </div>
          </div>

          {/* Selectores de Dispositivos */}
          <div className="space-y-3.5">
            
            {/* Cámara */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-violet-400" />
                  Cámara de Video
                </span>
                <button
                  type="button"
                  onClick={() => refreshDevices()}
                  className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1"
                >
                  <RotateCw className="w-3 h-3" />
                  Detectar de nuevo
                </button>
              </label>
              <select
                value={selectedCameraId}
                onChange={handleCameraChange}
                disabled={videoDevices.length === 0}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
              >
                {videoDevices.length === 0 ? (
                  <option value="">No se detectaron cámaras</option>
                ) : (
                  videoDevices.map(cam => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                      {cam.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Micrófono / Interfaz de Audio */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-300 flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-violet-400" />
                Micrófono / Interfaz de Audio
              </label>
              <select
                value={selectedMicId}
                onChange={handleMicChange}
                disabled={audioDevices.length === 0}
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
              >
                {audioDevices.length === 0 ? (
                  <option value="">No se detectaron entradas de audio</option>
                ) : (
                  audioDevices.map(mic => (
                    <option key={mic.deviceId} value={mic.deviceId}>
                      {mic.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Switch Modo Batería / Audio de Estudio */}
            <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Audio Sin Filtros (Modo Acústico / Batería)
                </div>
                <p className="text-[11px] text-neutral-400 leading-tight">
                  Desactiva la cancelación de eco y compresión de llamada para que platillos y tambores no se apaguen.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStudioAudioToggle}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  studioAudioMode ? "bg-violet-600" : "bg-neutral-700"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    studioAudioMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-neutral-800 bg-neutral-950 flex justify-between items-center">
          <span className="text-[11px] text-neutral-500">
            Tu configuración se guarda automáticamente
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Listo
          </button>
        </div>

      </div>
    </div>
  )
}

