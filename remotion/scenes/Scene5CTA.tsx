import React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { ArrowRight, Sparkles } from "lucide-react"

export const Scene5CTA: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrada del logo y texto
  const logoScale = spring({ frame, fps, from: 0.8, to: 1, config: { damping: 10 } })
  const contentOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" })

  // Botón CTA con efecto resplandor
  const ctaScale = spring({ frame: frame - 25, fps, from: 0.85, to: 1 })
  const pulseGlow = 1 + Math.sin(frame * 0.15) * 0.05

  return (
    <AbsoluteFill className="bg-neutral-950 flex flex-col items-center justify-center p-8 text-white select-none font-sans overflow-hidden">
      
      {/* Resplandor violeta cinematográfico */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full blur-[160px] opacity-35 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, #4c1d95 60%, transparent 80%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        style={{ transform: `scale(${logoScale})`, opacity: contentOpacity }}
        className="flex flex-col items-center text-center z-10 max-w-xl"
      >
        {/* Emoji Batería */}
        <div className="w-20 h-20 rounded-3xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-4xl mb-6 shadow-2xl shadow-violet-600/30">
          🥁
        </div>

        {/* Marca KHORA */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white mb-3">
          KHORA
        </h1>

        <p className="text-base sm:text-xl font-medium text-neutral-300 mb-6 leading-relaxed">
          La nueva forma de estudiar batería con <strong className="text-white">tecnología de estudio profesional</strong> y feedback constante.
        </p>

        {/* Lista de beneficios en una línea */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-neutral-400 uppercase tracking-widest mb-8">
          <span className="flex items-center gap-1.5 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800">
            <Sparkles className="w-3 h-3 text-violet-400" /> Video-Reacciones
          </span>
          <span className="flex items-center gap-1.5 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800">
            <Sparkles className="w-3 h-3 text-emerald-400" /> Modo Pad / Batería
          </span>
          <span className="flex items-center gap-1.5 bg-neutral-900/80 px-3 py-1.5 rounded-full border border-neutral-800">
            <Sparkles className="w-3 h-3 text-amber-400" /> Metas Semanales
          </span>
        </div>

        {/* Botón CTA Destacado */}
        <div
          style={{ transform: `scale(${ctaScale * pulseGlow})` }}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-base shadow-2xl shadow-violet-600/50 flex items-center gap-3 border border-violet-400/30"
        >
          <span>Súmate a la comunidad en khora.cl</span>
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </AbsoluteFill>
  )
}
