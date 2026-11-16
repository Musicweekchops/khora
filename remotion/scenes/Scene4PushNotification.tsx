import React from "react"
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion"
import { Bell, Sparkles, Smartphone, ChevronRight } from "lucide-react"

export const Scene4PushNotification: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrada del teléfono
  const phoneScale = spring({ frame, fps, from: 0.85, to: 1 })
  const phoneOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" })

  // Entrada de la notificación push desde arriba (Frame 20+)
  const pushY = spring({
    frame: frame - 20,
    fps,
    from: -120,
    to: 0,
    config: { damping: 12, stiffness: 120 },
  })
  const pushOpacity = interpolate(frame, [20, 30], [0, 1], { extrapolateRight: "clamp" })

  // Efecto de pulso / tap en la notificación (Frame 60+)
  const tapScale = frame >= 65 && frame <= 75 ? 0.96 : 1

  return (
    <AbsoluteFill className="bg-neutral-950 flex flex-col items-center justify-center p-6 text-white select-none font-sans overflow-hidden">
      
      {/* Fondo ambiental */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Título de la escena */}
      <div className="flex flex-col items-center mb-6 z-10 text-center">
        <span className="text-violet-400 font-extrabold text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5" />
          Avisos Inmediatos
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white">
          Notificaciones Push y Correo Directo
        </h2>
      </div>

      {/* Mockup de Teléfono Celular */}
      <div
        style={{ transform: `scale(${phoneScale})`, opacity: phoneOpacity }}
        className="relative w-[340px] sm:w-[380px] h-[480px] bg-neutral-900 border-4 border-neutral-800 rounded-[48px] shadow-2xl p-4 flex flex-col overflow-hidden z-10"
      >
        {/* Dynamic Island / Notch */}
        <div className="w-28 h-5 bg-black rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-neutral-800 ml-auto mr-3" />
        </div>

        {/* Hora y Fecha de Pantalla de Bloqueo */}
        <div className="text-center mb-6">
          <div className="text-4xl font-extrabold tracking-tight text-white font-mono">
            09:41
          </div>
          <div className="text-xs text-neutral-400 font-medium mt-0.5">
            Miércoles, 16 de noviembre
          </div>
        </div>

        {/* Notificación Push que cae desde arriba */}
        {frame >= 20 && (
          <div
            style={{
              transform: `translateY(${pushY}px) scale(${tapScale})`,
              opacity: pushOpacity,
              transition: "transform 0.15s ease-out",
            }}
            className="w-full bg-neutral-900/95 border border-violet-500/50 rounded-3xl p-4 shadow-2xl shadow-violet-950/60 backdrop-blur-xl"
          >
            {/* Header de la notificación */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-xs shadow-md">
                  🥁
                </div>
                <span className="text-[11px] font-extrabold text-neutral-300 uppercase tracking-wider">
                  KHORA
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 font-medium">ahora</span>
            </div>

            {/* Contenido de la notificación */}
            <h4 className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
              <span>🥁 ¡Arnaldo respondió a tu video!</span>
            </h4>
            <p className="text-[11px] text-neutral-300 leading-snug">
              Revisó <strong className="text-white">"Práctica de Paradiddles"</strong> y te dejó 2 video-reacciones técnicas. ¡Toca aquí para verlas!
            </p>

            <div className="mt-2.5 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] text-violet-400 font-bold">
              <span>Abrir en Khora</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}

        {/* Barra de inicio inferior */}
        <div className="w-32 h-1 bg-neutral-700 rounded-full mx-auto mt-auto mb-1" />
      </div>
    </AbsoluteFill>
  )
}
