"use client"

import React, { useState, useEffect, useRef } from "react"
import { useMetronome, Subdivision, SubdivisionMode, SoundType } from "@/lib/hooks/useMetronome"
import {
  Play,
  Square,
  Volume2,
  VolumeX,
  X,
  ChevronUp,
  ChevronDown,
  GripHorizontal,
  Plus,
  Minus,
  SlidersHorizontal,
  Music,
} from "lucide-react"

// Presets populares de compases para acceso rápido (totalmente editables)
const COMMON_TIME_SIGNATURES = [
  { beats: 4, unit: 4, label: "4/4" },
  { beats: 3, unit: 4, label: "3/4" },
  { beats: 2, unit: 4, label: "2/4" },
  { beats: 5, unit: 4, label: "5/4" },
  { beats: 6, unit: 8, label: "6/8" },
  { beats: 7, unit: 8, label: "7/8" },
  { beats: 9, unit: 8, label: "9/8" },
  { beats: 12, unit: 8, label: "12/8" },
]

// Denominadores válidos con su símbolo de notación
const DENOMINATORS = [
  { value: 2, label: "/2", name: "Blanca", symbol: "𝅗𝅥" },
  { value: 4, label: "/4", name: "Negra", symbol: "♩" },
  { value: 8, label: "/8", name: "Corchea", symbol: "♪" },
  { value: 16, label: "/16", name: "Semi", symbol: "𝅘𝅥𝅯" },
]

export default function MetronomeWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [customInputBeats, setCustomInputBeats] = useState<string>("4")
  const widgetRef = useRef<HTMLDivElement>(null)

  const {
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
  } = useMetronome(100, 4, 4)

  // Sincronizar input numérico de pulsos con el estado del metrónomo
  useEffect(() => {
    setCustomInputBeats(beatsPerMeasure.toString())
  }, [beatsPerMeasure])

  // Drag logic para la ventana flotante
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ((e.target as HTMLElement).closest("button, select, input, label")) return

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY

    if (!widgetRef.current) return
    const rect = widgetRef.current.getBoundingClientRect()
    const offsetX = clientX - rect.left
    const offsetY = clientY - rect.top

    setIsDragging(true)

    const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
      moveEvent.preventDefault()
      const curX = "touches" in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX
      const curY = "touches" in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY

      const widgetWidth = rect.width
      const widgetHeight = widgetRef.current ? widgetRef.current.offsetHeight : rect.height

      const minX = 8
      const maxX = Math.max(8, window.innerWidth - widgetWidth - 8)
      const minY = 8
      const maxY = Math.max(8, window.innerHeight - widgetHeight - 8)

      const newX = Math.min(Math.max(curX - offsetX, minX), maxX)
      const newY = Math.min(Math.max(curY - offsetY, minY), maxY)

      setPosition({ x: newX, y: newY })
    }

    const handleEnd = () => {
      setIsDragging(false)
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("mouseup", handleEnd)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("touchend", handleEnd)
    }

    window.addEventListener("mousemove", handleMove, { passive: false })
    window.addEventListener("mouseup", handleEnd)
    window.addEventListener("touchmove", handleMove, { passive: false })
    window.addEventListener("touchend", handleEnd)
  }

  // Clampear posición si se redimensiona la ventana
  useEffect(() => {
    function handleResize() {
      if (!position || !widgetRef.current) return
      const rect = widgetRef.current.getBoundingClientRect()
      const maxX = Math.max(8, window.innerWidth - rect.width - 8)
      const maxY = Math.max(8, window.innerHeight - rect.height - 8)
      if (position.x > maxX || position.y > maxY) {
        setPosition({
          x: Math.min(position.x, maxX),
          y: Math.min(position.y, maxY),
        })
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [position])

  // Obtener término de tempo italiano
  function getTempoMarking(val: number): string {
    if (val < 60) return "Largo"
    if (val < 76) return "Adagio"
    if (val < 108) return "Andante"
    if (val < 120) return "Moderato"
    if (val < 168) return "Allegro"
    if (val < 200) return "Vivace"
    return "Presto"
  }

  // Símbolo musical de la figura del denominador
  const activeDenominator = DENOMINATORS.find(d => d.value === beatUnit) || DENOMINATORS[1]

  // Atajos de teclado: Espacio para play/stop, flechas para BPM
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return
      if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) return

      if (e.code === "Space") {
        e.preventDefault()
        toggle()
      } else if (e.code === "ArrowUp" || e.code === "ArrowRight") {
        e.preventDefault()
        setBpm(prev => prev + 1)
      } else if (e.code === "ArrowDown" || e.code === "ArrowLeft") {
        e.preventDefault()
        setBpm(prev => prev - 1)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, toggle, setBpm])

  // Manejar cambio manual en el input de pulsos
  const handleCustomBeatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomInputBeats(val)
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= 1 && num <= 32) {
      setBeatsPerMeasure(num)
    }
  }

  const handleCustomBeatsBlur = () => {
    const num = parseInt(customInputBeats, 10)
    if (isNaN(num) || num < 1) {
      setBeatsPerMeasure(1)
      setCustomInputBeats("1")
    } else if (num > 32) {
      setBeatsPerMeasure(32)
      setCustomInputBeats("32")
    }
  }

  // Verificar si el compás actual coincide con algún preset conocido
  const matchingPreset = COMMON_TIME_SIGNATURES.find(
    p => p.beats === beatsPerMeasure && p.unit === beatUnit
  )

  return (
    <>
      {/* Botón flotante inferior (siempre visible cuando el widget está cerrado) */}
      <div className="fixed bottom-20 lg:bottom-6 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
              isPlaying
                ? "bg-violet-600 text-white ring-4 ring-violet-500/20 shadow-violet-500/30 scale-105"
                : "bg-neutral-900 text-white hover:bg-neutral-800 hover:scale-102"
            }`}
            title="Abrir Metrónomo Khora"
          >
            <div className="relative">
              <span className="text-base">⏱️</span>
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              )}
            </div>
            <div className="text-left font-sans">
              <span className="block text-xs font-bold leading-none tracking-wide">
                {isPlaying ? `${bpm} BPM` : "Metrónomo"}
              </span>
              <span className="text-[10px] text-violet-200 leading-tight">
                {beatsPerMeasure}/{beatUnit} {isPlaying && `· ${currentBeat + 1}`}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Widget flotante interactivo y arrastrable */}
      {isOpen && (
        <div
          ref={widgetRef}
          style={
            position
              ? {
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  bottom: "auto",
                  right: "auto",
                }
              : undefined
          }
          className={`fixed z-50 w-[94vw] sm:w-[380px] max-w-[390px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden flex flex-col ${
            !position
              ? "bottom-20 lg:bottom-6 right-4 sm:right-6 animate-in fade-in slide-in-from-bottom-5 duration-200"
              : ""
          } ${isDragging ? "ring-2 ring-violet-500/40 shadow-violet-500/25 select-none opacity-95" : ""}`}
        >
          {/* Cabecera / Barra de arrastre */}
          <div
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onDoubleClick={() => setPosition(null)}
            className={`flex items-center justify-between px-3.5 py-2.5 bg-neutral-900 text-white select-none cursor-grab active:cursor-grabbing transition-colors shrink-0 ${
              isDragging ? "bg-neutral-950" : ""
            }`}
            title="Arrastra para mover · Doble clic para restablecer posición"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-neutral-400 shrink-0" />
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  isPlaying
                    ? currentBeat === 0
                      ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"
                      : "bg-violet-400"
                    : "bg-neutral-500"
                }`}
              />
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">
                  Metrónomo
                </h3>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-violet-300 font-mono font-bold">
                  {beatsPerMeasure}/{beatUnit}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:bg-white/10 rounded-md text-neutral-400 hover:text-white transition-colors"
                title={isMinimized ? "Expandir" : "Minimizar"}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-md text-neutral-400 hover:text-white transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Vista compacta cuando está minimizado */}
          {isMinimized ? (
            <div className="p-3 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggle}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white transition-transform active:scale-95 ${
                    isPlaying ? "bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20" : "bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/20"
                  }`}
                >
                  {isPlaying ? (
                    <Square className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
                <div>
                  <div className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">
                    {bpm} <span className="text-xs font-normal text-neutral-500">BPM</span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    {beatsPerMeasure}/{beatUnit} · {getTempoMarking(bpm)}
                  </div>
                </div>
              </div>

              {/* LEDs del compás minimizado */}
              <div className="flex gap-1 max-w-[130px] overflow-hidden justify-end">
                {Array.from({ length: Math.min(beatsPerMeasure, 12) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-5 rounded-full transition-all duration-75 ${
                      isPlaying && currentBeat === i
                        ? i === 0
                          ? "bg-emerald-500 scale-110 shadow-sm shadow-emerald-500/50"
                          : "bg-violet-500 scale-105"
                        : "bg-neutral-200 dark:bg-neutral-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          ) : (
            /* Vista Completa con todos los Controles */
            <div className="p-4 space-y-3.5 bg-white dark:bg-neutral-900 select-none overflow-y-auto max-h-[82vh] kh-scrollbar">
              
              {/* Luces de Tiempo (Pulsos del Compás) */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-center gap-1.5 py-1">
                  {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
                    const isActive = isPlaying && currentBeat === idx
                    const isAccent = idx === 0
                    return (
                      <div
                        key={idx}
                        className={`relative rounded-full transition-all duration-75 ${
                          beatsPerMeasure <= 8 ? "flex-1 h-3 min-w-[20px]" : "w-4 h-3 shrink-0"
                        } ${
                          isActive
                            ? isAccent
                              ? "bg-emerald-500 shadow-md shadow-emerald-500/50 scale-y-125 ring-2 ring-emerald-400/40"
                              : "bg-violet-600 shadow-sm shadow-violet-500/30 scale-y-110"
                            : "bg-neutral-100 dark:bg-neutral-800"
                        }`}
                        title={`Pulso ${idx + 1}`}
                      />
                    )
                  })}
                </div>

                {/* Micro-visualizador de Subdivisión en Vivo */}
                {subdivision > 1 && (
                  <div className="flex items-center justify-center gap-1 pt-0.5">
                    {Array.from({ length: subdivision }).map((_, subIdx) => {
                      const isSubActive = isPlaying && currentSubBeat === subIdx
                      return (
                        <div
                          key={subIdx}
                          className={`h-1.5 rounded-full transition-all duration-75 ${
                            subIdx === 0 ? "w-4" : "w-2.5"
                          } ${
                            isSubActive
                              ? playSubdivisions
                                ? subIdx === 0
                                  ? "bg-emerald-500 shadow-sm"
                                  : "bg-violet-500 scale-110 shadow-sm"
                                : "bg-neutral-400"
                              : "bg-neutral-200 dark:bg-neutral-800"
                          }`}
                        />
                      )
                    })}
                    <span className="text-[9px] font-mono text-neutral-400 ml-1.5">
                      {playSubdivisions ? "Subd. activa" : "Subd. muda"}
                    </span>
                  </div>
                )}
              </div>

              {/* Display de Tempo & Nota de Referencia */}
              <div className="text-center py-0.5">
                <div className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest font-semibold text-violet-600 dark:text-violet-400 mb-0.5">
                  <span>{getTempoMarking(bpm)}</span>
                  <span className="text-neutral-300 dark:text-neutral-700">·</span>
                  <span className="font-mono">{activeDenominator.symbol} = {bpm}</span>
                </div>
                <div className="text-5xl font-black tracking-tight text-neutral-900 dark:text-white font-mono">
                  {bpm}
                </div>
                <div className="text-[10px] text-neutral-400 font-medium">
                  pulsaciones por minuto
                </div>
              </div>

              {/* Botones de Ajuste Rápido de BPM & Tap Tempo */}
              <div className="grid grid-cols-5 gap-1.5">
                <button
                  onClick={() => setBpm(prev => prev - 5)}
                  className="py-1.5 text-xs font-bold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  -5
                </button>
                <button
                  onClick={() => setBpm(prev => prev - 1)}
                  className="py-1.5 text-xs font-bold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  -1
                </button>
                <button
                  onClick={tapTempo}
                  className="py-1.5 text-xs font-black uppercase tracking-wider rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all active:scale-95"
                  title="Presiona al ritmo deseado"
                >
                  TAP
                </button>
                <button
                  onClick={() => setBpm(prev => prev + 1)}
                  className="py-1.5 text-xs font-bold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  +1
                </button>
                <button
                  onClick={() => setBpm(prev => prev + 5)}
                  className="py-1.5 text-xs font-bold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  +5
                </button>
              </div>

              {/* Barra Deslizante de Tempo */}
              <div className="pt-0.5 px-0.5">
                <input
                  type="range"
                  min="30"
                  max="280"
                  value={bpm}
                  onChange={e => setBpm(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-0.5">
                  <span>30</span>
                  <span>100</span>
                  <span>180</span>
                  <span>280</span>
                </div>
              </div>

              {/* SECCIÓN 1: EDITOR DE TIME SIGNATURE (COMPÁS EDITABLE Y NO PREDETERMINADO) */}
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-750 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Music className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider">
                      Compás (Time Signature)
                    </label>
                  </div>
                  {/* Badge de Compás Actual */}
                  <div className="px-2 py-0.5 rounded-md bg-violet-600 text-white font-mono font-black text-xs shadow-sm">
                    {beatsPerMeasure} / {beatUnit}
                  </div>
                </div>

                {/* Controles interactivos para editar Numerador y Denominador */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {/* Editor de Pulsos (Numerador) */}
                  <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                    <span className="block text-[10px] font-medium text-neutral-400 uppercase tracking-wide mb-1">
                      Pulsos por compás
                    </span>
                    <div className="flex items-center justify-between gap-1">
                      <button
                        onClick={() => setBeatsPerMeasure(Math.max(1, beatsPerMeasure - 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
                        title="Restar un pulso"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="32"
                        value={customInputBeats}
                        onChange={handleCustomBeatsChange}
                        onBlur={handleCustomBeatsBlur}
                        className="w-12 text-center font-mono font-bold text-base bg-transparent border border-neutral-200 dark:border-neutral-700 rounded-md py-0.5 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
                        title="Escribe cualquier número de pulsos (1 a 32)"
                      />
                      <button
                        onClick={() => setBeatsPerMeasure(Math.min(32, beatsPerMeasure + 1))}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200 transition-colors"
                        title="Añadir un pulso"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Editor de Denominador (Figura del pulso) */}
                  <div className="bg-white dark:bg-neutral-900 p-2 rounded-lg border border-neutral-200/60 dark:border-neutral-700/60">
                    <span className="block text-[10px] font-medium text-neutral-400 uppercase tracking-wide mb-1">
                      Figura de pulso
                    </span>
                    <div className="grid grid-cols-4 gap-1">
                      {DENOMINATORS.map(d => (
                        <button
                          key={d.value}
                          onClick={() => setBeatUnit(d.value)}
                          className={`py-1 rounded text-xs font-mono font-bold transition-all ${
                            beatUnit === d.value
                              ? "bg-violet-600 text-white shadow-sm"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                          title={`${d.label} (${d.name})`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Atajos Rápidos de Compases Populares (Acceso rápido pero editable) */}
                <div className="pt-0.5">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mb-1">
                    <span>Atajos populares:</span>
                    {!matchingPreset && (
                      <span className="text-[10px] text-violet-600 dark:text-violet-400 font-medium">
                        Personalizado ({beatsPerMeasure}/{beatUnit})
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-1">
                    {COMMON_TIME_SIGNATURES.map(preset => {
                      const isSelected = beatsPerMeasure === preset.beats && beatUnit === preset.unit
                      return (
                        <button
                          key={preset.label}
                          onClick={() => setTimeSignature(preset.beats, preset.unit)}
                          className={`py-1 text-[11px] font-bold rounded-md transition-all ${
                            isSelected
                              ? "bg-violet-600 text-white shadow-sm ring-1 ring-violet-500"
                              : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/80 dark:hover:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-800"
                          }`}
                        >
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* SECCIÓN 2: SUBDIVISIONES & OPCIONES DE REPRODUCCIÓN */}
              <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-750 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                    <label className="text-[11px] font-bold text-neutral-700 dark:text-neutral-200 uppercase tracking-wider">
                      Subdivisiones
                    </label>
                  </div>

                  {/* Switch para Activar / Silenciar la Reproducción de Subdivisiones */}
                  <button
                    onClick={() => setPlaySubdivisions(prev => !prev)}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                      playSubdivisions
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                    }`}
                    title={
                      playSubdivisions
                        ? "Las subdivisiones están sonando en el metrónomo. Haz clic para silenciarlas."
                        : "Las subdivisiones están silenciadas (solo suena el pulso). Haz clic para activarlas."
                    }
                  >
                    {playSubdivisions ? (
                      <>
                        <Volume2 className="w-3 h-3 text-emerald-500" />
                        <span>Sonar Audio</span>
                      </>
                    ) : (
                      <>
                        <VolumeX className="w-3 h-3 text-neutral-400" />
                        <span>Silenciadas</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Selector de Patrón de Subdivisión */}
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { val: 1 as Subdivision, label: "Negra", note: "♩", desc: "Pulso" },
                    { val: 2 as Subdivision, label: "Corchea", note: "♫", desc: "Duinas" },
                    { val: 3 as Subdivision, label: "Tresillo", note: "³♬", desc: "Trillizos" },
                    { val: 4 as Subdivision, label: "Semi", note: "♬", desc: "Cuartinas" },
                    { val: 6 as Subdivision, label: "Seisillo", note: "⁶♬", desc: "Sextinas" },
                  ].map(sub => (
                    <button
                      key={sub.val}
                      onClick={() => setSubdivision(sub.val)}
                      className={`py-1.5 px-0.5 flex flex-col items-center justify-center rounded-lg text-xs transition-all ${
                        subdivision === sub.val
                          ? "bg-violet-600 text-white shadow-sm font-bold"
                          : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200/60 dark:border-neutral-800"
                      }`}
                    >
                      <span className="text-sm font-sans leading-none">{sub.note}</span>
                      <span className="text-[10px] scale-90 mt-0.5">{sub.label}</span>
                    </button>
                  ))}
                </div>

                {/* Opciones avanzadas de reproducción de subdivisión (si hay subdivisión activa > 1) */}
                {subdivision > 1 && (
                  <div className="pt-1 space-y-2 border-t border-neutral-200/50 dark:border-neutral-700/50">
                    <div className="flex items-center justify-between text-xs">
                      {/* Modo de reproducción: Todas vs Contratiempo */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-neutral-400">Modo:</span>
                        <div className="flex rounded-md bg-white dark:bg-neutral-900 p-0.5 border border-neutral-200/60 dark:border-neutral-700/60">
                          <button
                            onClick={() => setSubdivisionMode("all")}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              subdivisionMode === "all"
                                ? "bg-violet-600 text-white"
                                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                            }`}
                          >
                            Todas
                          </button>
                          <button
                            onClick={() => setSubdivisionMode("offbeat")}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                              subdivisionMode === "offbeat"
                                ? "bg-violet-600 text-white"
                                : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900"
                            }`}
                            title="Mutea el pulso a tierra y suena solo el contratiempo"
                          >
                            Contratiempo
                          </button>
                        </div>
                      </div>

                      {/* Control de volumen de subdivisión */}
                      <div className="flex items-center gap-1.5 max-w-[140px] flex-1 justify-end">
                        <span className="text-[10px] text-neutral-400 shrink-0">Volumen subd.:</span>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={subdivisionVolume}
                          onChange={e => setSubdivisionVolume(parseFloat(e.target.value))}
                          disabled={!playSubdivisions}
                          className={`w-16 h-1.5 rounded-lg appearance-none cursor-pointer ${
                            playSubdivisions
                              ? "bg-neutral-200 dark:bg-neutral-700 accent-violet-600"
                              : "bg-neutral-200 dark:bg-neutral-800 opacity-40 cursor-not-allowed"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN 3: SONIDO & VOLUMEN MASTER */}
              <div className="pt-1 flex items-center justify-between gap-3 text-xs border-t border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-400 text-[11px]">Sonido:</span>
                  <select
                    value={soundType}
                    onChange={e => setSoundType(e.target.value as SoundType)}
                    className="text-xs bg-neutral-100 dark:bg-neutral-800 border-none rounded-md px-2 py-1 font-medium text-neutral-700 dark:text-neutral-200 cursor-pointer focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="woodblock">Woodblock (Clave)</option>
                    <option value="rimshot">Rimshot Percusivo</option>
                    <option value="beep">Beep Electrónico</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 flex-1 max-w-[130px]">
                  <Volume2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    title={`Volumen maestro: ${Math.round(volume * 100)}%`}
                  />
                </div>
              </div>

              {/* BOTÓN MASTER PLAY / STOP */}
              <button
                onClick={toggle}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 text-white shadow-lg transition-all duration-200 active:scale-98 ${
                  isPlaying
                    ? "bg-red-500 hover:bg-red-600 shadow-red-500/25 ring-2 ring-red-400/20"
                    : "bg-violet-600 hover:bg-violet-700 shadow-violet-600/25 ring-2 ring-violet-500/20"
                }`}
              >
                {isPlaying ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>Detener Metrónomo</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                    <span>Iniciar Práctica ({beatsPerMeasure}/{beatUnit})</span>
                  </>
                )}
              </button>

              <div className="text-[10px] text-center text-neutral-400">
                Usa <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono text-[9px]">Espacio</kbd> para activar/pausar · <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono text-[9px]">↑ ↓</kbd> para BPM
              </div>

            </div>
          )}
        </div>
      )}
    </>
  )
}
