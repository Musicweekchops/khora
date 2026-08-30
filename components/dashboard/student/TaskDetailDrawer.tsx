"use client"

import { X, ExternalLink, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"
import { RichText } from "@/components/ui/RichText"

interface TaskDetailDrawerProps {
  task: any | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleStatus: (task: any) => void;
  onUpdateProgress: (task: any, val: number) => void;
}

export default function TaskDetailDrawer({
  task,
  isOpen,
  onClose,
  onToggleStatus,
  onUpdateProgress
}: TaskDetailDrawerProps) {
  if (!isOpen || !task) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[160] bg-neutral-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className="fixed inset-y-0 right-0 z-[160] w-full md:w-[480px] bg-white shadow-2xl flex flex-col border-l border-neutral-100 animate-in slide-in-from-right duration-300 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-neutral-100 bg-neutral-50/50 flex flex-col gap-4 flex-shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-9 h-9 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-all flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="space-y-3 pr-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                task.completed 
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                  : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}>
                {task.completed ? "✓ Completada" : "⏳ Pendiente"}
              </span>

              {task.Class?.date && (
                <span className="bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  📅 Clase del {new Date(task.Class.date + "T12:00").toLocaleDateString("es-CL")}
                </span>
              )}
            </div>

            <h3 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight leading-snug">
              {task.title}
            </h3>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-1 scrollbar-thin">
          {/* Description */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Descripción / Instrucciones</h4>
            {task.description ? (
              <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 md:p-5">
                <RichText text={task.description} className="text-sm text-neutral-800 font-medium leading-relaxed" />
              </div>
            ) : (
              <p className="text-sm text-neutral-400 italic">Sin descripción adicional para esta tarea.</p>
            )}
          </div>

          {/* Attached Materials */}
          {(task.LibraryContent || task.LibraryPlaylist) && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Material Adjunto para Estudiar</h4>
              <div className="space-y-3">
                {task.LibraryContent && (
                  <div className="bg-violet-50/70 border border-violet-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-violet-900 truncate">📖 {task.LibraryContent.title}</p>
                      <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mt-1">
                        Recurso {task.LibraryContent.type}
                      </p>
                    </div>
                    {task.LibraryContent.url && (
                      <a
                        href={task.LibraryContent.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {task.LibraryPlaylist && (
                  <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black text-amber-900 truncate">📚 {task.LibraryPlaylist.title}</p>
                      <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mt-1">
                        Serie de Estudio
                      </p>
                    </div>
                    <Link
                      href="/dashboard/biblioteca"
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
                    >
                      <span>Ver Serie</span>
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Progress Bar & Selector */}
          <div className="space-y-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between text-sm font-black">
              <span className="text-neutral-400 uppercase tracking-widest text-xs">Progreso de la Tarea</span>
              <span className={task.completed || task.progress === 100 ? "text-emerald-600" : "text-violet-600"}>
                {task.completed ? "100%" : `${task.progress || 0}%`}
              </span>
            </div>

            <div className="w-full h-3 bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  task.completed || task.progress === 100 
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                    : "bg-gradient-to-r from-violet-500 to-indigo-500"
                }`}
                style={{ width: `${task.completed ? 100 : (task.progress || 0)}%` }}
              />
            </div>

            <div className="flex gap-2 pt-2">
              {[0, 25, 50, 75, 100].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => onUpdateProgress(task, val)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${
                    task.progress === val || (val === 100 && task.completed)
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "bg-neutral-50 text-neutral-600 border border-neutral-200 hover:bg-neutral-100"
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 flex gap-3 flex-shrink-0">
          <button
            onClick={() => onToggleStatus(task)}
            className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
              task.completed
                ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {task.completed ? (
              <>
                <Circle className="w-5 h-5" />
                <span>Marcar como Pendiente</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Marcar como Completada (100%)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
