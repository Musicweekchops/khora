"use client"

import { useState, useRef, useEffect, useCallback } from "react"

export type Subdivision = 1 | 2 | 3 | 4 | 6 // 1: negras (pulso), 2: corcheas, 3: tresillos, 4: semicorcheas, 6: seisillos
export type SubdivisionMode = "all" | "offbeat" // all: todas las subdivisiones, offbeat: solo contratiempos
export type SoundType = "woodblock" | "beep" | "rimshot"

export interface MetronomeState {
  isPlaying: boolean
  bpm: number
  beatsPerMeasure: number
  beatUnit: number
  subdivision: Subdivision
  playSubdivisions: boolean
  subdivisionVolume: number
  subdivisionMode: SubdivisionMode
  soundType: SoundType
  volume: number
  currentBeat: number
  currentSubBeat: number
}

export function useMetronome(
  initialBpm: number = 100,
  initialBeats: number = 4,
  initialBeatUnit: number = 4
) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpmState] = useState(initialBpm)
  const [beatsPerMeasure, setBeatsPerMeasureState] = useState(initialBeats)
  const [beatUnit, setBeatUnitState] = useState(initialBeatUnit)
  const [subdivision, setSubdivisionState] = useState<Subdivision>(1)
  const [playSubdivisions, setPlaySubdivisionsState] = useState(true)
  const [subdivisionVolume, setSubdivisionVolumeState] = useState(0.55)
  const [subdivisionMode, setSubdivisionModeState] = useState<SubdivisionMode>("all")
  const [soundType, setSoundType] = useState<SoundType>("woodblock")
  const [volume, setVolume] = useState(0.8)
  const [currentBeat, setCurrentBeat] = useState(0)
  const [currentSubBeat, setCurrentSubBeat] = useState(0)

  // Web Audio Context refs
  const audioContextRef = useRef<AudioContext | null>(null)
  const isPlayingRef = useRef(false)
  const bpmRef = useRef(bpm)
  const beatsRef = useRef(beatsPerMeasure)
  const beatUnitRef = useRef(beatUnit)
  const subRef = useRef(subdivision)
  const playSubdivisionsRef = useRef(playSubdivisions)
  const subdivisionVolumeRef = useRef(subdivisionVolume)
  const subdivisionModeRef = useRef(subdivisionMode)
  const soundRef = useRef(soundType)
  const volumeRef = useRef(volume)

  // Scheduling position refs
  const beatIndexRef = useRef(0)
  const subBeatIndexRef = useRef(0)
  const nextNoteTimeRef = useRef(0)
  const timerWorkerRef = useRef<number | null>(null)
  const tapTimesRef = useRef<number[]>([])

  // Keep refs in sync with state for access inside scheduling loop
  useEffect(() => { bpmRef.current = bpm }, [bpm])
  useEffect(() => { beatsRef.current = beatsPerMeasure }, [beatsPerMeasure])
  useEffect(() => { beatUnitRef.current = beatUnit }, [beatUnit])
  useEffect(() => { subRef.current = subdivision }, [subdivision])
  useEffect(() => { playSubdivisionsRef.current = playSubdivisions }, [playSubdivisions])
  useEffect(() => { subdivisionVolumeRef.current = subdivisionVolume }, [subdivisionVolume])
  useEffect(() => { subdivisionModeRef.current = subdivisionMode }, [subdivisionMode])
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

    // If it's a subdivision and playing subdivisions is muted or at volume 0, skip
    if (isSubdivision && (!playSubdivisionsRef.current || subdivisionVolumeRef.current <= 0)) {
      return
    }

    // In offbeat practice mode, mute the main on-beat clicks when subdivisions are active
    if (!isSubdivision && subdivisionModeRef.current === "offbeat" && subRef.current > 1 && playSubdivisionsRef.current) {
      return
    }

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const masterVol = volumeRef.current
    const subVol = subdivisionVolumeRef.current

    osc.connect(gain)
    gain.connect(ctx.destination)

    const type = soundRef.current

    if (type === "woodblock") {
      // High-pitched short resonant woodblock click
      const baseFreq = isDownbeat ? 1200 : isSubdivision ? 720 : 920
      osc.type = "sine"
      osc.frequency.setValueAtTime(baseFreq, time)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, time + 0.035)

      const noteVol = isDownbeat ? masterVol : isSubdivision ? masterVol * 0.5 * subVol : masterVol * 0.75
      gain.gain.setValueAtTime(Math.max(0.001, noteVol), time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.04)

      osc.start(time)
      osc.stop(time + 0.04)
    } else if (type === "rimshot") {
      // Sharp percussive click with frequency drop
      const baseFreq = isDownbeat ? 1600 : isSubdivision ? 850 : 1200
      osc.type = "triangle"
      osc.frequency.setValueAtTime(baseFreq, time)
      osc.frequency.exponentialRampToValueAtTime(120, time + 0.02)

      const noteVol = isDownbeat ? masterVol * 1.1 : isSubdivision ? masterVol * 0.45 * subVol : masterVol * 0.8
      gain.gain.setValueAtTime(Math.max(0.001, noteVol), time)
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025)

      osc.start(time)
      osc.stop(time + 0.025)
    } else {
      // Clean sine beep
      const freq = isDownbeat ? 1046.5 : isSubdivision ? 523.25 : 880 // C6, C5, A5
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, time)

      const noteVol = isDownbeat ? masterVol : isSubdivision ? masterVol * 0.4 * subVol : masterVol * 0.7
      gain.gain.setValueAtTime(Math.max(0.001, noteVol), time)
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
      const beatIndex = beatIndexRef.current
      const subBeatIndex = subBeatIndexRef.current
      const isDownbeat = beatIndex === 0 && subBeatIndex === 0
      const isSubdivision = subBeatIndex !== 0

      // Schedule sound in Web Audio timeline
      playClick(nextNoteTimeRef.current, isDownbeat, isSubdivision)

      // Schedule UI flash synchronized
      const timeToNote = Math.max(0, (nextNoteTimeRef.current - ctx.currentTime) * 1000)
      window.setTimeout(() => {
        if (isPlayingRef.current) {
          setCurrentBeat(beatIndex)
          setCurrentSubBeat(subBeatIndex)
        }
      }, timeToNote)

      // Calculate time for next subdivision note
      const currentSub = subRef.current
      const currentBeats = beatsRef.current
      const secondsPerBeat = 60.0 / bpmRef.current
      const secondsPerSubdivision = secondsPerBeat / currentSub
      nextNoteTimeRef.current += secondsPerSubdivision

      // Advance note indexes seamlessly
      let nextSub = subBeatIndex + 1
      let nextBeat = beatIndex
      if (nextSub >= currentSub) {
        nextSub = 0
        nextBeat = (nextBeat + 1) % currentBeats
      }
      subBeatIndexRef.current = nextSub
      beatIndexRef.current = nextBeat
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
    beatIndexRef.current = 0
    subBeatIndexRef.current = 0
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
    beatIndexRef.current = 0
    subBeatIndexRef.current = 0
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
    const clamped = Math.min(32, Math.max(1, Math.round(val)))
    setBeatsPerMeasureState(clamped)
    if (beatIndexRef.current >= clamped) {
      beatIndexRef.current = 0
    }
  }, [])

  const setBeatUnit = useCallback((val: number) => {
    const valid = [1, 2, 4, 8, 16].includes(val) ? val : 4
    setBeatUnitState(valid)
  }, [])

  const setTimeSignature = useCallback((beats: number, unit: number = 4) => {
    const clampedBeats = Math.min(32, Math.max(1, Math.round(beats)))
    const validUnit = [1, 2, 4, 8, 16].includes(unit) ? unit : 4
    setBeatsPerMeasureState(clampedBeats)
    setBeatUnitState(validUnit)
    if (beatIndexRef.current >= clampedBeats) {
      beatIndexRef.current = 0
    }
  }, [])

  const setSubdivision = useCallback((val: Subdivision) => {
    setSubdivisionState(val)
    if (subBeatIndexRef.current >= val) {
      subBeatIndexRef.current = 0
    }
  }, [])

  const setPlaySubdivisions = useCallback((val: boolean | ((prev: boolean) => boolean)) => {
    setPlaySubdivisionsState(val)
  }, [])

  const setSubdivisionVolume = useCallback((val: number) => {
    setSubdivisionVolumeState(Math.min(1, Math.max(0, val)))
  }, [])

  const setSubdivisionMode = useCallback((val: SubdivisionMode) => {
    setSubdivisionModeState(val)
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
    beatUnit,
    subdivision,
    playSubdivisions,
    subdivisionVolume,
    subdivisionMode,
    soundType,
    volume,
    currentBeat,
    currentSubBeat,
    start,
    stop,
    toggle,
    setBpm,
    setBeatsPerMeasure,
    setBeatUnit,
    setTimeSignature,
    setSubdivision,
    setPlaySubdivisions,
    setSubdivisionVolume,
    setSubdivisionMode,
    setSoundType,
    setVolume,
    tapTempo,
  }
}
