"use client"

import { useState, useEffect, useCallback } from "react"

export interface MediaDeviceInfoSimple {
  deviceId: string
  label: string
  kind: MediaDeviceKind
}

const STORAGE_KEY_CAMERA = "khora_preferred_camera_id"
const STORAGE_KEY_MIC = "khora_preferred_mic_id"
const STORAGE_KEY_STUDIO_AUDIO = "khora_studio_audio_enabled"

export function useMediaDevices() {
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfoSimple[]>([])
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfoSimple[]>([])
  const [selectedCameraId, setSelectedCameraId] = useState<string>("")
  const [selectedMicId, setSelectedMicId] = useState<string>("")
  const [studioAudioMode, setStudioAudioMode] = useState<boolean>(true)
  const [hasPermissions, setHasPermissions] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Cargar preferencias guardadas en localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCam = localStorage.getItem(STORAGE_KEY_CAMERA)
      const savedMic = localStorage.getItem(STORAGE_KEY_MIC)
      const savedStudio = localStorage.getItem(STORAGE_KEY_STUDIO_AUDIO)

      if (savedCam) setSelectedCameraId(savedCam)
      if (savedMic) setSelectedMicId(savedMic)
      if (savedStudio !== null) setStudioAudioMode(savedStudio === "true")
    }
  }, [])

  // Enumerar dispositivos de audio y video
  const refreshDevices = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      setIsLoading(false)
      return
    }

    try {
      let devices = await navigator.mediaDevices.enumerateDevices()

      // Si los nombres están vacíos, pedir permiso temporal para desbloquear las etiquetas
      const needsPermission = devices.some(
        d => (d.kind === "videoinput" || d.kind === "audioinput") && !d.label
      )

      if (needsPermission) {
        try {
          const tempStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          setHasPermissions(true)
          devices = await navigator.mediaDevices.enumerateDevices()
          tempStream.getTracks().forEach(t => t.stop())
        } catch {
          // Si el usuario deniega o falla, usamos lo que haya
        }
      } else {
        setHasPermissions(true)
      }

      const vDevs = devices
        .filter(d => d.kind === "videoinput")
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Cámara ${index + 1}`,
          kind: d.kind,
        }))

      const aDevs = devices
        .filter(d => d.kind === "audioinput")
        .map((d, index) => ({
          deviceId: d.deviceId,
          label: d.label || `Micrófono / Interfaz ${index + 1}`,
          kind: d.kind,
        }))

      setVideoDevices(vDevs)
      setAudioDevices(aDevs)

      // Auto-seleccionar primer dispositivo si no hay guardado o si el guardado ya no existe
      setSelectedCameraId(prev => {
        if (prev && vDevs.some(d => d.deviceId === prev)) return prev
        // Priorizar cámaras profesionales (Cam Link, OBS, Capture) si existen
        const proCam = vDevs.find(d => 
          /cam link|obs|capture|blackmagic|elgato|sony|canon|atem/i.test(d.label)
        )
        return proCam ? proCam.deviceId : (vDevs[0]?.deviceId || "")
      })

      setSelectedMicId(prev => {
        if (prev && aDevs.some(d => d.deviceId === prev)) return prev
        // Priorizar interfaces de audio USB / Thunderbolt si existen
        const proAudio = aDevs.find(d => 
          /focusrite|scarlett|apollo|universal audio|motu|behringer|audient|rodecaster|presonus|steinberg|yamaha/i.test(d.label)
        )
        return proAudio ? proAudio.deviceId : (aDevs[0]?.deviceId || "")
      })
    } catch (err) {
      console.warn("Error enumerating media devices:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshDevices()

    if (navigator?.mediaDevices?.addEventListener) {
      navigator.mediaDevices.addEventListener("devicechange", refreshDevices)
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", refreshDevices)
      }
    }
  }, [refreshDevices])

  // Guardar cámara
  const selectCamera = (deviceId: string) => {
    setSelectedCameraId(deviceId)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_CAMERA, deviceId)
    }
  }

  // Guardar micrófono / interfaz
  const selectMic = (deviceId: string) => {
    setSelectedMicId(deviceId)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_MIC, deviceId)
    }
  }

  // Alternar modo de audio estudio
  const setStudioAudio = (enabled: boolean) => {
    setStudioAudioMode(enabled)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_STUDIO_AUDIO, enabled ? "true" : "false")
    }
  }

  // Obtener stream optimizado para percusión y video profesional
  const getProMediaStream = useCallback(async (
    camId?: string,
    micId?: string,
    useStudioAudio: boolean = studioAudioMode
  ): Promise<MediaStream> => {
    // Si el estado aún no cargó (primer render), leer directo de localStorage
    const storedCam = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_CAMERA) : null
    const storedMic = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_MIC) : null
    const targetCamId = camId || selectedCameraId || storedCam || ""
    const targetMicId = micId || selectedMicId || storedMic || ""

    // Restricciones de audio: Modo estudio conserva dinámicas de tambores y platillos
    const audioConstraints: MediaTrackConstraints = {
      deviceId: targetMicId ? { ideal: targetMicId } : undefined,
      echoCancellation: !useStudioAudio,
      noiseSuppression: !useStudioAudio,
      autoGainControl: !useStudioAudio,
      sampleRate: 48000,
      channelCount: { ideal: 2 },
    }

    // Restricciones de video: 1080p a 30-60fps
    const videoConstraints: MediaTrackConstraints = {
      deviceId: targetCamId ? { ideal: targetCamId } : undefined,
      width: { ideal: 1920, max: 1920 },
      height: { ideal: 1080, max: 1080 },
      frameRate: { ideal: 60, max: 60 },
    }

    try {
      return await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: audioConstraints,
      })
    } catch (err) {
      console.warn("Fallo con restricciones ideales, intentando fallback estándar:", err)
      // Fallback si la cámara no soporta 1080p o 60fps
      return await navigator.mediaDevices.getUserMedia({
        video: targetCamId ? { deviceId: { ideal: targetCamId } } : true,
        audio: targetMicId ? { deviceId: { ideal: targetMicId } } : true,
      })
    }
  }, [selectedCameraId, selectedMicId, studioAudioMode])

  return {
    videoDevices,
    audioDevices,
    selectedCameraId,
    selectedMicId,
    studioAudioMode,
    hasPermissions,
    isLoading,
    selectCamera,
    selectMic,
    setStudioAudio,
    refreshDevices,
    getProMediaStream,
  }
}

