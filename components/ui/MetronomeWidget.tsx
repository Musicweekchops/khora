"use client"

import React, { useState, useEffect, useRef } from "react"
import { useMetronome, Subdivision, SoundType } from "@/lib/hooks/useMetronome"
import { Play, Square, Volume2, X, ChevronUp, ChevronDown, Music, Sparkles, GripHorizontal } from "lucide-react"

export default function MetronomeWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const widgetRef = useRef<HTMLDivElement>(null)

  const {
    isPlaying,
    bpm,
    beatsPerMeasure,
    subdivision,
    soundType,
    volume,
    currentBeat,
    currentSubBeat,
    toggle,
    setBpm,
    setBeatsPerMeasure,
    setSubdivision,
    setSoundType,
    setVolume,
    tapTempo,
  } = useMetronome(100, 4)

  // Drag logic for the floating window
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    // No iniciar arrastre si se hizo clic en botones o controles
    if ((e.target as HTMLElement).closest("button, select, input")) return

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

  // Clampear si la ventana se redimensiona
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

  // Get Italian tempo marking
  function getTempoMarking(val: number): string {
    if (val < 60) return "Largo"
    if (val < 76) return "Adagio"
    if (val < 108) return "Andante"
    if (val < 120) return "Moderato"
    if (val < 168) return "Allegro"
    if (val < 200) return "Vivace"
    return "Presto"
  }

  // Keyboard shortcut listener when widget is open: Space to toggle, arrows to change BPM
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!isOpen) return
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return

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

  return (
    <>
      {/* Floating Trigger Button (Always visible at bottom-right or floating) */}
      <div className="fixed bottom-20 lg:bottom-6 right-5 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className={`group flex items-center gap-2.5 px-4 py-3 rounded-full shadow-lg transition-all duration-300 ${
              isPlaying
                ? "bg-violet-600 text-white ring-4 ring-violet-500/20 shadow-violet-500/30 scale-105"
                : "bg-neutral-900 text-white hover:bg-neutral-800 hover:scale-102"
            }`}
            title="Abrir Metrónomo Web"
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
              {isPlaying && (
                <span className="text-[10px] text-violet-200 leading-tight">
                  Compás {currentBeat + 1}/{beatsPerMeasure}
                </span>
              )}
            </div>
          </button>
        )}
      </div>

      {/* Floating Expanded Draggable Widget */}
      {isOpen && (
        <div
          ref={widgetRef}
          style={position ? {
            left: `${position.x}px`,
            top: `${position.y}px`,
            bottom: "auto",
            right: "auto",
          } : undefined}
          className={`fixed z-50 w-[92vw] sm:w-[360px] max-w-[360px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-hidden ${
            !position ? "bottom-20 lg:bottom-6 right-4 sm:right-6 animate-in fade-in slide-in-from-bottom-5 duration-200" : ""
          } ${isDragging ? "ring-2 ring-violet-500/40 shadow-violet-500/25 select-none opacity-95" : ""}`}
        >
          
          {/* Header (Drag Handle) */}
          <div
            onMouseDown={handleDragStart}
            onTouchStart={handleDragStart}
            onDoubleClick={() => setPosition(null)}
            className={`flex items-center justify-between px-3.5 py-3 bg-neutral-900 text-white select-none cursor-grab active:cursor-grabbing transition-colors ${
              isDragging ? "bg-neutral-950" : ""
            }`}
            title="Arrastra para mover · Doble clic para restablecer posición"
          >
            <div className="flex items-center gap-2">
              <GripHorizontal className="w-4 h-4 text-neutral-400 shrink-0" />
              <div className={`w-2.5 h-2.5 rounded-full transition-colors ${isPlaying ? (currentBeat === 0 ? "bg-emerald-400 animate-pulse" : "bg-violet-400") : "bg-neutral-500"}`} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Metrónomo Khora</h3>
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

          {/* Compact View if Minimized */}
          {isMinimized ? (
            <div className="p-3 flex items-center justify-between bg-neutral-50 dark:bg-neutral-950">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggle}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white transition-transform active:scale-95 ${
                    isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-violet-600 hover:bg-violet-700"
                  }`}
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <div>
                  <div className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">{bpm} <span className="text-xs font-normal text-neutral-500">BPM</span></div>
                  <div className="text-[11px] text-neutral-500">{beatsPerMeasure}/4 · {getTempoMarking(bpm)}</div>
                </div>
              </div>
              {/* LED visualizer */}
              <div className="flex gap-1.5">
                {Array.from({ length: beatsPerMeasure }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-6 rounded-full transition-all duration-75 ${
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
            /* Full Controls View */
            <div className="p-4 space-y-4 bg-white dark:bg-neutral-900 select-none">
              
              {/* Visual Beat Indicators */}
              <div className="flex items-center justify-center gap-2 py-1">
                {Array.from({ length: beatsPerMeasure }).map((_, idx) => {
                  const isActive = isPlaying && currentBeat === idx
                  const isAccent = idx === 0
                  return (
                    <div
                      key={idx}
                      className={`relative flex-1 h-3 rounded-full transition-all duration-75 ${
                        isActive
                          ? isAccent
                            ? "bg-emerald-500 shadow-md shadow-emerald-500/50 scale-y-125"
                            : "bg-violet-600 shadow-sm shadow-violet-500/30 scale-y-110"
                          : "bg-neutral-100 dark:bg-neutral-800"
                      }`}
                    />
                  )
                })}
              </div>

              {/* Tempo Display & Primary Controls */}
              <div className="text-center py-1">
                <div className="text-xs uppercase tracking-widest font-semibold text-violet-600 dark:text-violet-400 mb-0.5">
                  {getTempoMarking(bpm)}
                </div>
                <div className="text-5xl font-black tracking-tight text-neutral-900 dark:text-white font-mono">
                  {bpm}
                </div>
                <div className="text-[11px] text-neutral-400 font-medium mt-0.5">
                  pulsaciones por minuto
                </div>
              </div>

              {/* Quick BPM Increment / Decrement & Tap Tempo */}
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
                  title="Presiona al ritmo de la música"
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

              {/* Tempo Slider */}
              <div className="pt-1 px-1">
                <input
                  type="range"
                  min="30"
                  max="260"
                  value={bpm}
                  onChange={e => setBpm(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-violet-600"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                  <span>30</span>
                  <span>100</span>
                  <span>180</span>
                  <span>260</span>
                </div>
              </div>

              {/* Time Signatures (Compases) */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Compás
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[2, 3, 4, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => setBeatsPerMeasure(num)}
                      className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                        beatsPerMeasure === num
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200"
                      }`}
                    >
                      {num}/4
                    </button>
                  ))}
                </div>
              </div>

              {/* Subdivisions */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Subdivisión (Práctica)
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 1 as Subdivision, label: "Negra", note: "♩" },
                    { val: 2 as Subdivision, label: "Corchea", note: "♫" },
                    { val: 3 as Subdivision, label: "Tresillo", note: "³♬" },
                    { val: 4 as Subdivision, label: "Semi", note: "♬" },
                  ].map(sub => (
                    <button
                      key={sub.val}
                      onClick={() => setSubdivision(sub.val)}
                      className={`py-1.5 px-1 flex flex-col items-center justify-center rounded-lg text-xs transition-all ${
                        subdivision === sub.val
                          ? "bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-700 font-bold"
                          : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200"
                      }`}
                    >
                      <span className="text-sm font-sans">{sub.note}</span>
                      <span className="text-[10px] scale-90">{sub.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound & Volume Row */}
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

                <div className="flex items-center gap-2 flex-1 max-w-[120px]">
                  <Volume2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                  />
                </div>
              </div>

              {/* Play / Stop Master Button */}
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
                    <span>Iniciar Práctica</span>
                  </>
                )}
              </button>

              <div className="text-[10px] text-center text-neutral-400">
                Usa <kbd className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 rounded font-mono text-[9px]">Espacio</kbd> para activar/pausar
              </div>

            </div>
          )}
        </div>
      )}
    </>
  )
}
