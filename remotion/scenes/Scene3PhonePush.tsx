import React from "react"
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion"
import { Sparkles, ChevronRight, Play } from "lucide-react"

export const Scene3PhonePush: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Entrada del teléfono
  const phoneScale = spring({ frame, fps, from: 0.88, to: 1 })
  const phoneOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" })

  // Notificación push que cae desde arriba en el frame 15
  const pushY = spring({
    frame: frame - 15,
    fps,
    from: -140,
    to: 0,
    config: { damping: 12, stiffness: 130 },
  })
  const pushOpacity = interpolate(frame, [15, 25], [0, 1], { extrapolateRight: "clamp" })

  // Tap en la notificación en el frame 60
  const isTapped = frame >= 65
  const tapScale = frame >= 60 && frame <= 70 ? 0.96 : 1

  return (
    <AbsoluteFill className="bg-[#08080b] flex flex-col items-center justify-center p-6 select-none font-sans overflow-hidden">
      
      {/* Luz ambiental */}
      <div
        className="absolute w-[700px] h-[700px] rounded-full blur-[170px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="flex flex-col items-center mb-6 z-10 text-center">
        <span className="text-violet-400 font-extrabold text-xs uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Aviso Inmediato en el Teléfono del Alumno
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white">
          Notificaciones Push y Acceso Directo
        </h2>
      </div>

      {/* Mockup de Teléfono Celular Realista */}
      <div
        style={{ transform: `scale(${phoneScale})`, opacity: phoneOpacity }}
        className="relative w-[340px] sm:w-[360px] h-[520px] bg-neutral-950 border-4 border-neutral-800 rounded-[44px] shadow-2xl p-4 flex flex-col overflow-hidden z-10"
      >
        {/* Dynamic Island */}
        <div className="w-24 h-4 bg-black rounded-full mx-auto mb-5 flex items-center justify-center border border-neutral-800/60" />

        {!isTapped ? (
          /* Vista Pantalla de Bloqueo */
          <div className="flex-1 flex flex-col">
            <div className="text-center my-4">
              <div className="text-4xl font-black tracking-tight text-white font-mono">
                09:41
              </div>
              <div className="text-xs text-neutral-400 font-medium mt-0.5">
                Miércoles, 16 de noviembre
              </div>
            </div>

            {/* Notificación Push */}
            {frame >= 15 && (
              <div
                style={{
                  transform: `translateY(${pushY}px) scale(${tapScale})`,
                  opacity: pushOpacity,
                }}
                className="w-full bg-neutral-900/95 border border-violet-500/60 rounded-3xl p-4 shadow-2xl shadow-violet-950/70 backdrop-blur-xl mt-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-violet-600 flex items-center justify-center text-xs shadow-md">
                      🥁
                    </div>
                    <span className="text-[11px] font-extrabold text-neutral-200 tracking-wider">
                      KHORA
                    </span>
                  </div>
                  <span className="text-[10px] text-neutral-500">ahora</span>
                </div>

                <h4 className="text-xs font-bold text-white mb-1">
                  🥁 ¡Arnaldo respondió a tu video!
                </h4>
                <p className="text-[11px] text-neutral-300 leading-snug">
                  Revisó <strong className="text-white">"Práctica de ejercicio"</strong> y te dejó 1 video-reacción técnica. ¡Toca aquí para verla!
                </p>

                <div className="mt-2.5 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-violet-400 font-bold">
                  <span>Abrir corrección en Khora</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Vista Alumno dentro de la App Khora en Móvil */
          <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-200 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
              <span className="text-xs font-bold text-white">Devolución Técnica</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                Aprobado
              </span>
            </div>

            {/* Reproductor móvil con el video de Arnaldo */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-neutral-800 flex items-center justify-center">
              <Img
                src={staticFile("dashboard_screenshot.jpg")}
                className="w-full h-full object-cover"
                style={{ objectPosition: "15% 40%" }}
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-lg">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-emerald-300 font-bold border border-emerald-500/40">
                🥁 Demostración de Arnaldo · 0:14
              </div>
            </div>

            <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block">
                Comentario del profesor
              </span>
              <p className="text-[11px] text-neutral-200 leading-snug">
                "Fíjate en el rebote de la muñeca izquierda al acentuar."
              </p>
            </div>
          </div>
        )}

        {/* Barra Home inferior */}
        <div className="w-28 h-1 bg-neutral-700 rounded-full mx-auto mt-auto mb-1" />
      </div>
    </AbsoluteFill>
  )
}
