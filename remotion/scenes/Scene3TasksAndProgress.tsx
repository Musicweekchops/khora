import React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { CheckCircle2, Circle, Flame, Target, Music } from "lucide-react"

export const Scene3TasksAndProgress: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrada de la tarjeta de tareas
  const cardScale = spring({ frame, fps, from: 0.88, to: 1 })
  const cardOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" })

  // Marcado de checks animados en los frames 30 y 60
  const check1 = frame >= 30
  const check2 = frame >= 55

  // Acelerómetro de BPM (80 -> 120 BPM)
  const currentBpm = Math.round(
    interpolate(frame, [20, 80], [80, 120], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  )

  // Pulso de metrónomo cada 15 frames
  const pulseScale = 1 + Math.sin(frame * 0.4) * 0.08

  return (
    <AbsoluteFill className="bg-neutral-950 flex flex-col items-center justify-center p-6 text-white select-none font-sans overflow-hidden">
      
      {/* Fondo con brillo ámbar y violeta */}
      <div
        className="absolute w-[700px] h-[500px] rounded-full blur-[150px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #f59e0b 0%, #7c3aed 100%)",
          top: "45%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Título de la escena */}
      <div className="flex flex-col items-center mb-6 z-10 text-center">
        <span className="text-amber-400 font-extrabold text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" />
          Ruta de Aprendizaje Clara
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white">
          Tareas Semanales y Metas de Tempo
        </h2>
      </div>

      {/* Contenedor Principal (Estilo Dashboard de Alumno en Khora) */}
      <div
        style={{ transform: `scale(${cardScale})`, opacity: cardOpacity }}
        className="w-full max-w-3xl bg-neutral-900/90 border border-neutral-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md z-10 grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Columna Izquierda: Lista de Tareas (7 cols) */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
              Misión de la Semana
            </span>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Flame className="w-3 h-3" /> Racha activa
            </span>
          </div>

          {/* Tarea 1 */}
          <div
            className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
              check1
                ? "bg-emerald-950/30 border-emerald-500/40"
                : "bg-neutral-950/60 border-neutral-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {check1 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-600 shrink-0" />
              )}
              <div>
                <h4 className="text-xs font-bold text-neutral-200">
                  Paradiddle simple en pad
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Objetivo: 110 BPM sin tensión
                </p>
              </div>
            </div>
            {check1 && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                100%
              </span>
            )}
          </div>

          {/* Tarea 2 */}
          <div
            className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
              check2
                ? "bg-emerald-950/30 border-emerald-500/40"
                : "bg-neutral-950/60 border-neutral-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {check2 ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-neutral-600 shrink-0" />
              )}
              <div>
                <h4 className="text-xs font-bold text-neutral-200">
                  Lectura rítmica · Ejercicio 4
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Partitura descargada desde tu biblioteca
                </p>
              </div>
            </div>
            {check2 && (
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                100%
              </span>
            )}
          </div>

          {/* Tarea 3 */}
          <div className="p-3 rounded-2xl border border-neutral-800 bg-neutral-950/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Circle className="w-5 h-5 text-neutral-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-neutral-200">
                  Groove Funk con apertura de Hi-Hat
                </h4>
                <p className="text-[11px] text-neutral-500">
                  Tocar sobre backing track (sin batería)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-violet-400 bg-violet-950/80 px-2 py-0.5 rounded-full border border-violet-800">
              En progreso
            </span>
          </div>
        </div>

        {/* Columna Derecha: Metrónomo y Evolución de Tempo (5 cols) */}
        <div className="md:col-span-5 bg-neutral-950/80 border border-neutral-800 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Music className="w-3 h-3 text-violet-400" /> Metrónomo Integrado
          </span>

          <div
            style={{ transform: `scale(${pulseScale})` }}
            className="text-5xl font-black font-mono text-white mb-1"
          >
            {currentBpm}
          </div>
          <span className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-4">
            BPM · Tempo Objetivo
          </span>

          <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden mb-3">
            <div
              style={{ width: `${interpolate(currentBpm, [80, 120], [30, 100])}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-emerald-400 rounded-full"
            />
          </div>

          <p className="text-[11px] text-neutral-400 leading-tight">
            Mide tu velocidad y técnica clase a clase con métricas reales.
          </p>
        </div>
      </div>
    </AbsoluteFill>
  )
}
