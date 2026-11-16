import React from "react"
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion"
import { BrowserFrame } from "../components/BrowserFrame"
import { Cursor } from "../components/Cursor"
import { Video, Search, Play, User as UserIcon, Plus, ExternalLink, Sparkles } from "lucide-react"

export const Scene1Dashboard: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Movimiento de cámara suave (Pan y zoom estilo Screen Studio)
  const cameraScale = interpolate(frame, [0, 80], [1, 1.05], { extrapolateRight: "clamp" })
  const cameraY = interpolate(frame, [0, 80], [0, -30], { extrapolateRight: "clamp" })

  // Cursor deslizándose hacia la tarjeta de Gloria
  const cursorX = interpolate(frame, [15, 65], [1150, 520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })
  const cursorY = interpolate(frame, [15, 65], [800, 580], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  })

  // Clic en el botón "Revisar con Slow-Mo" en el frame 65
  const isClicking = frame >= 65 && frame <= 75
  const cardPress = isClicking ? 0.98 : 1

  return (
    <AbsoluteFill className="bg-[#08080b] flex items-center justify-center p-8 select-none font-sans overflow-hidden">
      
      {/* Resplandor ambiental de estudio */}
      <div
        className="absolute w-[900px] h-[600px] rounded-full blur-[180px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle, #7c3aed 0%, #4338ca 100%)",
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Ventana de Navegador Real */}
      <div style={{ transform: `scale(${cameraScale}) translateY(${cameraY}px)` }} className="w-full max-w-5xl">
        <BrowserFrame url="khora.cl/dashboard/videos">
          
          <div className="p-6 md:p-8 space-y-6 bg-neutral-950 min-h-[580px]">
            
            {/* Banner Real de Khora */}
            <div className="relative rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/90 to-neutral-950 p-6 md:p-8 border border-neutral-800 shadow-xl overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-violet-950/80 text-violet-300 border border-violet-700/60 flex items-center gap-1.5 shadow-sm">
                    <Sparkles className="w-3 h-3 text-violet-400" />
                    Centro de Feedback & Ejercicios
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
                    Audio sin compresión · 720p HD
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                      Videos y Devoluciones Técnicas
                    </h1>
                    <p className="text-xs text-neutral-400 max-w-xl mt-1">
                      Revisa las tomas de tus alumnos con slow-motion (0.5x, 0.75x) y notas al segundo exacto, o graba demostraciones técnicas directamente.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-violet-600/30">
                      <Plus className="w-4 h-4" />
                      <span>Grabar / Enviar Video</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Brillos decorativos del banner */}
              <div className="absolute top-[-30%] right-[-10%] w-80 h-80 bg-violet-600/20 blur-[100px] rounded-full pointer-events-none" />
            </div>

            {/* Pestañas de Navegación y Búsqueda */}
            <div className="bg-neutral-900/90 rounded-2xl border border-neutral-800 p-2.5 shadow-sm flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 p-1 bg-neutral-950 rounded-xl">
                <div className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-neutral-800 text-white shadow-sm flex items-center gap-2">
                  <span>Por Revisar</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-black text-[10px] font-black">
                    1
                  </span>
                </div>
                <div className="px-3 py-1.5 text-xs font-medium text-neutral-400">
                  Enviados por Mí
                </div>
                <div className="px-3 py-1.5 text-xs font-medium text-neutral-400">
                  Todos los Videos (1)
                </div>
              </div>

              <div className="relative w-64 hidden md:block">
                <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  readOnly
                  value="Buscar por alumno o título..."
                  className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-neutral-500"
                />
              </div>
            </div>

            {/* Tarjeta Real de Gloria Céspedes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div
                style={{ transform: `scale(${cardPress})` }}
                className="bg-neutral-900 rounded-3xl border border-neutral-800 shadow-xl overflow-hidden flex flex-col group transition-transform"
              >
                {/* Miniatura del Video */}
                <div className="relative aspect-video bg-neutral-950 overflow-hidden flex items-center justify-center">
                  <Img
                    src={staticFile("dashboard_screenshot.jpg")}
                    className="w-full h-full object-cover scale-110"
                    style={{ objectPosition: "20% 50%" }}
                  />

                  {/* Badges de la tarjeta */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-neutral-950/80 text-white backdrop-blur-md border border-neutral-700">
                      ALUMNO
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-black font-extrabold shadow">
                      POR REVISAR
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-white/95 text-neutral-950 flex items-center justify-center shadow-lg">
                      <Play className="w-4 h-4 ml-0.5 fill-current" />
                    </div>
                  </div>
                </div>

                {/* Detalles de la Alumna */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span className="flex items-center gap-1.5 font-bold text-neutral-200">
                      <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                      Gloria Cespedes
                    </span>
                    <span className="font-mono text-[11px]">12 nov</span>
                  </div>

                  <h4 className="text-sm font-bold text-white leading-snug">
                    Práctica de ejercicio
                  </h4>

                  <button className="w-full py-2 bg-neutral-800 hover:bg-neutral-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-neutral-700/80 shadow-sm">
                    <span>Revisar con Slow-Mo</span>
                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </BrowserFrame>
      </div>

      {/* Cursor virtual con física suave */}
      <Cursor x={cursorX} y={cursorY} clickFrame={65} />
    </AbsoluteFill>
  )
}
