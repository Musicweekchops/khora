"use client"

import { useState, useRef, useEffect, useCallback } from "react"

export type Subdivision = 1 | 2 | 3 | 4 // 1: negras, 2: corcheas, 3: tresillos, 4: semicorcheas
export type SoundType = "woodblock" | "beep" | "rimshot"

export interface MetronomeState {
  isPlaying: boolean
  bpm: number
  beatsPerMeasure: number
  subdivision: Subdivision
  soundType: SoundType
  volume: number
  currentBeat: number
  currentSubBeat: number
}

export function useMetronome(initialBpm: number = 100, initialBeats: number = 4) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpmState] = useState(initialBpm)
  const [beatsPerMeasure, setBeatsPerMeasureState] = useState(initialBeats)
  const [subdivision, setSubdivisionState] = useState<Subdivision>(1)
  const [soundType, setSoundType] = useState<SoundType>("woodblock")
  const [volume, setVolume] = useState(0.8)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [currentSubBeat, setCurrentSubBeat] = useState(0)

  // Web Audio Context refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const isPlayingRef = useRef(false)
  const bpmRef = useRef(bpm)
  const beatsRef = useRef(beatsPerMeasure)
  const subRef = useRef(subdivision)
  const soundRef = useRef(soundType)
  const volumeRef = useRef(volume)

  // Scheduling variables
  const nextNoteTimeRef = useRef(0)
  const currentNoteRef = useRef(0) // total subdivision note index
  const timerWorkerRef = useRef<number | null>(null)
  const tapTimesRef = useRef<number[]>([])

  // Keep refs in sync with state for access inside scheduling loop
  useEffect(() => { bpmRef.current = bpm }, [bpm])
  useEffect(() => { beatsRef.current = beatsPerMeasure }, [beatsPerMeasure])
  useEffect(() => { subRef.current = subdivision }, [subdivision])
  useEffect(() => { soundRef.current = soundType }, [soundType])
  useEffect(() => { volumeRef.current = volume }, [volume])

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      audioContextRef.current = new AudioCtx()
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  // Synthesis of metronome click sound
  const playClick = useCallback((time: number, isDownbeat: boolean, isSubdivision: boolean) => {
    const ctx = audioContextRef.current
    if (!ctx) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const vol = volumeRef.current

    osc.connect(gain)
    gain.connect(ctx.destination)

    const type = soundRef.current

    if (type === "woodblock") {
      // High-pitched short resonant woodblock click - drummers love this
      const baseFreq = isDownbeat ? 1200 : isSubdivision ? 750 : 900
      osc.type = "sine"
      osc.frequency.setValueAtTime(baseFreq, time)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, time + 0.035)

      const noteVol = isDownbeat ? vol : isSubdivision ? vol * 0.4 : vol * 0.75
      gain.gain.setValueAtTime(noteVol, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04)

      osc.start(time)
      osc.stop(time + 0.04)
    } else if (type === "rimshot") {
      // Sharp percussive click with frequency drop
      const baseFreq = isDownbeat ? 1600 : isSubdivision ? 900 : 1200
      osc.type = "triangle"
      osc.frequency.setValueAtTime(baseFreq, time)
      osc.frequency.exponentialRampToValueAtTime(120, time + 0.02)

      const noteVol = isDownbeat ? vol * 1.1 : isSubdivision ? vol * 0.35 : vol * 0.8
      gain.gain.setValueAtTime(noteVol, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025)

      osc.start(time)
      osc.stop(time + 0.025)
    } else {
      // Clean sine beep
      const freq = isDownbeat ? 1046.5 : isSubdivision ? 440 : 880 // C6, A4, A5
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, time)

      const noteVol = isDownbeat ? vol : isSubdivision ? vol * 0.3 : vol * 0.7
      gain.gain.setValueAtTime(noteVol, time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045)

      osc.start(time)
      osc.stop(time + 0.045)
    }
  }, [])

  // Lookahead scheduler loop
  const schedule = useCallback(() => {
    const ctx = audioContextRef.current
    if (!ctx || !isPlayingRef.current) return

    const scheduleAheadTime = 0.1 // seconds
    const lookahead = 25 // milliseconds

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      const sub = subRef.current
      const beats = beatsRef.current
      const noteIndex = currentNoteRef.current

      const beatIndex = Math.floor(noteIndex / sub) % beats
      const subBeatIndex = noteIndex % sub
      const isDownbeat = beatIndex === 0 && subBeatIndex === 0
      const isSubdivision = subBeatIndex !== 0

      // Schedule sound in Web Audio timeline
      playClick(nextNoteTimeRef.current, isDownbeat, isSubdivision)

      // Schedule UI flash slightly ahead or synchronized
      const timeToNote = Math.max(0, (nextNoteTimeRef.current - ctx.currentTime) * 1000)
      window.setTimeout(() => {
        if (isPlayingRef.current) {
          setCurrentBeat(beatIndex)
          setCurrentSubBeat(subBeatIndex)
        }
      }, timeToNote)

      // Calculate time for next subdivision note
      const secondsPerBeat = 60.0 / bpmRef.current
      const secondsPerSubdivision = secondsPerBeat / sub
      nextNoteTimeRef.current += secondsPerSubdivision
      currentNoteRef.current += 1
    }

    if (isPlayingRef.current) {
      timerWorkerRef.current = window.setTimeout(schedule, lookahead)
    }
  }, [playClick])

  // Play / Stop Controls
  const start = useCallback(() => {
    const ctx = getAudioContext()
    if (!ctx) return

    isPlayingRef.current = true
    setIsPlaying(true)
    currentNoteRef.current = 0
    nextNoteTimeRef.current = ctx.currentTime + 0.05
    setCurrentBeat(0)
    setCurrentSubBeat(0)

    schedule()
  }, [getAudioContext, schedule])

  const stop = useCallback(() => {
    isPlayingRef.current = false
    setIsPlaying(false)
    if (timerWorkerRef.current) {
      clearTimeout(timerWorkerRef.current)
      timerWorkerRef.current = null
    }
    setCurrentBeat(0)
    setCurrentSubBeat(0)
  }, [])

  const toggle = useCallback(() => {
    if (isPlayingRef.current) {
      stop()
    } else {
      start()
    }
  }, [start, stop])

  // Tap Tempo calculation
  const tapTempo = useCallback(() => {
    const now = performance.now()
    const taps = tapTimesRef.current

    // Reset if last tap was more than 2.5 seconds ago
    if (taps.length > 0 && now - taps[taps.length - 1] > 2500) {
      taps.length = 0
    }

    taps.push(now)
    if (taps.length > 4) taps.shift()

    if (taps.length >= 2) {
      const intervals = []
      for (let i = 1; i < taps.length; i++) {
        intervals.push(taps[i] - taps[i - 1])
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
      const calculatedBpm = Math.round(60000 / avgInterval)
      const clampedBpm = Math.min(280, Math.max(30, calculatedBpm))
      setBpmState(clampedBpm)
    }
  }, [])

  const setBpm = useCallback((val: number | ((prev: number) => number)) => {
    setBpmState(prev => {
      const next = typeof val === "function" ? val(prev) : val
      return Math.min(280, Math.max(30, next))
    })
  }, [])

  const setBeatsPerMeasure = useCallback((val: number) => {
    setBeatsPerMeasureState(Math.min(12, Math.max(1, val)))
  }, [])

  const setSubdivision = useCallback((val: Subdivision) => {
    setSubdivisionState(val)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerWorkerRef.current) clearTimeout(timerWorkerRef.current)
    }
  }, [])

  return {
    isPlaying,
    bpm,
    beatsPerMeasure,
    subdivision,
    soundType,
    volume,
    currentBeat,
    currentSubBeat,
    start,
    stop,
    toggle,
    setBpm,
    setBeatsPerMeasure,
    setSubdivision,
    setSoundType,
    setVolume,
    tapTempo,
  }
}
