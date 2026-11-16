import React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { ArrowRight, Sparkles, Video, CheckCircle2 } from "lucide-react"

export const Scene4BrandOutro: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Animaciones de entrada
  const logoScale = spring({ frame, fps, from: 0.85, to: 1, config: { damping: 12 } })
  const contentOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" })

  const ctaScale = spring({ frame: frame - 20, fps, from: 0.9, to: 1 })
  const pulse = 1 + Math.sin(frame * 0.15) * 0.04

  return (
    <AbsoluteFill className="bg-[#08080b] flex flex-col items-center justify-center p-8 text-white select-none font-sans overflow-hidden">
      
      {/* Fondo cinematográfico violeta */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full blur-[180px] opacity-35 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, #31104b 60%, transparent 80%)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div
        style={{ transform: `scale(${logoScale})`, opacity: contentOpacity }}
        className="flex flex-col items-center text-center z-10 max-w-xl"
      >
        {/* Icono Khora */}
        <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-3xl mb-5 shadow-2xl shadow-violet-600/40">
          🥁
        </div>

        {/* Marca KHORA */}
        <h1 className="text-5xl sm:text-6xl font-black tracking-tight text-white mb-2">
          KHORA
        </h1>

        <p className="text-base sm:text-lg font-medium text-neutral-300 mb-6 leading-relaxed">
          La nueva forma de estudiar batería con <strong className="text-white">video-reacciones técnicas</strong> y acompañamiento real.
        </p>

        {/* Lista de características reales */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-bold text-neutral-300 mb-8">
          <span className="flex items-center gap-1.5 bg-neutral-900/90 px-3.5 py-1.5 rounded-full border border-neutral-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
            Video-Reacciones en el Segundo Exacto
          </span>
          <span className="flex items-center gap-1.5 bg-neutral-900/90 px-3.5 py-1.5 rounded-full border border-neutral-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Modo Pad / Batería en Full HD
          </span>
          <span className="flex items-center gap-1.5 bg-neutral-900/90 px-3.5 py-1.5 rounded-full border border-neutral-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
            Audio de Estudio Sin Compresión
          </span>
        </div>

        {/* Botón CTA */}
        <div
          style={{ transform: `scale(${ctaScale * pulse})` }}
          className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black text-sm sm:text-base shadow-2xl shadow-violet-600/50 flex items-center gap-3 border border-violet-400/40"
        >
          <span>Súmate a la comunidad en khora.cl</span>
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </AbsoluteFill>
  )
}
