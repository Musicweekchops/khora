"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/context/AuthContext"
import { ClipboardList, CheckCircle2, Circle, X, ExternalLink } from "lucide-react"
import { RichText } from "@/components/ui/RichText"
import { motion, AnimatePresence } from "framer-motion"

import Link from "next/link"

interface Task {
  id: string
  title: string
  description: string
  completed: boolean
  created_at: string
  content_id?: string | null
  playlist_id?: string | null
  progress?: number
  LibraryContent?: {
    title: string
    url: string | null
    type: string
  } | null
  LibraryPlaylist?: {
    id: string
    title: string
  } | null
}

export default function TareasPage() {
  const { profile } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.studentProfileId) {
      loadTasks()
    }
  }, [profile?.studentProfileId])

  async function loadTasks() {
    setLoading(true)
    const { data, error } = await supabase
      .from("Task")
      .select(`
        id,
        title,
        description,
        completed,
        created_at,
        content_id,
        playlist_id,
        progress,
        LibraryContent (
          title,
          url,
          type
        ),
        LibraryPlaylist (
          id,
          title
        )
      `)
      .eq("student_id", profile!.studentProfileId!)
      .order("created_at", { ascending: false })

    if (!error && data) setTasks(data as any)
    setLoading(false)
  }

  async function toggleTask(task: Task) {
    const newStatus = !task.completed
    const newProgress = newStatus ? 100 : 0
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === task.id ? { ...t, completed: newStatus, progress: newProgress } : t))
    if (selectedTask?.id === task.id) {
      setSelectedTask(prev => prev ? { ...prev, completed: newStatus, progress: newProgress } : null)
    }
    
    await supabase
      .from("Task")
      .update({ completed: newStatus, progress: newProgress })
      .eq("id", task.id)
  }

  async function updateProgress(task: Task, value: number) {
    const isCompleted = value === 100
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === task.id ? { ...t, progress: value, completed: isCompleted } : t))
    if (selectedTask?.id === task.id) {
      setSelectedTask(prev => prev ? { ...prev, progress: value, completed: isCompleted } : null)
    }

    await supabase
      .from("Task")
      .update({ progress: value, completed: isCompleted })
      .eq("id", task.id)
  }

  const pending = tasks
    .filter(t => !t.completed)
    .sort((a, b) => {
      const progressA = a.progress || 0
      const progressB = b.progress || 0
      
      // 1. Mostrar las de 0% de progreso al principio
      if (progressA === 0 && progressB > 0) return -1
      if (progressA > 0 && progressB === 0) return 1
      
      // 2. Si ambas tienen algún progreso (>0%), mostrar las de MENOR progreso arriba y las de MAYOR progreso abajo (más cerca de completadas)
      if (progressA > 0 && progressB > 0 && progressA !== progressB) {
        return progressA - progressB
      }
      
      // 3. Fallback: ordenar por fecha de creación (descendente)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  const completed = tasks.filter(t => t.completed)

  return (
    <div className="space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          Mis Tareas
        </h1>
        <p className="text-neutral-500 font-medium mt-2">{pending.length} pendientes (haz clic en una tarea para ver sus detalles)</p>
      </div>

      {loading ? (
        <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse" />)}</div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-neutral-100 shadow-sm">
          <span className="text-5xl mb-4 block opacity-30">✨</span>
          <p className="text-neutral-900 font-bold text-lg">No tienes tareas asignadas</p>
          <p className="text-neutral-400 text-sm mt-1">¡Estás al día con todo!</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Pendientes */}
          {pending.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-neutral-800 flex items-center gap-2">
                <span className="w-2 h-5 bg-emerald-500 rounded-full" />
                Por Hacer
              </h2>
              <motion.div layout className="grid gap-3">
                <AnimatePresence mode="popLayout">
                  {pending.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    >
                      <TaskCard 
                        task={task} 
                        onToggle={() => toggleTask(task)} 
                        onUpdateProgress={(val) => updateProgress(task, val)} 
                        onSelectTask={() => setSelectedTask(task)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* Completadas */}
          {completed.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-black text-neutral-400 flex items-center gap-2">
                <span className="w-2 h-5 bg-neutral-200 rounded-full" />
                Completadas
              </h2>
              <motion.div layout className="grid gap-3 opacity-60 hover:opacity-100 transition-opacity duration-300">
                <AnimatePresence mode="popLayout">
                  {completed.map(task => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    >
                      <TaskCard 
                        task={task} 
                        onToggle={() => toggleTask(task)} 
                        onUpdateProgress={(val) => updateProgress(task, val)} 
                        onSelectTask={() => setSelectedTask(task)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETALLES TAREA */}
      {selectedTask && (
        <div 
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setSelectedTask(null)}
        >
          <div 
            className="bg-white rounded-3xl md:rounded-[40px] max-w-xl w-full overflow-hidden shadow-2xl relative border border-neutral-100 animate-in zoom-in-95 duration-200 font-sans max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-neutral-100 bg-neutral-50/50 flex items-start justify-between gap-4 flex-shrink-0">
              <div className="space-y-2 flex-1 min-w-0">
                <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  selectedTask.completed 
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}>
                  {selectedTask.completed ? "✓ Completada" : "⏳ Pendiente"}
                </span>

                <h3 className="text-xl md:text-2xl font-black text-neutral-900 tracking-tight leading-snug">
                  {selectedTask.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedTask(null)}
                className="w-9 h-9 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 transition-all flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 scrollbar-thin">
              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Descripción / Instrucciones</h4>
                {selectedTask.description ? (
                  <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 md:p-5">
                    <RichText text={selectedTask.description} className="text-sm text-neutral-800 font-medium leading-relaxed" />
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">Sin descripción adicional para esta tarea.</p>
                )}
              </div>

              {/* Attached Materials */}
              {(selectedTask.LibraryContent || selectedTask.LibraryPlaylist) && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Material Adjunto para Estudiar</h4>
                  <div className="space-y-2">
                    {selectedTask.LibraryContent && (
                      <div className="bg-violet-50/70 border border-violet-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-violet-900 truncate">📖 {selectedTask.LibraryContent.title}</p>
                          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mt-0.5">
                            Recurso {selectedTask.LibraryContent.type}
                          </p>
                        </div>
                        {selectedTask.LibraryContent.url && (
                          <a
                            href={selectedTask.LibraryContent.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
                          >
                            <span>Abrir</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}

                    {selectedTask.LibraryPlaylist && (
                      <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-black text-amber-900 truncate">📚 {selectedTask.LibraryPlaylist.title}</p>
                          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-0.5">
                            Serie de Estudio
                          </p>
                        </div>
                        <Link
                          href="/dashboard/biblioteca"
                          className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 flex-shrink-0"
                        >
                          <span>Ver Serie</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Bar & Selector */}
              <div className="space-y-3 pt-4 border-t border-neutral-100">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-neutral-400 uppercase tracking-widest text-[10px]">Progreso de la Tarea</span>
                  <span className={selectedTask.completed || selectedTask.progress === 100 ? "text-emerald-600" : "text-violet-600"}>
                    {selectedTask.completed ? "100%" : `${selectedTask.progress || 0}%`}
                  </span>
                </div>

                <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedTask.completed || selectedTask.progress === 100 
                        ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                        : "bg-gradient-to-r from-violet-500 to-indigo-500"
                    }`}
                    style={{ width: `${selectedTask.completed ? 100 : (selectedTask.progress || 0)}%` }}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  {[0, 25, 50, 75, 100].map(val => (
                    <button
                      type="button"
                      key={val}
                      onClick={() => updateProgress(selectedTask, val)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black transition-all ${
                        selectedTask.progress === val || (val === 100 && selectedTask.completed)
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
                onClick={() => toggleTask(selectedTask)}
                className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
                  selectedTask.completed
                    ? "bg-neutral-200 text-neutral-700 hover:bg-neutral-300"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                {selectedTask.completed ? (
                  <>
                    <Circle className="w-4 h-4" />
                    <span>Marcar como Pendiente</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Marcar como Completada (100%)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TaskCard({ 
  task, 
  onToggle, 
  onUpdateProgress,
  onSelectTask 
}: { 
  task: Task, 
  onToggle: () => void, 
  onUpdateProgress: (val: number) => void,
  onSelectTask: () => void
}) {
  return (
    <div 
      onClick={onSelectTask}
      className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all hover:shadow-md flex gap-4 ${
        task.completed ? 'border-neutral-100 bg-neutral-50' : 'border-emerald-100 hover:border-emerald-300'
      }`}
    >
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onToggle()
        }}
        className="pt-1 text-left flex-shrink-0"
        title={task.completed ? "Desmarcar" : "Marcar como completada"}
      >
        {task.completed ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-500" />
        ) : (
          <Circle className="w-6 h-6 text-neutral-300 hover:text-emerald-400 transition-colors" />
        )}
      </button>

      <div className="flex-1 space-y-4 min-w-0">
        <div>
          <div className="flex items-start justify-between gap-2">
            <p className={`font-bold text-lg transition-colors group-hover:text-emerald-700 ${task.completed ? 'text-neutral-400 line-through' : 'text-neutral-900'}`}>
              {task.title}
            </p>
            <span className="text-xs font-bold text-violet-600 hover:underline flex-shrink-0">
              Ver detalles →
            </span>
          </div>

          {task.description && (
            <div onClick={e => e.stopPropagation()}>
              <RichText 
                text={task.description} 
                className={`text-sm mt-1 line-clamp-3 ${task.completed ? 'text-neutral-400' : 'text-neutral-500'}`} 
              />
            </div>
          )}
        </div>
        
        {/* Adjuntos del Material */}
        {(task.LibraryContent || task.LibraryPlaylist) && (
          <div className="flex flex-wrap gap-2" onClick={e => e.stopPropagation()}>
            {task.LibraryContent && task.LibraryContent.url && (
              <a 
                href={task.LibraryContent.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-100 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm"
              >
                📖 Ver material: {task.LibraryContent.title}
              </a>
            )}
            {task.LibraryPlaylist && (
              <Link 
                href="/dashboard/biblioteca"
                className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-sm"
              >
                📚 Ver serie: {task.LibraryPlaylist.title}
              </Link>
            )}
          </div>
        )}

        {/* Progress Bar & Interactive Pills */}
        <div className="space-y-2 pt-2 border-t border-neutral-50" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between text-[10px] font-black text-neutral-400 uppercase tracking-widest">
            <span>Progreso actual</span>
            <span className={task.completed || task.progress === 100 ? "text-emerald-600 font-bold" : "text-violet-600 font-bold"}>
              {task.completed ? "100%" : `${task.progress || 0}%`}
            </span>
          </div>
          
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                task.completed || task.progress === 100 
                  ? "bg-gradient-to-r from-emerald-400 to-teal-500" 
                  : "bg-gradient-to-r from-violet-500 to-indigo-500"
              }`}
              style={{ width: `${task.completed ? 100 : (task.progress || 0)}%` }}
            />
          </div>

          {!task.completed && (
            <div className="flex gap-1.5 pt-1">
              {[0, 25, 50, 75, 100].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => onUpdateProgress(val)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    task.progress === val
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-neutral-50 text-neutral-500 border border-neutral-100 hover:bg-neutral-100"
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
