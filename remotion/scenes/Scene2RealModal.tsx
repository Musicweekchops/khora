import React from "react"
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion"
import { BrowserFrame } from "../components/BrowserFrame"
import { Cursor } from "../components/Cursor"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Gauge, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  X, 
  Send, 
  Video, 
  Sliders 
} from "lucide-react"

export const Scene2RealModal: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Movimiento de entrada del modal
  const modalScale = spring({ frame, fps, from: 0.92, to: 1, config: { damping: 14 } })
  const modalOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" })

  // Progreso de reproducción del video del alumno (0:00 a 0:14)
  // El segundo 0:14 se alcanza en el frame 60
  const isPaused = frame >= 60
  const progressPct = interpolate(frame, [0, 60], [5, 45], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // En el frame 65 se activa la reacción en Pad/Batería
  const isReactionActive = frame >= 65
  const reactionScale = spring({
    frame: frame - 65,
    fps,
    from: 0.85,
    to: 1,
    config: { damping: 12, stiffness: 150 },
  })
  const reactionOpacity = interpolate(frame, [65, 75], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Cursor que se mueve al botón de Aprobar y Enviar (Frame 120+)
  const cursorX = interpolate(frame, [100, 140, 160], [600, 1050, 1050], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  const cursorY = interpolate(frame, [100, 140, 160], [400, 520, 580], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Estado de aprobación
  const isApproved = frame >= 140

  return (
    <AbsoluteFill className="bg-[#08080b] flex items-center justify-center p-6 select-none font-sans overflow-hidden">
      
      {/* Fondo ambiental */}
      <div
        className="absolute w-[800px] h-[600px] rounded-full blur-[170px] opacity-25 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, #10b981 100%)",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div style={{ transform: `scale(${modalScale})`, opacity: modalOpacity }} className="w-full max-w-5xl">
        <BrowserFrame url="khora.cl/dashboard/videos">
          
          {/* Modal Real de Feedback de Khora */}
          <div className="relative w-full bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-3.5 border-b border-neutral-800 bg-neutral-950">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-bold text-neutral-100">Práctica de ejercicio</h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
                  isApproved
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                }`}>
                  {isApproved ? "Aprobado" : "Por Revisar"}
                </span>
                <span className="text-xs text-neutral-400">Alumno: Gloria Cespedes</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400">
                  <X className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Split View: Columna Izquierda (Video) + Columna Derecha (Correcciones) */}
            <div className="grid grid-cols-12 min-h-[460px]">
              
              {/* Columna Izquierda: Reproductor Técnico (7 cols) */}
              <div className="col-span-7 bg-black p-4 flex flex-col justify-between border-r border-neutral-800">
                
                {/* Tabs de video */}
                <div className="flex gap-2 mb-3">
                  <div className="px-3 py-1 rounded-lg text-xs font-bold bg-violet-600 text-white shadow-sm flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" />
                    <span>Video del Alumno</span>
                  </div>
                  <div className="px-3 py-1 rounded-lg text-xs font-bold bg-neutral-800 text-neutral-400 flex items-center gap-1.5">
                    <span>Demostración del Profesor</span>
                  </div>
                </div>

                {/* Área de Video Principal */}
                <div className="relative flex-1 bg-neutral-950 rounded-xl overflow-hidden flex items-center justify-center border border-neutral-800/80">
                  
                  {/* Imagen de Video Real de Gloria */}
                  <Img
                    src={staticFile("dashboard_screenshot.jpg")}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      isReactionActive ? "opacity-30" : "opacity-100"
                    }`}
                    style={{ objectPosition: "20% 45%" }}
                  />

                  {/* OVERLAY: MODO PAD / BATERÍA AL LLEGAR A 0:14 */}
                  {isReactionActive && (
                    <div
                      style={{ transform: `scale(${reactionScale})`, opacity: reactionOpacity }}
                      className="absolute inset-2 bg-neutral-950/95 border-2 border-emerald-500 rounded-xl shadow-2xl flex flex-col overflow-hidden z-20"
                    >
                      {/* Cabecera de la reacción */}
                      <div className="flex items-center justify-between px-3 py-2 bg-emerald-950/80 border-b border-emerald-800">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                          🥁 Demostración de Arnaldo (Modo Pad / Batería) · 0:14
                        </span>
                        <span className="text-[10px] font-mono font-bold bg-emerald-900/60 text-emerald-300 px-2 py-0.5 rounded border border-emerald-700">
                          Slow-Mo 0.5x
                        </span>
                      </div>

                      {/* Video de Arnaldo demostrando */}
                      <div className="relative flex-1 bg-black flex flex-col items-center justify-center p-4 text-center">
                        <Img
                          src={staticFile("dashboard_screenshot.jpg")}
                          className="w-full h-full object-cover rounded-lg"
                          style={{ objectPosition: "15% 40%" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-4">
                          <span className="text-xs font-bold text-white bg-black/70 px-3 py-1.5 rounded-lg border border-neutral-700 backdrop-blur-md">
                            "Fíjate en el rebote de la muñeca izquierda al acentuar"
                          </span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="p-2.5 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-400 italic">
                          El video se pausó automáticamente en este compás
                        </span>
                        <div className="flex gap-1.5">
                          <div className="px-2.5 py-1 bg-neutral-800 text-white rounded-lg text-[11px] font-bold flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" /> Repetir
                          </div>
                          <div className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1">
                            <Play className="w-3 h-3 fill-current" /> Continuar
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Controles Técnicos Reales */}
                <div className="mt-3 bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 space-y-2">
                  
                  {/* Barra de Tiempo con Marcadores */}
                  <div className="relative w-full h-2 bg-neutral-800 rounded-full flex items-center">
                    <div
                      style={{ width: `${progressPct}%` }}
                      className="h-full bg-violet-600 rounded-full"
                    />

                    {/* Pin Luminoso de Video en 0:14 */}
                    <div
                      style={{ left: "45%" }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black shadow-lg shadow-emerald-400/90"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-violet-600 text-white">
                        {isPaused ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                      </div>
                      <span className="font-mono text-white text-[11px]">
                        {isPaused ? "0:14" : "0:06"} / 0:32
                      </span>
                    </div>

                    {/* Selector de Slow Motion de Khora */}
                    <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-[10px]">
                      <Gauge className="w-3 h-3 text-neutral-400 ml-1" />
                      <span className="px-2 py-0.5 rounded bg-violet-600 text-white font-bold">0.5x</span>
                      <span className="px-1.5 py-0.5 text-neutral-400">0.75x</span>
                      <span className="px-1.5 py-0.5 text-neutral-400">1x</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Columna Derecha: Panel de Feedback & Devolución (5 cols) */}
              <div className="col-span-5 p-4 flex flex-col justify-between bg-neutral-900 space-y-4">
                
                {/* Lista de Correcciones */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-violet-400" />
                      Correcciones (1)
                    </span>
                    <span className="text-[10px] text-neutral-500">Toca para reproducir</span>
                  </div>

                  <div className="p-2.5 rounded-xl border border-emerald-500/50 bg-emerald-950/20 flex items-start gap-2 shadow-sm">
                    <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-700 rounded font-mono text-[10px] font-bold">
                      0:14
                    </span>
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-0.5">
                        🥁 Demostración Pad / Batería
                      </span>
                      <p className="text-xs text-neutral-200">
                        Fíjate en el rebote de la muñeca izquierda al acentuar.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Comentario General */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                  <span className="text-[11px] font-bold uppercase text-neutral-400">
                    Devolución General
                  </span>
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-300">
                    ¡Gran avance en el tempo! Aplica la corrección del acento y queda listo para subir el BPM.
                  </div>
                </div>

                {/* Acciones del Profesor: Calificación y Enviar */}
                <div className="space-y-3 pt-2 border-t border-neutral-800">
                  <div>
                    <span className="block text-[11px] font-semibold text-neutral-400 mb-1.5">
                      Calificación:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        isApproved
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-900/40"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aprobar</span>
                      </div>
                      <div className="py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 bg-neutral-800 text-neutral-400 border border-neutral-700">
                        <span>Reintentar</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3 rounded-xl bg-violet-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30">
                    <Send className="w-4 h-4" />
                    <span>Enviar Devolución al Alumno</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        </BrowserFrame>
      </div>

      {/* Cursor virtual */}
      {frame >= 100 && (
        <Cursor x={cursorX} y={cursorY} clickFrame={140} />
      )}
    </AbsoluteFill>
  )
}
