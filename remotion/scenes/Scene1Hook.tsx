import React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"

export const Scene1Hook: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrada de la primera frase
  const t1Opacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" })
  const t1Y = spring({ frame, fps, from: 30, to: 0 })

  // Entrada de la segunda frase con impacto
  const t2Opacity = interpolate(frame, [25, 40], [0, 1], { extrapolateRight: "clamp" })
  const t2Scale = spring({ frame: frame - 25, fps, from: 0.9, to: 1, config: { damping: 12 } })

  // Entrada del punchline
  const t3Opacity = interpolate(frame, [60, 75], [0, 1], { extrapolateRight: "clamp" })
  const t3Y = spring({ frame: frame - 60, fps, from: 20, to: 0 })

  // Badge pill
  const badgeScale = spring({ frame: frame - 10, fps, from: 0, to: 1 })

  return (
    <AbsoluteFill className="bg-neutral-950 flex flex-col items-center justify-center p-8 text-white select-none overflow-hidden font-sans">
      {/* Fondo con brillo ambiental violeta */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-30 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          top: "20%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Grid sutil */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Pill Badge */}
      <div
        style={{ transform: `scale(${badgeScale})` }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-950/80 border border-violet-500/40 text-violet-300 text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-violet-950/50 mb-8 z-10"
      >
        <span>🥁</span>
        <span>Acompañamiento Técnico Real</span>
      </div>

      {/* Frase 1 */}
      <div
        style={{ opacity: t1Opacity, transform: `translateY(${t1Y}px)` }}
        className="text-2xl sm:text-3xl font-medium text-neutral-400 text-center max-w-xl mb-3 z-10"
      >
        ¿Sales de tu clase de batería motivado...
      </div>

      {/* Frase 2: Con dolor real del baterista */}
      <div
        style={{ opacity: t2Opacity, transform: `scale(${t2Scale})` }}
        className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-neutral-400 text-center max-w-2xl leading-tight mb-8 z-10"
      >
        ...pero a los 2 días dudas de si estás tocando con la técnica correcta?
      </div>

      {/* Frase 3: La revelación */}
      <div
        style={{ opacity: t3Opacity, transform: `translateY(${t3Y}px)` }}
        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-violet-400 font-bold text-sm sm:text-base shadow-2xl z-10"
      >
        <span>✨</span>
        <span>Aprender música no debería limitarse a 1 hora a la semana.</span>
      </div>
    </AbsoluteFill>
  )
}
