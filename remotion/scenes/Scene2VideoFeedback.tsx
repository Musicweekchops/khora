import React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { Play, Pause, RotateCcw, Sparkles, Gauge, Video, CheckCircle2 } from "lucide-react"
import { Cursor } from "../components/Cursor"

export const Scene2VideoFeedback: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrada de la ventana de Khora
  const modalScale = spring({ frame, fps, from: 0.9, to: 1 })
  const modalOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" })

  // Progreso del video del alumno (0:00 a 0:14) hasta que llega al segundo marcado
  // A 30 fps, el segundo 0:14 se alcanza en el frame 70
  const isPaused = frame >= 70
  const progressPct = interpolate(frame, [10, 70], [10, 48], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Movimiento del cursor para pausar en el segundo 0:14
  const cursorX = interpolate(frame, [45, 68], [800, 260], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
  const cursorY = interpolate(frame, [45, 68], [650, 430], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })

  // Explosión visual de la Reacción en Pad/Batería (Frame 75+)
  const reactionScale = spring({
    frame: frame - 75,
    fps,
    from: 0.8,
    to: 1,
    config: { damping: 12, stiffness: 140 },
  })
  const reactionOpacity = interpolate(frame, [75, 85], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  return (
    <AbsoluteFill className="bg-neutral-950 flex flex-col items-center justify-center p-6 text-white select-none font-sans overflow-hidden">
      
      {/* Luz ambiental de fondo */}
      <div
        className="absolute w-[800px] h-[500px] rounded-full blur-[160px] opacity-25 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, #10b981 100%)",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Título de la funcionalidad */}
      <div className="flex flex-col items-center mb-5 z-10 text-center">
        <span className="text-violet-400 font-extrabold text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          La funcionalidad estrella de Khora
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white">
          Video-Reacciones en el Segundo Exacto
        </h2>
      </div>

      {/* Ventana de Khora (Exacta al Feedback Modal) */}
      <div
        style={{ transform: `scale(${modalScale})`, opacity: modalOpacity }}
        className="relative w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col"
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-neutral-100">Práctica de Paradiddles</h3>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400 border border-violet-500/30">
              {frame >= 140 ? "Aprobado" : "En Revisión"}
            </span>
            <span className="text-xs text-neutral-400">Alumno: Gloria Céspedes</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-md border border-neutral-700 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              1080p HD · 48kHz
            </span>
          </div>
        </div>

        {/* Cuerpo: Reproductor de Video */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
          
          {/* Fondo simulando el video del alumno tocando */}
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-neutral-500">
              <div className="w-20 h-20 rounded-full border border-neutral-700 flex items-center justify-center bg-neutral-900/60 shadow-inner">
                <span className="text-3xl">🥁</span>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-400">
                [Grabación de Alumno con Audio Acústico]
              </span>
            </div>
          </div>

          {/* OVERLAY: Al llegar a 0:14, aparece la Reacción en Modo Pad/Batería */}
          {frame >= 75 && (
            <div
              style={{ transform: `scale(${reactionScale})`, opacity: reactionOpacity }}
              className="absolute inset-0 z-30 bg-black/95 flex flex-col border-2 border-emerald-500/70 rounded-2xl shadow-2xl m-2 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-2 bg-emerald-950/80 border-b border-emerald-800">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  🥁 Demostración de Arnaldo (Modo Pad / Batería) · 0:14
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Slow-Motion 0.5x
                </span>
              </div>

              {/* Contenido de la demostración técnica */}
              <div className="relative flex-1 bg-gradient-to-t from-neutral-950 to-neutral-900 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-emerald-950/80">
                  🥢
                </div>
                <h4 className="text-lg font-bold text-white mb-1">
                  "Fíjate en el rebote de la muñeca izquierda..."
                </h4>
                <p className="text-xs text-neutral-400 max-w-md">
                  El alumno ve la técnica correcta con tu cámara profesional en pantalla completa sin cortes.
                </p>
              </div>

              {/* Botones de acción del alumno */}
              <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400 italic">
                  Tu video se pausó automáticamente aquí
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-neutral-800 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Repetir
                  </button>
                  <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-900/30">
                    <Play className="w-3 h-3 fill-current" /> Continuar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Barra de Controles Inferiores */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
            
            {/* Barra de Tiempo con Pines Luminosos */}
            <div className="relative w-full h-2 bg-neutral-800 rounded-full mb-3 flex items-center">
              <div
                style={{ width: `${progressPct}%` }}
                className="h-full bg-violet-600 rounded-full"
              />

              {/* Pin de Video-Reacción en el 48% (0:14) */}
              <div
                style={{ left: "48%" }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-black shadow-lg shadow-emerald-400/80 flex items-center justify-center"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black" />
              </div>

              {/* Pin de Nota en el 75% */}
              <div
                style={{ left: "75%" }}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-amber-400 border-2 border-black shadow-md shadow-amber-400/60"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-violet-600 text-white">
                  {isPaused ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </div>
                <span className="font-mono text-white">
                  {frame >= 70 ? "0:14" : "0:08"} / 0:32
                </span>
              </div>

              <div className="flex items-center gap-1.5 bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800">
                <Gauge className="w-3 h-3 text-violet-400" />
                <span className="font-bold text-neutral-300">Slow-Mo: 0.5x</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cursor virtual animado */}
      {frame <= 80 && (
        <Cursor x={cursorX} y={cursorY} clickFrame={70} />
      )}
    </AbsoluteFill>
  )
}
