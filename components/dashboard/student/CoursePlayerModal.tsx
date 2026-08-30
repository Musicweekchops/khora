"use client"

import { X, FileText, Video } from "lucide-react"
import VideoPlayer from "@/components/ui/VideoPlayer"

interface CoursePlayerModalProps {
  activeCourseId: string | null;
  activeLessonId: string | null;
  setActiveCourseId: (id: string | null) => void;
  setActiveLessonId: (id: string | null) => void;
  purchases: any[];
  lessons: any[];
  resources: any[];
}

export default function CoursePlayerModal({
  activeCourseId,
  activeLessonId,
  setActiveCourseId,
  setActiveLessonId,
  purchases,
  lessons,
  resources
}: CoursePlayerModalProps) {
  if (!activeCourseId) return null;

  const activeLesson = lessons.find(l => l.id === activeLessonId)
  const courseResources = resources.filter(r => r.product_id === activeCourseId)
  const courseTitle = purchases.find(pur => pur.Product?.id === activeCourseId)?.Product?.title || "Curso Digital"

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/85 backdrop-blur-md"
        onClick={() => {
          setActiveCourseId(null)
          setActiveLessonId(null)
        }}
      />

      {/* Modal Container */}
      <div className="bg-neutral-900 text-white w-full h-full md:max-w-6xl md:h-[85vh] md:rounded-[40px] border border-neutral-800 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="h-16 border-b border-neutral-800 flex items-center justify-between px-6 bg-neutral-950/40 relative z-20 flex-shrink-0">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-black text-white">🥁</span>
            <div>
              <h3 className="text-sm font-black tracking-tight truncate max-w-[280px] sm:max-w-[400px]">
                {courseTitle}
              </h3>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-0.5">Aula Virtual Khora</p>
            </div>
          </div>

          <button
            onClick={() => {
              setActiveCourseId(null)
              setActiveLessonId(null)
            }}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Split Layout */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Column: Player & Lesson Info (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
            {activeLessonId ? (
              activeLesson ? (
                <div className="space-y-6">
                  {/* Video Player */}
                  <div className="w-full">
                    <VideoPlayer url={activeLesson.video_url} title={activeLesson.title} />
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-2">
                    <span className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest w-fit block">
                      Clase en Reproducción
                    </span>
                    <h4 className="text-xl md:text-2xl font-black tracking-tight">{activeLesson.title}</h4>
                    <p className="text-sm text-neutral-400 leading-relaxed font-semibold">
                      {activeLesson.description || "Esta lección no tiene una descripción adicional."}
                    </p>
                  </div>

                  {/* Resources zone */}
                  <div className="bg-neutral-950/30 border border-neutral-800 rounded-[32px] p-5 md:p-6 space-y-4">
                    <h5 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5 text-emerald-400">
                      <FileText className="w-4 h-4" />
                      Material de Descarga Complementario
                    </h5>

                    {courseResources.length === 0 ? (
                      <p className="text-xs text-neutral-500 font-bold italic">No hay archivos descargables específicos cargados para este curso.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {courseResources.map(res => (
                          <a
                            key={res.id}
                            href={res.download_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-all hover:bg-neutral-900/60"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold truncate text-white">{res.title}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mt-1">Archivo Descargable</p>
                            </div>
                            <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] flex-shrink-0 font-black uppercase tracking-widest">
                              Descargar
                            </span>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center text-neutral-500">
                <Video className="w-12 h-12 mb-3 text-neutral-600 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider">Cargando clase...</p>
              </div>
            )}
          </div>

          {/* Right Column: Playlist */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-neutral-800 bg-neutral-950/20 flex flex-col flex-shrink-0 overflow-hidden h-72 lg:h-auto">
            <div className="p-4 border-b border-neutral-800 flex-shrink-0 bg-neutral-950/40">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Clases del Curso</p>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
              {(() => {
                const courseLessons = lessons.filter(l => l.product_id === activeCourseId)
                if (courseLessons.length === 0) {
                  return (
                    <p className="text-xs text-neutral-500 font-bold italic text-center py-8">No hay clases registradas en este curso.</p>
                  )
                }

                return courseLessons.map(lesson => {
                  const isActive = activeLessonId === lesson.id
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonId(lesson.id)}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 group ${
                        isActive
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                          : "bg-neutral-900 border-neutral-800/60 text-neutral-300 hover:bg-neutral-850 hover:border-neutral-700"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black uppercase flex-shrink-0 ${
                        isActive ? "bg-white text-indigo-600" : "bg-neutral-850 text-neutral-400 group-hover:bg-neutral-800"
                      }`}>
                        {lesson.sort_order}
                      </span>
                      
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold leading-snug line-clamp-2">{lesson.title}</p>
                        <p className={`text-[10px] mt-1 font-semibold truncate ${isActive ? "text-indigo-200" : "text-neutral-500"}`}>
                          {lesson.description || "Video clase."}
                        </p>
                      </div>
                    </button>
                  )
                })
              })()}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
